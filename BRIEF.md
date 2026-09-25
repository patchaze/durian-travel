# BRIEF

**Status: DONE**
**Written: 25 September 2026, by Cowork**
**Brief 019**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE.

**The site is taking real money.** Deployment `0f3e4332-3a35-4ebb-89af-8c0cc3ee9a4e` put the live Payment Link and the €5.99 price on production. This brief rebuilds the page that takes payment and the page that sends people to it. Nothing here may break the pay button or the return from Stripe. There is a check for that in item 4.

Everything below was decided by Patricia on 25 September 2026 after looking at both pages on the live site.

---

## What to do

### 1. Rebuild the planners page at `/tools/`

The page currently splits into a `Free` group of three planners and a `Paid` group holding the report, with the paid report last. The report is the thing the most work went into and the only thing that earns anything, and it sits at the bottom behind a label that tells people it costs money before it tells them what it does.

1.1 Drop the free versus paid framing entirely. No `Free` label, no `Paid` label, no grouping by price. Price belongs on the report's own card, where €5.99 already sits, not as a way of organising the page.

1.2 Put the full cost per country report first, above the three free planners. The three planners keep their current order below it.

1.3 Give every section a heading that carries a search term instead of a product name. The current H2s are `Do you need a visa?`, `Cost per country`, `Budget calculator` and `The full cost per country report`, which name the tools and target nothing.

**Working headings, in page order.** Use these unless Patricia has sent replacements, and treat them as copy rather than as instructions to pad with keywords:

- H1: `How much a trip to Europe costs, before you book anything`
- H2: `The full cost per country report`, with the €5.99 card
- H2: `Do you need a Schengen visa for your passport?`
- H2: `Cheapest countries in Europe to visit, compared`
- H2: `Work out your Europe trip budget`
- H2: `Where these figures come from`, holding the existing sources and methodology line

**Say this plainly in Done.** These terms were not checked against search volume. Cowork tried Ahrefs and the account returned "Insufficient plan" for both Keywords Explorer and Site Explorer on 25 September 2026, so no volume, difficulty or traffic data was available and none was invented. The terms above come from the keywords the repository already declares on `cost-per-country.astro` and from the page's own copy. Patricia is an SEO strategist and may replace any of them.

1.4 Update the page title and meta description to match the new H1. Title under 60 characters, meta description under 155, as the project defaults require.

1.5 Keep the line that says Durian does not run consultations or review documents, and keep the disclaimer. Neither is negotiable.

### 2. Remove the sample report links

2.1 Remove `See a sample first →` from the report card on `/tools/`.

2.2 Remove the `See a full sample report first →` block, and its `Same sections, one worked example, nothing to pay` line, from `/tools/cost-per-country/full-report/`.

2.3 Remove the same link from `/tools/cost-per-country/` if it is still there.

2.4 **Do not delete the sample page.** `/tools/cost-per-country/sample/` stays live and stays in the build. Report in Done whether anything still links to it, because if nothing does it is now an orphan page and Patricia will want to decide what happens to it.

### 3. The report form asks every question

Patricia's position, stated on 25 September 2026: the eight questions behind the optional toggle are not optional detail, they are part of the answer, and the report should ask a few more. This reverses the reduction made in brief 016, deliberately.

3.1 Remove the optional toggle. Every existing question is shown in the normal flow, in its current group order, and every one is answered before the pay button.

3.2 Remove the `optional: true` flag from all eight fields: `flyingFrom`, `cityMoves`, `intercityMode`, `museums`, `tours`, `nightlife`, `shopping`, `esim`. Keep their defaults in `normalise()` as a fallback, so answers saved by an earlier visitor still produce a whole report.

3.3 Validate before payment. An unanswered required question blocks the pay button and says which question is missing, in the same plain voice the page already uses. It must never let somebody pay and then discover the form was incomplete.

3.4 Add three new questions. Each one must change a number in the report. If any of them cannot, **stop, do not add that one, and say why in Done** rather than shipping a question that does nothing. The file's own comment says none of these questions is decorative and that stays true.

- **How many rooms do you need.** Goes in `Where you sleep`. A number, minimum 1. Today the form collects adults, children and party type but never how the party splits into rooms, and the stay cost is the largest line in the report for a family or a group. It moves the `stay` category, which is `A0111, restaurants and hotels` in `country-costs.json`.
- **How often do you cook or eat from a shop.** Goes in `What you eat`. It shifts spend between `A0111` and `A0101, food and non-alcoholic beverages`, both of which are already in the dataset, so it needs no new source.
- **Insurance and airport transfers.** Goes in `Getting there`, beside the fare. Two of the buyer's own numbers, handled exactly as the fare is: added to the total when given, never looked up, never estimated, and stated in the report as their own figure. Durian has no data for either and must not imply that it does.

3.5 Report in Done how each new question changes the arithmetic, in one sentence each, so Patricia can check the logic without reading the code.

### 4. Fix the form layout, at the cause

Observed on the live page at desktop width on 25 September 2026: labels sit flush against their inputs with no gap, so it reads `How many nights in total?7` and `How many adults?2`. The dropdowns are unstyled native controls. The `Getting there` group is the worst of it: the fare input, the `I do not know yet` checkbox and the sentence that follows all run into each other on one line. The country checkboxes directly above are properly styled cards, so something is applying to one part of this form and not the rest.

4.1 Find out why before changing anything. This looks like a rule that is not reaching the field rows rather than a shortage of padding. Fix the cause and say in Done what it was. Do not paste margins on top of a broken rule.

4.2 Every field row ends up the same shape: the label on its own line above its control, one consistent gap between label and control, the hint below the control rather than beside it, and enough space between one field and the next that they read as separate questions.

4.3 The `Getting there` group specifically: the fare field, the `I do not know yet` checkbox and the explanatory sentence each sit on their own line.

4.4 Style the selects to match the rest of the form instead of leaving them as browser defaults.

4.5 Check the whole form in Chrome at 360, 390, 414, 768, 1024 and 1440 pixels wide. On a phone every control is full width and nothing sits side by side that has to be read as a pair. List in Done the widths you checked.

4.6 **The payment path still works when you are done.** Confirm, and say so in Done: the pay button still opens the live Payment Link, a return from Stripe carrying `session_id` still generates the report, and the access code path still works. If any of the three breaks, fix it before merging or hold the branch.

### 5. Report back, do not act

5.1 What caused the layout problem, in one sentence.

5.2 How many questions a buyer now answers before the pay button.

5.3 Whether anything still links to the sample page.

5.4 Anything in the new page order that broke an internal link or an anchor.

---

## Why

Two pages carry every sale this site will make. The planners page buries the report it is meant to sell at the bottom of the page, under a label announcing the price before the value, and organises itself around Durian's billing rather than around what somebody came to find out. The report page then asks for money through a form whose labels are glued to their inputs and whose dropdowns look unstyled, which reads as unfinished at exactly the moment somebody is deciding whether to trust it with a card. Neither is a content problem. Both are the last thing a buyer sees before they decide.

---

## Do not

- Do not touch `functions/api/report.ts`, the payment verification, the Payment Link, the price, `REPORT_PRICE`, or anything in Stripe.
- Do not change how the page reads `session_id`, stores it for the tab, or sends it as `x-durian-session`.
- Do not delete `/tools/cost-per-country/sample/`. It stays live and stays built.
- Do not add a question that changes nothing in the report, and do not invent a source, a price, a rate or a seasonality figure to make a new question work.
- Do not touch the Eurostat data, the freshness file or any provenance line.
- Do not reintroduce the free versus paid grouping in another form, such as a price filter or two columns split by cost.
- Do not pad headings with repeated keywords. One term per heading, in a sentence a person would actually say.
- Do not state or imply a search volume, a ranking or a difficulty figure anywhere. None was available.
- Do not change `public/_headers`, the Content Security Policy, `vercel.json` or DNS.
- Do not merge, rebase, edit or delete the branch `brief/015-new-posts`.
- Do not delete files that are not named in this brief.

---

## Done

*Claude Code fills this in.*

**Completed on:** 25 September 2026.
**Branch:** `brief/019-planners-and-form`.
**Merged, with the deployment id and time:** merged to `main` as `f9e944b` and deployed by Cloudflare Pages as deployment `2924793d-5595-4b17-aa2f-72c827f1d338`, which finished at 14:38 UTC on 25 September 2026.

**What changed:**

1. **`/tools/` rebuilt.** No Free or Paid labels and no grouping by price: the report comes first with €5.99 on its own card, then the visa check, the comparison and the budget calculator in their existing order, then a closing section for the sources. Headings as the brief set them, H1 included. Title "How Much a Trip to Europe Costs | DURIAN Travel" (48 characters) and a meta description of 154. The line about no consultations and no document review stays in the hero, and the disclaimer stays at the foot. **The terms were not checked against search volume.** Cowork's Ahrefs account returned "Insufficient plan" on 25 September 2026, so none was available and none is implied anywhere.
   - The hover and tap reveals that brief 014 put on the cards went with the card grouping. Each tool is now a section with a heading, one line, its detail and its link, all visible, which is why there is nothing left to reveal.
2. **Sample links removed** from the report card on `/tools/`, from the report page, and from the offer block on `/tools/cost-per-country/`. `/tools/cost-per-country/sample/` is untouched and still built.
3. **Every question is asked.** The optional toggle is gone and the `optional` flag is gone from the data file, so all 25 questions sit in the normal flow in their group order. Their defaults stay in `normalise()`, so answers saved before this change still produce a whole report. Three new questions, all of which move a number, verified by running the generator directly against the real data:
   - **How many rooms do you need**, in Where you sleep. The nightly cost is scaled by rooms over heads, so a room is charged once however many people are in it. A couple in Portugal, mid-range: €158.09 each per day at one room a head, €135.09 sharing a single room, with the accommodation line falling from €45.99 to €23.00. Left unanswered it falls back to one room a head, which is exactly what every earlier report assumed.
   - **How often do you cook or eat from a shop**, in What you eat. It moves points between eating out and food from shops, which are priced on two different Eurostat categories, so the same trip prices differently country by country. Same couple in Portugal: eating out €25.19 and groceries €10.30 at Sometimes, against €14.35 and €23.74 at Mostly, and the daily total moves with them.
   - **Insurance and airport transfers**, in Getting there, beside the fare. Both are the buyer's own figures, per person, added to every total exactly as the fare is and never looked up. €60 and €40 per person raised a two person total from €5,694 to €5,894, the €200 those answers add and nothing else. The report names them as the reader's own numbers in the cover and again in the limits section.
4. **Layout fixed at the cause.** The cause: when brief 016 moved the fields into `ReportField.astro`, every style for them stayed in the page, and Astro scopes a page's CSS to that page's own elements. None of those rules could match a component's markup any more, so labels, inputs, selects and hints all fell back to browser defaults, which is why the label sat against the input and the selects looked unstyled. The country checkboxes still looked right because they never left the page. The field styles now live in `ReportField.astro` with the markup they style, and the page keeps only what the page itself renders, which is the ceiling row, the country cards and the blocks. Every row is now label, control, hint, each on its own line, with an 8 pixel label gap and a consistent gap between questions. The selects carry the form's own border, padding and arrow. In Getting there the fare input, the "I do not know yet" checkbox and the sentence below each sit on their own line.
   - **Widths checked:** 360, 390, 414, 768, 1024 and 1440. One question per row and full width controls up to 720, two columns above it, no horizontal overflow at any width.
5. **Validation before payment.** Submitting with a question unanswered stops the submission, names the question ("Answer "Where are you flying from?" before you pay."), outlines the field, scrolls to it and focuses it. Picking no country is caught the same way. The ceiling is the one field left optional, as the page already says.

**The three payment path checks from 4.6:**

- **The pay button still opens the live Payment Link.** The form carries `data-payment-link="https://buy.stripe.com/8x23cu35Va9xgGV9937wA00"` and the submit handler still ends in `window.location.assign(PAYMENT_LINK)`, now behind the new validation.
- **A return from Stripe still generates the report.** Loading the page with `?session_id=...` still takes the id, keeps it in `sessionStorage` for that tab, strips it from the address bar, and changes the button to "Generate my report". Pressing it posts to `/api/report` with the `x-durian-session` header and a body carrying the answers, the four new ones included. Verified by intercepting the request in the browser rather than by paying.
- **The access code path still works.** "Generate with this code" posts to `/api/report` with the `x-durian-access` header.
- Not verified here, because it needs a card and a real charge: that Stripe accepts a payment and the Function releases the report end to end. That is Patricia's test, and brief 017 and 018 both set it out.

**Could not do, and why:**

- Nothing in the brief was skipped. All three new questions changed a number, so none had to be dropped under 3.4.

**For Cowork:**

- **5.1 The cause, in one sentence.** Moving the fields into a component in brief 016 left their styles behind in the page, where Astro's scoping stopped them matching anything.
- **5.2 How many questions a buyer answers before the pay button.** 25 questions in nine groups, plus the country picker and the optional ceiling. It was 13 with 8 behind a toggle.
- **5.3 Does anything still link to the sample page.** No. `/tools/cost-per-country/sample/` is live and built, and after item 2 nothing anywhere on the site links to it, so it is reachable only by typing the address or from search. It is an orphan and it is Patricia's decision what happens to it.
- **5.4 Broken links or anchors.** None. Every in page anchor resolves and no internal link 404s. Nothing linked to the old card anchors on `/tools/`.
- The headings are Patricia's to replace. They were taken from the keywords the repository already declares and from the page's own copy, with no volume data behind them.
- `brief/015-new-posts` untouched.
