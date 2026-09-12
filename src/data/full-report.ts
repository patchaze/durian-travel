// The full cost per country report: its price, its Payment Link, its offer
// copy and every question it asks.
//
// Two pages read this. The free comparison at /tools/cost-per-country/ shows
// the offer and links to the report page. The report page at
// /tools/cost-per-country/full-report/ asks the questions and takes payment.
// Keeping all of it here means the price and the link are each defined exactly
// once, however many pages show them.

// The price of the full report. Patricia set it on 12 September 2026.
export const REPORT_PRICE = '€5';

// The hosted Stripe Payment Link. A test link today: it charges nothing and
// takes only Stripe test cards, because the account is still under identity
// review. Swapping it for the live link is this one edit.
//
// It is a public navigation target, not a secret. It has to reach the browser
// for the button to work. The secret key, the price in cents and the currency
// are Cloudflare values and are never in this repository.
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_8x23cu35Va9xgGV9937wA00';

export const FULL_REPORT_URL = '/tools/cost-per-country/full-report/';

// Two buttons, two jobs, so two labels. The comparison page's button is a link
// that takes you to the report page. The report page's button takes payment.
export const offerCta = REPORT_PRICE
  ? `Get the full report for ${REPORT_PRICE}`
  : 'Get the full report';

export const payCta = REPORT_PRICE
  ? `Pay ${REPORT_PRICE} and get your report`
  : 'Get your report';

// What somebody is actually buying, said before they are asked to pay.
export const reportIncludes = [
  'Seven Eurostat categories weighted to how you actually travel, not one index for everybody.',
  'Every country you are weighing up, priced per person per day and for the whole trip.',
  'The ranking that changes once your own habits are counted, with the biggest mover named.',
  'A page you can save or print, with every figure sourced and dated.',
];

// The same three bands as /tools/budget/, and the same typical figures.
// Durian's own editorial estimate for Western Europe, not a statistic.
export const styles = [
  { id: 'budget', label: 'Budget', low: 70, high: 130, typical: 100 },
  { id: 'mid', label: 'Mid-range', low: 140, high: 240, typical: 190 },
  { id: 'comfortable', label: 'Comfortable', low: 260, high: 380, typical: 320 },
];

export const DEFAULT_STYLE = 'mid';

export interface Field {
  id: string;
  label: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  value?: number;
  options?: [string, string][];
}

export interface QuestionGroup {
  group: string;
  fields: Field[];
}

// Every question the report asks. Each one changes a weight, so none is
// decorative. There is deliberately no travel month or season: no verified
// source for seasonality exists yet, so the answer would change nothing.
export const questions: QuestionGroup[] = [
  {
    group: 'Your trip',
    fields: [
      { id: 'nights', label: 'How many nights in total?', type: 'number', min: 1, max: 365, value: 10 },
      { id: 'party', label: 'Who is going?', type: 'select', options: [
        ['solo', 'Solo'], ['couple', 'A couple'],
        ['family', 'A family with children'], ['friends', 'A group of friends'],
      ] },
      { id: 'adults', label: 'How many adults?', type: 'number', min: 0, max: 20, value: 1 },
      { id: 'children', label: 'How many children?', type: 'number', min: 0, max: 20, value: 0 },
    ],
  },
  {
    group: 'Where you sleep',
    fields: [
      { id: 'stayType', label: 'Where do you usually stay?', type: 'select', options: [
        ['hotel', 'Hotel'], ['apartment', 'Apartment or rental'],
        ['hostel', 'Hostel dorm'], ['friends', 'With friends or family'],
      ] },
      { id: 'breakfast', label: 'Is breakfast usually included?', type: 'select', options: [
        ['no', 'No'], ['yes', 'Yes'],
      ] },
    ],
  },
  {
    group: 'What you eat',
    fields: [
      { id: 'mealsOut', label: 'How many meals a day do you eat out?', type: 'select', options: [
        ['0', 'None'], ['1', 'One'], ['2', 'Two'], ['3', 'Three'],
      ] },
      { id: 'snacks', label: 'Coffee, pastries, snacks out?', type: 'select', options: [
        ['rarely', 'Rarely'], ['daily', 'Once a day'], ['several', 'Several a day'],
      ] },
      { id: 'dinnerDrinks', label: 'Drinks with dinner?', type: 'select', options: [
        ['no', 'No'], ['sometimes', 'Sometimes'], ['most', 'Most nights'],
      ] },
    ],
  },
  {
    group: 'Getting around a city',
    fields: [
      { id: 'cityTransport', label: 'How do you move around a city?', type: 'select', options: [
        ['walking', 'Mostly walking'], ['public', 'Public transport'],
        ['mix', 'A mix, with some taxis'], ['taxi', 'Mostly taxis and ride hailing'],
      ] },
      { id: 'carHire', label: 'Hiring a car anywhere?', type: 'select', options: [
        ['no', 'No'], ['yes', 'Yes'],
      ] },
    ],
  },
  {
    group: 'Between cities',
    fields: [
      { id: 'cityMoves', label: 'How many times will you move city?', type: 'number', min: 0, max: 100, value: 2 },
      { id: 'intercityMode', label: 'How do you travel between them?', type: 'select', options: [
        ['train', 'Train'], ['coach', 'Coach'], ['flight', 'Budget flight'],
      ] },
    ],
  },
  {
    group: 'What you actually do',
    fields: [
      { id: 'museums', label: 'Museums, galleries, monuments?', type: 'select', options: [
        ['rarely', 'Rarely'], ['few', 'A few'], ['most', 'Most days'],
      ] },
      { id: 'tours', label: 'Guided tours or day trips?', type: 'select', options: [
        ['none', 'None'], ['couple', 'One or two'], ['several', 'Several'],
      ] },
      { id: 'nightlife', label: 'Going out at night?', type: 'select', options: [
        ['no', 'No'], ['occasionally', 'Occasionally'], ['often', 'Often'],
      ] },
      { id: 'shopping', label: 'Planning to shop?', type: 'select', options: [
        ['no', 'No'], ['little', 'A little'], ['lot', 'A lot'],
      ] },
    ],
  },
  {
    group: 'Staying connected',
    fields: [
      { id: 'esim', label: 'Do you need an eSIM or data plan?', type: 'select', options: [
        ['no', 'No'], ['yes', 'Yes'],
      ] },
    ],
  },
];
