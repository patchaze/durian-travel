// The Trip Budget Report generator.
//
// Pure functions only. No network, no file system, no environment, no clock
// beyond the one date passed in. `functions/api/report.ts` is the thin HTTP
// wrapper around this module, which keeps the entire calculation testable
// without a server and makes the timing measurable in isolation.
//
// This module lives outside functions/ on purpose. Cloudflare Pages turns
// every file under functions/ into a route, so the calculation is kept here
// where it can only ever be imported, never requested. Astro does not build
// it either: nothing in src/pages imports it, so it never reaches a browser.
//
// What the report is. The free comparison on /tools/cost-per-country/ applies
// one Eurostat index, restaurants and hotels, to every euro a visitor spends.
// That is wrong for most people. Portugal sits well below the EU average for
// restaurants and hotels and slightly above it for food from shops, so
// somebody who cooks saves almost nothing there while somebody who eats out
// saves a quarter. This report answers the questionnaire by weighting seven
// Eurostat categories instead of one.
//
// Every figure the report prints is derived from three things only: the
// answers given on /tools/cost-per-country/, src/data/country-costs.json, and
// the editorial weighting table below. Nothing is fetched or inferred.

/* ────────────────────────────── the dataset ────────────────────────────── */

// The seven Eurostat price level categories carried per country. `pli` is the
// original single figure and is kept unchanged; it equals `stay`.
export type CategoryKey =
  | 'stay'
  | 'food'
  | 'drink'
  | 'shopping'
  | 'transport'
  | 'comms'
  | 'recreation'
  | 'overall';

export interface CostCountry {
  slug: string;
  name: string;
  iso: string;
  pli: number;
  stay: number;
  food: number;
  drink: number;
  shopping: number;
  transport: number;
  comms: number;
  recreation: number;
  overall: number;
}

export interface CostSource {
  publisher: string;
  dataset: string;
  datasetName: string;
  indicator: string;
  category: string;
  categories: Record<string, string>;
  categoriesMeaning: string;
  categoriesRetrieved: string;
  meaning: string;
  referenceYear: string;
  eurostatLastUpdated: string;
  retrieved: string;
  url: string;
  note: string;
  refreshHint?: string;
}

export interface CostData {
  _source: CostSource;
  countries: CostCountry[];
}

/* ───────────────────── the editorial weighting table ───────────────────── */

export type Component =
  | 'accommodation'
  | 'restaurantFood'
  | 'groceryFood'
  | 'drinks'
  | 'cityTransport'
  | 'intercityTransport'
  | 'recreation'
  | 'shopping'
  | 'communication';

export const COMPONENTS: Component[] = [
  'accommodation',
  'restaurantFood',
  'groceryFood',
  'drinks',
  'cityTransport',
  'intercityTransport',
  'recreation',
  'shopping',
  'communication',
];

export const COMPONENT_LABELS: Record<Component, string> = {
  accommodation: 'Where you sleep',
  restaurantFood: 'Eating out',
  groceryFood: 'Food from shops',
  drinks: 'Drinks',
  cityTransport: 'Getting around a city',
  intercityTransport: 'Travelling between cities',
  recreation: 'Museums, tours and going out',
  shopping: 'Shopping',
  communication: 'Data and calls',
};

// Which Eurostat category prices each component. Two components share the
// restaurants and hotels index, because that Eurostat category covers both a
// hotel room and a restaurant meal.
export const COMPONENT_CATEGORY: Record<Component, CategoryKey> = {
  accommodation: 'stay',
  restaurantFood: 'stay',
  groceryFood: 'food',
  drinks: 'drink',
  cityTransport: 'transport',
  intercityTransport: 'transport',
  recreation: 'recreation',
  shopping: 'shopping',
  communication: 'comms',
};

type Points = Partial<Record<Component, number>>;

// ─────────────────────────────────────────────────────────────────────────
// DURIAN'S EDITORIAL WEIGHTING. NOT A PUBLISHED STATISTIC.
//
// These numbers are assumptions about how people spend, not measurements of
// how they do. Nobody surveyed anyone. There is no dataset behind them and no
// source to cite, and the report says so in its own words wherever a figure
// derived from them appears.
//
// What is sourced and what is not, kept apart on purpose:
//   sourced      the price level index for each country and category, which
//                is Eurostat and carries its dataset, reference year and
//                retrieval date everywhere it is printed
//   ours         this table, which decides how much of a trip each of those
//                categories accounts for
//
// Read the numbers as points, not percentages. Every answer adds or removes
// points from one or more components, negatives are floored at zero, and the
// nine totals are divided by their sum at the end so the weights add to 1.
// Only the ratios between these numbers matter.
//
// Change them here and nowhere else. Nothing in this module hard codes a
// weight outside this table.
// ─────────────────────────────────────────────────────────────────────────
export const EDITORIAL_WEIGHTS = {
  // Where every trip starts, before a single answer is read.
  base: {
    accommodation: 30,
    restaurantFood: 14,
    groceryFood: 7,
    drinks: 4,
    cityTransport: 6,
    intercityTransport: 3,
    recreation: 8,
    shopping: 3,
    communication: 2,
  } as Record<Component, number>,

  stayType: {
    hotel: { accommodation: 14 },
    apartment: { accommodation: 5, groceryFood: 3 },
    hostel: { accommodation: -14, groceryFood: 2 },
    friends: { accommodation: -25, groceryFood: 3 },
  } as Record<string, Points>,

  breakfast: {
    yes: { restaurantFood: -2 },
    no: { restaurantFood: 2, groceryFood: 1 },
  } as Record<string, Points>,

  mealsOut: {
    '0': { restaurantFood: -11, groceryFood: 11 },
    '1': { restaurantFood: 0, groceryFood: 4 },
    '2': { restaurantFood: 8, groceryFood: -2 },
    '3': { restaurantFood: 16, groceryFood: -4 },
  } as Record<string, Points>,

  snacks: {
    rarely: { restaurantFood: -1 },
    daily: { restaurantFood: 3 },
    several: { restaurantFood: 6 },
  } as Record<string, Points>,

  dinnerDrinks: {
    no: { drinks: -3 },
    sometimes: { drinks: 3 },
    most: { drinks: 9 },
  } as Record<string, Points>,

  cityTransport: {
    walking: { cityTransport: -4 },
    public: { cityTransport: 2 },
    mix: { cityTransport: 7 },
    taxi: { cityTransport: 13 },
  } as Record<string, Points>,

  carHire: {
    yes: { cityTransport: 7 },
    no: {},
  } as Record<string, Points>,

  // Intercity travel is the one component whose weight depends on how often
  // it happens, so it is scaled by moves divided by nights rather than set by
  // a single answer. A fortnight with four train legs weighs far more than a
  // fortnight in one city.
  intercityPerMove: {
    train: 32,
    coach: 14,
    flight: 22,
  } as Record<string, number>,

  museums: {
    rarely: { recreation: -4 },
    few: { recreation: 3 },
    most: { recreation: 9 },
  } as Record<string, Points>,

  tours: {
    none: { recreation: -3 },
    couple: { recreation: 4 },
    several: { recreation: 11 },
  } as Record<string, Points>,

  nightlife: {
    no: { drinks: -2 },
    occasionally: { drinks: 3, recreation: 2 },
    often: { drinks: 8, recreation: 4 },
  } as Record<string, Points>,

  shopping: {
    no: { shopping: -3 },
    little: { shopping: 4 },
    lot: { shopping: 12 },
  } as Record<string, Points>,

  esim: {
    yes: { communication: 4 },
    no: { communication: -1 },
  } as Record<string, Points>,

  party: {
    solo: { accommodation: 4 },
    couple: { accommodation: -2 },
    family: { accommodation: -4, groceryFood: 3, recreation: 2 },
    friends: { accommodation: -3, drinks: 3 },
  } as Record<string, Points>,

  // Applied in proportion to the share of the party that is children, so the
  // two head count fields move the weighting rather than only the totals.
  childShift: {
    groceryFood: 10,
    recreation: 8,
    drinks: -9,
    accommodation: -4,
  } as Points,
};

/* ─────────────────────────────── the inputs ────────────────────────────── */

export interface ReportInput {
  countries: string[]; // ISO codes, at least one
  nights: number;
  party: string;
  adults: number;
  children: number;
  ceiling: number;
  currency: string;
  base: number; // daily figure per person, from the style band above the form
  style: string;
  stayType: string;
  breakfast: string;
  mealsOut: string;
  snacks: string;
  dinnerDrinks: string;
  cityTransport: string;
  carHire: string;
  cityMoves: number;
  intercityMode: string;
  museums: string;
  tours: string;
  nightlife: string;
  shopping: string;
  esim: string;
}

// The currency labels the page offers, plus the empty string. An allowlist
// rather than a passthrough, because this is the only visitor supplied string
// that reaches the HTML unmapped.
const CURRENCIES = ['€', '$', '£', '₱', 'R$', ''];

// Every answer label the report prints, keyed by the value posted. Nothing a
// visitor sends is ever printed directly: it is looked up here or dropped.
export const ANSWER_LABELS: Record<string, Record<string, string>> = {
  party: {
    solo: 'Solo',
    couple: 'A couple',
    family: 'A family with children',
    friends: 'A group of friends',
  },
  stayType: {
    hotel: 'Hotels',
    apartment: 'An apartment or rental',
    hostel: 'Hostel dorms',
    friends: 'With friends or family',
  },
  breakfast: { yes: 'Breakfast usually included', no: 'Breakfast not included' },
  mealsOut: {
    '0': 'No meals out',
    '1': 'One meal out a day',
    '2': 'Two meals out a day',
    '3': 'Three meals out a day',
  },
  snacks: {
    rarely: 'Coffee and snacks rarely',
    daily: 'Coffee or a snack once a day',
    several: 'Coffee and snacks several times a day',
  },
  dinnerDrinks: {
    no: 'No drinks with dinner',
    sometimes: 'Drinks with dinner sometimes',
    most: 'Drinks with dinner most nights',
  },
  cityTransport: {
    walking: 'Mostly walking',
    public: 'Public transport',
    mix: 'A mix, with some taxis',
    taxi: 'Mostly taxis and ride hailing',
  },
  carHire: { yes: 'Hiring a car somewhere', no: 'No car hire' },
  intercityMode: { train: 'Train', coach: 'Coach', flight: 'Budget flights' },
  museums: {
    rarely: 'Museums rarely',
    few: 'A few museums',
    most: 'Museums most days',
  },
  tours: {
    none: 'No guided tours',
    couple: 'One or two guided tours',
    several: 'Several guided tours',
  },
  nightlife: {
    no: 'No nights out',
    occasionally: 'Occasional nights out',
    often: 'Frequent nights out',
  },
  shopping: { no: 'No shopping', little: 'A little shopping', lot: 'A lot of shopping' },
  esim: { yes: 'An eSIM or data plan', no: 'No eSIM needed' },
  style: { budget: 'Budget', mid: 'Mid range', comfortable: 'Comfortable' },
};

// The three daily bands the free comparison offers, matching /tools/budget/.
// Durian's own editorial estimate for Western Europe, not a statistic.
const STYLE_BASE: Record<string, number> = { budget: 100, mid: 190, comfortable: 320 };

export const DISCLAIMER =
  'Educational information only. Not legal advice. Always check the official embassy or consulate source.';

/* ───────────────────────────── normalisation ───────────────────────────── */

function count(raw: unknown, min: number, max: number, fallback: number): number {
  const v = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
}

function money(raw: unknown): number {
  const v = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function obj(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
}

// A posted answer is kept only if the weighting table has an entry for it.
// Anything else falls back, so a hand crafted body cannot introduce a value
// the arithmetic has never seen.
function pick(raw: unknown, allowed: Record<string, unknown>, fallback: string): string {
  const v = String(raw ?? '');
  return Object.prototype.hasOwnProperty.call(allowed, v) ? v : fallback;
}

// Takes anything at all and returns a valid ReportInput. The endpoint hands
// straight over to this, so the rest of the module never sees a bad value.
export function normalise(raw: unknown, data: CostData): ReportInput {
  const src = obj(raw);

  const known = new Set(data.countries.map((c) => c.iso));
  const asked = Array.isArray(src.countries) ? src.countries : [];
  const countries = Array.from(
    new Set(asked.map((c) => String(c)).filter((c) => known.has(c)))
  );

  const currencyRaw = typeof src.currency === 'string' ? src.currency : '€';
  const style = pick(src.style, STYLE_BASE, 'mid');

  const adults = count(src.adults, 0, 20, 1);
  const children = count(src.children, 0, 20, 0);

  return {
    // An empty selection is a defaulted selection rather than an error: the
    // endpoint never fails on a bad body, it reports on a sane one.
    countries: countries.length ? countries : data.countries.map((c) => c.iso),
    nights: count(src.nights, 1, 365, 10),
    party: pick(src.party, EDITORIAL_WEIGHTS.party, 'solo'),
    adults: adults + children === 0 ? 1 : adults,
    children,
    ceiling: money(src.ceiling),
    currency: CURRENCIES.includes(currencyRaw) ? currencyRaw : '',
    base: money(src.base) || STYLE_BASE[style],
    style,
    stayType: pick(src.stayType, EDITORIAL_WEIGHTS.stayType, 'hotel'),
    breakfast: pick(src.breakfast, EDITORIAL_WEIGHTS.breakfast, 'no'),
    mealsOut: pick(src.mealsOut, EDITORIAL_WEIGHTS.mealsOut, '1'),
    snacks: pick(src.snacks, EDITORIAL_WEIGHTS.snacks, 'daily'),
    dinnerDrinks: pick(src.dinnerDrinks, EDITORIAL_WEIGHTS.dinnerDrinks, 'sometimes'),
    cityTransport: pick(src.cityTransport, EDITORIAL_WEIGHTS.cityTransport, 'public'),
    carHire: pick(src.carHire, EDITORIAL_WEIGHTS.carHire, 'no'),
    cityMoves: count(src.cityMoves, 0, 100, 0),
    intercityMode: pick(src.intercityMode, EDITORIAL_WEIGHTS.intercityPerMove, 'train'),
    museums: pick(src.museums, EDITORIAL_WEIGHTS.museums, 'few'),
    tours: pick(src.tours, EDITORIAL_WEIGHTS.tours, 'none'),
    nightlife: pick(src.nightlife, EDITORIAL_WEIGHTS.nightlife, 'occasionally'),
    shopping: pick(src.shopping, EDITORIAL_WEIGHTS.shopping, 'little'),
    esim: pick(src.esim, EDITORIAL_WEIGHTS.esim, 'no'),
  };
}

/* ───────────────────────────── the arithmetic ──────────────────────────── */

export type Weights = Record<Component, number>;

function addPoints(into: Record<Component, number>, points: Points | undefined): void {
  if (!points) return;
  for (const key of Object.keys(points) as Component[]) {
    into[key] += points[key] ?? 0;
  }
}

// Every answer moves at least one component. The nine totals are floored at
// zero and divided by their sum, so the result always adds to 1.
export function computeWeights(input: ReportInput): Weights {
  const w = { ...EDITORIAL_WEIGHTS.base };
  const E = EDITORIAL_WEIGHTS;

  addPoints(w, E.party[input.party]);
  addPoints(w, E.stayType[input.stayType]);
  addPoints(w, E.breakfast[input.breakfast]);
  addPoints(w, E.mealsOut[input.mealsOut]);
  addPoints(w, E.snacks[input.snacks]);
  addPoints(w, E.dinnerDrinks[input.dinnerDrinks]);
  addPoints(w, E.cityTransport[input.cityTransport]);
  addPoints(w, E.carHire[input.carHire]);
  addPoints(w, E.museums[input.museums]);
  addPoints(w, E.tours[input.tours]);
  addPoints(w, E.nightlife[input.nightlife]);
  addPoints(w, E.shopping[input.shopping]);
  addPoints(w, E.esim[input.esim]);

  // Children shift spending away from drinks and towards food from shops and
  // things to do, in proportion to how much of the party they are.
  const heads = input.adults + input.children;
  const childShare = heads > 0 ? input.children / heads : 0;
  if (childShare > 0) {
    for (const key of Object.keys(E.childShift) as Component[]) {
      w[key] += (E.childShift[key] ?? 0) * childShare;
    }
  }

  // How often you move city, not whether you do.
  const movesPerNight = input.nights > 0 ? input.cityMoves / input.nights : 0;
  w.intercityTransport += movesPerNight * (E.intercityPerMove[input.intercityMode] ?? 0);

  let sum = 0;
  for (const key of COMPONENTS) {
    if (w[key] < 0) w[key] = 0;
    sum += w[key];
  }
  if (sum <= 0) return { ...EDITORIAL_WEIGHTS.base };

  const out = {} as Weights;
  for (const key of COMPONENTS) out[key] = w[key] / sum;
  return out;
}

export interface BasketRow {
  component: Component;
  label: string;
  weight: number;
  category: CategoryKey;
  categoryName: string;
}

export function buildBasket(weights: Weights, source: CostSource): BasketRow[] {
  return COMPONENTS.map((component) => {
    const category = COMPONENT_CATEGORY[component];
    return {
      component,
      label: COMPONENT_LABELS[component],
      weight: weights[component],
      category,
      categoryName: source.categories[category] ?? source.category,
    };
  }).sort((a, b) => b.weight - a.weight);
}

export interface CountryRow {
  name: string;
  iso: string;
  plainIndex: number; // the restaurants and hotels index on its own
  personalIndex: number; // the same country, weighted by their answers
  perDay: number; // per person, per day
  perTrip: number; // everyone, whole trip
  plainPerTrip: number;
  gap: number; // ceiling minus perTrip. Negative means over.
  plainRank: number;
  personalRank: number;
}

// The personal index is the sum of each weight multiplied by that country's
// index for the matching Eurostat category. Everything else on this page is
// that one number applied to their daily figure.
export function personalIndexFor(country: CostCountry, weights: Weights): number {
  let total = 0;
  for (const component of COMPONENTS) {
    total += weights[component] * country[COMPONENT_CATEGORY[component]];
  }
  return total;
}

export function computeCountries(
  input: ReportInput,
  data: CostData,
  weights: Weights
): CountryRow[] {
  const chosen = data.countries.filter((c) => input.countries.includes(c.iso));
  const heads = Math.max(1, input.adults + input.children);

  const plainOrder = [...chosen].sort((a, b) => a.stay - b.stay).map((c) => c.iso);

  const rows = chosen.map((c) => {
    const personalIndex = personalIndexFor(c, weights);
    const perDay = (input.base * personalIndex) / 100;
    const perTrip = perDay * input.nights * heads;
    const plainPerTrip = ((input.base * c.stay) / 100) * input.nights * heads;
    return {
      name: c.name,
      iso: c.iso,
      plainIndex: c.stay,
      personalIndex,
      perDay,
      perTrip,
      plainPerTrip,
      gap: input.ceiling > 0 ? input.ceiling - perTrip : 0,
      plainRank: plainOrder.indexOf(c.iso) + 1,
      personalRank: 0,
    };
  });

  rows.sort((a, b) => a.personalIndex - b.personalIndex);
  rows.forEach((r, i) => {
    r.personalRank = i + 1;
  });
  return rows;
}

/* ─────────────────────────────── rendering ─────────────────────────────── */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function esc(value: string): string {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function fmt(value: number, currency: string): string {
  const text = Math.round(value).toLocaleString('en-GB');
  return currency ? currency + text : text;
}

function idx(value: number): string {
  return value.toFixed(1);
}

function pct(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Dates are printed the way a reader says them rather than the way a dataset
// stores them, which also keeps dashes out of the copy.
function prettyDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim());
  if (!m) return String(iso);
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return String(iso);
  return `${Number(m[3])} ${month} ${m[1]}`;
}

function list(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
}

function answer(group: string, value: string): string {
  return ANSWER_LABELS[group]?.[value] ?? '';
}

const STYLES = `
  :root {
    --bg: #FFFFFF;
    --bg-alt: #F4F6F8;
    --surface: #FFFFFF;
    --text: #1A1A2E;
    --muted: #5A6477;
    --light: #8892A0;
    --border: #E2E6EB;
    --border-light: #EFF1F4;
    --primary: #1B3A5C;
    --primary-light: #2A5580;
    --primary-bg: #E8EEF4;
    --navy: #0F2138;
    --accent: #C44B36;
    --accent-bg: #FAECE8;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #0F2138;
      --bg-alt: #152B45;
      --surface: #152B45;
      --text: #EAEEF3;
      --muted: #A3AFC0;
      --light: #7B8798;
      --border: #25405E;
      --border-light: #1D3450;
      --primary: #8FB4DA;
      --primary-light: #8FB4DA;
      --primary-bg: #1B3A5C;
      --navy: #EAEEF3;
      --accent: #E8836C;
      --accent-bg: #3A1F19;
    }
  }
  :root[data-theme="dark"] {
    --bg: #0F2138;
    --bg-alt: #152B45;
    --surface: #152B45;
    --text: #EAEEF3;
    --muted: #A3AFC0;
    --light: #7B8798;
    --border: #25405E;
    --border-light: #1D3450;
    --primary: #8FB4DA;
    --primary-light: #8FB4DA;
    --primary-bg: #1B3A5C;
    --navy: #EAEEF3;
    --accent: #E8836C;
    --accent-bg: #3A1F19;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 40px 24px 72px;
    background: var(--bg);
    color: var(--text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.65;
  }
  .wrap { max-width: 780px; margin: 0 auto; }
  h1, h2, h3 {
    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
    color: var(--navy);
    line-height: 1.2;
    letter-spacing: -.02em;
    font-weight: 400;
  }
  h1 { font-size: 2.25rem; margin: 0 0 8px; }
  h2 { font-size: 1.5rem; margin: 48px 0 8px; padding-top: 24px; border-top: 2px solid var(--border); }
  h3 { font-size: 1.125rem; margin: 28px 0 6px; font-weight: 700; }
  p { margin: 0 0 14px; max-width: 65ch; }
  a { color: var(--primary); }
  .bar {
    display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
    justify-content: space-between; margin: 0 0 28px; padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  .bar a { font-size: .875rem; color: var(--muted); }
  .bar button {
    font: inherit; font-size: .875rem; padding: 8px 18px; cursor: pointer;
    border: 1px solid var(--primary); border-radius: 6px;
    background: var(--primary); color: #FFFFFF;
  }
  .eyebrow {
    font-size: .75rem; letter-spacing: .1em; text-transform: uppercase;
    color: var(--accent); margin: 0 0 6px; font-weight: 600;
  }
  .lede { color: var(--muted); font-size: .9375rem; margin-bottom: 28px; }
  .muted { color: var(--muted); font-size: .875rem; }
  .facts { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 8px; padding: 0; list-style: none; }
  .facts li {
    background: var(--bg-alt); border: 1px solid var(--border);
    border-radius: 9999px; padding: 5px 14px; font-size: .875rem; color: var(--muted);
  }
  .verdict {
    border: 2px solid var(--primary); border-radius: 12px;
    padding: 22px 24px; margin: 24px 0 8px; break-inside: avoid;
  }
  .verdict__label { font-size: .75rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin: 0 0 4px; }
  .verdict__value {
    font-family: 'Playfair Display', Georgia, serif; font-weight: 400;
    font-size: 2.25rem; line-height: 1.2; color: var(--primary); margin: 0 0 16px;
  }
  .split { display: flex; flex-wrap: wrap; gap: 32px; }
  .split div { min-width: 150px; }
  .split span { display: block; font-size: .8125rem; color: var(--muted); }
  .split b { font-size: 1.25rem; color: var(--text); font-weight: 600; }
  .table-wrap { overflow-x: auto; margin: 18px 0 10px; }
  table { width: 100%; border-collapse: collapse; margin: 0; font-size: .9375rem; }
  .table-wrap--wide table { min-width: 560px; }
  caption { text-align: left; font-size: .875rem; color: var(--muted); padding-bottom: 8px; }
  th, td { padding: 9px 10px; border-bottom: 1px solid var(--border); text-align: right; }
  th:first-child, td:first-child { text-align: left; }
  thead th {
    font-size: .8125rem; letter-spacing: .05em; text-transform: uppercase;
    color: var(--muted); border-bottom: 2px solid var(--primary);
  }
  tbody tr.sum td, tbody tr.sum th { font-weight: 700; border-top: 2px solid var(--primary); }
  td.over { color: var(--accent); font-weight: 600; }
  .chart { margin: 18px 0 8px; }
  .chart__row { margin: 0 0 14px; break-inside: avoid; }
  .chart__head { display: flex; justify-content: space-between; gap: 12px; font-size: .875rem; margin-bottom: 4px; }
  .chart__head b { font-weight: 600; color: var(--navy); }
  .chart__head span { color: var(--muted); }
  .chart__bar { height: 10px; border-radius: 9999px; background: var(--bg-alt); overflow: hidden; margin-bottom: 3px; }
  .chart__fill { display: block; height: 100%; border-radius: 9999px; background: var(--primary); }
  .chart__fill--plain { background: var(--border); }
  .key { display: flex; flex-wrap: wrap; gap: 18px; font-size: .8125rem; color: var(--muted); margin: 0 0 18px; }
  .key i { display: inline-block; width: 22px; height: 8px; border-radius: 9999px; margin-right: 6px; vertical-align: middle; font-style: normal; }
  .key i.personal { background: var(--primary); }
  .key i.plain { background: var(--border); }
  .method {
    background: var(--bg-alt); border-left: 3px solid var(--primary);
    padding: 14px 18px; margin: 16px 0 0; font-size: .875rem; break-inside: avoid;
  }
  .method p { margin: 0 0 8px; }
  .method p:last-child { margin: 0; }
  .method code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .8125rem;
    background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 1px 5px;
  }
  .ours {
    border: 1px solid var(--accent); background: var(--accent-bg);
    border-radius: 8px; padding: 14px 18px; margin: 18px 0 0; font-size: .875rem; break-inside: avoid;
  }
  .ours p { margin: 0 0 8px; }
  .ours p:last-child { margin: 0; }
  .provenance { width: 100%; border-collapse: collapse; font-size: .9375rem; }
  .provenance th { width: 34%; text-align: left; font-weight: 600; color: var(--muted); vertical-align: top; }
  .provenance td { text-align: left; word-break: break-word; }
  ul.plain { margin: 0 0 14px; padding-left: 20px; }
  ul.plain li { margin-bottom: 8px; max-width: 65ch; }
  .disclaimer {
    margin-top: 48px; padding: 18px 20px; border: 2px solid var(--text);
    border-radius: 8px; font-size: .9375rem; break-inside: avoid;
  }
  .disclaimer p { margin: 0; }
  footer { margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--border); font-size: .8125rem; color: var(--muted); }
  @media print {
    :root, :root[data-theme="dark"] {
      --bg: #FFFFFF; --bg-alt: #F4F6F8; --surface: #FFFFFF; --text: #000000;
      --muted: #333333; --light: #555555; --border: #CCCCCC; --border-light: #E5E5E5;
      --primary: #1B3A5C; --primary-light: #2A5580; --primary-bg: #E8EEF4;
      --navy: #0F2138; --accent: #C44B36; --accent-bg: #FAECE8;
    }
    body { padding: 0; font-size: 11pt; background: #FFFFFF; color: #000000; }
    button, .no-print { display: none !important; }
    * { box-shadow: none !important; }
    .table-wrap { overflow: visible; }
    .table-wrap table { min-width: 0; }
    h2 { page-break-after: avoid; break-after: avoid; }
    table { page-break-inside: auto; }
    tr, .chart__row, .verdict, .method, .ours, .disclaimer { page-break-inside: avoid; break-inside: avoid; }
    .chart__fill { background: #1B3A5C !important; }
    .chart__fill--plain { background: #B8C2CE !important; }
  }
`;

/* ─────────────────────────────── sections ─────────────────────────────── */

function renderCover(input: ReportInput, rows: CountryRow[], generatedOn: string): string {
  const heads = input.adults + input.children;
  const who = answer('party', input.party);
  const names = list(rows.map((r) => r.name));

  const facts = [
    `${rows.length} ${rows.length === 1 ? 'country' : 'countries'}`,
    `${input.nights} ${input.nights === 1 ? 'night' : 'nights'}`,
    `${heads} ${heads === 1 ? 'person' : 'people'}`,
    esc(answer('style', input.style)) + ' daily figure',
  ];

  const partyDetail =
    input.children > 0
      ? `${input.adults} ${input.adults === 1 ? 'adult' : 'adults'} and ${input.children} ${
          input.children === 1 ? 'child' : 'children'
        }`
      : `${input.adults} ${input.adults === 1 ? 'adult' : 'adults'}`;

  return `
  <p class="eyebrow">Durian Travel</p>
  <h1>Your cost per country report</h1>
  <p class="lede">${esc(who)}, ${esc(partyDetail)}, ${input.nights} ${
    input.nights === 1 ? 'night' : 'nights'
  } across ${esc(names)}. Generated ${esc(prettyDate(generatedOn))}.</p>
  <ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>
  <p class="muted">The free comparison prices your whole trip with one Eurostat index, the one for
  restaurants and hotels. This report prices it with seven, weighted by how you answered. Every
  index below is Eurostat. The weighting is ours, and it is labelled as ours everywhere it
  appears.</p>`;
}

function renderVerdict(input: ReportInput, rows: CountryRow[]): string {
  const c = input.currency;
  const cheapest = rows[0];
  const dearest = rows[rows.length - 1];

  // The country whose ranking moves most between the two methods is the whole
  // argument for the report, so it is named rather than left to be spotted.
  const movers = rows
    .map((r) => ({ r, move: r.plainRank - r.personalRank }))
    .sort((a, b) => Math.abs(b.move) - Math.abs(a.move));
  const mover = movers[0];

  let moved: string;
  if (rows.length === 1) {
    const only = rows[0];
    const diff = only.personalIndex - only.plainIndex;
    moved = `You picked one country, so there is no ranking to move. What does move is the price
      level itself. On restaurants and hotels alone ${esc(only.name)} sits at
      ${idx(only.plainIndex)}. Weighted the way you travel it sits at ${idx(only.personalIndex)},
      which is ${idx(Math.abs(diff))} points ${diff >= 0 ? 'higher' : 'lower'}.`;
  } else if (!mover || mover.move === 0) {
    moved = `Your answers do not reorder the list. Every country holds the position it had on the
      restaurants and hotels index alone. The gaps between them change, but the order does not,
      so on this trip the free comparison was already telling you the right story.`;
  } else {
    const dir = mover.move > 0 ? 'cheaper' : 'dearer';
    moved = `The biggest change is ${esc(mover.r.name)}. On restaurants and hotels alone it ranks
      ${mover.r.plainRank} of ${rows.length}. Weighted the way you travel it ranks
      ${mover.r.personalRank}, which is ${Math.abs(mover.move)}
      ${Math.abs(mover.move) === 1 ? 'place' : 'places'} ${dir} for you than the free comparison
      suggested.`;
  }

  const ceiling =
    input.ceiling > 0
      ? `<p>You said you will not go over <b>${fmt(input.ceiling, c)}</b>. ${
          cheapest.perTrip <= input.ceiling
            ? `${esc(cheapest.name)} comes in ${fmt(
                input.ceiling - cheapest.perTrip,
                c
              )} under that.`
            : `Every country you picked comes in above it, ${esc(cheapest.name)} by the least at
               ${fmt(cheapest.perTrip - input.ceiling, c)} over.`
        }</p>`
      : '<p class="muted">You did not set a ceiling, so no country is measured against one.</p>';

  return `
  <h2>The verdict</h2>
  <div class="verdict">
    <p class="verdict__label">Cheapest for the way you travel</p>
    <p class="verdict__value">${esc(cheapest.name)}</p>
    <div class="split">
      <div><span>Per person, per day</span><b>${fmt(cheapest.perDay, c)}</b></div>
      <div><span>Whole trip, everyone</span><b>${fmt(cheapest.perTrip, c)}</b></div>
      <div><span>Personal index</span><b>${idx(cheapest.personalIndex)}</b></div>
    </div>
  </div>
  ${
    rows.length > 1
      ? `<p>The dearest of the countries you picked is <b>${esc(dearest.name)}</b>, at
         ${fmt(dearest.perDay, c)} per person per day, or ${fmt(dearest.perTrip, c)} for the trip.
         The gap between the two is ${fmt(dearest.perTrip - cheapest.perTrip, c)}.</p>`
      : ''
  }
  <p>${moved}</p>
  ${ceiling}`;
}

function renderBasket(
  input: ReportInput,
  basket: BasketRow[],
  lean: CountryRow,
  country: CostCountry,
  source: CostSource
): string {
  const body = basket
    .map(
      (r) => `
      <tr>
        <th scope="row">${esc(r.label)}</th>
        <td>${pct(r.weight)}</td>
        <td>${esc(r.categoryName)}</td>
        <td>${idx(country[r.category])}</td>
      </tr>`
    )
    .join('');

  return `
  <h2>Your basket</h2>
  <p>Nine parts of a trip, each priced by the Eurostat category that fits it. The weight is how
  much of your daily spending that part accounts for, worked out from your answers. The index is
  what ${esc(country.name)} costs for that category, where the EU27 average is 100.</p>

  <div class="table-wrap table-wrap--wide">
  <table>
    <caption>Price level indices are ${esc(source.publisher)}, dataset
    ${esc(source.dataset)}, indicator ${esc(source.indicator)}, reference year
    ${esc(source.referenceYear)}, published ${esc(prettyDate(source.eurostatLastUpdated))} and
    retrieved by us on ${esc(prettyDate(source.categoriesRetrieved))}. The weights are not
    ${esc(source.publisher)} and are not a published statistic.</caption>
    <thead>
      <tr>
        <th scope="col">Part of the trip</th>
        <th scope="col">Weight</th>
        <th scope="col">Eurostat category</th>
        <th scope="col">Index, ${esc(country.name)}</th>
      </tr>
    </thead>
    <tbody>
      ${body}
      <tr class="sum">
        <th scope="row">Your personal index</th>
        <td>100%</td>
        <td class="muted">weighted sum of the column to the right</td>
        <td>${idx(lean.personalIndex)}</td>
      </tr>
    </tbody>
  </table>
  </div>

  <div class="ours">
    <p><b>The weights are ours, not Eurostat's.</b> They are Durian's editorial weighting: our
    assumptions about how somebody who answered the way you did spends their money. Nobody
    surveyed anyone, there is no dataset behind them, and a different set of assumptions would
    give a different personal index.</p>
    <p>The indices they multiply are a different matter. Those are published, sourced and dated,
    and they are what makes the comparison between countries worth reading.</p>
  </div>

  <div class="method">
    <p><b>How the personal index is worked out.</b>
    <code>personal index = &Sigma; (weight &times; that country's index for the category)</code>.</p>
    <p>Then <code>per person per day = your daily figure &times; personal index &divide; 100</code>,
    and <code>whole trip = per day &times; ${input.nights} nights &times;
    ${input.adults + input.children} ${input.adults + input.children === 1 ? 'person' : 'people'}</code>.</p>
  </div>`;
}

function renderCountries(input: ReportInput, rows: CountryRow[]): string {
  const c = input.currency;
  const hasCeiling = input.ceiling > 0;

  const body = rows
    .map(
      (r) => `
      <tr>
        <th scope="row">${esc(r.name)}</th>
        <td>${idx(r.personalIndex)}</td>
        <td>${fmt(r.perDay, c)}</td>
        <td>${fmt(r.perTrip, c)}</td>
        ${
          hasCeiling
            ? `<td class="${r.gap < 0 ? 'over' : ''}">${
                r.gap < 0 ? fmt(-r.gap, c) + ' over' : fmt(r.gap, c) + ' under'
              }</td>`
            : ''
        }
      </tr>`
    )
    .join('');

  return `
  <h2>Country by country</h2>
  <p>Sorted cheapest first for the way you travel, which is not always the same order as the free
  comparison. Per day is one person. Per trip is everyone, for
  ${input.nights} ${input.nights === 1 ? 'night' : 'nights'}.</p>

  <div class="table-wrap table-wrap--wide">
  <table>
    <caption>Your daily figure is ${fmt(input.base, c)} per person, the
    ${esc(answer('style', input.style)).toLowerCase()} band. That figure is Durian's own estimate
    for a Western European trip, not a published statistic. Each country's index then scales
    it.</caption>
    <thead>
      <tr>
        <th scope="col">Country</th>
        <th scope="col">Personal index</th>
        <th scope="col">Per person, per day</th>
        <th scope="col">Whole trip</th>
        ${hasCeiling ? `<th scope="col">Against ${fmt(input.ceiling, c)}</th>` : ''}
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>
  </div>
  ${
    hasCeiling
      ? `<p class="muted">The last column is your ceiling minus the trip total. It counts the
         nights and the people, and it does not count flights, because no free source prices
         those.</p>`
      : ''
  }`;
}

function renderChart(rows: CountryRow[]): string {
  const max = Math.max(...rows.map((r) => Math.max(r.personalIndex, r.plainIndex)), 1);

  const bars = rows
    .map((r) => {
      const diff = r.personalIndex - r.plainIndex;
      const note =
        Math.abs(diff) < 0.05
          ? 'the same either way'
          : `${idx(Math.abs(diff))} ${diff > 0 ? 'higher' : 'lower'} for you`;
      return `
      <div class="chart__row">
        <div class="chart__head"><b>${esc(r.name)}</b><span>${idx(r.personalIndex)} against ${idx(
          r.plainIndex
        )}, ${note}</span></div>
        <div class="chart__bar"><span class="chart__fill" style="width:${(
          (r.personalIndex / max) *
          100
        ).toFixed(1)}%"></span></div>
        <div class="chart__bar"><span class="chart__fill chart__fill--plain" style="width:${(
          (r.plainIndex / max) *
          100
        ).toFixed(1)}%"></span></div>
      </div>`;
    })
    .join('');

  return `
  <h2>The difference, drawn</h2>
  <p>Two bars per country. The first is your personal index, the second is the restaurants and
  hotels index the free comparison uses on its own. Where the two differ, the free comparison was
  pricing your trip with the wrong basket.</p>
  <div class="key">
    <span><i class="personal"></i>Your personal index</span>
    <span><i class="plain"></i>Restaurants and hotels only</span>
  </div>
  <div class="chart">${bars}</div>`;
}

function renderSplit(input: ReportInput, basket: BasketRow[], lean: CountryRow, country: CostCountry): string {
  const c = input.currency;
  const heads = Math.max(1, input.adults + input.children);

  const body = basket
    .map((r) => {
      const perDay = (input.base * r.weight * country[r.category]) / 100;
      return `
      <tr>
        <th scope="row">${esc(r.label)}</th>
        <td>${pct(r.weight)}</td>
        <td>${fmt(perDay, c)}</td>
        <td>${fmt(perDay * input.nights * heads, c)}</td>
      </tr>`;
    })
    .join('');

  return `
  <h2>Where your money goes in ${esc(country.name)}</h2>
  <p>${esc(country.name)} is the cheapest of the countries you picked for the way you travel, so
  this is the one worth breaking open. Each line is your daily figure, split by weight, then
  priced at that country's index for the category.</p>

  <div class="table-wrap table-wrap--wide">
  <table>
    <caption>Per person per day, and then the same figure across
    ${input.nights} ${input.nights === 1 ? 'night' : 'nights'} for
    ${heads} ${heads === 1 ? 'person' : 'people'}.</caption>
    <thead>
      <tr>
        <th scope="col">Part of the trip</th>
        <th scope="col">Weight</th>
        <th scope="col">Per person, per day</th>
        <th scope="col">Whole trip</th>
      </tr>
    </thead>
    <tbody>
      ${body}
      <tr class="sum">
        <th scope="row">Total</th>
        <td>100%</td>
        <td>${fmt(lean.perDay, c)}</td>
        <td>${fmt(lean.perTrip, c)}</td>
      </tr>
    </tbody>
  </table>
  </div>`;
}

function renderLimits(): string {
  return `
  <h2>What this does not cover</h2>
  <ul class="plain">
    <li><b>Flights.</b> There is no free, official source for fares, so no figure in this report
    is a flight. Whatever you are quoted sits on top of every total here.</li>
    <li><b>Season.</b> The indices are annual averages. August and February can differ by more
    than two countries do, and no part of this report knows which month you are travelling.</li>
    <li><b>The capital city premium.</b> Prices in a capital, and in the streets around the
    sights, run above the national figure. Sometimes well above.</li>
    <li><b>The difference between a country and a tourist district.</b> Every index here is a
    national average across everything a resident buys. You will be buying in the parts of the
    country that charge visitors the most.</li>
    <li><b>The weighting itself.</b> The nine weights are our assumptions about behaviour, not a
    measurement of yours. They are the part of this report you should argue with.</li>
  </ul>
  <p>Treat the ranking as the reliable part and the exact figures as a starting point.</p>`;
}

function renderSources(source: CostSource, rows: CountryRow[]): string {
  const used = Array.from(new Set(COMPONENTS.map((k) => COMPONENT_CATEGORY[k])));

  return `
  <h2>Sources</h2>
  <table class="provenance">
    <tbody>
      <tr><th scope="row">Publisher</th><td>${esc(source.publisher)}</td></tr>
      <tr><th scope="row">Dataset</th><td>${esc(source.datasetName)} (${esc(source.dataset)})</td></tr>
      <tr><th scope="row">Indicator</th><td>${esc(source.indicator)}</td></tr>
      <tr><th scope="row">Categories used</th><td>${used
        .map((k) => esc(source.categories[k] ?? k))
        .join('<br>')}</td></tr>
      <tr><th scope="row">Reference year</th><td>${esc(source.referenceYear)}</td></tr>
      <tr><th scope="row">Last updated by ${esc(source.publisher)}</th><td>${esc(
        prettyDate(source.eurostatLastUpdated)
      )}</td></tr>
      <tr><th scope="row">Retrieved by us</th><td>${esc(
        prettyDate(source.categoriesRetrieved)
      )}</td></tr>
      <tr><th scope="row">Source</th><td><a href="${esc(source.url)}">${esc(source.url)}</a></td></tr>
      <tr><th scope="row">Countries in this report</th><td>${rows.length}</td></tr>
      <tr><th scope="row">The weighting</th><td>Durian Travel editorial weighting. Not published,
      not a statistic, and not ${esc(source.publisher)}.</td></tr>
      <tr><th scope="row">The daily figure</th><td>Durian Travel editorial estimate for a Western
      European trip. Also not a statistic.</td></tr>
    </tbody>
  </table>
  <p class="muted">${esc(source.note)}</p>`;
}

/* ────────────────────────────── the report ─────────────────────────────── */

export interface RenderOptions {
  generatedOn?: string; // ISO date, YYYY-MM-DD. Defaults to today in UTC.
}

export function buildReport(raw: unknown, data: CostData, options: RenderOptions = {}): string {
  const input = normalise(raw, data);
  const weights = computeWeights(input);
  const basket = buildBasket(weights, data._source);
  const rows = computeCountries(input, data, weights);
  const lean = rows[0];
  const leanCountry = data.countries.find((c) => c.iso === lean.iso) as CostCountry;
  const generatedOn = options.generatedOn ?? new Date().toISOString().slice(0, 10);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Your cost per country report | DURIAN Travel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Playfair+Display:wght@400;700&amp;display=swap">
<style>${STYLES}</style>
</head>
<body>
<div class="wrap">
<div class="bar no-print">
  <a href="/tools/cost-per-country/">Back to the comparison</a>
  <button type="button" onclick="window.print()">Print or save as PDF</button>
</div>
${renderCover(input, rows, generatedOn)}
${renderVerdict(input, rows)}
${renderBasket(input, basket, lean, leanCountry, data._source)}
${renderCountries(input, rows)}
${renderChart(rows)}
${renderSplit(input, basket, lean, leanCountry)}
${renderLimits()}
${renderSources(data._source, rows)}

<div class="disclaimer">
  <p>${DISCLAIMER}</p>
</div>

<footer>
  <p>Cost per country report, generated ${esc(prettyDate(generatedOn))} by DURIAN Travel.
  Prepared by the Durian Travel Editorial Team. Estimates only, built from the answers you gave.
  Prices change constantly and vary by season, city and how far ahead you book.</p>
</footer>
</div>
</body>
</html>`;
}
