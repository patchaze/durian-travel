# BRIEF

**Status: DONE**
**Written: 8 September 2026, by Cowork**
**Brief 002**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

Context: the budget calculator currently ignores the destination country entirely, so a trip to Switzerland and a trip to Portugal produce the same suggestion. The Eurostat data that fixes this is already in the repo. This brief makes the free tool more useful without adding a single number that is not either sourced or openly labelled as Durian's own estimate.

---

## What to do

### 1. Add a destination country to the budget calculator

`src/pages/tools/budget.astro`, in the "Your trip" section, after the existing nights and travellers fields.

- New `<select id="destination">`, labelled **"Where in Europe"**, with a first option **"Not sure yet"** (value empty) selected by default.
- Populate it from `src/data/country-costs.json`, the same file `/tools/cost-per-country/` already reads. Do not duplicate the data, do not hand type the list, and do not add or remove countries.
- Add it to the saved state in `localStorage` under the existing `durian-budget-v1` key, alongside the other fields.

### 2. Make the style presets follow the destination

Today the three preset buttons write a flat daily figure regardless of destination. Change that.

- The `styles` array at `src/pages/tools/budget.astro:13` stays as it is. Its `typical` values (100, 190, 320) remain the EU baseline.
- When a destination is chosen, multiply the preset's `typical` by `countryIndex / 100` before splitting it across the four daily fields. The existing 45 / 30 / 10 / 15 split is unchanged.
- When the destination is "Not sure yet", behave exactly as now: use `typical` unscaled.
- Update the range shown on each button the same way, so "Mid-range 140 to 240 per day" becomes the scaled range for the chosen country. Keep the "380+" treatment on the top band.
- Recalculate when the destination changes, the same way the tool already recalculates on any input.

### 3. Say on the page what just happened

Directly under the preset buttons, one line, plain text, no styling invention. It must name the source inline. Wording to use, exactly:

> Adjusted for [country] using Eurostat's price level index for restaurants and hotels, reference year 2024, where the EU27 average is 100. The starting figures are our own estimate, not a published statistic.

Replace `[country]` with the chosen country name. When no destination is chosen, show only the second sentence.

### 4. Add an eSIM field

Visitors need mobile data and the tool never mentions it.

- New field in the **fixed costs** group, after "Travel insurance": `<input class="money fixed" id="f-esim">`, labelled **"eSIM or mobile data (total, everyone)"**.
- No suggested figure and no benchmark. It is an empty input like every other cost field. A price benchmark is a separate brief, because Cowork has not yet confirmed a citable source for one.
- Add it to the saved state.

### 5. Declare the preset figures on the sources page

`src/pages/sources.astro`. The budget calculator is not covered there at all, and its numbers are the only unsourced ones on the tools. Add a short section, matching the structure and tone of the existing Eurostat section on that page. It must say:

- The three daily bands are Durian Travel's own estimate, not a published statistic.
- They describe Western Europe.
- They are scaled to other countries using the Eurostat index already described on that page.
- The 380 figure is a ceiling for the top band and is not published anywhere.

Do not invent a method, a sample size or a date of research for these figures. Say plainly that they are an editorial estimate.

## Why

The tool's biggest weakness is that it treats Europe as one price. The data to fix that is already in the repo and already sourced, so this is the largest honest improvement available without new research. Item 5 closes the last unsourced-number gap on the planners by labelling the estimate as an estimate rather than removing it.

## Do not

- Do not add any new number to any page. Every figure that appears must come from `country-costs.json` or from the existing `styles` array.
- Do not add a flight price benchmark, a travel insurance price benchmark, or a seasonal adjustment. Cowork is still checking whether a citable source exists for each. A number without a source breaks a hard rule even with a disclaimer attached.
- Do not add a travel month or travel season question. It would change nothing in the output until the seasonality data exists.
- Do not touch `/tools/cost-per-country/` or `/tools/visa-checklist/`.
- Do not touch `public/_headers`, the CSP, payments, or DNS.
- Do not change the 45 / 30 / 10 / 15 split, the buffer options, or the arithmetic in the totals.
- Do not modify `src/data/country-costs.json`.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json` or the untracked `api/` folder.
- Every page you touch keeps: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

---

## Done

**Completed on:** 8 September 2026
**Branch:** `brief/002-budget-destination`, merged to `main`

**What changed:**

`src/pages/tools/budget.astro`

1. New `<select id="destination">` labelled "Where in Europe", first option "Not sure yet" (empty value, selected). Populated from `src/data/country-costs.json` via `costData.countries`, the same import `/tools/cost-per-country/` uses. All 28 countries, none added or removed, nothing hand typed. Placed full width under the nights / travellers / currency row rather than inside it, because that row is a fixed three column grid and country names do not fit in a third of it.
2. `applyStyle` multiplies `typical` by `countryIndex()` before the 45 / 30 / 10 / 15 split. `countryIndex()` returns `pli / 100`, or exactly 1 when no destination is chosen, so "Not sure yet" produces byte for byte the previous numbers. The `styles` array is unchanged.
3. Button ranges rescale the same way. `low` and `high` are now on the buttons as data attributes; the top band keeps its "+" so Switzerland reads `444–649+/day`.
4. New line directly under the preset buttons, using the exact wording in the brief. The reference year is read from `_source.referenceYear` in `country-costs.json` rather than typed, so it cannot drift from the data. With no destination it renders only the second sentence, and that sentence is the server rendered default, so it is correct with JavaScript off.
5. New `f-esim` field in fixed costs after Travel insurance, labelled "eSIM or mobile data (total, everyone)". Empty, no benchmark, no suggested figure.
6. `destination` added to the saved state under `durian-budget-v1`, restored on load, and cleared by "Clear and start again".

`src/pages/sources.astro`

7. New "The daily spending bands in the budget calculator" section at the end of the Eurostat block, so it sits next to the index it refers to. States the bands are Durian Travel's own editorial estimate rather than a published statistic, that they describe Western Europe, that they are scaled by the Eurostat index described above that section, and that the 380 ceiling is ours and is published nowhere, including in our own guide. No method, sample size or research date invented. No new figure introduced: 380 is the only number quoted and it comes from the existing `styles` array.

Gates: `npm run build` passes, 77 pages. `grep -ri "azevedo" dist/` returns nothing. Both re-run after the final edit. Verified in the browser: presets, range labels, the note line, localStorage save and restore across a reload, and reset. No console errors.

**One judgement call worth knowing about.** The brief asked only that the tool recalculate when the destination changes. Taken literally, a reader who clicks Mid-range and then picks Switzerland would see Swiss ranges on the button and EU figures in the fields. So changing the destination now also re-applies the active preset, but only when all four daily fields still hold exactly what that preset last wrote. If the reader has edited any of them, their figures are left alone and only the total recalculates. Nothing a reader typed is ever overwritten.

**Could not do, and why:** nothing. Everything in the brief is done.

**For Cowork:**

- The existing note under the presets still opens "Ranges are for Western Europe and are our own estimate". Once a destination is chosen that is no longer true of the numbers shown, and the new line above it now says so. The two sit slightly at odds. The brief specified the new wording exactly and did not cover that paragraph, so it was left alone. It probably wants a rewrite in a later brief.
- "Copy the breakdown" does not mention the destination. Out of scope here, easy to add.
- The eSIM field is live but empty and unlabelled by any figure, as instructed. It will read as an odd blank until the price benchmark brief lands.
- Nothing was staged except the two page files and this brief. `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json` and `api/` are untouched and still untracked. The `api/` decision from brief 001 is still open.
