# BRIEF

**Status: DONE**
**Written: 24 September 2026, by Cowork**
**Brief 017**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE.

**Gate. Read before you start.** This brief puts a live Stripe link on the site, which means real money. `functions/api/report.ts` refuses everybody when `STRIPE_SECRET_KEY`, `REPORT_PRICE_CENTS` or `REPORT_CURRENCY` is missing or wrong in the Cloudflare environment. If this ships against a wrong value, a buyer pays €5.99 and gets nothing.

State of the Cloudflare production environment, checked by Cowork on 25 September 2026 in the `durian-travel` Pages project:

- `REPORT_PRICE_CENTS`: `599`. Was `500`, changed and saved by Cowork on 25 September 2026.
- `REPORT_CURRENCY`: `eur`. Already correct, untouched.
- `STRIPE_SECRET_KEY`: present and encrypted, so its value cannot be read from the dashboard. **Nobody has confirmed it is the live key rather than a test key.** A test key cannot look up a live Checkout Session, so if it is a test key every paying buyer is refused.
- `REPORT_ACCESS_CODE`: present and encrypted, untouched.

None of these are yours to set and none of them enter the repository. Cloudflare applies environment variables at deployment, so the new `599` takes effect on the deployment this brief produces, not before.

**Before you merge,** check the Done section requirement at the bottom: if Patricia has not confirmed `STRIPE_SECRET_KEY` is the live key, stop at the branch, write that in Done, and do not merge.

---

## What to do

### 1. Swap the test Payment Link for the live one

In `src/data/full-report.ts`:

1.1 Replace the value of `STRIPE_PAYMENT_LINK`. It is currently `https://buy.stripe.com/test_8x23cu35Va9xgGV9937wA00`. The live link is:

```
https://buy.stripe.com/8x23cu35Va9xgGV9937wA00
```

1.2 Rewrite the comment above it. It currently says the link is a test link that charges nothing, and that the account is still under identity review. Both are now out of date. The Stripe account is active, Payments and Payouts are both live, and this link takes real money. Keep the part that explains why the link is public and why the secret key, price in cents and currency are Cloudflare values, because that is still true and still worth saying.

1.3 Grep the whole repository for `test_8x23cu35` and for `buy.stripe.com/test_`. Neither should survive anywhere, including comments and documentation.

### 2. Change the price from €5 to €5.99

Patricia set €5.99 on 24 September 2026, after checking Stripe's Portugal fees. At €5 she was keeping between €4.57 and €4.65 per sale once fees came off. €5.99 clears €5 net on every card type the account accepts.

2.1 In `src/data/full-report.ts`, change `REPORT_PRICE` from `'€5'` to `'€5.99'` and update the comment's date and reasoning to match.

2.2 Sweep for every other place the price is written out rather than read from that constant. Search `src/` and the content collections for `€5`, `EUR 5`, `5 euro`, `five euro` and `€5.00`. The sample report page, the methodology page, the planners index, the free comparison page, the report page itself and any blog post that mentions the report are all candidates. Anything describing the price of this report reads from `REPORT_PRICE` afterwards, or says €5.99. List in Done every file you changed and every `€5` you left alone with the reason.

2.3 Check the sample report at `/tools/cost-per-country/sample/`. If it shows a price anywhere, it shows the new one.

### 3. Confirm the success URL matches the code

The live link redirects buyers to:

```
https://www.duriantravel.com/tools/cost-per-country/full-report/?session_id={CHECKOUT_SESSION_ID}
```

3.1 Confirm `src/pages/tools/cost-per-country/full-report.astro` still reads `session_id` from the address bar on load and still sends it to the Function in the `x-durian-session` header. Do not change how it works. This is a check, not an edit.

3.2 The forwarding script on `/tools/cost-per-country/` that catches a stray `session_id` and passes it to the report page stays exactly as it is. The old test link pointed there and buyers with old links may still land on it.

### 4. Report back, do not act

Put these in the "For Cowork" part of Done.

4.1 Every remaining `€5` you found and left, with the file and the reason.

4.2 Whether anything in the repository other than `src/data/full-report.ts` hardcodes the payment link or the price.

4.3 Whether `functions/api/report.ts` would behave differently if a Stripe session came back in a currency other than EUR. Do not change it. Adaptive Pricing is switched on in the Stripe account, which may mean a buyer paying in their own currency produces a session whose `currency` is not `eur` and whose `amount_total` is not `599`. Patricia has been told. Say plainly what the code does in that case so she can decide.

---

## Why

The site has been selling a test link since 12 September, which charges nothing and only accepts Stripe test cards. The Stripe account is now verified, Payments and Payouts are both active, a Wise payout account is attached, and a live Payment Link exists at €5.99. This brief is the last edit between that and the site actually taking money. The price moved from €5 because at €5 the fees left her with less than she thought, and the whole point of a single digit product is that the arithmetic has to work at the first sale, not the hundredth.

---

## Do not

- Do not touch `functions/api/report.ts`. Not the verification, not the amount check, not the currency check, not the 24 hour window. If you think the currency check is wrong, report it under 4.3 and leave it alone.
- Do not loosen, widen or make optional any check that decides whether a report is released. A check that lets an unpaid session through is worse than a check that is too strict.
- Do not create, edit, deactivate or replace anything in Stripe. The link, the product, the price in Stripe and the success URL are all set and are not yours to change.
- Do not put `STRIPE_SECRET_KEY`, the price in cents or the currency into the repository, into `.env`, into `.dev.vars` or into any committed file, and do not read `.env.local`.
- Do not change `public/_headers`, the Content Security Policy, `vercel.json` or DNS.
- Do not add Stripe Elements, embedded Checkout, a checkout endpoint or a webhook handler. The hosted Payment Link opened as plain navigation is the design.
- Do not merge, rebase, edit or delete the branch `brief/015-new-posts`. Those three posts are still waiting for Patricia to read.
- Do not act on the "For Cowork" notes left in brief 016. They get their own brief.
- Do not delete files that are not named in this brief.

---

## Done

*Claude Code fills this in.*

**Before you merge:** `REPORT_PRICE_CENTS` and `REPORT_CURRENCY` were verified in Cloudflare on 25 September 2026 and are correct. State here whether Patricia has confirmed that `STRIPE_SECRET_KEY` holds her live key and not a test key. If she has not, leave the work on the branch, say so, and do not merge.

**Before you merge.** `REPORT_PRICE_CENTS` (599) and `REPORT_CURRENCY` (eur) were verified by Cowork in Cloudflare on 25 September 2026. **Patricia has not confirmed that `STRIPE_SECRET_KEY` holds her live key.** The gate is unmet, so this is held at the branch and nothing is live.

**Completed on:** 25 September 2026, held at the branch.
**Branch:** `brief/017-live-payment-link`, pushed, not merged.

**Merged, or held at the branch and why:** Held, for two reasons.

1. **The gate.** Nobody has confirmed the Cloudflare `STRIPE_SECRET_KEY` is the live key. A test key cannot look up a live Checkout Session, so every buyer would pay and be refused.
2. **Adaptive Pricing, found while checking the link.** Opening the live Payment Link on 25 September 2026 showed a currency selector with **₱445.00 selected by default** and €5.99 as the alternative. It is not in test mode and the product and price are right. But a buyer who accepts the currency Stripe offers them produces a session whose `currency` is not `eur` and whose `amount_total` is not `599`, and `functions/api/report.ts` refuses exactly that. This is the default path for a buyer outside the eurozone, not an edge case. Shipping the link in this state means most buyers pay €5.99 and get nothing. Details under 4.3.

**What changed:**

- `src/data/full-report.ts`: `STRIPE_PAYMENT_LINK` now `https://buy.stripe.com/8x23cu35Va9xgGV9937wA00`. The comment no longer calls it a test link or mentions identity review, and keeps why the link is public and why the key, the cents and the currency are Cloudflare values.
- `src/data/full-report.ts`: `REPORT_PRICE` from `'€5'` to `'€5.99'`, with the date and the fee reasoning in the comment.
- Nothing else needed editing. `offerCta`, `payCta`, the homepage card, the planners card, the comparison page offer and the report page all read `REPORT_PRICE`, and the built pages show €5.99 in all four places.
- `grep -rn "test_8x23cu35\|buy.stripe.com/test_" src/ dist/` returns nothing after a rebuild.
- The sample report at `/tools/cost-per-country/sample/` states no price, so there was nothing to change. Its `€5,681` and `€5,840` are trip totals.

**Checks, not edits:**

- **3.1** `full-report.astro` still reads `session_id` from the address bar on load (line 715), keeps it in `sessionStorage` for that tab, strips it from the URL, and sends it to the Function as `x-durian-session` (line 665). Untouched.
- **3.2** The forwarding script on `/tools/cost-per-country/` that catches a stray `session_id` and passes it to the report page is untouched.
- `functions/api/report.ts` untouched.

**Could not do, and why:**

- **Merging.** The brief's gate is unmet, and the Adaptive Pricing finding above is a second reason to stop. Both are Patricia's to decide.

**For Cowork:**

- **4.1 Every remaining `€5`, all left alone.** None of them is the price of the report: `destinations/denmark.md:109` (coffee €5 to 6), `destinations/bulgaria.md:27` (a meal €5 to 10), and daily budget ranges that contain `€5` inside a larger number in `czech-republic.md:93`, `estonia.md:94`, `slovenia.md:97`, `malta.md:109`, `norway.md:106` (DNT membership €55 a year), `austria.md:61`, `switzerland.md:10`, `poland.md:32`, and `countries.json:961` (`"dailyBudget": "€50-€100"`). `schengen-visa-guide.astro:35` states the Schengen visa fee of 90 euros, which is the consulate's fee, not ours.
- **4.2 Nothing else hardcodes the link or the price.** The link exists once, in `src/data/full-report.ts`, and reaches the form as `data-payment-link`. Two historical copies of the old test link remain and were deliberately not edited: `briefs/2026-09-12-010-stripe-layer.md`, because `briefs/` is the archive and CLAUDE.md says it is read only, and item 1.1 of this brief, which quotes it as the thing to replace.
- **4.3 What the code does with a non euro session.** `hasPaidSession` reads `REPORT_PRICE_CENTS` and `REPORT_CURRENCY` from the environment, then refuses unless `session.amount_total === 599` **and** `session.currency === 'eur'` (lines 148 and 149). A session paid in pesos comes back as `currency: 'php'` with `amount_total` in centavos, so both comparisons fail, `isPaidRequest` returns false, and the endpoint answers `402` with "This report is not available". The buyer has already paid. When Adaptive Pricing converts, Stripe puts the original euro figures in the session's `currency_conversion` object (`amount_total`, `amount_subtotal`, `fx_rate`, `source_currency`); the code never reads it, so the euro amount that was actually charged in Durian's own currency is available but unused. Two ways out, both Patricia's call: switch Adaptive Pricing off in Stripe so every buyer is charged €5.99 in euros and the existing check passes untouched, or write a brief that authorises reading `currency_conversion` in the Function. Nothing here was changed, per the "Do not" list.
- `brief/015-new-posts` untouched. The three posts are still waiting for Patricia to read.
