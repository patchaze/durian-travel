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
// Every figure the report prints is derived here from two things only: the
// numbers the visitor entered on /tools/budget/, and src/data/country-costs.json.
// Nothing is fetched, inferred or estimated. If a number cannot be worked out
// from those two inputs it does not go in the report.

/* ────────────────────────────── the dataset ────────────────────────────── */

export interface CostCountry {
  slug: string;
  name: string;
  iso: string;
  pli: number;
}

export interface CostSource {
  publisher: string;
  dataset: string;
  datasetName: string;
  indicator: string;
  category: string;
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

/* ─────────────────────────────── the inputs ────────────────────────────── */

export interface ReportInput {
  nights: number;
  travellers: number;
  currency: string;
  fixed: {
    flights: number;
    visa: number;
    insurance: number;
    intercity: number;
    prebooked: number;
  };
  daily: {
    stay: number;
    food: number;
    transport: number;
    activities: number;
  };
  style: string;
  buffer: number;
}

// The five currency symbols the planner offers, plus the empty string for
// "Other". An allowlist rather than a passthrough, because this value is the
// only visitor supplied string that reaches the HTML.
const CURRENCIES = ['€', '$', '£', '₱', 'R$', ''];

const STYLE_LABELS: Record<string, string> = {
  budget: 'Budget',
  mid: 'Mid range',
  comfortable: 'Comfortable',
};

const BUFFERS = [10, 15, 20];

export const DISCLAIMER =
  'Educational information only. Not legal advice. Always check the official embassy or consulate source.';

const FIXED_LABELS: Array<[keyof ReportInput['fixed'], string]> = [
  ['flights', 'Flights, total for everyone'],
  ['visa', 'Visa and application fees'],
  ['insurance', 'Travel insurance'],
  ['intercity', 'Intercity trains, buses, internal flights'],
  ['prebooked', 'Anything prebooked, such as tours and passes'],
];

const DAILY_LABELS: Array<[keyof ReportInput['daily'], string]> = [
  ['stay', 'Accommodation'],
  ['food', 'Food and drink'],
  ['transport', 'Local transport'],
  ['activities', 'Attractions and activities'],
];

/* ───────────────────────────── normalisation ───────────────────────────── */

// Same rule the free planner uses: a value counts only if it is a finite
// number above zero. Anything else becomes zero rather than NaN.
function money(raw: unknown): number {
  const v = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function count(raw: unknown, min: number, max: number, fallback: number): number {
  const v = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
}

function obj(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
}

// Takes anything at all and returns a valid ReportInput. The endpoint hands
// straight over to this, so the rest of the module never sees a bad value.
export function normalise(raw: unknown): ReportInput {
  const src = obj(raw);
  const fixed = obj(src.fixed);
  const daily = obj(src.daily);

  const currencyRaw = typeof src.currency === 'string' ? src.currency : '€';
  const styleRaw = typeof src.style === 'string' ? src.style : '';
  const bufferRaw = count(src.buffer, 0, 100, 15);

  return {
    nights: count(src.nights, 1, 365, 10),
    travellers: count(src.travellers, 1, 20, 1),
    currency: CURRENCIES.includes(currencyRaw) ? currencyRaw : '',
    fixed: {
      flights: money(fixed.flights),
      visa: money(fixed.visa),
      insurance: money(fixed.insurance),
      intercity: money(fixed.intercity),
      prebooked: money(fixed.prebooked),
    },
    daily: {
      stay: money(daily.stay),
      food: money(daily.food),
      transport: money(daily.transport),
      activities: money(daily.activities),
    },
    style: Object.prototype.hasOwnProperty.call(STYLE_LABELS, styleRaw) ? styleRaw : '',
    buffer: BUFFERS.includes(bufferRaw) ? bufferRaw : 15,
  };
}

/* ───────────────────────────── the arithmetic ──────────────────────────── */

export interface CategoryRow {
  label: string;
  kind: 'fixed' | 'daily';
  entered: number; // what the visitor typed, in the unit the field asks for
  total: number;
  perPerson: number;
  perNight: number;
}

export interface CountryRow {
  name: string;
  iso: string;
  pli: number;
  dailyTotal: number;
  subtotal: number;
  buffer: number;
  total: number;
  perPerson: number;
}

export interface Totals {
  fixedTotal: number;
  dailyPerPersonPerNight: number;
  dailyTotal: number;
  subtotal: number;
  bufferTotal: number;
  total: number;
  perPerson: number;
  perPersonPerNight: number;
}

export function computeTotals(input: ReportInput): Totals {
  const n = input.nights;
  const p = input.travellers;

  const fixedTotal =
    input.fixed.flights +
    input.fixed.visa +
    input.fixed.insurance +
    input.fixed.intercity +
    input.fixed.prebooked;

  const dailyPerPersonPerNight =
    input.daily.stay + input.daily.food + input.daily.transport + input.daily.activities;

  const dailyTotal = dailyPerPersonPerNight * n * p;
  const subtotal = fixedTotal + dailyTotal;
  const bufferTotal = subtotal * (input.buffer / 100);
  const total = subtotal + bufferTotal;

  return {
    fixedTotal,
    dailyPerPersonPerNight,
    dailyTotal,
    subtotal,
    bufferTotal,
    total,
    perPerson: total / p,
    perPersonPerNight: total / p / n,
  };
}

// Three columns, one definition each, applied identically to every row so the
// whole table can be checked with a calculator:
//   Total      the whole trip, everyone
//   Per person Total divided by the number of travellers
//   Per night  Total divided by the number of nights
export function computeCategories(input: ReportInput): CategoryRow[] {
  const n = input.nights;
  const p = input.travellers;
  const rows: CategoryRow[] = [];

  for (const [key, label] of FIXED_LABELS) {
    const total = input.fixed[key];
    rows.push({ label, kind: 'fixed', entered: total, total, perPerson: total / p, perNight: total / n });
  }

  for (const [key, label] of DAILY_LABELS) {
    const entered = input.daily[key];
    const total = entered * n * p;
    rows.push({ label, kind: 'daily', entered, total, perPerson: total / p, perNight: total / n });
  }

  return rows;
}

// The same trip, repriced country by country. The price level index moves the
// daily costs and nothing else. Flights, visa and application fees, insurance,
// intercity travel and prebooked items are held at the figures entered,
// because a Eurostat index for restaurants and hotels says nothing about them.
export function computeCountries(input: ReportInput, data: CostData): CountryRow[] {
  const t = computeTotals(input);

  return data.countries
    .map((c) => {
      const dailyTotal = t.dailyTotal * (c.pli / 100);
      const subtotal = t.fixedTotal + dailyTotal;
      const buffer = subtotal * (input.buffer / 100);
      const total = subtotal + buffer;
      return {
        name: c.name,
        iso: c.iso,
        pli: c.pli,
        dailyTotal,
        subtotal,
        buffer,
        total,
        perPerson: total / input.travellers,
      };
    })
    .sort((a, b) => a.total - b.total);
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

// Whole units throughout, the same rounding the free planner uses, so the two
// never print different totals for the same trip.
function fmt(value: number, currency: string): string {
  const rounded = Math.round(value);
  const text = rounded.toLocaleString('en-GB');
  return currency ? currency + text : text;
}

function num(value: number): string {
  return Math.round(value).toLocaleString('en-GB');
}

function pli(value: number): string {
  return value.toFixed(1);
}

// Dates are printed the way a reader says them rather than the way a dataset
// stores them, which also keeps hyphens out of the copy.
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function prettyDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim());
  if (!m) return String(iso);
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return String(iso);
  return `${Number(m[3])} ${month} ${m[1]}`;
}

const STYLES = `
  :root {
    --ink: #0F2138;
    --primary: #1B3A5C;
    --accent: #C44B36;
    --muted: #5A6B7D;
    --line: #DFE4EA;
    --tint: #F4F6F8;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 40px 24px 72px;
    background: #FFFFFF;
    color: var(--ink);
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.65;
  }
  .wrap { max-width: 780px; margin: 0 auto; }
  h1, h2, h3 { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; color: var(--primary); line-height: 1.25; }
  h1 { font-size: 34px; margin: 0 0 8px; }
  h2 { font-size: 24px; margin: 48px 0 8px; padding-top: 24px; border-top: 2px solid var(--line); }
  h3 { font-size: 18px; margin: 28px 0 6px; }
  p { margin: 0 0 14px; max-width: 68ch; }
  .lede { color: var(--muted); font-size: 15px; margin-bottom: 28px; }
  .muted { color: var(--muted); font-size: 14px; }
  .facts { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 8px; padding: 0; list-style: none; }
  .facts li { background: var(--tint); border: 1px solid var(--line); border-radius: 999px; padding: 5px 14px; font-size: 14px; }
  .headline { border: 2px solid var(--primary); border-radius: 10px; padding: 22px 24px; margin: 28px 0 8px; }
  .headline__label { font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin: 0 0 4px; }
  .headline__value { font-family: 'Playfair Display', Georgia, serif; font-size: 40px; line-height: 1; color: var(--primary); margin: 0 0 16px; }
  .headline__split { display: flex; flex-wrap: wrap; gap: 32px; }
  .headline__split div { min-width: 140px; }
  .headline__split span { display: block; font-size: 13px; color: var(--muted); }
  .headline__split b { font-size: 22px; color: var(--ink); font-weight: 600; }
  .table-wrap { overflow-x: auto; margin: 18px 0 10px; }
  table { width: 100%; border-collapse: collapse; margin: 0; font-size: 15px; }
  .table-wrap--costs table { min-width: 460px; }
  .table-wrap--countries table { min-width: 520px; }
  caption { text-align: left; font-size: 14px; color: var(--muted); padding-bottom: 8px; }
  th, td { padding: 9px 10px; border-bottom: 1px solid var(--line); text-align: right; }
  th:first-child, td:first-child { text-align: left; }
  thead th { font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); border-bottom: 2px solid var(--primary); }
  tbody tr.group th { text-align: left; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); background: var(--tint); border-bottom: 1px solid var(--line); }
  tbody tr.sum td, tbody tr.sum th { font-weight: 700; }
  tbody tr.grand td, tbody tr.grand th { font-weight: 700; font-size: 17px; border-bottom: 2px solid var(--primary); border-top: 2px solid var(--primary); }
  .method { background: var(--tint); border-left: 3px solid var(--primary); padding: 14px 18px; margin: 16px 0 0; font-size: 14px; }
  .method p { margin: 0 0 8px; }
  .method p:last-child { margin: 0; }
  .method code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; background: #FFFFFF; border: 1px solid var(--line); border-radius: 3px; padding: 1px 5px; }
  .provenance { width: 100%; border-collapse: collapse; font-size: 15px; }
  .provenance th { width: 34%; text-align: left; font-weight: 600; color: var(--muted); vertical-align: top; }
  .provenance td { text-align: left; word-break: break-word; }
  .gap { border: 1px solid var(--accent); border-radius: 8px; padding: 14px 18px; margin: 18px 0 0; }
  .gap h3 { margin-top: 0; color: var(--accent); }
  .disclaimer { margin-top: 48px; padding: 18px 20px; border: 2px solid var(--ink); border-radius: 8px; font-size: 15px; }
  .disclaimer p { margin: 0; }
  footer { margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--line); font-size: 13px; color: var(--muted); }
  @media print {
    body { padding: 0; font-size: 12px; }
    .table-wrap { overflow: visible; }
    .table-wrap table { min-width: 0; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; }
  }
`;

/* ─────────────────────────────── sections ─────────────────────────────── */

function renderSummary(input: ReportInput, t: Totals): string {
  const c = input.currency;
  const styleLabel = input.style ? STYLE_LABELS[input.style] : '';

  const facts = [
    `${input.nights} ${input.nights === 1 ? 'night' : 'nights'}`,
    `${input.travellers} ${input.travellers === 1 ? 'traveller' : 'travellers'}`,
    `${input.buffer}% buffer`,
  ];
  if (styleLabel) facts.push(`${esc(styleLabel)} style`);

  return `
  <h1>Trip Budget Report</h1>
  <p class="lede">Built from the figures you entered. Every number below can be checked by hand,
  and the working is printed beside each table.</p>
  <ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>

  <div class="headline">
    <p class="headline__label">Total trip cost</p>
    <p class="headline__value">${fmt(t.total, c)}</p>
    <div class="headline__split">
      <div><span>Per person</span><b>${fmt(t.perPerson, c)}</b></div>
      <div><span>Per person, per night</span><b>${fmt(t.perPersonPerNight, c)}</b></div>
    </div>
  </div>
  <p class="muted">All figures are rounded to the nearest whole unit of currency. A category
  showing zero is one you left empty.</p>`;
}

function renderCategories(input: ReportInput, t: Totals, rows: CategoryRow[]): string {
  const c = input.currency;
  const n = input.nights;
  const p = input.travellers;

  const row = (r: CategoryRow) => `
      <tr>
        <th scope="row">${esc(r.label)}</th>
        <td>${fmt(r.total, c)}</td>
        <td>${fmt(r.perPerson, c)}</td>
        <td>${fmt(r.perNight, c)}</td>
      </tr>`;

  const fixedRows = rows.filter((r) => r.kind === 'fixed').map(row).join('');
  const dailyRows = rows.filter((r) => r.kind === 'daily').map(row).join('');

  return `
  <h2>Every cost, broken out</h2>
  <div class="table-wrap table-wrap--costs">
  <table>
    <caption>Three columns, one rule each. Total is the whole trip for everyone.
    Per person is that total divided by ${p}. Per night is that total divided by ${n}.</caption>
    <thead>
      <tr><th scope="col">Category</th><th scope="col">Total</th><th scope="col">Per person</th><th scope="col">Per night</th></tr>
    </thead>
    <tbody>
      <tr class="group"><th colspan="4" scope="colgroup">Fixed costs, paid once for the whole trip</th></tr>
      ${fixedRows}
      <tr class="sum">
        <th scope="row">Fixed costs</th>
        <td>${fmt(t.fixedTotal, c)}</td>
        <td>${fmt(t.fixedTotal / p, c)}</td>
        <td>${fmt(t.fixedTotal / n, c)}</td>
      </tr>
      <tr class="group"><th colspan="4" scope="colgroup">Daily costs, per person per night</th></tr>
      ${dailyRows}
      <tr class="sum">
        <th scope="row">Daily costs</th>
        <td>${fmt(t.dailyTotal, c)}</td>
        <td>${fmt(t.dailyTotal / p, c)}</td>
        <td>${fmt(t.dailyTotal / n, c)}</td>
      </tr>
      <tr class="sum">
        <th scope="row">Subtotal, before the buffer</th>
        <td>${fmt(t.subtotal, c)}</td>
        <td>${fmt(t.subtotal / p, c)}</td>
        <td>${fmt(t.subtotal / n, c)}</td>
      </tr>
      <tr class="sum">
        <th scope="row">Buffer at ${input.buffer}%</th>
        <td>${fmt(t.bufferTotal, c)}</td>
        <td>${fmt(t.bufferTotal / p, c)}</td>
        <td>${fmt(t.bufferTotal / n, c)}</td>
      </tr>
      <tr class="grand">
        <th scope="row">Total</th>
        <td>${fmt(t.total, c)}</td>
        <td>${fmt(t.perPerson, c)}</td>
        <td>${fmt(t.total / n, c)}</td>
      </tr>
    </tbody>
  </table>
  </div>

  <div class="method">
    <p><b>How each figure is worked out.</b></p>
    <p>A fixed cost is used exactly as you entered it, because you pay it once for the whole party.
    Its per night figure is that one payment spread evenly across ${n} ${n === 1 ? 'night' : 'nights'}.
    It is a way of seeing the weight of the line, not a nightly charge.</p>
    <p>A daily cost is a per person per night figure, so its total is
    <code>amount &times; ${n} nights &times; ${p} ${p === 1 ? 'traveller' : 'travellers'}</code>.</p>
    <p>Then <code>subtotal = fixed + daily</code>, <code>buffer = subtotal &times; ${input.buffer / 100}</code>,
    and <code>total = subtotal + buffer</code>.</p>
    <p>Your daily figures add up to <b>${fmt(t.dailyPerPersonPerNight, c)}</b> per person per night.</p>
  </div>`;
}

function renderCountries(input: ReportInput, t: Totals, rows: CountryRow[], source: CostSource): string {
  const c = input.currency;
  const cheapest = rows[0];
  const dearest = rows[rows.length - 1];

  const body = rows
    .map(
      (r) => `
      <tr>
        <th scope="row">${esc(r.name)}</th>
        <td>${pli(r.pli)}</td>
        <td>${fmt(r.dailyTotal, c)}</td>
        <td>${fmt(r.total, c)}</td>
        <td>${fmt(r.perPerson, c)}</td>
      </tr>`
    )
    .join('');

  return `
  <h2>The same trip, priced across ${rows.length} countries</h2>
  <p>This is your trip, unchanged, moved country by country. Only the daily costs move.
  Flights, visa and application fees, travel insurance, intercity travel and anything prebooked
  stay at the figures you entered, because a price index for restaurants and hotels says nothing
  about them.</p>
  <p><b>Read this as a comparison, not a quote.</b> The index treats your daily figures as if they
  sit at the EU27 average, which the dataset puts at 100. A country with an index of
  ${pli(dearest.pli)} is priced here at ${pli(dearest.pli)} percent of that average for restaurants
  and hotels.
  Your own booking, your season and your city will move the real number.</p>

  <div class="table-wrap table-wrap--countries">
  <table>
    <caption>Sorted from the lowest total to the highest. Price level index: EU27 average = 100,
    restaurants and hotels, reference year ${esc(source.referenceYear)}.</caption>
    <thead>
      <tr>
        <th scope="col">Country</th>
        <th scope="col">Price level</th>
        <th scope="col">Daily costs</th>
        <th scope="col">Trip total</th>
        <th scope="col">Per person</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>
  </div>

  <div class="method">
    <p><b>How each row is worked out.</b> Your daily costs total
    <code>${fmt(t.dailyTotal, c)}</code> and your fixed costs total <code>${fmt(t.fixedTotal, c)}</code>.</p>
    <p>For each country:
    <code>daily &times; index &divide; 100</code>, then
    <code>+ ${fmt(t.fixedTotal, c)} fixed</code>, then
    <code>&times; ${1 + input.buffer / 100}</code> for the ${input.buffer}% buffer.</p>
    <p>Lowest total: <b>${esc(cheapest.name)}</b> at ${fmt(cheapest.total, c)}.
    Highest: <b>${esc(dearest.name)}</b> at ${fmt(dearest.total, c)}.
    The gap between them is ${fmt(dearest.total - cheapest.total, c)} on this trip.</p>
  </div>`;
}

function renderBuffer(input: ReportInput, t: Totals): string {
  const c = input.currency;
  return `
  <h2>What the buffer is, and what it is not</h2>
  <p>Your buffer is ${input.buffer}% of everything above it, which comes to
  <b>${fmt(t.bufferTotal, c)}</b> across the trip, or ${fmt(t.bufferTotal / input.travellers, c)}
  each. It is the line that turns a small problem into a non problem.</p>

  <h3>What it is there for</h3>
  <p>The costs that are certain to happen and impossible to list in advance. Laundry halfway
  through. A pharmacy visit. One taxi because the last train went without you. A locker at a
  station. A meal that cost more than the ones you budgeted for. Water, coffee, a phone charger,
  the small constant leak that no planner captures because it has no name.</p>

  <h3>What it does not cover</h3>
  <p>A buffer is not insurance and it is not a safety net. It will not absorb a cancelled flight,
  a hospital visit, stolen luggage, a rebooked long haul ticket or a stay extended because you
  could not travel. Those are what travel insurance is for, and travel insurance is a separate
  line in your fixed costs above.</p>
  <p>It also does not cover the gap between what you entered and what things actually cost. If your
  accommodation figure is optimistic, the buffer will quietly disappear into that instead of being
  there when you need it. The buffer protects a realistic budget. It cannot rescue a hopeful one.</p>
  <p>And it does not move with the exchange rate. Every figure in this report is in the single
  currency you entered. If you earn in one currency and spend in another, the rate on the day is a
  separate risk that sits outside this number.</p>`;
}

function renderProvenance(source: CostSource, countryCount: number): string {
  return `
  <h2>Where the country figures come from</h2>
  <table class="provenance">
    <tbody>
      <tr><th scope="row">Publisher</th><td>${esc(source.publisher)}</td></tr>
      <tr><th scope="row">Dataset</th><td>${esc(source.datasetName)} (<code>${esc(source.dataset)}</code>)</td></tr>
      <tr><th scope="row">Indicator</th><td>${esc(source.indicator)}</td></tr>
      <tr><th scope="row">Category</th><td>${esc(source.category)}</td></tr>
      <tr><th scope="row">Reference year</th><td>${esc(source.referenceYear)}</td></tr>
      <tr><th scope="row">Last updated by ${esc(source.publisher)}</th><td>${esc(prettyDate(source.eurostatLastUpdated))}</td></tr>
      <tr><th scope="row">Retrieved by us</th><td>${esc(prettyDate(source.retrieved))}</td></tr>
      <tr><th scope="row">Source URL</th><td><a href="${esc(source.url)}">${esc(source.url)}</a></td></tr>
      <tr><th scope="row">Countries covered</th><td>${countryCount}</td></tr>
    </tbody>
  </table>
  <p class="muted">${esc(source.meaning)}</p>

  <div class="gap">
    <h3>One country is missing</h3>
    <p>${esc(source.note)}</p>
    <p>So the comparison above covers ${countryCount} countries and leaves that one out entirely.
    We would rather show you a gap than fill it with a number we made up.</p>
  </div>`;
}

/* ────────────────────────────── the report ─────────────────────────────── */

export interface RenderOptions {
  generatedOn?: string; // ISO date, YYYY-MM-DD. Defaults to today in UTC.
}

export function buildReport(raw: unknown, data: CostData, options: RenderOptions = {}): string {
  const input = normalise(raw);
  const totals = computeTotals(input);
  const categories = computeCategories(input);
  const countries = computeCountries(input, data);
  const generatedOn = options.generatedOn ?? new Date().toISOString().slice(0, 10);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Trip Budget Report | DURIAN Travel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Playfair+Display:wght@700&amp;display=swap">
<style>${STYLES}</style>
</head>
<body>
<div class="wrap">
${renderSummary(input, totals)}
${renderCategories(input, totals, categories)}
${renderCountries(input, totals, countries, data._source)}
${renderBuffer(input, totals)}
${renderProvenance(data._source, countries.length)}

<div class="disclaimer">
  <p>${DISCLAIMER}</p>
</div>

<footer>
  <p>Trip Budget Report, generated ${esc(prettyDate(generatedOn))} by DURIAN Travel.
  Prepared by the Durian Travel Editorial Team. Estimates only, built from the figures you entered.
  Prices change constantly and vary by season, city and how far ahead you book.</p>
</footer>
</div>
</body>
</html>`;
}
