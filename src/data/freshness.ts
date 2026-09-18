// Every source this site leans on, in one place: what it is, the version read,
// the date Durian last checked it, the date the source itself last changed,
// and where it lives.
//
// Pages read their provenance from here and nowhere else, so a figure and the
// date beside it can never drift apart. The datasets that already carry their
// own provenance block are re-exported from their own files rather than copied,
// for the same reason. The data itself (the countries, the visa entries, the
// rates) is still read from the data files: this module owns only the
// provenance.
import { getCollection } from 'astro:content';
import visaData from './visa-requirements.json';
import costData from './country-costs.json';
import rateData from './exchange-rates.json';

/** The provenance blocks of the three datasets, exactly as their files hold them. */
export const PROVENANCE = {
  visa: visaData._source,
  eurostat: costData._source,
  rates: rateData._source,
  ratesSecondary: rateData._secondarySource,
};

/** Every currency the planners convert into, with its rate and its source. */
export const CURRENCIES = rateData.currencies;

/** 18 September 2026, from 2026-09-18. */
export const onDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// ETIAS, as the official site stated it on the date below. Nobody can apply:
// applications are not being collected, so no page may tell anybody to apply.
export const ETIAS_STATUS = {
  operational: false,
  statement:
    'ETIAS is currently not in operation and no applications for travel authorisations are collected at this point.',
  fee: 'EUR 20',
  countries: 30,
  url: 'https://travel-europe.europa.eu/etias_en',
  checked: '2026-09-17',
};

// The Schengen area, as the European Commission lists it on the date below.
export const SCHENGEN_MEMBERS = {
  eu: ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Czechia', 'Denmark', 'Estonia', 'Finland',
       'France', 'Germany', 'Greece', 'Hungary', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
       'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain',
       'Sweden'],
  nonEu: ['Iceland', 'Norway', 'Switzerland', 'Liechtenstein'],
  url: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/schengen-area_en',
  checked: '2026-09-18',
};

export interface SourceRecord {
  id: string;
  name: string;
  covers: string;
  /** The version, dataset or page edition the site is reading. */
  version: string;
  /** When Durian last read the source. */
  lastChecked: string;
  /** When the source itself last changed, where the source says so. */
  lastChanged?: string;
  /** Anything a reader needs to know about how the source is used. */
  note?: string;
  url: string;
}

const visa = PROVENANCE.visa;
const cost = PROVENANCE.eurostat;
const rates = PROVENANCE.rates;
const ratesNg = PROVENANCE.ratesSecondary;

export const SOURCES: SourceRecord[] = [
  {
    id: 'visa-list',
    name: 'Regulation (EU) 2018/1806, the EU visa list',
    covers: 'Whether a passport needs a Schengen short stay visa.',
    version: visa.consolidatedVersionLabel,
    lastChecked: visa.retrieved,
    lastChanged: visa.consolidatedVersion,
    url: visa.consolidatedUrl,
  },
  {
    id: 'eurostat-prices',
    name: `Eurostat, dataset ${cost.dataset}`,
    covers: 'What a day costs in each country, and every figure in the paid report.',
    version: `Indicator ${cost.indicator}, ${cost.category.replace('A0111, ', '')}, reference year ${cost.referenceYear}`,
    lastChecked: cost.retrieved,
    lastChanged: cost.eurostatLastUpdated,
    note: cost.note,
    url: cost.url,
  },
  {
    id: 'exchange-rates',
    name: `${rates.publisher}, ${rates.dataset}`,
    covers: 'Converting the euro figures in the planners into the other currencies they offer.',
    version: `Reference rates of ${onDate(rates.rateDate)}`,
    lastChecked: rates.retrieved,
    lastChanged: rates.rateDate,
    url: rates.url,
  },
  {
    id: 'exchange-rates-cbn',
    name: `${ratesNg.publisher}, ${ratesNg.dataset}`,
    covers: ratesNg.covers,
    version: `Central rates of ${onDate(ratesNg.rateDate)}`,
    lastChecked: ratesNg.retrieved,
    lastChanged: ratesNg.rateDate,
    note: ratesNg.method,
    url: ratesNg.url,
  },
  {
    id: 'visa-code',
    name: 'Regulation (EC) No 810/2009, the Visa Code',
    covers: 'Visa fees, insurance cover, which consulate to apply to, refusal grounds and appeals.',
    version: 'Consolidated text of 11 June 2024',
    lastChecked: '2026-09-17',
    lastChanged: '2024-06-11',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02009R0810-20240611',
  },
  {
    id: 'commission-visa',
    name: 'European Commission, Applying for a Schengen visa',
    covers: 'The fee, the application window, processing times and what a refusal letter tells you.',
    version: 'Page edition of 2 December 2025',
    lastChecked: '2026-09-17',
    lastChanged: '2025-12-02',
    url: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/visa-policy/applying-schengen-visa_en',
  },
  {
    id: 'schengen-area',
    name: 'European Commission, Schengen area',
    covers: 'Which countries are in the Schengen area, and the position of Cyprus and Ireland.',
    version: '29 countries: 25 EU members plus Iceland, Norway, Switzerland and Liechtenstein',
    lastChecked: SCHENGEN_MEMBERS.checked,
    url: SCHENGEN_MEMBERS.url,
  },
  {
    id: 'ees',
    name: 'European Commission, Entry/Exit System',
    covers: 'When EES started, who it registers, and that it has replaced passport stamps.',
    version: 'Fully operational since 10 April 2026',
    lastChecked: '2026-09-17',
    lastChanged: '2026-04-10',
    url: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/smart-borders/entry-exit-system_en',
  },
  {
    id: 'etias',
    name: 'The official ETIAS website',
    covers: 'What ETIAS will be, what it will cost, and that it is not running yet.',
    version: `Not in operation, no applications collected, fee stated as ${ETIAS_STATUS.fee}`,
    lastChecked: ETIAS_STATUS.checked,
    url: ETIAS_STATUS.url,
  },
];

export const byId = (id: string): SourceRecord | undefined =>
  SOURCES.find((source) => source.id === id);

/**
 * The country guides, counted from the content collection rather than typed,
 * with the most recent day any of them changed. Each guide carries its own
 * lastUpdated in its frontmatter, stamped from the repository.
 */
export async function countryGuideFreshness(): Promise<{ count: number; lastUpdated: string | null }> {
  const guides = await getCollection('destinations');
  const dates = guides
    .map((guide) => guide.data.lastUpdated)
    .filter((date): date is string => typeof date === 'string')
    .sort();
  return { count: guides.length, lastUpdated: dates.length ? dates[dates.length - 1] : null };
}

/** What changed on this site, and when. The public half of the work log. */
export interface ChangeRecord {
  date: string;
  what: string;
}

export const CHANGES: ChangeRecord[] = [
  {
    date: '2026-09-19',
    what: 'Added the UAE dirham and the Nigerian naira to the planners, converted at the Central Bank of Nigeria\'s published central rates because the European Central Bank does not publish either.',
  },
  {
    date: '2026-09-18',
    what: 'Published a sample of the paid report, cut the questions asked before payment from 21 to 13, added the list of the 29 Schengen countries to the visa check, and started converting prices at the European Central Bank\'s reference rates instead of relabelling euro figures.',
  },
  {
    date: '2026-09-17',
    what: 'Checked every border rule, visa rule and fee stated in the guides against its official source, and added a dated source line to the 13 guides that state one. Corrected the Schengen country count, the rule for which consulate you apply to, and who needs a visa. Removed an ETIAS start date the official site no longer gives, a refusal rate figure, and price ranges that had no source.',
  },
  {
    date: '2026-09-15',
    what: 'Retired the services section. Everything Durian Travel publishes is now a free planner, a guide, or the one paid report.',
  },
  {
    date: '2026-09-12',
    what: 'Rebuilt the visa check on the consolidated text of Regulation (EU) 2018/1806, with the version and the date it was read shown on every answer.',
  },
];
