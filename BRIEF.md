# BRIEF

**Status: DONE**
**Written: 8 September 2026, by Cowork**
**Brief 005**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

Brief 004 shipped and works. Patricia has generated a real report with the access code. This brief fixes two things she found: the report renders dark, and the paid layer is buried too far down the page. **No Stripe. That is brief 006.**

---

## What to do

### 1. The report must be light, always

`src/lib/report.ts`. The report currently ships a dark palette at line 645, `@media (prefers-color-scheme: dark)`, and again at line 663, `:root[data-theme="dark"]`. Anybody whose machine is set to dark mode gets a dark navy report. Patricia did, and did not expect it.

The dark set was correct guidance for a Claude artifact, which renders in the viewer's theme. **It is wrong here.** This report is a page on duriantravel.com, and that site is light only. A customer's paid deliverable should not change colour depending on their operating system.

- **Delete both dark blocks.** The report is light in every context.
- Keep the `@media print` block exactly as it is.
- Do not add `data-theme` handling of any kind.

### 2. Make the report look like the site

Patricia's words: follow the layout of the site, dark blue header, white background, terracotta accents. Right now the whole page carries the navy.

- **A navy header band across the top**, `--color-primary` `#1B3A5C`, with the DURIAN Travel wordmark in white, matching `src/components/Header.astro`. Playfair for "DURIAN", the same stacked wordmark treatment the site header uses. No navigation links, this is a document.
- **Everything below the band sits on white.** `#FFFFFF` ground, `#1A1A2E` body text.
- **Terracotta `#C44B36` is the accent and appears sparingly**: the rule under the wordmark, the section eyebrows, and the personal index bars in the chart. Navy carries structure, headings and table rules.
- The chart currently uses navy for the personal bar and border grey for the plain bar. Switch the personal bar to terracotta so the number that matters is the one that stands out, and leave the plain bar grey.
- Headings stay Playfair at weight 400, per the `durian-deliverable-design` skill.

### 3. Collapse the question form so the page stops being a scroll

`src/pages/tools/cost-per-country.astro`. The 28 country rows sit between the controls and "Get the full report", so the paid layer is a long way down. The report is the point of the page and most visitors never see it.

- Wrap the whole `#report-form` in a native `<details>` element. Use `<details>` and `<summary>`, not a JavaScript accordion, so it still opens with JavaScript off and stays keyboard accessible for free.
- **Closed by default.** The `<summary>` is the visible invitation: the "Full report" eyebrow, the "Get the full report" heading, and the first intro paragraph only. Style the summary as a card so it reads as a button rather than a bare disclosure triangle.
- The second intro paragraph, every question, the access code block and the generate button all live inside, hidden until opened.
- If a visitor has answers saved in `durian-cpc-report-v1`, open the `<details>` on load so they are not hunting for what they typed.
- Once a report has been generated, keep it open.

### 4. Put the offer above the comparison as well

One compact line between the style buttons and the 28 country rows, linking down to the report section. Something close to:

> This comparison uses one Eurostat category. The full report weights seven, for the way you actually travel.

Make it a link to the `<details>`, and open the element when it is followed. One line, no card, no image, no repetition of the longer intro further down.

## Why

Two visitor problems, both found by Patricia on the live site.

A paid deliverable that turns dark because of an operating system setting looks broken rather than designed, and it is the first thing a customer sees after paying.

The report is what this page exists to sell, and it currently sits below 28 rows of free comparison. The free comparison is the quick win people take away, so it stays exactly as it is, but the offer has to be visible before it.

## Do not

- Do not add Stripe, a price, a payment link, or any fulfilment code. That is brief 006.
- Do not change `isPaidRequest` or anything else in `functions/api/report.ts`. The access code works and is verified live.
- Do not change the report's content, sections, arithmetic, weights or wording. This brief is appearance and page structure only.
- Do not change the seven Eurostat categories or any figure in `src/data/country-costs.json`.
- Do not degrade the free comparison. The 28 rows, the ordering, the style buttons and the budget line all stay.
- Do not use a JavaScript accordion where `<details>` will do.
- Do not add a dark palette back to the report in any form.
- Do not touch `public/_headers`, the CSP, or DNS.
- Do not touch `/tools/budget/` or `/tools/visa-checklist/`.
- Do not add a PDF library or any new runtime dependency.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- Every page and the report carry: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

---

## Done

**Completed on:** 9 September 2026
**Branch:** `brief/005-light-report-and-collapsed-form`

**What changed:**

1. **The report is light everywhere.** Both dark blocks are deleted from
   `src/lib/report.ts`: the `@media (prefers-color-scheme: dark)` block and the
   `:root[data-theme="dark"]` block. Verified in a browser reporting dark mode: body stays
   `#FFFFFF`, text stays `#1A1A2E`. The `@media print` block is untouched, so it still
   contains one `data-theme="dark"` selector that can no longer match anything. No
   `data-theme` handling was added.

2. **The report looks like the site.** A navy `#1B3A5C` masthead runs across the top with the
   stacked DURIAN Travel wordmark and the circle D, all in white, and a 3px terracotta rule
   under it. No navigation links. Everything below sits on white. The page padding moved off
   `body` onto `.wrap` so the band can be full width; the reading column is still 780px.
   Headings are still Playfair at weight 400.

3. **Terracotta is the accent.** The chart's personal index bar and its key swatch moved from
   navy to terracotta `#C44B36`; the plain bar stays grey. Navy still carries headings, table
   rules and the verdict box.

4. **The question form is collapsed.** `#report-form` now sits inside a native `<details>`,
   closed by default, no JavaScript accordion. The `<summary>` holds the "Full report"
   eyebrow, the "Get the full report" heading and the first intro paragraph only, styled as a
   card with a chevron instead of a disclosure triangle. The second paragraph, all questions,
   the access code and the generate button are inside. The page is 4514px closed against
   7092px open at 1100px wide, so the collapse removes about a third of it.

5. **It opens when it should.** On load if there are real saved answers in
   `durian-cpc-report-v1`, on a click of the new offer line, on a `#report-details` link, and
   when a report is generated. All four verified in the browser.

6. **The offer sits above the comparison too.** One line between the controls and the 28
   country rows, linking to `#report-details` and opening it: "This comparison uses one
   Eurostat category. The full report weights seven, for the way you actually travel."

The free comparison is untouched: 28 rows, ordering, three style buttons and the budget line
all still there. Both the page and the report still carry the educational information notice.

**Could not do, and why:**

Nothing in the brief was skipped.

**For Cowork:**

- **The printed report still has a navy personal bar.** The brief said to keep the
  `@media print` block exactly as it is, and that block hard codes
  `.chart__fill { background: #1B3A5C !important; }`. So on screen the bar that matters is
  terracotta and on paper it is navy. The report's only button is "Print or save as PDF", so
  this is worth a decision. One line fixes it whenever you want it fixed.
- The masthead is white on navy rather than the site's terracotta circle D, because the brief
  asked for the wordmark in white and listed the three places terracotta should appear. Easy
  to switch the D back to terracotta if you would rather it matched the site header exactly.
- **A real bug was found and fixed while testing.** `saveReport()` also runs when the currency
  dropdown above the comparison changes, so "something is in localStorage" was not evidence
  that anybody had answered anything, and the panel would have opened for visitors who only
  used the free comparison. It now opens only when a saved answer differs from the control's
  own default. None of the selects mark an option as `selected`, so the untouched value is the
  first option, not the empty string; the first version of this check got that wrong and was
  corrected.
- Unrelated to this brief: the three style buttons render as "0-0/day" in some browsers even
  though the served HTML says "70-130/day". It reproduces identically on the live site today,
  so it predates this work and is client side, not a build problem. Flagging it in case
  Patricia sees it and thinks brief 005 caused it.
- Untouched as instructed: `functions/api/report.ts`, `public/_headers`, the Eurostat data,
  `/tools/budget/`, `/tools/visa-checklist/`. No Stripe, no price, no new dependency.
