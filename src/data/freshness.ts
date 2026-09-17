// Every source this site leans on, in one place, with the date it was last
// checked and the date the source itself last changed.
//
// Pages read from here instead of restating dates in their own copy, so a
// figure and the date beside it can never drift apart. The two datasets that
// already carry their own provenance are read from their own files rather
// than copied, for the same reason.
import visaData from './visa-requirements.json';
import costData from './country-costs.json';

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
  url: string;
}

const visa = visaData._source;
const cost = costData._source;

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
    version: `Indicator ${cost.indicator}, reference year ${cost.referenceYear}`,
    lastChecked: cost.retrieved,
    lastChanged: cost.eurostatLastUpdated,
    url: cost.url,
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
    lastChecked: '2026-09-18',
    url: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/schengen-area_en',
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
    version: 'Not in operation, no applications collected, fee stated as EUR 20',
    lastChecked: '2026-09-17',
    url: 'https://travel-europe.europa.eu/etias_en',
  },
];

export const byId = (id: string): SourceRecord | undefined =>
  SOURCES.find((source) => source.id === id);

/** What changed on this site, and when. The public half of the work log. */
export interface ChangeRecord {
  date: string;
  what: string;
}

export const CHANGES: ChangeRecord[] = [
  {
    date: '2026-09-18',
    what: 'Published a sample of the paid report, cut the questions asked before payment from 21 to 13, and added the list of the 29 Schengen countries to the visa check.',
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

/** 18 September 2026, from 2026-09-18. */
export const onDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
