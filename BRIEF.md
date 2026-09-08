# BRIEF

**Status: DONE**
**Written: 8 September 2026, by Cowork**
**Brief 004**

Promoted to the live work order by Cowork on 8 September 2026, after brief 003 was marked DONE. Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE.

This brief turns `/tools/cost-per-country/` into the paid planner. **It does not add Stripe.** Access is by a secret code only, so Patricia can test the whole thing before any payment code exists. Stripe is brief 005.

Full reasoning: `claude/paid-cost-per-country-spec.md` in the Claude project. Read it if a decision here seems arbitrary.

---

## What to do

### 1. Extend the data file to seven categories

`src/data/country-costs.json`. Today each country carries one `pli`. It needs eight figures.

All values below are Eurostat, dataset `prc_ppp_ind`, indicator `PLI_EU27_2020`, reference year 2024, EU27 average = 100, Eurostat last updated 2025-07-10, retrieved by Cowork from the Eurostat API on 8 September 2026. **Type them exactly. Do not fetch, do not round, do not recalculate.**

The `stay` column is identical to the existing `pli` value for every country. Keep `pli` as it is so nothing that reads it breaks, and add the new keys alongside.

| ISO | stay | food | drink | shopping | transport | comms | recreation | overall |
|---|---|---|---|---|---|---|---|---|
| AT | 110 | 110.5 | 90.4 | 105.7 | 118.2 | 111.9 | 118.3 | 119.7 |
| BE | 124.2 | 105.3 | 124.2 | 98.2 | 118.1 | 168.6 | 106.3 | 118.7 |
| BG | 53.2 | 88.8 | 69 | 79.1 | 57.2 | 82.8 | 68.2 | 56.9 |
| HR | 95.4 | 103.7 | 88.8 | 96.1 | 87 | 111 | 86.3 | 73.3 |
| CZ | 74.1 | 89 | 90.2 | 96.4 | 73.6 | 110.2 | 84.4 | 80.2 |
| DK | 147.6 | 120.2 | 122.4 | 132.7 | 159.9 | 108.7 | 136.7 | 142.8 |
| EE | 98.3 | 106.2 | 105 | 116.9 | 97.9 | 108.9 | 102.1 | 96.5 |
| FI | 126.8 | 109.8 | 175.4 | 120.7 | 141.2 | 110.4 | 124.2 | 127.2 |
| FR | 110 | 110.1 | 137.1 | 97.8 | 116.3 | 82.2 | 105.7 | 107.9 |
| DE | 112.1 | 102.7 | 99.6 | 101.2 | 118.7 | 136 | 107 | 109.1 |
| EL | 86.4 | 105.8 | 96.5 | 90.1 | 89.5 | 144.1 | 86.2 | 83 |
| HU | 71.8 | 94.8 | 85.7 | 86.6 | 61.6 | 97.3 | 72 | 68.3 |
| IS | 167.3 | 143.9 | 219.1 | 143.4 | 169.6 | 154.4 | 154.2 | 172.7 |
| IT | 106.9 | 101.7 | 87.7 | 106.9 | 84.8 | 85.7 | 93.9 | 98.1 |
| LV | 90.9 | 105.4 | 102.9 | 102.2 | 71.5 | 93.9 | 91.5 | 77.2 |
| LT | 86.1 | 101.2 | 97.1 | 106.5 | 77.4 | 98.5 | 82.1 | 78.2 |
| LU | 123.6 | 124.8 | 94 | 109.1 | 98.4 | 154.7 | 116.8 | 150.7 |
| MT | 88.7 | 112.2 | 99.2 | 101.5 | 89.8 | 106.7 | 94.5 | 93.1 |
| NL | 124.6 | 98.9 | 126.9 | 93 | 118.4 | 134.2 | 112.4 | 121 |
| NO | 140 | 131.2 | 205.3 | 117.6 | 161.6 | 178.7 | 138.5 | 134.1 |
| PL | 91.7 | 86.8 | 82.9 | 103.1 | 68.7 | 56.1 | 69.3 | 70.2 |
| PT | 75.5 | 101.5 | 94.2 | 93.5 | 80.6 | 115.6 | 85.9 | 85 |
| RO | 68.5 | 75.5 | 87.1 | 87.4 | 73.4 | 52.6 | 66.5 | 57.4 |
| SK | 91.3 | 83.4 | 83 | 97.2 | 91 | 111.4 | 81.7 | 81.1 |
| SI | 90.1 | 100 | 88.9 | 97.8 | 98.9 | 110 | 95.4 | 91 |
| ES | 83.9 | 95.2 | 86.3 | 90.9 | 81.5 | 94.6 | 94.2 | 90.7 |
| SE | 116.7 | 106.4 | 121.5 | 120.6 | 144.1 | 143.1 | 118 | 123 |
| CH | 170.8 | 158.5 | 140.3 | 138.7 | 151.7 | 186.1 | 160.6 | 184.3 |

Extend `_source` so each key names its Eurostat category. The mapping is:

- `stay` = `A0111`, restaurants and hotels
- `food` = `A0101`, food and non-alcoholic beverages
- `drink` = `A0102`, alcoholic beverages and tobacco
- `shopping` = `A0103`, clothing and footwear
- `transport` = `A010703`, transport services
- `comms` = `A0108`, communication
- `recreation` = `A0109`, recreation and culture
- `overall` = `A01`, actual individual consumption

Add a `retrieved` date of `2026-09-08` for the new keys. Keep the existing Liechtenstein note.

### 2. Stop the page calling itself free

`/tools/cost-per-country/` and anywhere that links to it. The free comparison stays free and keeps working. The label "free planner" is now wrong for the page as a whole, because the page gains a paid layer.

Wording to use for the free part: **"Free comparison"**. For the new part: **"Full report"**. Do not write a price anywhere. The price is not decided.

### 2b. Fix the free comparison, which currently rescales every country

**This is a real defect, found by Patricia on 8 September 2026. Fix it before anything else on this page.**

Today the tool computes `perDay = amount × (countryIndex ÷ referenceIndex)`, where `referenceIndex` comes from the "at prices like" dropdown, `#cpc-reference`. So choosing Belgium rescales the bars for Bulgaria, Romania, Hungary and every other country. The ranking never changes, only the scale, and a visitor reads it as the tool being broken.

Make these changes to the free layer.

1. **Delete the `#cpc-reference` dropdown and the label "at prices like".** The reference is now permanently the EU average, which is 100. The arithmetic becomes `perDay = base × countryIndex ÷ 100`. Picking a country can no longer change anything, because there is nothing to pick.

2. **Replace the free amount input with the three style buttons**, matching `/tools/budget/` exactly: Budget, Mid-range, Comfortable, using the same `typical` values that page already uses, 100, 190 and 320. That figure becomes `base`. Mid-range is selected by default so the page shows real bars on first load. Reuse the existing button styling from the budget tool rather than inventing a new control.

3. **Add one number input labelled "Your daily budget, per person"**, optional, empty by default. It does not scale anything. It draws a line across the comparison: every country whose `perDay` is at or below it is highlighted, every country above it is not. If it is empty, nothing is highlighted and the tool behaves as it does now.

4. **Keep the nights input.** It multiplies into the trip total exactly as it does today.

5. The summary sentence stays, and the ordering stays: cheapest first.

6. **Say where `base` comes from, on the page.** One line under the style buttons, exact wording:

   > Daily figures are our own estimate for a Western European trip, then scaled to each country using Eurostat's price level index for restaurants and hotels, reference year 2024, where the EU27 average is 100.

7. `localStorage` under `durian-cpc-v1` now stores the chosen style, the nights, the budget line and the currency. The old `reference` key is gone. **A saved state from the old version must not break the page.** Ignore any key you do not recognise and fall back to Mid-range.

**Why this is right and not a downgrade.** The Eurostat figure is a ratio, not a price, so euros on the bars have to come from somewhere. Anchoring them to the visitor's own number let them anchor to a country and rescale everything, which is the bug. Anchoring them to the editorial band is stable, it matches the budget calculator, and that band is already declared as Durian's own estimate on `/sources/`. The visitor's budget then has something to be compared against, which is what makes the highlight mean anything.

### 3. Build the question form

New section on `/tools/cost-per-country/`, below the existing free comparison, headed **"Get the full report"**.

Every question below. Each one changes a number, so do not drop any.

**Your trip**
- Which countries are you weighing up? Multi select from the 28. At least one required.
- How many nights in total? Number, minimum 1.
- Who is going? Solo, couple, family with children, group of friends.
- How many adults? How many children? Two numbers.
- The number you will not go over. Amount plus a currency label.

**Where you sleep**
- Where do you usually stay? Hotel, apartment or rental, hostel dorm, with friends or family.
- Is breakfast usually included? Yes, no.

**What you eat**
- How many meals a day do you eat out? 0, 1, 2, 3.
- Coffee, pastries, snacks out? Rarely, once a day, several a day.
- Drinks with dinner? No, sometimes, most nights.

**Getting around a city**
- How do you move around a city? Mostly walking, public transport, a mix with taxis, mostly taxis and ride hailing.
- Hiring a car anywhere? Yes, no.

**Between cities**
- How many times will you move city? Number.
- How do you travel between them? Train, coach, budget flight.

**What you actually do**
- Museums, galleries, monuments? Rarely, a few, most days.
- Guided tours or day trips? None, one or two, several.
- Going out at night? No, occasionally, often.
- Planning to shop? No, a little, a lot.

**Staying connected**
- Do you need an eSIM or data plan? Yes, no.

Then an access field labelled **"Access code"** and a submit button labelled **"Generate my report"**.

Save the answers to `localStorage` under `durian-cpc-report-v1` so a refresh does not lose them.

**Do not ask for a travel month or season.** There is no verified source for seasonality yet, so the question would change nothing in the output.

### 4. Turn the answers into weights, and the weights into a personal index

Put the calculation in `src/lib/report.ts`, next to what is already there.

1. The answers produce a weight for each of: accommodation, restaurant food, grocery food, drinks, city transport, intercity transport, recreation, shopping, communication. Weights sum to 1.
2. For each chosen country, the personal index is the sum of each weight multiplied by that country's index for the matching category.
3. Personal daily cost is the visitor's own daily figure multiplied by the personal index, divided by 100.
4. The report's headline comparison is the personal index against the plain `stay` index, per country. That difference is the entire reason somebody pays.

Choose the weight values yourself and **write them into a single named table at the top of the file with a comment saying they are Durian's editorial weighting, not a published statistic.** They are assumptions about behaviour, not measurements, and the report must say so.

Flights are not in the weighting. There is no free source for fares, so a flight figure stays whatever the visitor types.

### 5. Generate the report

Extend `buildReport` in `src/lib/report.ts`. HTML, returned by the existing `functions/api/report.ts`. No PDF library.

Sections in this order:

1. Cover. Their trip in one line: countries, nights, who is going, the date generated.
2. The verdict. Cheapest and dearest country for them, and how that ranking differs from the plain hotel index ranking.
3. Your basket. One row per component: the weight, the Eurostat category used, the index, and the source in the sentence.
4. Country by country. Per day, per trip, and the gap against their ceiling.
5. A ranked bar chart, personal index against plain index, so the difference is visible rather than asserted.
6. Where your money goes, for the country they lean towards.
7. What this does not cover: flights, season, the capital city premium, and that these are national averages rather than tourist district prices.
8. Sources, dated.
9. The disclaimer.

Build it to the `durian-deliverable-design` skill: Playfair at weight 400, navy for structure, terracotta spent once. Add a `@media print` block so the browser's own save as PDF produces a clean copy with no buttons and no dark mode.

### 6. The access code

`functions/api/report.ts`. `isPaidRequest` currently returns `false` to everybody. Change it to return true only when the request carries a code matching a Cloudflare environment variable.

- Read the expected value from `env`, name it `REPORT_ACCESS_CODE`.
- **Do not invent a code. Do not write any code value into the repo, into a comment, into a test, or into `.env`.** Patricia sets the value herself in the Cloudflare Pages dashboard.
- If `REPORT_ACCESS_CODE` is not set, refuse every request. Never fall open.
- Compare server side only. The code must never appear in any file that reaches `dist/`.
- Keep the 402 refusal body exactly as it is for a wrong or missing code.

This is deliberate and specific, so it does not trip the halt rule about touching payments.

### 7. Wire the form to the endpoint

The form posts the answers as JSON to `/api/report` and renders the returned HTML. On a 402, show a plain message that the code was not accepted. On any other failure, show that something went wrong and nothing was charged.

`connect-src` in `public/_headers` is `'self'`, and `/api/report` is same origin, so no header change is needed. **Do not touch `public/_headers`.**

## Why

Two things.

The free comparison has a defect that makes it look broken: choosing a reference country rescales all 28 bars. Item 2b removes the cause and gives the page a budget line that actually tells somebody something. The free comparison is the quick win people take away when they decide not to pay, so it has to stand on its own.

The paid layer exists because the free comparison applies the hotel index to every euro a visitor spends, and that is wrong for most people. Portugal is 24 percent below the EU average for hotels and restaurants and 1.5 percent above it for groceries, so somebody who cooks saves almost nothing there while somebody who eats out saves a quarter. Seven indices instead of one is the whole product, and the data is already free and official.

The access code exists so Patricia can test the finished thing without paying herself, and so brief 005 has something working to attach Stripe to.

## Do not

- Do not add Stripe, a price, a payment link, or any fulfilment code. That is brief 005.
- Do not write a price anywhere on the page.
- Do not invent, generate, commit or log an access code value.
- Do not fetch the Eurostat values. Type the table above.
- Do not change the existing `pli` key or remove any country.
- Do not degrade the free comparison. Item 2b changes how it is anchored and nothing else. The 28 country ranking, the bars, the ordering and the summary sentence all stay.
- Do not reintroduce a reference country dropdown in any form.
- Do not let the daily budget input scale the bars. It highlights, it does not multiply.
- Do not add a travel month or season question.
- Do not add a flight price benchmark. No free source exists.
- Do not touch `public/_headers`, the CSP, or DNS.
- Do not touch `/tools/budget/` or `/tools/visa-checklist/`.
- Do not add a PDF library or any new runtime dependency.
- Nothing in the report may score, rate, predict or imply a visa outcome.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, or the untracked `api/` folder.
- Every page and the report carry: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

---

## Done

**Completed on:** 9 September 2026
**Branch:** `brief/004-paid-cost-per-country`

**What changed:**

1. `src/data/country-costs.json`. Seven new keys per country alongside `pli`, typed from the
   table in this brief. Verified purely additive against the previous commit: no country removed,
   no `pli` value changed, no existing `_source` value changed. `stay` equals `pli` for all 28,
   asserted rather than assumed. Added `categories`, `categoriesMeaning` and
   `categoriesRetrieved` (2026-09-08) to `_source`.

2. The free comparison defect is fixed. The `#cpc-reference` dropdown and the "at prices like"
   label are gone, from the page and from `dist/`. Arithmetic is now `perDay = base x index / 100`
   with the reference fixed at the EU average. Three style buttons replace the amount input,
   reusing the markup, classes and 100/190/320 values from `/tools/budget/`, Mid-range preselected
   so the bars are populated on first load. The provenance line under them is the exact wording
   asked for, with the reference year read from the data file. The optional daily budget input
   highlights rows and changes no figure: confirmed by snapshotting all 28 rows before and after
   typing a budget, zero figures moved. Nights, the summary sentence and cheapest-first ordering
   are unchanged.

3. `durian-cpc-v1` now stores style, nights, budget and currency. Old saved states were tested:
   one carrying `amount` and `reference` falls back to Mid-range, keeps nights and currency, and
   drops the dead keys. Garbage and non-JSON states also fall back cleanly with all 28 bars drawn.

4. The question form is on the page under "Get the full report". All 20 questions, none dropped,
   no month or season question. Answers persist to `durian-cpc-report-v1`. The access code is
   deliberately not persisted.

5. `src/lib/report.ts` rewritten for the questionnaire. `EDITORIAL_WEIGHTS` is a single named
   table at the top, labelled as Durian's editorial weighting and not a statistic, in the comment
   and again in three places in the report itself. Nine components, weights normalised to 1,
   mapped onto seven Eurostat categories. Every one of the questions was verified to move at
   least one weight. Report sections are in the order specified, with a `@media print` block and
   a `.no-print` action bar.

6. `functions/api/report.ts`. `isPaidRequest` now reads `REPORT_ACCESS_CODE` from `env` and
   compares it, server side, against an `x-durian-access` header, using a constant time compare.
   No code value exists anywhere in the repo. Tested against the compiled handler: unset env,
   empty env, undefined env, missing header, wrong code and an off-by-one-character code all
   return 402 with the refusal body unchanged. Only the correct code returns 200.

7. The form posts to `/api/report` and renders the result. `frame-src` is `'none'`, so the report
   cannot go in an iframe and replaces the document instead. The answers are already saved, so the
   back button returns to a filled in form. 402, other failures and network errors were each
   tested and show the right message with the submit button re-enabled.

8. Stopped the page calling itself free: "Free comparison" and "Full report" labels, meta
   description, and the `offers` price of 0 removed from the page schema. Also corrected
   `/sources/`, which still described the old reference-country arithmetic, plus the wording on
   `/tools/`, `/faq/` and `/book-a-call/`.

Build passes, 76 pages. `grep -ri "azevedo" dist/` returns nothing. `REPORT_ACCESS_CODE` does not
appear in `dist/`.

**Could not do, and why:**

Nothing in the brief was skipped. Two notes rather than blockers:

- The endpoint could not be exercised through a real Worker *locally*. There is no wrangler in
  this repo and the brief forbids new dependencies, and `npm run dev` is Astro only, so it does
  not serve `functions/`. The handler was bundled with the esbuild already present and called
  directly with mock requests instead. Since deploying, the live endpoint has been confirmed:
  `/api/report` answers 405 to a GET and 402 to a POST with no code and to a POST with a wrong
  code, so Cloudflare's routing and the refusal paths are verified in production. The 200 path
  cannot be verified from here without the code.
- The `overall` key (A01) is stored as instructed but no weight uses it. Kept for later.

**For Cowork:**

- **The report cannot be generated until Patricia sets `REPORT_ACCESS_CODE` in the Cloudflare
  Pages dashboard**, on Production and, if she wants previews to work, on Preview. Until then the
  endpoint returns 402 to everybody, including her. This is the deliberate never-fall-open
  behaviour, not a fault. It is the one thing standing between her and seeing the report.
- The code goes in the `x-durian-access` header, set by the form. Nothing else needs changing.
- The weights live in `EDITORIAL_WEIGHTS` at the top of `src/lib/report.ts` and are the part worth
  arguing with. They are assumptions, and a different set gives a different personal index.
  Changing them needs no other edit.
- The ranking really does move: for a couple who cook, Poland comes out 8 places cheaper than the
  restaurants and hotels index alone suggests, because its communication index is 56.1 against a
  hotel index of 91.7. Malta and Greece move the other way. That is the argument for the product.
- Left alone deliberately: the homepage stat still reads "3 Free planners" and links to `/tools/`,
  not to this page. All three planners are still free to use, so it is not a false claim, but
  flagging it in case the wording should change when a price is set.
- `public/_headers`, `/tools/budget/` and `/tools/visa-checklist/` were not touched.
