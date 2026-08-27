import source from './service-packages.json';

type FaqItem = {
  question: string;
  answer: string;
};

type SeoConfig = {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  personas: string[];
  faq: FaqItem[];
};

const oldSlugByUrlSlug: Record<string, string> = {
  'schengen-visa-help': 'schengen-blueprint',
  'first-international-trip': 'first-journey',
  'family-travel-planning': 'family-expedition',
  'digital-nomad-visa-strategy': 'nomad-infrastructure',
  'visa-refusal-reapplication': 'recovery-route',
  'travel-health-planning': 'wellness-journey',
  'multi-region-trip-planning': 'grand-circuit',
};

const iconByOldSlug: Record<string, string> = {
  'schengen-blueprint': '✦',
  'first-journey': '◈',
  'family-expedition': '⬡',
  'nomad-infrastructure': '◎',
  'recovery-route': '◇',
  'wellness-journey': '✿',
  'grand-circuit': '◉',
};

const toneByOldSlug: Record<string, string> = {
  'schengen-blueprint': 'blueprint',
  'first-journey': 'journey',
  'family-expedition': 'family',
  'nomad-infrastructure': 'nomad',
  'recovery-route': 'recovery',
  'wellness-journey': 'wellness',
  'grand-circuit': 'circuit',
};

const tierByName = Object.fromEntries(
  source.tiers.flatMap((tier) => tier.packages.map((name) => [name, tier.tier]))
);

const seoByUrlSlug: Record<string, SeoConfig> = {
  'schengen-visa-help': {
    h1: 'Schengen Application Support - Documents, Route and Cover Letter',
    metaTitle: 'Schengen Visa Help + Itinerary Planning | Durian Travel',
    metaDescription:
      'Expert Schengen visa strategy, document review, and itinerary planning. Cover letters, financial proof coaching, and embassy-specific guidance. Contact us.',
    personas: [
      'First-time applicants who need their visa file and itinerary to tell the same story.',
      'Travelers facing embassy-specific financial proof or cover-letter scrutiny.',
      'Applicants trying to avoid a refusal caused by route logic, weak documents, or vague planning.',
    ],
    faq: [
      {
        question: "What's the difference between applying at the French vs German embassy?",
        answer:
          'The core Schengen rules are shared, but intake style, document expectations, and how strictly officers assess context can differ by consulate. That is why embassy-specific preparation matters.',
      },
      {
        question: 'How much money do I need in my bank account for a Schengen visa?',
        answer:
          'There is no single safe number for every applicant. Officers look at consistency, income pattern, trip length, route, and whether the budget makes sense beside the rest of the file.',
      },
      {
        question: "Can I apply for Schengen if I've never traveled internationally before?",
        answer:
          'Yes. First-time applicants can be approved, but the file needs stronger clarity around finances, itinerary, and ties to home because there is no travel-history shortcut.',
      },
      {
        question: 'What is a cover letter for a Schengen visa, and do I need one?',
        answer:
          'A cover letter explains purpose, route, funding, and return logic in one readable document. Some embassies do not explicitly require it, but it often improves the file when used properly.',
      },
      {
        question: 'How far in advance should I apply for a Schengen visa?',
        answer:
          'The legal window is up to six months before travel and at least 15 days before departure, but strong applicants usually start much earlier so the route, bookings, and finances can be aligned properly.',
      },
    ],
  },
  'first-international-trip': {
    h1: 'First International Trip Planning - Step by Step',
    metaTitle: 'First International Trip Planning | Durian Travel',
    metaDescription:
      'Planning your first international trip? We handle visa strategy, itinerary planning, and pre-departure prep - with pharmacist-backed health guidance included.',
    personas: [
      'Travelers who have never flown internationally and need a clean, confidence-building process.',
      'People overwhelmed by visas, insurance, airport rules, and what to book first.',
      'Anyone who wants a realistic first route instead of internet advice that assumes too much.',
    ],
    faq: [
      {
        question: 'What if this is my first time leaving my home country?',
        answer:
          'That is exactly what this package is built for. It starts from zero and covers the order of decisions, documents, bookings, and pre-departure preparation in plain language.',
      },
      {
        question: 'Can you help me choose a destination based on my passport and budget?',
        answer:
          'Yes. The first step is matching your passport strength, travel timeline, and budget ceiling to a route that is both realistic and enjoyable.',
      },
      {
        question: 'Do first-time international travelers need travel insurance right away?',
        answer:
          'Insurance timing depends on the destination and visa process, but it should be built into the early planning stage rather than treated as a last-minute add-on.',
      },
      {
        question: 'How do I know if my first itinerary is too ambitious?',
        answer:
          'If the route depends on repeated one-night stops, tight airport transfers, or vague assumptions about your energy after a long-haul flight, it is probably overbuilt.',
      },
    ],
  },
  'family-travel-planning': {
    h1: 'Family Travel Planning - Routes, Timing and Paperwork',
    metaTitle: 'Family International Travel Planning | Durian Travel',
    metaDescription:
      'International travel planning for families of 2-6, including children and elderly travelers. Coordinated visa strategy, group itineraries, and pharmacist-reviewed health planning.',
    personas: [
      'Families traveling with children whose documents and pacing need tighter coordination.',
      'Groups including elderly travelers, chronic medications, or mobility considerations.',
      'Sponsors and guardians managing a multi-member visa file where one mistake affects everyone.',
    ],
    faq: [
      {
        question: 'Can you coordinate visa strategy for an entire family application?',
        answer:
          'Yes. Family cases often need synchronized appointments, sponsorship logic, minor documentation, and a route that works for every traveler, not just the lead applicant.',
      },
      {
        question: 'What documents do children need for international travel?',
        answer:
          'That depends on the destination and who is traveling with them, but parental consent letters, birth records, guardianship proof, and minor travel authorizations are common requirements.',
      },
      {
        question: 'Can this package help with elderly travelers and medications?',
        answer:
          'Yes. The planning includes medication handling, mobility pacing, emergency documentation, and the extra health preparation families usually discover too late.',
      },
      {
        question: 'Is family travel insurance different from solo travel insurance?',
        answer:
          'Often yes. Group coverage, pediatric needs, pre-existing conditions, and age-based exclusions can all affect the right policy choice for a family trip.',
      },
    ],
  },
  'digital-nomad-visa-strategy': {
    h1: 'Long-Stay Planning for Digital Nomads',
    metaTitle: 'Digital Nomad Long-Stay Trip Planning | Durian Travel',
    metaDescription:
      'Solve the 90-day Schengen limit. Multi-entry visa strategy, remote work visa options, and 3+ month medication planning for long-stay digital nomads.',
    personas: [
      'Remote workers trying to stay in Europe longer than the basic 90/180 Schengen window.',
      'Nomads balancing visa architecture, insurance gaps, and medication continuity across months.',
      'Travelers comparing long-stay visa options such as Portugal D8 or Spain digital nomad pathways.',
    ],
    faq: [
      {
        question: 'Can you help me stay in Europe longer than 90 days?',
        answer:
          'Yes. The core of this package is mapping the 90/180 rule, non-Schengen buffers, and destination-specific long-stay or remote work visa options.',
      },
      {
        question: 'Do digital nomads need different insurance from short-term travelers?',
        answer:
          'Usually yes. Many standard travel policies are built for short trips and may not fit long stays, repeated entries, or ongoing prescription needs.',
      },
      {
        question: 'How do I travel with a 3-month medication supply?',
        answer:
          'That needs country-by-country planning for quantities, import rules, supporting letters, and safe refill or equivalent strategies abroad.',
      },
      {
        question: 'Can you compare remote work visa options for me?',
        answer:
          'Yes. We help evaluate whether a long-stay route should use Schengen planning, a national digital nomad visa, or a non-Schengen buffer strategy instead.',
      },
    ],
  },
  'visa-refusal-reapplication': {
    h1: 'After a Visa Refusal - Reading the Reasons and Reapplying',
    metaTitle: 'Visa Refusal Reapplication Help | Durian Travel',
    metaDescription:
      "Got a visa refusal? We decode the real reason, fix the application, and build a stronger reapplication strategy. Don't guess - get a plan.",
    personas: [
      'Applicants who already have a refusal letter and need to know what it really means.',
      'Travelers who suspect the official refusal reason does not explain the real weakness in the file.',
      'People deciding whether to reapply, switch consulates, strengthen documents, or wait.',
    ],
    faq: [
      {
        question: 'What should I do immediately after a visa refusal?',
        answer:
          'Start by decoding the refusal grounds properly. Reapplying without understanding the real weakness often leads to a second refusal for the same reason.',
      },
      {
        question: 'Can you tell me whether I should appeal or reapply?',
        answer:
          'Yes. The right next step depends on the refusal grounds, the jurisdiction, how quickly you need to travel, and whether the file can be materially strengthened.',
      },
      {
        question: 'How long should I wait before reapplying after a refusal?',
        answer:
          'There is no universal wait period, but reapplying too quickly without changing the substance of the case is one of the most common mistakes after a refusal.',
      },
      {
        question: 'Do refusal codes always explain the real problem?',
        answer:
          'Not always. Many refusal letters are broad or formulaic, so the real work is identifying the actual weakness behind the wording and fixing that directly.',
      },
    ],
  },
  'travel-health-planning': {
    h1: "Travel Health Planning - Medication, Insurance and Chronic Conditions",
    metaTitle: 'Travel Health Planning for Europe | Medication & Chronic Conditions | Durian Travel',
    metaDescription:
      'Planning a Europe trip with chronic conditions or prescription medication? We align Schengen health prep, insurance, medication documents, and safer itinerary pacing.',
    personas: [
      'Travelers with chronic conditions who need health to shape a Schengen route, not follow it.',
      'People carrying prescription or controlled medications into Europe and unsure what paperwork is required.',
      'Families or solo travelers who need pharmacist-informed Schengen planning before they book anything irreversible.',
    ],
    faq: [
      {
        question: 'Can you help me travel to Europe with prescription medication?',
        answer:
          'Yes. This package is built for medication legality, quantity planning, documentation, and Schengen-country rules that standard travel planning usually ignores.',
      },
      {
        question: 'Do I need a pharmacist letter to travel with medication in Schengen countries?',
        answer:
          'Sometimes supporting documentation is extremely helpful, especially for controlled substances, injectable items, or large quantities. The right paperwork depends on the drug, your route, and any transit points.',
      },
      {
        question: 'Is this a medical consultation or a travel-planning service?',
        answer:
          'It is travel planning informed by pharmacist expertise. It does not replace your doctor, but it helps translate health constraints into a safer, more workable trip.',
      },
      {
        question: 'Can you help with Europe-specific health risks and pacing issues?',
        answer:
          'Yes. The package includes Schengen-focused risk briefings and preparation guidance for issues such as altitude, heat, food safety, dehydration, walking load, and travel fatigue.',
      },
    ],
  },
  'multi-region-trip-planning': {
    h1: 'Multi-Country Trip Planning - Routes That Hold Together',
    metaTitle: 'Multi-Country Europe Trip Planning | Durian Travel',
    metaDescription:
      'Planning a trip across multiple regions and visa zones? We map the full visa architecture, manage health continuity, and coordinate itinerary logic across every destination.',
    personas: [
      'Experienced travelers moving across multiple visa systems on one trip.',
      'Clients who need Schengen, non-Schengen, transit, and destination health rules to work together.',
      'Travelers planning a premium or multi-month route where one sequencing mistake becomes expensive.',
    ],
    faq: [
      {
        question: 'Can you help plan a trip that crosses multiple visa zones?',
        answer:
          'Yes. This package is built for multi-region sequencing where visas, entries, insurance, and route logic need to work together from the start.',
      },
      {
        question: 'What if my trip includes Schengen and non-Schengen countries?',
        answer:
          'That is exactly the kind of architecture this package handles. We map how the Schengen stay fits into the larger trip and where timing or documentation can break.',
      },
      {
        question: 'Do I need separate health planning for different regions?',
        answer:
          'Usually yes. Climate, altitude, disease profile, medication availability, and insurance validity can shift significantly when a trip crosses regions.',
      },
      {
        question: 'Is this package only for luxury travelers?',
        answer:
          'No. It is designed for complex routes rather than a specific budget tier, though it is often a strong fit for higher-investment or high-consequence trips.',
      },
    ],
  },
};

export type ServicePackage = (typeof source.packages)[number] & {
  oldSlug: string;
  tone: string;
  icon: string;
  tier: string;
  href: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  personas: string[];
  faq: FaqItem[];
};

export const servicePackages: ServicePackage[] = source.packages.map((pkg) => {
  const oldSlug = oldSlugByUrlSlug[pkg.url_slug];
  const seo = seoByUrlSlug[pkg.url_slug];

  return {
    ...pkg,
    oldSlug,
    tone: toneByOldSlug[oldSlug],
    icon: iconByOldSlug[oldSlug],
    tier: tierByName[pkg.name],
    href: `/services/${pkg.url_slug}/`,
    h1: seo.h1,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    personas: seo.personas,
    faq: seo.faq,
  };
});

export const servicePackageBySlug = Object.fromEntries(
  servicePackages.map((pkg) => [pkg.url_slug, pkg])
) as Record<string, ServicePackage>;

export const serviceHrefByOldSlug = Object.fromEntries(
  servicePackages.map((pkg) => [pkg.oldSlug, pkg.href])
) as Record<string, string>;

export const servicePositioning = source.positioning;
