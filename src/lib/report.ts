// The cost per country report generator.
//
// Pure functions only. No network, no file system, no environment, no clock
// beyond the one date passed in. `functions/api/report.ts` is the thin HTTP
// wrapper around this module, and it only ever calls `buildReport`.
//
// This module lives outside functions/ on purpose. Cloudflare Pages turns
// every file under functions/ into a route, so the calculation is kept here
// where it can only ever be imported, never requested. Nothing in src/pages
// imports it, so it never reaches a browser, and neither do the editorial
// tables below.
//
// What the report does. It lays the options out against the reader's own
// budget and lets them choose: each country they are comparing on its own for
// the whole trip, then the realistic ways to combine those countries. Every
// option carries a total, a daily figure per person, and what it leaves spare
// or how far over it goes. The report never names a best option and never
// recommends one.
//
// What the reader sees and what stays here. Every Eurostat source and date is
// printed. The editorial weights are not, because they are the method. The
// report describes what each part of a trip covers in words and never prints
// how much of a day each part is given.
//
// Every figure comes from three places only: the reader's answers,
// src/data/country-costs.json, and the editorial tables below. Nothing is
// fetched. No fare is ever invented: the only flight figure in a report is the
// one the reader typed.

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

/* ───────────────────────────── parts of a trip ─────────────────────────── */

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
  intercityTransport: 'Traveling between cities',
  recreation: 'Museums, tours and going out',
  shopping: 'Shopping',
  communication: 'Data and calls',
};

// What each part of a trip covers, in plain words. The report prints these in
// place of the weights, so the reader learns what goes into a figure without
// learning how it is put together. The Eurostat category that prices each part
// is added from the dataset when it is printed, so the two cannot drift apart.
const PART_COVERS: Record<Component, string> = {
  accommodation: 'your room or bed each night',
  restaurantFood: 'the meals, coffee and snacks you buy in cafés and restaurants',
  groceryFood: 'the groceries you buy to prepare and eat yourself',
  drinks: 'alcohol',
  cityTransport: 'local public transport, taxis and ride hailing, and hiring a car if you do',
  intercityTransport: 'the trains, buses or flights you take between cities inside one country',
  recreation: 'entry tickets, guided tours and nights out',
  shopping: 'clothes, shoes and the things you buy to take home',
  communication: 'your eSIM or data plan',
};

// A part that needs one more honest word about what its price level measures.
const PART_NOTES: Partial<Record<Component, string>> = {
  drinks: ', which tracks what alcohol costs in shops rather than in bars',
};

// Which Eurostat category prices each part. Two parts share the restaurants
// and hotels index, because that Eurostat category covers both a hotel room
// and a restaurant meal.
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
// DURIAN'S EDITORIAL WEIGHTING. NOT A PUBLISHED STATISTIC. NEVER PRINTED.
//
// These numbers are assumptions about how people spend, not measurements of
// how they do. Nobody surveyed anyone. There is no dataset behind them and no
// source to cite, and the report says in its own words that the split of a
// day between parts of a trip is Durian's estimate.
//
// What is sourced and what is not, kept apart on purpose:
//   sourced      the price level for each country and category, which is
//                Eurostat and carries its dataset, reference year and
//                retrieval date everywhere it is printed
//   ours         this table, which decides how much of a day each of those
//                categories accounts for
//
// Read the numbers as points, not percentages. Every answer adds or removes
// points from one or more parts, negatives are floored at zero, and the nine
// totals are divided by their sum at the end so the weights add to 1. Only
// the ratios between these numbers matter.
//
// The weights are the method, so they are never printed. Change them here and
// nowhere else. Nothing in this module hard codes a weight outside this table.
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

  // Travel between cities is the one part whose weight depends on how often it
  // happens, so it is scaled by moves divided by nights rather than set by a
  // single answer. Two weeks with four train journeys weighs far more than two
  // weeks in one city. The same figures also shape the estimate for a journey
  // between countries, below. The key `coach` is kept for saved answers; the
  // reader only ever sees the word Bus.
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

// ─────────────────────────────────────────────────────────────────────────
// DURIAN'S EDITORIAL RULES FOR COMBINING COUNTRIES. NOT PUBLISHED FIGURES.
//
// Wherever one of these shapes a number, the report says in that sentence
// that it is Durian's estimate.
// ─────────────────────────────────────────────────────────────────────────
export const COMBINING = {
  // Fewer nights than this in a country is passing through, not staying, so a
  // combination is only built when every country in it gets at least this.
  minNightsPerCountry: 3,
  // The largest combination the report builds.
  maxCountriesInCombination: 4,
  // Combinations are only built when the reader is comparing this many
  // countries or fewer. Beyond that there are too many options to read.
  maxCountriesForCombining: 6,
  // At most this many combinations are shown, lowest total first. Countries on
  // their own are never capped.
  maxCombinationsShown: 10,
  // Time spent traveling each time the reader moves into another country.
  daysPerJourney: 0.5,
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
  base: number; // daily figure per person, from the style band on the comparison
  style: string;
  combine: string; // one, combining or unsure
  flyingFrom: string; // the reader's own words, trimmed and capped, printed escaped
  fare: number; // return fare per person, the reader's own figure, 0 when not known
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
// rather than a passthrough, so no posted currency reaches the HTML unmapped.
const CURRENCIES = ['€', '$', '£', '₱', 'R$', ''];

// Every answer label the report prints, keyed by the value posted. Nothing a
// visitor sends is printed directly, except where they typed where they are
// flying from, which is trimmed, capped and escaped.
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
  intercityMode: { train: 'Train', coach: 'Bus', flight: 'Budget flights' },
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
  combine: {
    one: 'Set on one country',
    combining: 'Open to combining',
    unsure: 'Not sure yet',
  },
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

// A posted answer is kept only if the table has an entry for it. Anything else
// falls back, so a hand crafted body cannot introduce a value the arithmetic
// has never seen.
function pick(raw: unknown, allowed: Record<string, unknown>, fallback: string): string {
  const v = String(raw ?? '');
  return Object.prototype.hasOwnProperty.call(allowed, v) ? v : fallback;
}

// Free text the reader typed. Control characters become spaces, runs of space
// collapse, and it is capped. It is still escaped wherever it is printed.
function cleanText(raw: unknown, max: number): string {
  // Control characters are found by code point, never with an escaped pattern,
  // so none can hide in this source file.
  let out = '';
  for (const ch of String(raw ?? '')) {
    const code = ch.codePointAt(0) ?? 0;
    out += code < 32 || code === 127 ? ' ' : ch;
  }
  return out.replace(/\s+/g, ' ').trim().slice(0, max);
}

// A couple is always two adults. The party answer decides the head count
// instead of trusting whatever the number fields were left at, because the
// adults field starts at 1 and somebody choosing "A couple" rarely changes it.
function headcount(party: string, adultsRaw: unknown, childrenRaw: unknown): { adults: number; children: number } {
  const adults = count(adultsRaw, 0, 20, 1);
  const children = count(childrenRaw, 0, 20, 0);
  switch (party) {
    case 'solo':
      return { adults: 1, children: 0 };
    case 'couple':
      return { adults: 2, children: 0 };
    case 'family':
      return { adults: Math.max(1, adults), children: Math.max(1, children) };
    case 'friends':
      return { adults: Math.max(2, adults), children };
    default:
      return { adults: Math.max(1, adults), children };
  }
}

const COMBINE_OPTIONS = { one: true, combining: true, unsure: true };

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
  const party = pick(src.party, EDITORIAL_WEIGHTS.party, 'solo');
  const { adults, children } = headcount(party, src.adults, src.children);

  return {
    // An empty selection is a defaulted selection rather than an error: the
    // endpoint never fails on a bad body, it reports on a sane one.
    countries: countries.length ? countries : data.countries.map((c) => c.iso),
    nights: count(src.nights, 1, 365, 10),
    party,
    adults,
    children,
    ceiling: money(src.ceiling),
    currency: CURRENCIES.includes(currencyRaw) ? currencyRaw : '',
    base: money(src.base) || STYLE_BASE[style],
    style,
    combine: pick(src.combine, COMBINE_OPTIONS, 'unsure'),
    flyingFrom: cleanText(src.flyingFrom, 80),
    // "I do not know yet" wins over any number left in the fare field.
    fare: src.fareUnknown === 'yes' ? 0 : money(src.fare),
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

// Every answer moves at least one part. The nine totals are floored at zero
// and divided by their sum, so the result always adds to 1.
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

/* ─────────────────────────────── the prices ────────────────────────────── */

export interface PartPrice {
  component: Component;
  label: string;
  perDay: number; // per person, per day
}

export interface CountryPrice {
  name: string;
  iso: string;
  transport: number; // the Eurostat transport services price level
  perDay: number; // per person, per day, everything except flights and border journeys
  parts: PartPrice[]; // in COMPONENTS order
}

function headsOf(input: ReportInput): number {
  return Math.max(1, input.adults + input.children);
}

// Each part of a day is the reader's daily figure, times the share of a day
// that part is given, times the country's Eurostat price level for the
// category that prices it, over 100. A full day is the sum of the parts.
// Countries come back in alphabetical order, which is neutral.
export function priceCountries(input: ReportInput, data: CostData, weights: Weights): CountryPrice[] {
  return data.countries
    .filter((c) => input.countries.includes(c.iso))
    .map((c) => {
      const parts = COMPONENTS.map((component) => ({
        component,
        label: COMPONENT_LABELS[component],
        perDay: (input.base * weights[component] * c[COMPONENT_CATEGORY[component]]) / 100,
      }));
      const perDay = parts.reduce((sum, p) => sum + p.perDay, 0);
      return { name: c.name, iso: c.iso, transport: c.transport, perDay, parts };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ─────────────────────────────── the options ───────────────────────────── */

export interface Scenario {
  kind: 'single' | 'combination';
  countries: CountryPrice[];
  nightsEach: number; // nights split evenly across the countries in it
  journeys: number; // journeys between countries
  daysTraveling: number;
  journeyPerPerson: number; // one journey between countries, per person
  groundPerPerson: number; // everything except flights and border journeys, whole trip, per person
  travelPerPerson: number; // every journey between countries, per person
  flightsPerPerson: number; // the reader's own fare, or 0
  perPersonPerDay: number; // ground plus border journeys, per day, before flights
  total: number; // everyone, whole trip, flights included only when the reader gave a fare
  gap: number; // ceiling minus total; only read when there is a ceiling
}

export interface ScenarioSet {
  singles: Scenario[];
  combinations: Scenario[]; // the ones shown
  combinationsPossible: number; // realistic combinations before the display cap
  combinationsNote: 'one' | 'too-many-countries' | 'too-few-nights' | 'built';
}

function combinationsOf<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  const walk = (start: number, acc: T[]) => {
    if (acc.length === size) {
      out.push(acc.slice());
      return;
    }
    for (let i = start; i < items.length; i++) {
      acc.push(items[i]);
      walk(i + 1, acc);
      acc.pop();
    }
  };
  walk(0, []);
  return out;
}

// One journey between countries, per person. Durian has no fare data, so this
// is Durian's estimate: the reader's daily figure, scaled by how much a
// journey between cities weighs for the way they said they travel, priced at
// the average Eurostat transport services level of the countries involved.
function journeyCost(input: ReportInput, countries: CountryPrice[]): number {
  const avgTransport = countries.reduce((s, c) => s + c.transport, 0) / countries.length;
  const share = (EDITORIAL_WEIGHTS.intercityPerMove[input.intercityMode] ?? 0) / 100;
  return (input.base * share * avgTransport) / 100;
}

function makeScenario(input: ReportInput, countries: CountryPrice[]): Scenario {
  const k = countries.length;
  const heads = headsOf(input);
  const nightsEach = input.nights / k;
  const journeys = k - 1;
  const groundPerPerson = countries.reduce((s, c) => s + c.perDay * nightsEach, 0);
  const journeyPerPerson = journeys > 0 ? journeyCost(input, countries) : 0;
  const travelPerPerson = journeyPerPerson * journeys;
  const flightsPerPerson = input.fare;
  const total = (groundPerPerson + travelPerPerson + flightsPerPerson) * heads;
  return {
    kind: k === 1 ? 'single' : 'combination',
    countries,
    nightsEach,
    journeys,
    daysTraveling: journeys * COMBINING.daysPerJourney,
    journeyPerPerson,
    groundPerPerson,
    travelPerPerson,
    flightsPerPerson,
    perPersonPerDay: (groundPerPerson + travelPerPerson) / input.nights,
    total,
    gap: input.ceiling - total,
  };
}

function labelOf(s: Scenario): string {
  const names = s.countries.map((c) => c.name);
  return s.kind === 'single' ? `${names[0]} on its own` : `${list(names)} together`;
}

// Options are listed from the lowest total to the highest. That is an order,
// stated as one, and never a recommendation.
function byTotal(a: Scenario, b: Scenario): number {
  return a.total - b.total || labelOf(a).localeCompare(labelOf(b));
}

export function buildScenarios(input: ReportInput, prices: CountryPrice[]): ScenarioSet {
  const singles = prices.map((p) => makeScenario(input, [p])).sort(byTotal);

  if (prices.length < 2) {
    return { singles, combinations: [], combinationsPossible: 0, combinationsNote: 'one' };
  }
  if (prices.length > COMBINING.maxCountriesForCombining) {
    return { singles, combinations: [], combinationsPossible: 0, combinationsNote: 'too-many-countries' };
  }

  const largest = Math.min(
    prices.length,
    COMBINING.maxCountriesInCombination,
    Math.floor(input.nights / COMBINING.minNightsPerCountry)
  );
  if (largest < 2) {
    return { singles, combinations: [], combinationsPossible: 0, combinationsNote: 'too-few-nights' };
  }

  const all: Scenario[] = [];
  for (let size = 2; size <= largest; size++) {
    for (const group of combinationsOf(prices, size)) all.push(makeScenario(input, group));
  }
  all.sort(byTotal);

  return {
    singles,
    combinations: all.slice(0, COMBINING.maxCombinationsShown),
    combinationsPossible: all.length,
    combinationsNote: 'built',
  };
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
  const text = Math.round(value).toLocaleString('en-US');
  return currency ? currency + text : text;
}

// Rounded the way a person says a sum out loud. Only ever printed after
// "about" or "roughly", so a rounded figure is never presented as exact.
function nice(value: number, currency: string): string {
  const v = Math.abs(value);
  const step = v >= 1000 ? 50 : 10;
  return fmt(Math.round(v / step) * step, currency);
}

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
];

function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

function groupPhrase(heads: number): string {
  if (heads <= 1) return 'for you';
  if (heads === 2) return 'for the two of you';
  return `for all ${numberWord(heads)} of you`;
}

function daysPhrase(days: number): string {
  if (days === 0.5) return 'half a day';
  if (days === 1) return 'a day';
  if (days === 1.5) return 'a day and a half';
  if (Number.isInteger(days)) return `${numberWord(days)} days`;
  return `about ${Math.round(days)} days`;
}

function modePhrase(mode: string): string {
  if (mode === 'coach') return 'by bus';
  if (mode === 'flight') return 'on budget flights';
  return 'by train';
}

// "A0111, restaurants and hotels" becomes "price level for restaurants and
// hotels (A0111)", which reads as part of a sentence while keeping the code.
function categoryWords(raw: string): string {
  const m = /^([A-Z0-9]+),\s*(.+)$/.exec(String(raw).trim());
  return m ? `price level for ${m[2]} (${m[1]})` : String(raw);
}

// "A0111, restaurants and hotels" becomes "restaurants and hotels (A0111)", for
// a list of several categories inside one sentence.
function categoryName(raw: string): string {
  const m = /^([A-Z0-9]+),\s*(.+)$/.exec(String(raw).trim());
  return m ? `${m[2]} (${m[1]})` : String(raw);
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
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.65;
  }
  .wrap { max-width: 828px; margin: 0 auto; padding: 40px 24px 72px; }
  .masthead {
    background: var(--primary);
    border-bottom: 3px solid var(--accent);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .masthead__inner {
    max-width: 828px; margin: 0 auto; padding: 16px 24px;
    display: flex; align-items: center; gap: 12px;
  }
  .masthead__icon { flex: 0 0 auto; display: flex; }
  .masthead__text { display: flex; flex-direction: column; line-height: 1.1; }
  .masthead__brand {
    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
    font-weight: 400; font-size: 1.25rem; color: #FFFFFF; letter-spacing: .04em;
  }
  .masthead__sub {
    font-size: .75rem; font-style: italic; font-weight: 500;
    color: hsla(0, 0%, 100%, .65);
  }
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
  .chart__fill { display: block; height: 100%; border-radius: 9999px; background: var(--accent); }
  .chart__fill--plain { background: var(--border); }
  .key { display: flex; flex-wrap: wrap; gap: 18px; font-size: .8125rem; color: var(--muted); margin: 0 0 18px; }
  .key i { display: inline-block; width: 22px; height: 8px; border-radius: 9999px; margin-right: 6px; vertical-align: middle; font-style: normal; }
  .key i.personal { background: var(--accent); }
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

function renderCover(input: ReportInput, prices: CountryPrice[], set: ScenarioSet, generatedOn: string): string {
  const c = input.currency;
  const names = esc(list(prices.map((p) => p.name)));
  const nights = `${input.nights} ${plural(input.nights, 'night', 'nights')}`;

  // Comparing, not visiting. The reader picked countries to weigh against each
  // other, and nothing here may claim they are going to all of them.
  const comparing =
    prices.length === 1
      ? `This report prices a trip of ${nights} in ${names}.`
      : `You are comparing ${names} for a trip of ${nights}.`;

  const a = input.adults;
  const ch = input.children;
  const adultsText = `${numberWord(a)} ${plural(a, 'adult', 'adults')}`;
  const childrenText = `${numberWord(ch)} ${plural(ch, 'child', 'children')}`;
  let party: string;
  switch (input.party) {
    case 'solo':
      party = 'You are traveling on your own.';
      break;
    case 'couple':
      party = 'You are traveling as a couple, so every total is for two adults.';
      break;
    case 'family':
      party = `You are traveling as a family of ${adultsText} and ${childrenText}.`;
      break;
    default:
      party =
        ch > 0
          ? `You are traveling with friends, ${adultsText} and ${childrenText} in all.`
          : `You are traveling with friends, ${adultsText} in all.`;
  }

  const origin = input.flyingFrom ? ` You are flying from ${esc(input.flyingFrom)}.` : '';

  const fare =
    input.fare > 0
      ? `You told us you are seeing return fares of about ${fmt(input.fare, c)} per person, and that fare is included in every total below. It is your figure, not ours, because Durian has no fare data of its own.`
      : 'You have not given us a fare yet, so no total in this report includes flights.';

  let lead = '';
  if (prices.length > 1) {
    const hasCombos = set.combinations.length > 0;
    if (input.combine === 'combining') {
      lead = hasCombos
        ? 'You said you are open to combining countries, so the combinations come first and each country on its own follows.'
        : 'You said you are open to combining countries, but this trip does not allow a realistic combination, so each country is shown on its own. The section on combining explains why.';
    } else if (input.combine === 'one') {
      lead = hasCombos
        ? 'You said you are set on one country, so each country on its own comes first and the combinations follow as alternatives.'
        : 'You said you are set on one country, so each country is shown on its own.';
    } else {
      lead = hasCombos
        ? 'You are not sure yet whether to stay in one country or combine several, so this report starts with each country on its own and then shows the combinations.'
        : 'You are not sure yet whether to stay in one country or combine several, so this report shows each country on its own. The section on combining explains why there are no combinations for this trip.';
    }
  }

  return `
  <p class="eyebrow">Durian Travel</p>
  <h1>Your cost per country report</h1>
  <p class="lede">${comparing} ${party}${origin} This report was generated on ${esc(prettyDate(generatedOn))}.</p>
  <p>${fare}</p>
  ${lead ? `<p>${lead}</p>` : ''}
  <p class="muted">Every figure is built from Eurostat's price levels for seven kinds of spending, so a room, a meal out and a week of groceries are each priced at what they actually cost in each country, rather than with one average for everything.</p>`;
}

function leadGroups(input: ReportInput, set: ScenarioSet): { lead: Scenario[]; other: Scenario[] } {
  if (input.combine === 'combining' && set.combinations.length > 0) {
    return { lead: set.combinations, other: set.singles };
  }
  return { lead: set.singles, other: set.combinations };
}

function optionSentence(s: Scenario, input: ReportInput): string {
  const c = input.currency;
  const flights = input.fare > 0 ? ', flights included' : ' before flights';
  const label = esc(labelOf(s));
  if (input.ceiling > 0) {
    const tolerance = Math.max(25, input.ceiling * 0.02);
    if (s.gap >= tolerance) return `${label} leaves you about ${nice(s.gap, c)} spare${flights}.`;
    if (s.gap <= -tolerance) return `${label} puts you roughly ${nice(s.gap, c)} over${flights}.`;
    return `${label} comes out close to your ceiling${flights}.`;
  }
  return `${label} comes to about ${nice(s.total, c)} ${groupPhrase(headsOf(input))}${flights}, or about ${fmt(
    s.perPersonPerDay,
    c
  )} a day each for everything except flights.`;
}

// The headline shows the range in each group, never only the cheapest: the
// lowest total and the highest, with one between when there is room. Showing
// only the cheapest would let every sentence read as money left over while an
// option that goes over the ceiling sat unseen in the table.
function spread(options: Scenario[], n: number): Scenario[] {
  if (options.length <= n) return options;
  if (n <= 1) return options.slice(0, 1);
  const out: Scenario[] = [];
  for (let i = 0; i < n; i++) {
    const at = Math.round((i * (options.length - 1)) / (n - 1));
    if (!out.includes(options[at])) out.push(options[at]);
  }
  return out;
}

function renderHeadline(input: ReportInput, set: ScenarioSet): string {
  const c = input.currency;
  const { lead, other } = leadGroups(input, set);
  const picked = [...spread(lead, 3), ...spread(other, 2)];
  const sentences = picked.map((s) => `<p>${optionSentence(s, input)}</p>`).join('');
  const shownAll = picked.length === set.singles.length + set.combinations.length;

  const opener =
    input.ceiling > 0
      ? `<p>You told us you will not spend more than ${fmt(input.ceiling, c)} on the whole trip. Here is how the options sit against that.</p>`
      : '<p>You did not set a ceiling, so nothing here is measured against one. Add one to your answers and each option will show how much it leaves you spare or how far over it goes.</p>';

  return `
  <h2>${input.ceiling > 0 ? 'How the options fit your budget' : 'What each option costs'}</h2>
  ${opener}
  <div class="verdict">${sentences}</div>
  ${shownAll ? '' : '<p class="muted">Every option, with its daily figure, is listed in full below.</p>'}`;
}

function optionTable(title: string, rows: Scenario[], input: ReportInput): string {
  if (rows.length === 0) return '';
  const c = input.currency;
  const heads = headsOf(input);
  const hasCeiling = input.ceiling > 0;
  const totalHead =
    input.fare > 0
      ? `Whole trip ${groupPhrase(heads)}, flights included`
      : `Whole trip ${groupPhrase(heads)}, flights not included`;

  const body = rows
    .map((s) => {
      const nights =
        s.kind === 'single'
          ? String(input.nights)
          : Number.isInteger(s.nightsEach)
            ? `${s.nightsEach} in each`
            : `about ${Math.round(s.nightsEach)} in each`;
      const against = hasCeiling
        ? `<td class="${s.gap < 0 ? 'over' : ''}">${
            s.gap < 0 ? `${fmt(-s.gap, c)} over` : `${fmt(s.gap, c)} spare`
          }</td>`
        : '';
      return `
      <tr>
        <th scope="row">${esc(labelOf(s))}</th>
        <td>${nights}</td>
        <td>${fmt(s.perPersonPerDay, c)}</td>
        <td>${fmt(s.total, c)}</td>
        ${against}
      </tr>`;
    })
    .join('');

  return `
  <h3>${title}</h3>
  <div class="table-wrap table-wrap--wide">
  <table>
    <thead>
      <tr>
        <th scope="col">Option</th>
        <th scope="col">Nights</th>
        <th scope="col">Each person, per day, before flights</th>
        <th scope="col">${totalHead}</th>
        ${hasCeiling ? `<th scope="col">Against your ${fmt(input.ceiling, c)}</th>` : ''}
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>
  </div>`;
}

function renderOptions(input: ReportInput, set: ScenarioSet): string {
  const singles = optionTable('Each country on its own', set.singles, input);
  const combos = optionTable('Combining countries', set.combinations, input);
  const combosFirst = input.combine === 'combining' && set.combinations.length > 0;
  return `
  <h2>Every option in detail</h2>
  <p>Each group below is listed from the lowest total to the highest. The daily figure is what one person spends in a day on everything except flights, including any journeys between countries.</p>
  ${combosFirst ? combos + singles : singles + combos}`;
}

function renderCombining(input: ReportInput, set: ScenarioSet, source: CostSource): string {
  const c = input.currency;
  const heads = headsOf(input);
  const min = numberWord(COMBINING.minNightsPerCountry);
  const nights = `${input.nights} ${plural(input.nights, 'night', 'nights')}`;

  if (set.combinationsNote === 'one') return '';

  if (set.combinationsNote === 'too-many-countries') {
    return `
  <h2>What combining countries costs</h2>
  <p>You are comparing ${numberWord(set.singles.length)} countries. Combining that many would produce more options than anyone can read, so this report prices each country on its own. Compare ${numberWord(
    COMBINING.maxCountriesForCombining
  )} countries or fewer to see combinations.</p>`;
  }

  if (set.combinationsNote === 'too-few-nights') {
    return `
  <h2>What combining countries costs</h2>
  <p>In ${nights} you cannot give each country at least ${min} nights, which is the least that counts as staying somewhere rather than passing through. So this report does not build combinations for this trip.</p>`;
  }

  const transport = esc(categoryWords(source.categories.transport ?? ''));
  const intro = `<p>Combining countries costs you in two ways that are easy to miss. Every move from one country to the next is a journey you pay for, on top of the moves between cities you already told us about, and it takes time you do not spend anywhere.</p>
  <p>We price each journey ${modePhrase(input.intercityMode)} from your daily figure of ${fmt(
    input.base,
    c
  )}, adjusted by Eurostat's ${transport} in the countries involved. We also allow ${daysPhrase(
    COMBINING.daysPerJourney
  )} of traveling for each journey. Both are Durian's estimates, not published fares or timetables, and neither takes distance into account, so a long journey costs the same here as a short one.</p>`;

  const cap =
    set.combinationsPossible > set.combinations.length
      ? `<p>In ${nights} there are ${set.combinationsPossible} ways to combine these countries while giving each at least ${min} nights. This report shows the ${set.combinations.length} with the lowest totals.</p>`
      : `<p>These are all the ways to combine your countries in ${nights} while giving each at least ${min} nights.</p>`;

  const items = set.combinations
    .map((s) => {
      const journeys = `${numberWord(s.journeys)} ${plural(s.journeys, 'journey', 'journeys')}`;
      const forAll = heads > 1 ? `, or about ${nice(s.travelPerPerson * heads, c)} ${groupPhrase(heads)}` : '';
      return `<li>${esc(labelOf(s))} means ${journeys} between countries. That adds about ${nice(
        s.travelPerPerson,
        c
      )} per person${forAll}, and about ${daysPhrase(s.daysTraveling)} spent traveling rather than staying anywhere.</li>`;
    })
    .join('');

  return `
  <h2>What combining countries costs</h2>
  ${intro}
  ${cap}
  <ul class="plain">${items}</ul>`;
}

// Every country the reader is comparing, never only the cheapest one.
function renderDays(input: ReportInput, prices: CountryPrice[]): string {
  const c = input.currency;

  const sentences = prices
    .map((p) => {
      const top = [...p.parts].sort((a, b) => b.perDay - a.perDay);
      return `<li>In ${esc(p.name)}, a full day comes to about ${fmt(p.perDay, c)} per person. ${esc(
        top[0].label
      )} is the largest part at ${fmt(top[0].perDay, c)}, and ${esc(top[1].label.toLowerCase())} comes next at ${fmt(
        top[1].perDay,
        c
      )}.</li>`;
    })
    .join('');

  const head = COMPONENTS.map((k) => `<th scope="col">${esc(COMPONENT_LABELS[k])}</th>`).join('');
  const rows = prices
    .map(
      (p) => `
      <tr>
        <th scope="row">${esc(p.name)}</th>
        ${p.parts.map((part) => `<td>${fmt(part.perDay, c)}</td>`).join('')}
        <td><b>${fmt(p.perDay, c)}</b></td>
      </tr>`
    )
    .join('');

  return `
  <h2>What a day costs in each country</h2>
  <p>This is what one day costs each person in every country you are comparing, before flights and before any journeys between countries, split into the parts of a trip. Each figure comes from your daily figure of ${fmt(
    input.base,
    c
  )} and Eurostat's price levels for each country. What each part includes is explained after the table.</p>
  <ul class="plain">${sentences}</ul>
  <div class="table-wrap table-wrap--wide">
  <table>
    <caption>Per person, per day, before flights.</caption>
    <thead><tr><th scope="col">Country</th>${head}<th scope="col">A full day</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  </div>`;
}

function renderParts(source: CostSource): string {
  const items = COMPONENTS.map((k) => {
    const category = esc(categoryWords(source.categories[COMPONENT_CATEGORY[k]] ?? ''));
    return `<li><b>${esc(COMPONENT_LABELS[k])}</b> covers ${esc(PART_COVERS[k])}. It is priced with Eurostat's ${category}${esc(PART_NOTES[k] ?? '')}.</li>`;
  }).join('');

  return `
  <h2>What each part of the cost covers</h2>
  <ul class="plain">${items}</ul>
  <p>Eating out and cooking for yourself are priced separately, because the gap between restaurant prices and shop prices is very different from one country to the next. How much of your day goes to each part depends on your answers, such as where you sleep and how often you eat out. That split is Durian's own estimate of how people who answer the way you did tend to spend. It is not a measurement of you and it is not a published figure.</p>`;
}

function renderLimits(input: ReportInput): string {
  const c = input.currency;
  const flights =
    input.fare > 0
      ? `The flights in every total are the return fare you gave us, ${fmt(input.fare, c)} per person. Durian has no fare data of its own, so that number is yours and not ours, and it will change as you search.`
      : 'No total in this report includes flights. Durian has no fare data of its own and you did not give us a fare, so whatever you pay to reach Europe comes on top of every figure here.';

  return `
  <h2>What this report does not cover</h2>
  <ul class="plain">
    <li>${flights}</li>
    <li>Every price level is a yearly average, and this report does not know when you are going. A week in August and a week in February can differ by more than two countries do.</li>
    <li>Capital cities, and the streets around the famous sights, cost more than the national figure. Sometimes they cost a lot more.</li>
    <li>Each price level is an average of what residents pay across the whole country. As a visitor, you will mostly buy in the places that charge the most.</li>
    <li>How a day splits between the parts of a trip is an estimate of how people like you tend to spend, not a record of how you will.</li>
  </ul>
  <p>The differences between the options are more reliable than any single figure, so treat each total as a starting point for your own planning.</p>`;
}

function renderSources(input: ReportInput, source: CostSource, prices: CountryPrice[], set: ScenarioSet): string {
  const c = input.currency;
  const used = Array.from(new Set(COMPONENTS.map((k) => COMPONENT_CATEGORY[k])));
  const categories = list(used.map((k) => esc(categoryName(source.categories[k] ?? k))));
  const style = esc((ANSWER_LABELS.style[input.style] ?? '').toLowerCase());
  const combining =
    set.combinationsNote === 'built'
      ? ', and so are the cost of each journey between countries and the half day it takes'
      : '';

  return `
  <h2>Where these figures come from</h2>
  <p>Every price level in this report comes from ${esc(source.publisher)}, the statistical office of the European Union. The dataset is called "${esc(
    source.datasetName
  )}", code ${esc(source.dataset)}, indicator ${esc(source.indicator)}, for the reference year ${esc(
    source.referenceYear
  )}. ${esc(source.publisher)} last updated it on ${esc(
    prettyDate(source.eurostatLastUpdated)
  )}, and Durian retrieved the figures used here on ${esc(
    prettyDate(source.categoriesRetrieved)
  )}. Each price level compares a country with the average of the 27 EU countries, which is set at 100.</p>
  <p>The categories used are ${categories}. You can check any of them yourself on the <a href="${esc(
    source.url
  )}">${esc(source.publisher)} data browser</a>.</p>
  <p>Your daily figure of ${fmt(input.base, c)} per person is Durian's own estimate for a ${style} trip in Western Europe. It is not a published statistic. How that day splits between the parts of a trip is Durian's estimate too${combining}.</p>
  <p class="muted">This report covers ${numberWord(prices.length)} ${plural(
    prices.length,
    'country',
    'countries'
  )}. ${esc(source.note)}</p>`;
}

/* ────────────────────────────── the report ─────────────────────────────── */

export interface RenderOptions {
  generatedOn?: string; // ISO date, YYYY-MM-DD. Defaults to today in UTC.
}

// The page this report is generated from. The report replaces that page in the
// browser, so a shared link is this address, and the canonical says so.
const REPORT_PAGE = 'https://www.duriantravel.com/tools/cost-per-country/full-report/';

export function buildReport(raw: unknown, data: CostData, options: RenderOptions = {}): string {
  const input = normalise(raw, data);
  const weights = computeWeights(input);
  const prices = priceCountries(input, data, weights);
  const set = buildScenarios(input, prices);
  const generatedOn = options.generatedOn ?? new Date().toISOString().slice(0, 10);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Your cost per country report | DURIAN Travel</title>
<meta name="description" content="Your cost per country report from DURIAN Travel: each country you are comparing, and the realistic ways to combine them, priced against your own budget with every source dated.">
<link rel="canonical" href="${REPORT_PAGE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Playfair+Display:wght@400;700&amp;display=swap">
<style>${STYLES}</style>
</head>
<body>
<header class="masthead">
  <div class="masthead__inner">
    <span class="masthead__icon" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="transparent" stroke="#FFFFFF" stroke-width="2"/>
        <text x="20" y="27" text-anchor="middle" font-family="'Playfair Display',Georgia,serif" font-size="22" font-weight="400" fill="#FFFFFF">D</text>
      </svg>
    </span>
    <span class="masthead__text">
      <span class="masthead__brand">DURIAN</span>
      <span class="masthead__sub">Travel</span>
    </span>
  </div>
</header>
<div class="wrap">
<div class="bar no-print">
  <a href="/tools/cost-per-country/full-report/">Change your answers</a>
  <button type="button" onclick="window.print()">Print or save as PDF</button>
</div>
${renderCover(input, prices, set, generatedOn)}
${renderHeadline(input, set)}
${renderOptions(input, set)}
${renderCombining(input, set, data._source)}
${renderDays(input, prices)}
${renderParts(data._source)}
${renderLimits(input)}
${renderSources(input, data._source, prices, set)}

<div class="disclaimer">
  <p>${DISCLAIMER}</p>
</div>

<footer>
  <p>This cost per country report was generated on ${esc(prettyDate(generatedOn))} by DURIAN Travel and prepared by the Durian Travel Editorial Team. Every figure is an estimate built from the answers you gave. Prices change all the time and vary by season, by city and by how far ahead you book.</p>
</footer>
</div>
</body>
</html>`;
}
