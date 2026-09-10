# BRIEF

**Status: DONE**
**Written: 10 September 2026, by Cowork**
**Brief 007**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

Brief 006 shipped. Three changes to how the paid offer reads on `/tools/cost-per-country/`. **Still no Stripe.** The price is not decided, and item 2 is built so that setting it later is a one line change.

Everything here is `src/pages/tools/cost-per-country.astro`.

---

## What to do

### 1. The report toggle is always closed on landing

Brief 005 said to reopen the `<details>` when the visitor has answers saved in `durian-cpc-report-v1`. That was Cowork's idea, not Patricia's, and it is wrong: she lands on her own page with saved answers and gets a wall of questions.

- **Remove the auto open entirely.** The `<details>` is closed on every page load, for everybody, saved answers or not.
- Keep restoring the saved answers into the fields. They are just not visible until the visitor opens the disclosure.
- Keep it open after a report has been generated in that session.

### 2. Make the offer look like a button, and give it a price slot

The summary currently reads as a heading with a paragraph. It needs to read as something you click.

- Add a real call to action inside the `<summary>`, styled as a primary button using the existing `.btn` and `.btn--primary` classes from `src/styles/global.css`. Do not invent a new button style and do not edit `global.css`.
- Because it sits inside a `<summary>`, it must not be a `<button>` or an `<a>`. Nested interactive elements break the disclosure and the keyboard behaviour. Use a `<span>` carrying the button classes. The whole summary is already the click target.
- The label comes from a single constant at the top of the file:

```
// The price of the full report. Empty until Patricia decides it.
// Set it to a string like '€9' and the button label picks it up.
const REPORT_PRICE = '';
```

- When `REPORT_PRICE` is empty the label reads **"Get the full report"**. When it is set the label reads **"Get the full report for €9"**, using whatever string is in the constant.
- **Do not put a price anywhere else on the page.** One constant, one place.
- Give the summary a visible open and closed state, so it is obvious it expands. A rotating chevron or a plus turning into a minus is enough. Keep the native `<details>` behaviour underneath.

### 3. A question heading above the free comparison

The heading above the 28 rows is currently "Cheapest first", which tells a search engine and an AI assistant nothing about what the section answers.

- Change that `<h2>` to a question a person would actually type. Use: **"Can you afford Europe?"**
- Under it, one short line of context, something close to: "Pick how you travel and see what a week costs in all 28 countries, cheapest first."
- Keep "Cheapest first" as the small label on the list itself if it still helps, but it is no longer the heading.
- This stays an `<h2>`. Do not add a second `<h1>` and do not move the existing one.

**A boundary that matters here.** The heading asks about the cost of a trip and nothing else. Nothing in this section may connect that answer to a visa application, to whether a bank balance is sufficient, or to how an embassy would read it. Master strategy 5.4 is the line and this heading sits closer to it than the old one did.

## Why

The report is the thing this page sells and it currently reads as an optional footnote rather than an offer. A button that names the product, and later the price, is the difference.

The heading change is Patricia's call as an SEO strategist. Worth recording honestly: Cowork could not verify the search volume for that phrasing, because the Ahrefs plan refused both the overview and the matching terms queries on 10 September 2026. The reasoning for it is that a question heading matches how people and AI assistants phrase the problem, which is a judgement rather than a measurement.

## Do not

- Do not add Stripe, a payment link, or any fulfilment code.
- Do not set `REPORT_PRICE` to a value. Patricia sets it when she decides.
- Do not write a price, a currency amount or a "from" figure anywhere else on the page.
- Do not put a `<button>` or an `<a>` inside the `<summary>`.
- Do not replace the `<details>` with a JavaScript accordion.
- Do not change `isPaidRequest`, `functions/api/report.ts`, or `src/lib/report.ts`.
- Do not change any question, answer option, or weighting in the report form.
- Do not change what the free comparison computes, or touch `src/data/country-costs.json`.
- Do not edit `src/styles/tokens.css` or `src/styles/global.css`.
- Do not undo the selector scoping from brief 006. Any new script here stays scoped to this page's own root.
- Do not touch `public/_headers`, the CSP, or DNS.
- Do not touch `/tools/budget/` or `/tools/visa-checklist/`.
- Nothing on this page may score, rate, predict or imply a visa outcome, or comment on whether somebody's money is enough for an application.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- The page keeps: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

---

## Done

**Completed on:** 11 September 2026
**Branch:** `brief/007-offer-button-and-question-heading`

**What changed:**

1. **The disclosure is closed on every page load.** The auto open is gone. `restoreReport()` is
   back to only restoring: it no longer tracks whether anything was answered, because that
   bookkeeping existed solely to decide whether to open. Verified with saved answers present:
   the panel stays closed and the countries, party, stay type and ceiling are all still in the
   fields when it is opened by hand.

   The one exception is a report generated in the same tab. That is a `sessionStorage` flag,
   `durian-cpc-report-generated`, set only after a report has actually come back, not on a
   refused code and not on a failed request. Verified: a refused request leaves the flag unset,
   the flag reopens the panel on reload, and clearing it closes the panel again.

2. **The summary has a primary call to action.** A `<span class="btn btn--primary">`, not a
   `<button>` or an `<a>`, so nothing interactive is nested inside the `<summary>`. Styling is
   the existing `.btn` and `.btn--primary` from `global.css`, which was not edited. The card
   already had the rotating chevron from brief 005 for the open and closed state, so that is
   unchanged.

   The label comes from `REPORT_PRICE` at the top of the file, shipped empty, so it reads "Get
   the full report". I set it to a euro amount, rebuilt, and confirmed the label became "Get the
   full report for €9" and that the amount appeared exactly once in the built page, then set it
   back to empty. It is a one line change.

3. **The comparison heading is a question.** "Cheapest first" becomes "Can you afford Europe?",
   still an `<h2>`, with one line under it: "Pick how you travel and see what a week costs in all
   28 countries, cheapest first." The dynamic line that names the cheapest and dearest country
   still sits beside it. The page still has exactly one `<h1>` and it has not moved.

   On the boundary: I checked the whole comparison section for anything tying cost to a visa
   outcome. No occurrence of visa, embassy, consulate, approval, application, eligibility,
   sufficient funds, proof of funds or bank balance. The section is about what a trip costs and
   nothing else.

Brief 006 is intact: two columns of fourteen, cheapest first, scoped selectors, style buttons
reading `140–240/day`. No console errors, no sideways scroll, one column and no overflow at
375px. Page height at 1440 by 900 is 3087px against 2944px before, the difference being the
button and the new line of context.

**Could not do, and why:**

Nothing in the brief was skipped.

**For Cowork:**

- **The card now says "Get the full report" twice**, once as the `<h2>` from brief 005 and once
  on the new button. The brief specified the button label and said nothing about the heading, so
  I left the heading alone rather than rewrite copy that was not mine to touch. It looks like a
  mistake on the rendered page. It needs a different `<h2>`, something naming the product rather
  than repeating the action. Once `REPORT_PRICE` is set the two lines will at least differ.
- **I also removed the `#report-details` hash auto open.** The brief said closed on every page
  load for everybody, and brief 006 had already deleted the only link that pointed there, so it
  was dead code. Say the word if you want deep links to open it again.
- The old "Cheapest first" is not repeated as a separate label on the list, because the new line
  of context already ends with those words. Adding it again read as a stutter.
- On the search volume note in the brief: I did not attempt to verify it either. The heading
  ships as written.
- Untouched as instructed: `src/lib/report.ts`, `functions/`, `src/styles/`, `src/data/`,
  `public/`, `/tools/budget/`, `/tools/visa-checklist/`. No Stripe, no payment link, no price
  set, no new dependency.
