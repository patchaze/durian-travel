# BRIEF

**Status: DONE**
**Written: 16 September 2026, by Cowork**
**Brief 015**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

**Read this first.** This brief publishes blog posts, and blog posts state facts. Under the handoff convention they reach live with nobody reading them. **Patricia has been told to read the three new posts before you merge.** If she has not, write that in Done and stop before item 3 rather than publishing them unread. Items 1 and 2 are safe to ship either way.

---

## What to do

### 1. Finish the retirement

Claude Code flagged these in brief 014 and they are still live. Every one of them sells work Durian no longer does.

- `src/pages/privacy-policy.astro` line 36: "DURIAN ("we", "us", "our") is a visa application strategy consultancy". Durian is not a consultancy. Reword.
- `src/pages/terms-of-service.astro` line 10: the meta description says "educational services and consultancy".
- `src/pages/destinations.astro` line 29: the description offers "links to travel consultancy support".
- `src/pages/destinations.astro` line 80: a paragraph selling a "trusted Europe travel planner", "custom Europe itineraries", "personalized travel consultancy", and claiming every detail is "arranged flawlessly". **Rewrite the whole paragraph.** It is keyword stuffing, it sells three retired services, and "flawlessly" is a promise about an outcome Durian does not control.
- `src/data/countries.json`: the `metaDescription` for France, Spain and Croatia each promise "expert travel consultancy" and "custom itineraries". Check all 30 countries, not just those three, and list in Done how many you changed.

`src/content/blog/travel-health-kit-europe.md` was flagged for pharmacist framing. **Read it before changing anything.** Lines 61, 88 and 90 talk about using a pharmacy abroad and carrying generic drug names, which is ordinary travel advice and stays. Only remove wording that presents Durian, or the person behind it, as a pharmacist or as medically qualified. If there is none, say so in Done and change nothing.

### 2. Date the border content

Only one blog post carries a "last checked" line, and only one mentions ETIAS. Border rules move, and an undated rule on this site is the single most damaging error it can make.

- Find every post that states a border rule, a visa rule, a fee or an entry requirement.
- Add a dated line in the same style the site already uses, naming the official source and the date it was checked. **Check each rule against its official source before you date it.** If you cannot confirm a statement, do not date it: remove the claim or replace it with a link to the official page, and list what you removed in Done.
- Do not change `pubDate` on any existing post. Use `modDate`.

### 3. Three new posts

All three are built only from data already in this repo or from the sources named below. **No figure may come from anywhere else.**

Each post ends by sending the reader to the tool that answers the question, not to the contact page.

**Post A, money.** Working title: what a week in Europe actually costs, country by country.
- Source: `src/data/country-costs.json` only. Eurostat `prc_ppp_ind`, `PLI_EU27_2020`, reference year 2024, the dates already in that file's `_source` block.
- The story is the one that makes the paid report worth buying: the cheap country for hotels is not the cheap country for groceries. Portugal sits well below the EU average for restaurants and hotels and slightly above it for food from shops. Bulgaria looks far cheaper on hotels than it is on food.
- Any daily figure that is Durian's own estimate says so in the same sentence.
- Ends at `/tools/cost-per-country/`.

**Post B, border rules.** Working title: what ETIAS is, what it costs, and why you cannot apply yet.
- Sources: the official ETIAS site `https://travel-europe.europa.eu/etias_en`, verified by Cowork on 12 September 2026. It states: "ETIAS is currently not in operation and no applications for travel authorisations are collected at this point." The fee shown is EUR 20. It covers 30 European countries and stays of up to 90 days.
- **Re-check that page yourself before publishing and use your own date.** If it now says something different, write what it says, not what is above.
- The point of the post is that nobody can apply yet and that anyone charging for an ETIAS application today is not selling what they claim. Say it plainly, without naming anybody.
- Ends at `/tools/do-you-need-a-visa/`.

**Post C, nationality.** Working title: which passports need a Schengen visa and which do not.
- Source: `src/data/visa-requirements.json` only, which brief 009 built from Regulation (EU) 2018/1806 and verified against EUR-Lex.
- Explain the three situations plainly: free movement, visa exempt, and visa required. Cover the conditional cases, because they catch people out: several exemptions apply only to biometric passports, and some British national categories are listed separately.
- **This post must not tell anybody what documents to gather.** It says whether a rule applies. Nothing else.
- Ends at `/tools/do-you-need-a-visa/`.

**For all three:** target keyword, title under 60 characters, meta description under 155, real `pubDate` of the day you publish. Authorship is the organisation. Follow the blog frontmatter shape in `CLAUDE.md`.

## Why

The blog has published nothing since 9 April, and it is the traffic channel the strategy names first. Restarting it on the two datasets Durian already maintains costs no new research and produces content nobody else can copy, because copying it means maintaining the data.

ETIAS is the largest traffic opportunity available: the searches are building now and the thing does not exist yet, so the page that explains the wait is the page people find.

## Do not

- **Do not backdate any post.** `pubDate` is the real date of publication. Google records when it first saw a URL, and a false date in article schema is the exact trust signal this site cannot afford to lose.
- Do not invent a statistic, a price, a law or a date. Every number comes from `country-costs.json`, `visa-requirements.json`, or the official ETIAS page, cited with a date.
- Do not state a border rule you have not checked against its official source today.
- Do not list documents to gather, in any post. That is the retired business.
- Do not score, rate, predict or imply a visa outcome anywhere.
- Do not name Patricia, add a byline, or add `Person` schema. Authorship is the organisation.
- Do not use: unlock, seamless, effortless, game changer, dream trip, guaranteed, chances, odds, hack, secret, ultimate, definitive, flawlessly.
- Do not use dashes as punctuation in published copy. Rewrite the sentence.
- Do not change `functions/api/report.ts`, the Stripe verification, the access code, or any tool's arithmetic.
- Do not touch `public/_headers`, the CSP, or DNS.
- Do not add a library or any new runtime dependency.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- Every page and post touching visas or borders carries: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

## Check before you merge

- `grep -rni "consultancy\|consultant\|flawlessly\|custom itinerar" src/ dist/` returns nothing.
- Every post stating a border rule carries a dated source line.
- No new post lists documents to gather.
- Every figure in the three new posts traces to a named file or the official ETIAS page.
- No `pubDate` is earlier than the day you publish.
- Build passes and `grep -ri "azevedo" dist/` returns nothing.

---

## Done

*Claude Code fills this in. Keep it to facts.*

**Completed on:** 17 September 2026, items 1 and 2. Item 3 is drafted, not published.
**Branch:** `brief/015-retirement-and-dates`, merged. Item 3 drafts: `brief/015-new-posts`, not merged.

**What changed:**

1. **Retirement.**
   - Privacy policy "Who we are" reworded, last updated 17 September 2026. Terms meta description. `destinations.astro` description, hero line ("bespoke adventure") and the whole "Planning Your European Journey" paragraph, which now links to cost per country and the visa check.
   - `countries.json`: **29 of 29** meta descriptions rewritten (the file has 29 countries, not 30), plus Austria's "Our custom itineraries" and "bespoke" dropped from 7 keyword lists. **None of this was live.** Every country has its own `src/content/destinations/*.md`, whose description wins, and those were already clean. Same for the "Bespoke Travel in" heading and the fallback description in `destinations/[slug].astro`, both fixed.
   - The check grep also caught, and these were live: homepage hero button "Get a Custom Itinerary" (now "Try the free planners", to `/tools/`), "consultant" twice in the homepage FAQ and three times in the disclaimer (last updated 17 September 2026), the Switzerland and Netherlands write ups, and the agency switching post's "Strategy Reset" call.
   - Travel health kit: "Pharmacist" removed from tags and keywords. The body makes no pharmacist or medical claim; lines 61, 88, 90 and 102 unchanged.
   - `grep -rni "consultancy\|consultant\|flawlessly\|custom itinerar" src/ dist/`: nothing.
2. **Dates.** Checked on 17 September 2026 against the Commission's "Applying for a Schengen visa" page, the Visa Code consolidated 11 June 2024 on EUR-Lex (Articles 5, 9, 12, 15, 16, 32), the Commission's Schengen area and EES pages, the official ETIAS site, and EUR-Lex for Regulation (EU) 2018/1806 (latest consolidation still 30 December 2025).
   - **13 posts** now end with a linked source line dated 17 September 2026 and carry `modDate: "2026-09-17"`: schengen-visa-requirements, how-much-does-schengen-visa-cost, visa-refusal-reasons, schengen-document-checklist, how-to-write-visa-cover-letter, europe-travel-insurance, europe-trip-planning-timeline, europe-trip-budget, 10-day-europe-itinerary, 10-day-italy-itinerary, multi-country-europe-itinerary, sweden-itinerary, how-to-switch-travel-agencies. No `pubDate` changed.
   - **Wrong, corrected:** requirements post said passports from outside Europe generally need a visa, naming North America and Australia. Document checklist said 27 Schengen countries, now 29. Eight posts said "most nights, and first entry if equal"; Article 5 says days or purpose, then first external border. Visa guide said EES replaces stamps "in the long term"; it has since 10 April 2026.
   - **Unconfirmed, removed:** "ETIAS starts in the last quarter of 2026" (requirements post, visa guide page, chatbot); the official site gives no date. Sources page EES and ETIAS date moved to 17 September 2026. Refusal post: the 14.8% refusal rate section (approval rate shaped), "many travelers get approved", and "a prior refusal never explained" as a ground. Appeal "deadline" claims in the refusal and cover letter posts. Cost post: every unsourced price range (visa centre, courier, insurance, documents, reservations, the EUR 170 to 270 total). Checklist: "EUR 50 to 100 a day" and the photo size; now the ICAO standard the Commission names. Cover letter post: "DURIAN Travel client application experience" and the Manila language claims.
   - **Not dated, no border rule, visa rule or official fee stated:** is-sweden-worth-it, where-to-stay-paris, train-travel-europe, europe-packing-list, travel-health-kit-europe, flights-to-europe-middle-east-conflict-2026, is-it-safe-to-travel-to-europe-2026.
3. **New posts: not published.** Patricia had not read them. Drafted on `brief/015-new-posts` for her to read. Their `pubDate` must be reset to the real day they merge.

**Could not do, and why:**

- Item 3 publication, per the gate above.

**For Cowork:**

- **Stale, not border rules, not touched:** the flights post says an EASA bulletin is "currently" active "through April 10, 2026". The safety post quotes US advisory levels from April 2026. Also unchecked: the 100 ml liquids rule (packing, timeline, Italy) and EU rail delay thresholds (train travel).
- **Document lists still live:** the whole checklist post, the cover letter templates and enclosures, the requirements post's 10 item file, and parts of the timeline, insurance, budget and agency posts. This brief barred them only in new posts.
- **Outcome language still live:** "Top 7 Reasons", "strongest files", "the easier the application" across the requirements, refusal, cover letter and itinerary posts.
- `how-to-switch-travel-agencies-schengen.md` sends readers to paid agencies for "rescue cases", recommends dummy bookings and giving a pretext to get a passport back. Worth retiring.
- `destinations.astro` banner: "we'll write back with itinerary ideas".
- Commission Implementing Regulation (EU) 2026/496 of 6 March 2026 suspends visa free travel for Georgian diplomatic, service and official passports. Not in the consolidated text. Ordinary passports and the visa tool are unaffected.
