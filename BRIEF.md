# BRIEF

**Status: DONE**
**Written: 19 September 2026, by Cowork**
**Brief 016**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

**Carried over from brief 015, which is DONE.** Brief 015 merged on 17 September 2026 and swept `consultancy`, `consultant`, `flawlessly` and `custom itinerar` out of `src/` and `dist/`, so this brief's sweep in item 2.9 covers different terms and should find different hits. Its item 3, three new blog posts, is drafted on `brief/015-new-posts` and is not merged, because Patricia has not read them yet. That branch is not part of this brief.

---

## What to do

Everything below came from a live visitor test of production on 17 September 2026, done from the browser. Brief 015 merged the same day, so a string quoted here may already have changed. File paths are not given because the audit had no repo access. Locate and confirm every quoted string before editing it, and list in Done anything you could not find, rather than editing the nearest match.

Work in the order given. Do not skip ahead.

Copy rules for everything you write or edit in this brief:

- No dashes of any kind. No hyphens, no en dashes, no em dashes in visitor facing copy. Rewrite the sentence instead.
- Match the calm, plain, specific tone already on the tool pages. Do not match the homepage sales tone, which is being deleted.
- Never claim a service the site does not perform. Never predict or imply a visa outcome.
- Keep sentences connected and flowing. No two word sentences, no staccato fragments.
- Banned words: unlock, seamless, dream trip, effortless, game changer.

### Step 1. Build the freshness source of truth first

This comes first because section 2 reads from it.

1.1 Create one data file or content collection entry that holds, for every data source the site relies on: source name, version or dataset identifier, date last checked, date last changed, and source URL.

1.2 Seed it from what already exists and is already correct: Regulation (EU) 2018/1806 with its consolidated version and last checked date, as the visa tool already states it; the Eurostat dataset behind the cost tool, which is `prc_ppp_ind`, indicator `PLI_EU27_2020`, restaurants and hotels, reference year 2024, with Liechtenstein excluded rather than estimated; and the count and most recent update date of the country guides, computed from the content collection rather than typed in.

1.3 Refactor the visa tool and the cost tool to read their provenance from this file instead of holding their own copies. Do not change what either tool displays or how it calculates. This is a source change only.

### Step 2. Resolve the identity conflict. This is the highest value item in the brief.

A visitor can currently find three statements on the site that contradict each other within two minutes. The About page and the Planners page are correct. The homepage is wrong, and the homepage is what changes.

2.1 Delete the entire `OUR PROCESS` and `What Working With Durian Travel Looks Like` block from the homepage, including its three numbered steps. Remove the component and its data if nothing else uses it. Remove the `#how-it-works` anchor target only after item 2.5 has repointed the hero link.

2.2 Delete the `WHAT OUR CLIENTS SAY` section entirely, including the carousel and its dots. All three testimonials go. Do not rewrite them, do not soften them, do not move them elsewhere. One of them describes catching an error in financial proof before submission, which is document review, which the footer on the same page says never happens.

2.3 Replace that slot with a section that proves what the site actually does. Label it `WHAT THE TOOLS ARE BUILT ON`. Three short items: the regulation behind the visa checker with its consolidated version and last checked date, the Eurostat dataset and reference year behind the cost comparison, and the number of country guides with the date of the most recent update. Every value reads from the file built in step 1. Nothing is hardcoded.

2.4 In the `THE PROBLEM WE SOLVE` section, keep the first two paragraphs as they are. Rewrite the third, which currently says Durian builds your trip and designs your itinerary, so that it describes publishing tools and guides the reader uses themselves. The rewritten paragraph must not contain "we build your trip", "we design", "your itinerary", or any first person promise to do work for the reader.

2.5 Rewrite the section headed `Every Kind of Traveler, One Shared Starting Point`. It currently contains "You want someone who has done this before, for people exactly like you, and can hand you a plan you can actually trust" and "We've built Europe trips for travelers planning from outside Europe". Both claim client work that does not exist. Keep the audience framing, which is good, and rewrite it so it describes who the guides and tools are written for.

2.6 The hero secondary link reads `See How It Works →` and points at `#how-it-works`, which is being deleted. Repoint it to `/tools/do-you-need-a-visa/` and change the label to match, for example `Start with your passport →`.

2.7 The button `See If We're Right For You →` points at `/about-us/`. Keep the destination and change the label to something like `What Durian Travel is, and is not →`, because the About page already carries exactly that section.

2.8 The homepage stat row reads `29 COUNTRY GUIDES`, `20 PLANNING GUIDES`, `3 FREE PLANNERS`, `0 APPLICATIONS WE SUBMIT FOR YOU`. The zero is rhetoric sitting in a row of counts and reads as a bug. Either move it out of the row and into the new `WHAT THE TOOLS ARE BUILT ON` block as a plain sentence, or relabel it so the zero is obviously deliberate. Confirm the first three numbers are computed from the actual content collections and convert any that are hardcoded.

2.9 Sweep every template, content file and component for: `we build`, `we design`, `our clients`, `client`, `we plan`, `itinerary for you`, `consultation`, `book your`, `we handle`, `done for you`, `let us`. Every hit either goes or is rewritten into publisher language. Report anything ambiguous in the Done section rather than guessing at it.

**Check before moving on.** No page claims Durian plans, designs, books, reviews, submits or advises for an individual reader. No testimonials anywhere. The homepage, the Planners page and the About page describe the same business when read one after the other. No broken internal anchors.

### Step 3. Fix the cost comparison defaults

The tool at `/tools/cost-per-country/` loads with tier `Mid-range`, nights `3` and daily budget `30` euro, while the mid tier band is stated on the same control as 140 to 240 per day. The first thing a new visitor sees is therefore "None of the 28 countries come in at or under €30 a day on this style of trip", which reads as "you cannot afford Europe". The heading also promises a week while the nights field defaults to three.

3.1 Change the nights default to 7 so it matches the copy that promises a week.

3.2 Leave the daily budget field empty by default, so no affordability line is drawn until the visitor enters a number. The page already describes the field as optional.

3.3 Rewrite the empty state message so that when nothing falls under the entered budget it says what would work instead of only reporting failure. Tell them which tier their number does fit, or how many days at that number would be possible in the cheapest country.

3.4 Reframe the section heading `Can you afford Europe?`. It poses a yes or no that the tool then answers with no. Frame it around what a week costs in each country.

3.5 Move the flights exclusion up. The line "Flights are not included, and they often decide the total" currently sits in the methodology note at the very bottom. For an audience defined by flying in from outside Europe it belongs directly under the ranking. Add a short line there. Do not add flight data and do not estimate fares.

**Check before moving on.** Loading the page cold produces an informative first result rather than a message that nothing is affordable. The nights default and the surrounding copy agree. The flights exclusion sits next to the numbers.

### Step 4. Fix the homepage chart on mobile

Observed at 400px wide on the homepage price level chart: country labels truncate to a single letter and an ellipsis, so the chart reads `B...`, `P...`, `G...` and is unreadable; the value labels 124.6 and 170.8 collide; the instruction says `Hover a country`, which does not exist on touch; and the floating chat bubble overlaps the chart. Tapping a bar does navigate to `/tools/cost-per-country/`, and nothing tells the visitor that.

4.1 Below a breakpoint, switch to a horizontal bar layout so full country names fit on the label axis, or rotate the labels, or reduce to the four or five countries that make the point. Truncating to one letter is not an acceptable fallback.

4.2 Stop the value labels overlapping. Stagger them, reduce the type size at that breakpoint, or place the values inside the bars.

4.3 Make the instruction responsive. Use hover wording on pointer devices and tap wording on touch, or write one instruction that works for both.

4.4 Give the chat launcher a safe area so it never sits on top of interactive content, or hide it while the chart is in the viewport on small screens.

**Check before moving on.** Every country name is fully readable at 360px, 390px and 414px. No two value labels overlap anywhere between 320px and 1440px. The interaction hint matches the input method.

### Step 5. Give the visa checker an exit

Selecting a passport at `/tools/do-you-need-a-visa/` returns a clear, well sourced answer and then the page ends. There is nothing after the answer except the sources explainer. This is the highest intent moment on the site and it currently goes nowhere.

5.1 Add a next steps block directly below the answer card, not in the footer area. It is conditional on which of the four answers was shown.

5.2 For the answer that a Schengen short stay visa is required, offer in this order: the Schengen document checklist guide that already exists in the blog, framed as what consulates commonly ask for and never as a guarantee; `/tools/cost-per-country/`, framed around finding out what the trip costs before booking anything; and the planning timeline guide that already exists, framed around when to apply, which matters because the FAQ already says applications can be lodged up to six months ahead and that appointment waits set the clock.

5.3 For the answer that no visa is required, point instead to the ETIAS explanation, the 90 in 180 rule, and the cost comparison.

5.4 Name the countries. The answer says Schengen area and never lists which states those are. Add a collapsible list to the answer card, or link to a page that holds it. A first time reader from outside Europe does not know that Switzerland is in and Ireland is not.

5.5 Do not add a consulate finder or an appointment checker. Those need maintained third party data the site does not have, and one wrong answer would destroy the credibility this tool has earned. Link to official sources instead.

**Check before moving on.** All four possible answers end with at least two relevant internal links. The Schengen country list is reachable from the answer in one click. Nothing added implies Durian can influence, speed up or guarantee an application.

### Step 6. Make the 5 euro report sellable

`/tools/cost-per-country/full-report/` currently asks for roughly fifty form controls before the `Pay €5 and get your report` button. There is no sample, no preview, no example output and no refund statement. The words sample, example and preview appear nowhere on the page.

Read the payment boundary in the "Do not" list below before touching this page.

6.1 Publish one fully worked static sample report at a fixed URL, for example `/tools/cost-per-country/sample/`. Use a realistic scenario, label it clearly as an example with fixed inputs, and show every section the real report produces so a buyer knows exactly what arrives. Link to it from three places: the full report page above the form, the upsell block on `/tools/cost-per-country/`, and the Planners page card.

6.2 Cut the form down and stage it. Reduce what is required before payment to the smallest set that still produces the report. Everything else becomes optional, prefilled with a sensible default, or is asked for after payment on the report page itself where the buyer is already committed. Candidates to make optional or move after payment: the four "what you actually do" dropdowns, the eSIM question, the between cities questions, and the flying from field, which the page itself already says is only used to describe the trip back to the reader. If the full set genuinely must stay, split it into clearly numbered steps with a progress indicator and put the pay button at the end of a short first step.

6.3 Add the commercial basics below the pay button, in plain language: what format the report is in, that it opens immediately on screen, whether it can be returned to later or should be saved or printed, and a refund position. The page already says the report opens as soon as payment goes through and that no account is needed, which is good, and it does not say what happens if the buyer closes the tab. Note that report access is tied to a Stripe session id valid for 24 hours, so describe what the buyer can actually do, and do not promise access that the current verification does not allow.

6.4 Move the paid block on `/tools/cost-per-country/` to below the free comparison results. It currently sits above them and opens with "The free comparison below prices your whole trip with one index, the one for restaurants and hotels. That is the wrong basket for most people", which tells the reader the free tool is wrong before they have used it. Rewrite the opening so the paid report reads as more detail rather than as a warning against the free view. Keep the honesty about which index is used, which is a strength, and state it as a limitation of the free view.

**Check before moving on.** The sample is reachable in one click from all three tool surfaces. The number of required inputs before payment is materially lower than fifty, and the exact count is reported in the Done section. Format, delivery and refund position sit near the pay button. The free comparison is no longer preceded by copy that undermines it.

### Step 7. Fix the chat assistant

The widget labelled `Durian Assistant / Answers from our published guides` was asked "I have a Philippines passport and 12 days in May. Where should I go and what will it cost me including flights from Manila?" and replied about route logic and doubling back across the continent, linking the multi country itinerary guide. It did not address the passport, the visa, the cost or Manila. Asked "Do Filipinos need a Schengen visa and how much money do I need to show?", it replied about building a budget in euros and linked the free budget calculator, and did not mention visas at all. In both cases it never linked `/tools/do-you-need-a-visa/`, which answers the first question definitively. Message timestamps also displayed as `02:39 AM` while local time for the visitor was mid morning, which means they render in UTC or server time.

7.1 Route visa intent to the visa tool. Any question containing visa, Schengen, passport, embassy, consulate, ETIAS or a nationality returns the visa checker link as the first thing in the response, with one line describing what it gives. This is the highest value routing on the site and it is missing.

7.2 Stop answering a different question than the one asked. When confidence in the match is low, say there is no published answer for that and offer the three tools plus the contact page. A visible non answer is better than a confident irrelevant one, and it protects the honesty the rest of the site is built on.

7.3 When a question names a nationality, an origin city, dates or a budget, acknowledge those specifics and say plainly what the site can and cannot tell them, then route. Never invent a fare, a cost or a visa outcome.

7.4 Render timestamps in the visitor's local timezone, or remove them entirely, which is the simpler fix for a widget where every message is from the current session.

7.5 The quick reply `Talk to a person` implies a human is available. Relabel it to something like `Email us` and point it at `/contact/`, which matches the contact page wording about a reply by email within a few working days.

**Check before moving on.** A visa question returns the visa tool link first, every time. An unmatched question produces an explicit non answer plus routing. No timestamp shows a time that is not the visitor's local time. No quick reply promises live human contact.

### Step 8. Freshness and trust without a byline

The author stays anonymous, which removes the strongest available trust signal, so the site compensates elsewhere. This also matters for how AI answer engines assess the site, since author identity is one of the signals they weigh. Homepage journal posts are also dated 6, 8 and 9 April 2026 and were read in September 2026, which for a site whose whole value is accuracy on rules and prices invites doubt.

8.1 Surface last reviewed dates on content, not just published dates, read from the file built in step 1. Every guide and destination page shows one. A post published in April and reviewed in September reads as maintained. A post that shows only April reads as abandoned.

8.2 Expand the Sources page, already linked in the footer, into a public dated update log of what was checked when and what changed. This is the anonymous author's substitute for a byline and it is more convincing than a photograph.

8.3 Add a methodology page explaining how figures are produced, which datasets are used, what is estimated versus what is sourced, and what the site deliberately does not do. Much of this text already exists scattered across the tool pages, so consolidate rather than rewrite. Link it from the tools and from the footer.

8.4 Keep the About page honest about the anonymity rather than glossing over it. The existing line "Behind the site is one person who has traveled widely inside Europe and writes as Durian Travel. There is no team of advisors and no agency" stays. Add one sentence saying the sources are published precisely so the reader does not have to take anyone's word for it, and link the new methodology page.

**Check before moving on.** Freshness data lives in one place and is read everywhere, never duplicated. Every guide shows a last reviewed date. The methodology page exists and is linked from the tools and the footer.

### Step 9. Smaller items

9.1 Both `/about/` and `/about-us/` resolve and serve the About page. Pick one canonical URL, 301 the other, and make every internal link and the canonical tag point at the chosen one.

9.2 The cost comparison offers euro, dollar, pound, peso and Brazilian real. For an audience defined as everyone outside Europe, add at least Indian rupee, UAE dirham, Indonesian rupiah, Malaysian ringgit and Nigerian naira. Confirm where the conversion rates come from, add that source to the file built in step 1, and show the rate date on the tool, consistent with the rest of the site's sourcing.

9.3 On `/destinations/` the country card images lazy load, so cards render as empty boxes for a moment when scrolling quickly. This was verified as normal lazy loading and not broken images, and all 29 load correctly. Add a low weight placeholder or a blurred thumbnail so cards never appear blank. Low priority.

9.4 The site is English only for an audience that is largely not native English speaking. No build task in this pass. Confirm in the Done section whether the current routing and content structure would support translated versions later without a rewrite.

---

## Why

A visitor who reads the homepage and then the About page is told two different things about what this business is, and one of the testimonials describes document review that the same page says never happens. That contradiction is worth more than every other fix here combined, because it costs the site the one asset it has, which is being believed. Everything after it follows the same line: the visa tool answers well and then abandons the reader, the cost tool opens by telling a first time visitor that nothing in Europe is affordable, the chart is unreadable on the phone most of the audience is holding, the chat sends visa questions to a budget calculator, and the 5 euro report asks for fifty answers before showing anything. The site is a publisher with good sources and it should read like one everywhere.

---

## Do not

- Do not add an author name, photo, byline or personal profile anywhere. The owner decided this and the anonymity grep on `dist/` still has to pass.
- Do not add flight prices, fare estimates or fare data of any kind. There is no fare source.
- Do not add a consulate appointment checker, a visa approval estimator, a readiness score, a risk analysis, a financial review, or anything that implies a prediction about an application.
- Do not touch the visa tool's answer logic or its sourcing, beyond reading provenance from the file built in step 1. It is the best thing on the site.
- Do not rewrite the testimonials with different names. They are deleted, not replaced.
- Do not add a services page, a pricing page for planning work, or an enquiry form for custom itineraries. Services were retired on 12 September 2026 and every old services URL 301s to `/tools/`.
- Do not add email capture popups, exit intent overlays or newsletter gates. Their absence is currently a strength.
- **Payments.** Step 6 touches the form, the copy and the layout on the report pages only. Do not change the Stripe hosted Payment Link URL or its success URL, the session verification logic in the Pages Function, the price, the currency, or any Cloudflare Secret. Do not add a checkout endpoint, a webhook handler or embedded Checkout.
- Do not change `public/_headers`, the Content Security Policy, or DNS. Anything in step 4 or step 6 that would need a new external script or an iframe is out of scope, so build it inline or report it instead.
- Do not generate any visa rule, fee or date from a model. Every one is read from the data files.
- Every piece of visa content keeps: "Educational information only. Not legal advice. Always check the official embassy or consulate source."
- Do not merge, rebase, edit or delete the branch `brief/015-new-posts`. The three posts drafted on it are Patricia's to read before they go live, and their `pubDate` is still wrong until the day they merge.
- Do not act on the "For Cowork" notes in the brief 015 Done section. They are recorded and will get their own brief.
- Do not delete files that are not named in this brief.

---

## Done

*Claude Code fills this in.*

**Completed on:** 19 September 2026
**Branch:** `brief/016-audit-fixes`, merged.

**Read this first.** Patricia gave Claude Code the same live audit directly on 18 September 2026 (`~/Downloads/durian-fix-brief.md`), and most of this brief shipped that day, before brief 016 was written. Those commits are `e67415d`, `e74ed17`, `adee8f3`, `03b0e66`, `5c4698e`, `dcbc438` and `2b74f6d` on main. This branch finished what was missing and brought the rest into line with the brief's wording. Each item below says which.

**What changed:**

- **Step 1, freshness.** `src/data/freshness.ts` holds, for every source, the name, version, last checked, last changed and URL. It was built on 18 September; this branch made it the only place pages read provenance from. It re-exports the provenance blocks of the visa, Eurostat and exchange rate data files, so nothing is copied. It also holds the ETIAS status, the Schengen member list, and the country guide count and latest change, computed from the content collection. The visa tool, cost comparison, report form, budget calculator, sources page and homepage all import it now; `grep "\._source" src/pages src/components` finds nothing outside the sample page. What the tools show and calculate is unchanged, except that the visa tool's ETIAS line now shows 17 September 2026, the date it was last checked. One accidental coupling was fixed: the visa tool's "last checked against EUR-Lex" line was reading the ETIAS date, and now reads the regulation's own (still 12 September 2026). The Eurostat record carries the dataset's own note that Liechtenstein is excluded rather than estimated.
- **Step 2, identity. Shipped 18 September.** Process section, all three testimonials and their carousel deleted. "What the tools are built on" block added. Problem and audience sections rewritten. Hero link now "Start with your passport →" to `/tools/do-you-need-a-visa/`. About button now "What Durian Travel is, and is not →". The zero moved out of the stat row into a sentence. The FAQ, destinations banner and Switzerland data were fixed in the same pass. **This branch:** the block's third item now reads "29 country guides, the most recent change made on 17 September 2026", from the collection, not the blog.
- **Step 2.9 sweep.** Seven hits in `src/`. Code or legal terms, left alone: two "client side" code comments, `getBoundingClientRect`, "attorney-client relationship" in the disclaimer. Correct as written: "We do not run consultations or review documents" on `/tools/`, and "Book your appointment" in the visa guide, which tells the reader to book their own. Ambiguous and rewritten: `sources.astro` "so we plan around EUR 20" now reads "so we treat EUR 20 as the fee".
- **Step 3, cost defaults. Shipped 18 September.** The source already defaulted to 7 nights and an empty budget; the "3 nights, €30" state in the audit came from values saved in that visitor's browser. The empty state now names the style and country that do fit. The heading is "What a week costs, country by country", and the flights line sits under the ranking.
- **Step 4, chart. Shipped 18 September; this branch changed the breakpoint.** Below 900px the chart turns on its side. It was 640px, but between 641 and 899px the upright chart still truncated "Netherlands" and "Switzerland". Checked at 320, 360, 390, 414, 641, 700, 768, 899, 900, 1024 and 1440: no clipped names, no overlapping values. The instruction no longer says hover. The chat button fades while the chart is on screen, on phones only.
- **Step 5, visa exit. Shipped 18 September.** Each of the four answers ends with three internal links plus the Schengen country list, which opens in one click. When a visa is needed: the document checklist (framed as what consulates commonly ask for), cost per country, and the timing guide. When none is needed: `/schengen-visa-guide/#ees-etias`, `#rule-90-180` and cost per country. Free movement: cost per country, the budget calculator and destinations. No consulate finder.
- **Step 6, the report. Shipped 18 September.** Sample at `/tools/cost-per-country/sample/`, generated by the same `buildReport()` the paid endpoint calls, linked from all three surfaces. **Before payment:** 28 country checkboxes, 13 trip questions (one of them is the fare, which renders two controls), the budget and its currency. Eight questions now sit behind an optional toggle: flying from, city moves, intercity mode, museums, tours, nightlife, shopping, eSIM. That is 21 questions down to 13. The paid block moved below the free comparison and was reworded. Refund line, Patricia's choice: it cannot be returned once generated. **This branch:** the delivery line now matches the 24 hour session. The paid session is held in that tab only, so it says the report can be generated again from the same tab for 24 hours after paying and cannot be reopened once the tab is closed. Stripe link, success URL, verification, price and payment currency: untouched.
- **Step 7, chat. Shipped 18 September.** Any question mentioning a visa, Schengen, a passport, an embassy, a consulate, ETIAS or a nationality gets the visa tool link first. Nationalities are read from the visa data plus demonyms; a bare country name still counts as a destination question. An unmatched question gets an explicit non-answer and the three planners plus the contact page. Specifics (nationality, dates, budget, flights) are named back, with "no fare data" stated. Timestamps removed. "Talk to a person" is now "Email us".
- **Step 8, trust. Shipped 18 September.** `/methodology/` exists, linked from the footer, `/tools/`, About Us and every country guide. `/sources/` carries a dated change log, which reads from `freshness.ts`. About Us has the sentence on published sources. **This branch:** the methodology link was added to the three tool pages themselves, and blog cards (homepage journal and blog index) show "Updated" beside the publish date when the post changed later. The April posts now show "Updated September 17, 2026".
- **Step 9. Shipped 18 September.** `/about/` is a real 301 to `/about-us/`; it was a 200 with a meta refresh. Destination cards got a tinted placeholder. Currencies convert at ECB reference rates, with the rate date shown and the ECB added to `freshness.ts`; rupee, rupiah and ringgit were added. **This branch:** the dirham and the naira come from the Central Bank of Nigeria's central rates of 18 September 2026, because the ECB publishes neither. The naira is converted directly against the euro. The dirham goes through the CBN's euro and dirham rates for the same day (4.2117 per euro, against 4.2164 from the dollar peg: 0.1% apart). The UAE central bank's site sits behind a bot check, which was not bypassed.

**Could not do, and why:**

- **8.1, "last reviewed" on every guide.** Country guides show the day their text last changed, stamped from git, not a review date, because nobody has re-read the 29 guides. Blog posts show "Updated" from `modDate`. A real review pass is needed before any page claims a review.
- **9.4, translations.** Routing would support them: Astro 4 has built in i18n routing, and posts and guides are content collections that could take a locale folder. What stops a quick translation is copy, not structure. The tool pages, chat answers and homepage hold their English strings inline in templates and scripts, so translating them means extracting strings first. That is a refactor, not a rewrite.

**For Cowork:**

- Brief 016 duplicated work Patricia had already had done directly. The change log on `/sources/` and main's history are the quickest way to see what is live before the next brief.
- Rates are a snapshot: ECB 17 September, CBN 18 September. Refresh `src/data/exchange-rates.json` when prices matter. Its `refreshHint` says how.
- `brief/015-new-posts` untouched. Still waiting for Patricia to read.
