# BRIEF

**Status: DONE**
**Written: 12 September 2026, by Cowork**
**Brief 011**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

Brief 010 shipped and Stripe works. Patricia looked at the live page and the disclosure is the problem: nineteen questions unfolding inside the page is not intuitive. The paid flow moves to its own page.

---

## What to do

### 1. Move the paid flow to its own page

New page at `src/pages/tools/cost-per-country/full-report.astro`, URL `/tools/cost-per-country/full-report/`.

Astro routes `src/pages/tools/cost-per-country.astro` and a `src/pages/tools/cost-per-country/` folder to different URLs, so both can exist. If the build disagrees, convert the existing page to `src/pages/tools/cost-per-country/index.astro` and keep its URL exactly as it is today. **The existing URL must not change.** It is the page that ranks.

Move onto the new page, unchanged in substance:

- The nineteen questions, in their current groups and order.
- The pay button, the price, the what you get bullets, and the Stripe reassurance line.
- The access code fine print, per item 3.
- Everything Brief 010 built for the states after payment, including the return from Stripe and the refused session message.
- The `localStorage` keys stay as they are, `durian-cpc-report-v1`.

The new page needs its own `title` and `description` for `BaseLayout`, a breadcrumb back to the comparison, and the standard disclaimer.

### 2. Delete the disclosure from the comparison page

`src/pages/tools/cost-per-country.astro`.

- Remove the `<details id="report-details">` and everything inside it.
- In its place, keep the offer as a plain block: the "Full report" eyebrow, the `<h2>` "Priced for the way you actually travel", the intro paragraph, the what you get bullets, the price, and one primary button that is a normal link to `/tools/cost-per-country/full-report/`.
- No dropdown, no toggle, no JavaScript for this. It is a link.
- The free comparison below it stays exactly as it is.

### 3. The access code line

On the new page only. It currently reads "Testing this? Enter a code."

- Change the text to exactly: **Got a code.**
- Nothing else. No question mark, no "enter", no explanation, no hint that it gives free access.
- It stays small, muted, collapsed by default, and the input only appears when clicked. Behaviour behind it is unchanged.

### 4. The scroll cue becomes a real heading

`src/pages/tools/cost-per-country.astro` line 306, currently a `<p class="cpc-cue">` wrapping a link that reads "Not ready to answer twenty questions? The free comparison below ranks all 28 countries in one click."

That is a link pretending to be a signpost, and it carries no search value.

- Replace it with an `<h2>` phrased the way a person types it into a search box. Use: **How much does a trip to Europe cost?**
- Under it, one short line with the link into the comparison, something close to: "Pick how you travel and see what a week costs in all 28 countries, cheapest first."
- Keep the existing `<h2>` "Can you afford Europe?" where it is, on the comparison itself. Two question headings on one page is fine because they answer different questions, one about the cost and one about affording it.
- Do not add a second `<h1>`, and do not move the existing one.

**Recorded honestly:** Cowork could not verify search volume for either phrase. The Ahrefs plan refused both the overview and the matching terms queries on 10 September 2026 and again today. The reasoning is that question headings match how people and AI assistants phrase the problem, which is a judgement rather than a measurement. Patricia has Ahrefs access elsewhere if she wants the real figure.

### 5. Repoint the Stripe redirect

The Payment Link's success URL currently returns people to `/tools/cost-per-country/`. Their saved answers and the report now live on the new page.

- Cowork updates the URL in Stripe to `https://duriantravel.com/tools/cost-per-country/full-report/?session_id={CHECKOUT_SESSION_ID}`. **Do not attempt this yourself, you have no Stripe access.**
- Build the new page to read `session_id` from its own URL.
- As a safety net, if `/tools/cost-per-country/` is loaded with a `session_id` in the query, forward to the new page keeping that parameter, so anybody returning against the old URL still gets their report rather than a dead end.

## Why

Nineteen questions unfolding inside a page that is also a free tool asks the visitor to hold two things at once. A separate page makes the paid product feel like a product, gives it a URL that can be linked and measured on its own, and leaves the free comparison clean.

## Do not

- Do not change the URL of `/tools/cost-per-country/`.
- Do not change any question, answer option, or the weighting.
- Do not change `functions/api/report.ts`, the Stripe verification, or the access code checking.
- Do not change the report's content or appearance.
- Do not change what the free comparison computes, or touch `src/data/country-costs.json`.
- Do not reintroduce a `<details>` for the question form anywhere.
- Do not write a price anywhere except the existing constant.
- Do not put the Stripe secret key, the Payment Link, or a session id anywhere new in the repo beyond the constants that already hold them.
- Do not touch `public/_headers`, the CSP, or DNS. Only `public/_redirects` if a redirect is needed.
- Do not touch `/tools/budget/` or `/tools/do-you-need-a-visa/`.
- Do not edit `src/styles/tokens.css` or `src/styles/global.css`.
- Any page script scopes its queries to its own page root. See brief 006.
- Build to the `durian-deliverable-design` skill. Light only.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- Both pages carry: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

## Check before you merge

- `/tools/cost-per-country/` still resolves and still shows all 28 countries.
- `/tools/cost-per-country/full-report/` resolves and holds every question.
- The access code line reads exactly "Got a code."
- No `<details>` remains around the question form.
- The sitemap includes the new page.
- Build passes and `grep -ri "azevedo" dist/` returns nothing.

---

## Done

**Completed on:** 13 September 2026
**Branch:** `brief/011-full-report-page`

**Cowork has one action:** repoint the Payment Link's success URL in Stripe to
`https://duriantravel.com/tools/cost-per-country/full-report/?session_id={CHECKOUT_SESSION_ID}`.
Until then the safety net in item 5 forwards anybody Stripe returns to the old URL, so nothing
breaks in the meantime.

**What changed:**

1. **New page** at `src/pages/tools/cost-per-country/full-report.astro`. On Astro 4.16.19 the
   file route `cost-per-country.astro` and the folder route built side by side, so no conversion
   to `index.astro` was needed and `/tools/cost-per-country/` is unchanged. The page holds every
   question in its original groups and order, the what you get bullets, the price, the pay
   button, the Stripe line, the code line, and every return state from brief 010. The
   `localStorage` key is still `durian-cpc-report-v1`. It has its own title, description,
   canonical, a breadcrumb back to the comparison, the disclaimer, and it is in the sitemap.

2. **Comparison page.** The `<details id="report-details">` and everything inside it are gone.
   The offer is now a plain block: the eyebrow, the `<h2>`, the intro, the bullets, the price, and
   one primary button that is an ordinary `<a href>` to the new page. No toggle and no script for
   it. The free comparison is unchanged, checked token by token against HEAD.

3. **The code line** reads exactly "Got a code." It is collapsed on load, the input appears only
   when it is opened, it is keyboard operable because it is a native disclosure, and the code is
   still checked server side.

4. **The heading.** The `<p class="cpc-cue">` became `<h2>` "How much does a trip to Europe
   cost?" with one line under it linking into the comparison. "Can you afford Europe?" stays on
   the comparison itself. Still exactly one `<h1>`, not moved.

5. **Safety net.** If `/tools/cost-per-country/` loads with a `session_id`, a small inline script
   forwards to the new page with the query string intact. It is a script rather than a
   `_redirects` rule because Cloudflare Pages redirect rules cannot match on a query string, so
   `public/_redirects` was not touched.

6. **The two identical buttons, fixed at Patricia's request.** The comparison's button reads
   "Get the full report for €5" and takes you to the report page. The report page's button reads
   "Pay €5 and get your report" and takes payment. Both labels come from `REPORT_PRICE`.

7. **Shared module.** `REPORT_PRICE`, `STRIPE_PAYMENT_LINK`, both button labels, the offer
   bullets, the styles and the questions moved from the comparison page into
   `src/data/full-report.ts`, because both pages need them and copying would have defined the
   price and the link twice. They were moved, not changed: the questions, styles, bullets, price
   and link are identical to HEAD. The Payment Link is in exactly one source file, and in the
   built site it appears once, on the report page only.

**A bug this move exposed, found and fixed:**

- The report payload used to take the travel style, its daily base and the currency from the
  comparison's controls on the same page. The new page has none of those controls. Without them
  `normalise` in `src/lib/report.ts` silently defaults to Mid-range and a blank currency, which
  would have changed the report people receive. The new page reads the style and currency the
  visitor last used from `durian-cpc-v1`, the key the comparison already saves, and falls back to
  Mid-range and €, the comparison's own defaults.
- Testing that hand-off exposed a worse bug underneath. **All four tool pages load one shared
  bundle, `page-tools.*.js`, that carries every tool's script.** The free comparison's `update()`
  therefore ran on every tool page and saved `{"style":"mid"}` over the visitor's saved choice,
  wiping their nights, budget and currency. Reproduced before the fix on the report page, the
  budget planner and the visa tool. On the budget and visa pages this predates this brief. On the
  new report page it priced every report at Mid-range: a visitor who picked Budget sent a payload
  of Mid-range, base 190.
- Fix: the comparison script's listeners and its `restore()` and `update()` calls now run only
  when its own list and controls are present. This touches the free comparison's script but not
  what it computes. After rebuilding, the saved choice survives on all three pages, the comparison
  still restores and saves on its own page, and the hand-off sends Budget, base 100, $.
- The budget planner was checked for the same fault: its own saved state survives loads of every
  other tool page, so there is no second bug.

**Checks:**

- Build passes, 76 pages. `grep -ri "azevedo" dist/` returns nothing. No secret key or price id in
  `src/`, `functions/` or `dist/`.
- Built comparison page: 28 rows, no question form, no `<details>`, the offer button a real link
  to the new page, no Payment Link, the forward script present, both question headings, one
  `<h1>`, the disclaimer.
- Built report page: all 19 answer fields in the original order, 28 country checkboxes, "Got a
  code.", one `<details>` and it is the code line, not the form, the Payment Link once, the new
  canonical, the disclaimer.
- Sitemap lists `/tools/cost-per-country/` and `/tools/cost-per-country/full-report/`.
- In a browser: cold arrival sends Mid-range, 190, €; the hand-off sends Budget, 100, $; a refused
  code shows the refusal; the old URL with a `session_id` lands on the new page with the id kept
  and stripped from the address bar; returning with answers posts to `/api/report`; returning
  without them says so and keeps the session; the pay button saves the answers before leaving and
  lands on Stripe showing €5.00 for "Full cost per country report" in sandbox. No sideways scroll
  at 375px on either page. No JavaScript errors. The only console errors are the local preview's
  404 on `/api/report`, because the preview server does not run Cloudflare Functions. The live
  endpoint is checked after deploy.
- All new copy checked for dashes and banned words.

**Could not do, and why:**

Nothing in the brief was skipped. Repointing the Stripe success URL is Cowork's, as the brief said.

**For Cowork:**

- **The cue line does not use the suggested wording.** The suggested sentence, "Pick how you
  travel and see what a week costs in all 28 countries, cheapest first", is already the lede
  under "Can you afford Europe?" a short scroll below. Using it again put the same sentence twice
  in a row. The line reads "Rather skip the questions? The free comparison below ranks all 28
  countries straight away."
- **The shared bundle is the root cause of both this bug and brief 006's, and it is worth a brief
  of its own.** Every tool page also loads the FAQ and services chunks. Any page script that
  writes storage or attaches listeners without checking its own page root will misbehave on pages
  it was never meant for. The visa tool, the report page and now the comparison all check. The FAQ
  and services scripts were not tested here.
- **The report's own "Back to the comparison" link** still points at `/tools/cost-per-country/`,
  not the report page, because the report's content was off limits. Nothing is lost: the answers
  are saved, and the report page restores them.
- Search volume for both question headings is still unverified, as the brief recorded.
