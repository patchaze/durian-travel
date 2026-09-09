# BRIEF

**Status: DONE**
**Written: 9 September 2026, by Cowork**
**Brief 006**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

Brief 005 shipped. The report is light and the form collapses, both correct. Patricia looked at the live page and the page is still too tall, and the paid offer is still below the free comparison rather than above it. This brief is layout only. **Still no Stripe.**

Everything here is `src/pages/tools/cost-per-country.astro`. Do not touch `src/lib/report.ts` or `functions/api/report.ts`.

---

## What to do

### 1. Put the full report first

New section order, top to bottom:

1. **The page title block.** Keep the existing `<h1>` where it is in the reading order, at the very top. It stays the page's only `<h1>` and it must stay first, because moving it below other content weakens the page for search and for AI assistants. Keep the first `tool-intro` paragraph. **Delete the second one**, the "Pick how you travel and the comparison prices the same standard of trip" paragraph. It describes the free comparison and it now sits too far from it. Change the `section-label` above the h1 from "Free comparison" to something that covers the whole page, since the page is no longer only the free layer.
2. **The full report block.** The `<details>` exactly as it is today, moved up to here. Same summary, same paragraph, same questions inside, still closed by default, still reopening when saved answers exist.
3. **The scroll cue.** One line, quiet, sending people down to the free layer. Suggested, adjust to fit: "Not ready to answer twenty questions? The free comparison below ranks all 28 countries in one click." Make it a link to the comparison. No card, no button, no image.
4. **The free comparison.** The controls and the 28 rows, unchanged in substance.
5. **The notes section**, unchanged.

The line added in brief 005 above the comparison, "This comparison uses one Eurostat category. The full report weights seven", now points backwards up the page. **Delete it.** The scroll cue in item 3 replaces it.

### 2. Two columns for the 28 countries

Patricia wants the comparison to stop eating the page.

- Above 900px, lay the rows out in **two columns**, reading top to bottom down the first column and then the second. Below that, one column as now.
- **The sort currently uses CSS `order`, which cannot work with a multi column layout.** Change it: reorder the actual DOM nodes into the sorted sequence with `appendChild`, then drop the `order` assignments. The visible ordering must stay exactly what it is today, cheapest first.
- Keep every row's content: name, index, bar, per day and per trip figures, and the highlight when a row is inside the budget line.
- Make the rows shorter. The bar and the figures can sit on one line at this width rather than stacking.

### 3. The style buttons read "0–0/day", and the cause is a script from another page

**Diagnosed by Cowork on 9 September 2026, reproduced on the live site. Do not spend time rediscovering it.**

The server sends the correct HTML. A fresh fetch of `/tools/cost-per-country/` contains `70–130/day`, `140–240/day` and `260–380+/day`. By the time the page has rendered, all three read `0–0/day`.

`src/pages/tools/budget.astro` around lines 606 to 612 does this:

```
const low = parseFloat(btn.dataset.low ?? '0');
const high = parseFloat(btn.dataset.high ?? '0');
...
const range = btn.querySelector('.style-btn__range');
```

It selects `.style-btn` across the whole document. Astro bundles page scripts together, so that script also runs on `/tools/cost-per-country/`, where the style buttons carry `data-typical` but no `data-low` or `data-high`. Both `parseFloat` calls fall back to `0`, and the budget script overwrites the cost per country labels with `0–0/day`.

The fix:

- **Scope the budget script to its own page.** Query inside `#budget-form`, or return early when that element is absent. Do not add `data-low` and `data-high` to the cost per country buttons to paper over it, because the two pages scale their ranges differently and that would put the budget page's country scaling on the wrong tool.
- **Then check the rest of both tool scripts for the same class of bug.** Any `document.querySelector` or `document.querySelectorAll` in a page script that could match an element on another tool page is the same defect waiting to happen. `.style-btn`, `.money`, `.item`, `.cpc-row` and `.buffer-btn` are the ones to look at. Scope each one to its own page root.
- Verify in a browser on all three tool pages, not just this one. The label must read `140–240/day` on the cost per country page with Mid-range selected, and the budget page's own scaled ranges must still work.

### 4. Tighten the spacing everywhere on this page

Five stacked `section section--sm` blocks is what is making the page long.

- Collapse the five sections into fewer. The title block, the report block and the scroll cue belong to one section, not three.
- Reduce the vertical padding between blocks, and reduce the internal padding on the cards, `--space-5` and `--space-8` are doing too much work here.
- Reduce the gap under headings and between form fields inside the disclosure.

**The target, and it is testable:** on a 1440 by 900 laptop the `<h1>`, the first paragraph and the whole "Get the full report" summary card must all be visible without scrolling. The finished page should be meaningfully shorter than it is now, not trimmed by a few pixels. Check it in the browser before you commit, do not assume.

Use the existing spacing tokens. Do not invent new ones and do not edit `src/styles/tokens.css`, which every other page reads.

## Why

The report is what this page sells and it was still below 28 rows of free comparison, so most visitors never reached it. The free comparison is the thing people take away when they decide not to buy, so it stays complete and free, just below the offer instead of in front of it.

The height is the same problem in another form. A page that takes four screens to read buries whichever part comes last.

## Do not

- Do not add Stripe, a price, or a payment link. The price is not decided.
- Do not change `isPaidRequest`, `functions/api/report.ts`, or `src/lib/report.ts`. The report and the access code both work and are verified live.
- Do not change the report's appearance. Brief 005 settled that.
- Do not change any question, any answer option, or the weighting.
- Do not remove a country, change a figure, or touch `src/data/country-costs.json`.
- Do not change what the free comparison computes. This is layout only.
- Do not move the `<h1>` below other content, and do not add a second `<h1>`.
- Do not replace the `<details>` with a JavaScript accordion.
- Do not edit `src/styles/tokens.css` or `src/styles/global.css`. Other pages depend on both.
- Do not touch `public/_headers`, the CSP, or DNS.
- Item 3 is the only reason to open `src/pages/tools/budget.astro`, and the only change allowed there is scoping its selectors. Do not change what that page computes, shows or stores. Do not touch `/tools/visa-checklist/` beyond the same selector check.
- Do not fix item 3 by adding `data-low` or `data-high` to the cost per country buttons.
- Do not add a library or any new runtime dependency.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- The page keeps: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

---

## Done

**Completed on:** 9 September 2026
**Branch:** `brief/006-report-first-layout`

**What changed:**

1. **The report is first.** Order is now: title block, the `<details>`, the scroll cue, the free
   comparison, the notes. The `<h1>` is still first in the reading order and is still the only
   one. The second `tool-intro` paragraph is deleted. The eyebrow above the `<h1>` reads "Cost
   per country" instead of "Free comparison". The brief 005 offer line above the comparison is
   deleted and the scroll cue replaces it, linking down to `#cpc-compare` on the comparison
   section.

2. **Two columns above 900px.** `.cpc-list` becomes `column-count: 2`, so the first column fills
   top to bottom before the second starts, which is the sorted order. Below 900px it is one
   column exactly as before. The sort no longer sets `row.style.order`; it moves the DOM nodes
   through a document fragment instead. Verified across repeated style, nights, currency and
   budget changes: always 28 rows, no duplicates, always cheapest first, budget highlighting
   intact. The inline `listEl.style.display = 'flex'` was removed as well, because an inline
   style would have beaten the media query.

3. **Rows are shorter.** In two column mode the name sits beside the index and the two figures
   sit beside the bar, so each row is two lines rather than three. List height at 1440 wide is
   868px against 1930px. No row overflows its column at any width tested.

4. **The 0-0/day bug is fixed, both directions.** `budget.astro` now queries inside
   `#budget-form` rather than the document, so its `.style-btn`, `.money.fixed`, `.money.daily`
   and `.buffer-btn` collections cannot reach another page. The same defect ran the other way:
   `cost-per-country.astro` was attaching its own click handlers to the budget planner's style
   buttons, so its `.style-btn` is now scoped to `#cpc-form` and `.cpc-row` to `#cpc-list`.
   `visa-checklist.astro` is scoped too: status and flag inputs to the existing `#situation`,
   and `.item`, `.item__box` and `.group` to the container, which needed an `id="checklist"`.
   That is the only markup change on that page.

5. **Spacing.** Five `section--sm` blocks became three, and this page overrides `section--sm`
   block padding from `--space-12` to `--space-8` with no padding between adjacent sections.
   Card padding, field gaps and heading margins came down a step each. All existing tokens, no
   new ones, and neither `tokens.css` nor `global.css` was touched.

**The target, measured at 1440 by 900:**

| | before, live | after |
|---|---|---|
| Page height | 4514px | 2934px |
| Bottom of the report card | 3506px | 707px |
| Country list height | 1930px | 868px |

The `<h1>` (311px), the first paragraph (412px) and the whole report card (707px) are all above
the fold, and the comparison starts at 801px. On mobile the page is 5347px against 6057px and
stays one column.

Verified in a browser on all three tool pages: the cost per country buttons read `140–240/day`
with Mid-range selected, the budget planner still rescales its own ranges by destination
(Croatia gives 67–124) and still computes totals and the buffer correctly, and the visa
checklist still filters by employment status. No console errors on any of them.

**Could not do, and why:**

Nothing in the brief was skipped.

**For Cowork:**

- **One sentence had to change that the brief said to keep.** The report summary opened with
  "The comparison above prices your whole trip with one index". Moving the report above the
  comparison made that false, so it now reads "The free comparison below". Same reason the brief
  gave for deleting the offer line. No other wording changed.
- `visa-checklist.astro` needed one new attribute, `id="checklist"` on the container that holds
  the progress bar and the groups, because there was no existing element to scope `.item` and
  `.group` to. Nothing that page computes, shows or stores changed.
- The two column layout uses CSS columns rather than grid. Grid would need an explicit row count
  to fill down and then across; columns do it natively and reflow on their own.
- Untouched as instructed: `src/lib/report.ts`, `functions/api/report.ts`, `src/styles/`,
  `src/data/`, `public/`. No Stripe, no price, no new dependency.
