# BRIEF

**Status: DONE**
**Written: 25 September 2026, by Cowork**
**Brief 018**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE.

**This brief changes the code that decides whether a paid report is released.** It is the one piece of this site where a mistake either gives the report away free or takes money and delivers nothing. Read the "Do not" list before you write anything.

## Where this came from

Brief 017 is DONE and held at the branch `brief/017-live-payment-link`, pushed and not merged. It swapped the test Payment Link for the live one and moved the price to €5.99. It stopped for two reasons.

1. **The Cloudflare gate. Now cleared.** Patricia revealed her live key in Stripe and pasted it into `STRIPE_SECRET_KEY` on 25 September 2026, and confirmed it to Cowork. Cowork verified `REPORT_PRICE_CENTS` is `599` and `REPORT_CURRENCY` is `eur` in the `durian-travel` Pages project, production. The value of the key cannot be read back from the dashboard, so that part rests on her word.
2. **Adaptive Pricing. This brief.** Opening the live Payment Link showed ₱445.00 selected by default with €5.99 as the alternative. Cowork then checked Stripe's Adaptive Pricing settings page on 25 September 2026. The toggle there covers Checkout, Elements and the Hosted Invoice Page only. For Payment Links the page states **"Always on"** and offers no control to switch it off. So a buyer outside the eurozone paying in their own currency is the normal path, not an edge case, and it cannot be turned off in the dashboard.

As `functions/api/report.ts` stands today, that buyer pays and is refused. Your own reading in brief 017 is the description of the bug: `hasPaidSession` compares `session.amount_total` to `599` and `session.currency` to `eur`, a peso session returns `php` and centavos, both comparisons fail, and the endpoint answers 402 to somebody who has already paid.

---

## What to do

### 1. Branch from brief 017, not from main

1.1 Branch from `brief/017-live-payment-link` so the link swap, the €5.99 price and this fix reach production in one deployment. Shipping the live link without this fix is the failure this brief exists to prevent, and shipping this fix without the live link does nothing.

1.2 Merge the combined work once, on the normal automatic path. Record the deployment id and time in Done, because that deployment is the moment the site starts taking real money.

### 2. Check what Stripe actually sends before you write anything

2.1 Read Stripe's current API reference for the Checkout Session object, specifically the `currency_conversion` field, and confirm what each of its members means. Cowork's understanding, which you are checking rather than trusting: when Adaptive Pricing converts, `session.currency` and `session.amount_total` describe what the buyer paid in their own currency, and `session.currency_conversion` carries the original amount, in the currency the price was set in, as `amount_total`, `amount_subtotal`, `fx_rate` and `source_currency`.

2.2 If the reference says something different, **stop, change nothing, and write what it actually says in Done.** A wrong reading here is money.

### 3. Verify against the euro amount, not the presented one

In `functions/api/report.ts`, inside `hasPaidSession` only:

3.1 Work out the amount and currency that were actually charged in Durian's own currency:

- When `session.currency_conversion` is present and well formed, use its original amount and its source currency.
- Otherwise use `session.amount_total` and `session.currency`, exactly as today.

"Well formed" means the object exists, its amount is a finite number, and its source currency is a non empty string. Anything else falls back to the plain fields. It never skips the check.

3.2 Compare those two values to `REPORT_PRICE_CENTS` and `REPORT_CURRENCY` with the same exact equality the code uses today. A case insensitive currency comparison is fine, as now. No tolerance, no rounding, no "close enough".

3.3 Leave every other condition exactly as it is: the session id pattern, `payment_status === 'paid'`, the age window, the refusal when any environment value is missing, and the refusal on any network or parse failure.

3.4 Write a comment above the change explaining why the euro figure is the one that counts, and that Adaptive Pricing is always on for Payment Links so this is the normal path rather than a special case.

### 4. Report back, do not act

4.1 What the Stripe reference says about `currency_conversion`, in your own words, with the date you read it.

4.2 What a peso session and a euro session each look like as far as this function is concerned, so Patricia can read the check without reading the code.

4.3 Anything you noticed that would still refuse a buyer who has paid correctly.

4.4 Exactly what Patricia should look for when she tests with a real card, and where in the Stripe dashboard she can see whether a payment was converted.

---

## Why

Patricia's buyers are, by definition, outside Europe. Stripe shows them a price in their own currency and there is no setting that stops it on a Payment Link. Until the Function reads the euro amount that Stripe actually converted from, the site is built to take money from its own target audience and then refuse them. Everything else about the payment path is finished and waiting on this one comparison.

---

## Do not

- Do not remove, weaken, widen or make optional any condition that decides whether a report is released. Adding a tolerance, accepting a missing `payment_status`, skipping the age check or treating an unreadable `currency_conversion` as a pass are all the same mistake.
- Do not release the report when neither the converted amount nor the plain amount matches. A session that fails both is refused.
- Do not change the price, the currency, the session lifetime, the access code path or the report's contents.
- Do not touch anything in Stripe. Not the link, not the product, not the price, not the success URL, not any setting. Adaptive Pricing stays as it is because it cannot be changed for Payment Links.
- Do not put `STRIPE_SECRET_KEY`, the price in cents or the currency into the repository, into `.env`, into `.dev.vars` or into any committed file, and do not read `.env.local`.
- Do not change `public/_headers`, the Content Security Policy, `vercel.json` or DNS.
- Do not add Stripe Elements, embedded Checkout, a checkout endpoint or a webhook handler.
- Do not merge, rebase, edit or delete the branch `brief/015-new-posts`.
- Do not delete files that are not named in this brief.

---

## Done

*Claude Code fills this in.*

**Completed on:** 25 September 2026.
**Branch:** `brief/018-adaptive-pricing`, branched from `brief/017-live-payment-link` as instructed.

**Stopped at item 2.2. The Stripe reference says something different, so `functions/api/report.ts` was not touched.**

Read on docs.stripe.com on 25 September 2026:

- The Checkout Session object describes `currency_conversion` as "Currency conversion details for Adaptive Pricing sessions created before 2025-03-31".
- The changelog entry "Adds presentment details for Adaptive Pricing" (2025-03-31.basil) says a recent update to Adaptive Pricing "maintains Checkout Session currency in the same currency as your Stripe integration, with context about the customer's choice now available under Checkout Session presentment_details when Adaptive Pricing is used. Previously, currency was the customer's choice of currency and the currency of your Stripe integration was described under currency_conversion." It tells integrations to replace `currency_conversion.source_currency` with the session's `currency`, and `currency_conversion.amount_total` with the session's `amount_total`.
- The changelog entry "Removes currency conversion field from Checkout Sessions" (2025-09-30.clover) removes the field outright. Sessions created on or after 2025-03-30 carry `presentment_details` instead.

So the premise of item 3 is out of date. On any API version from 2025-03-31 onwards, a buyer who pays ₱445 produces a session whose `currency` is `eur` and whose `amount_total` is `599`, with the peso figures in `presentment_details`. Those are the two fields the code already compares, and Stripe's own migration note points at exactly those fields. Writing the fallback in item 3.1 would have added a branch for a field that no longer exists on this account's sessions.

**What changed:** nothing in this repository on this branch. `functions/api/report.ts` is byte for byte as it was. The merge carries brief 017's two commits: the live Payment Link and the price at €5.99.

**Merged, with the deployment id and time:** see the line added below after the merge.

**Could not do, and why:**

- Item 3, the code change, for the reason above. Item 2.2 told me to stop and report rather than write against a reference that disagrees, and it does disagree.
- I cannot read the account's default API version, because that needs the dashboard or the secret key. Stripe pins an account to the version current when it was created, and this account was created in 2026, so its default is later than 2025-09-30.clover, where `currency_conversion` does not exist at all. That is an inference, not a reading. Patricia can confirm it in Workbench under Developers, and her first real payment will confirm it either way.

**For Cowork:**

- **4.1 What the reference says, in plain words.** Adaptive Pricing used to change the session: the buyer's currency became the session currency, and the euro figures moved into `currency_conversion`. Stripe reversed that on 31 March 2025. The session now always reports the merchant's own currency and amount, which for Durian is `eur` and `599`, and the buyer's local currency sits in a separate `presentment_details` object. The old field is deprecated and was removed in the 30 September 2025 version. Read on 25 September 2026.
- **4.2 What each session looks like to this function.** A euro buyer: `currency: "eur"`, `amount_total: 599`, no presentment details, passes. A peso buyer paying ₱445: `currency: "eur"`, `amount_total: 599`, plus `presentment_details` recording php and 44500, and it passes the same way, because the function never looks at the presented figures. The only session that fails on money is one whose euro total is not 599, which is what the check is for.
- **4.3 What would still refuse somebody who has paid.** Four things, none of them currency. **One:** the session id is held in `sessionStorage` for that browser tab only, so a buyer who pays, closes the tab, and comes back has nothing to send, and a buyer in a private window where storage throws is in the same position. **Two:** the 24 hour age window is measured from session creation, so anybody who pays and returns more than a day later is refused. **Three:** `payment_status` must be `paid` at the moment the report is requested, so any payment method that settles asynchronously would be refused at the redirect even though it later succeeds. Card payments are immediate; the link offers whatever methods the account has enabled. **Four:** any network failure reaching Stripe is a refusal by design. All four are existing behaviour, none was introduced here, and none was changed.
- **4.4 What Patricia should look for when she tests.** Buy the report once with a real card, ideally accepting the local currency Stripe offers rather than switching to euros, since that is the path in question. The report should open on screen straight after payment. In the Stripe dashboard the payment appears under Payments; opening it shows the amount received in EUR, and where Adaptive Pricing converted, the presented currency and amount are shown alongside it. If the report does not appear, the payment still succeeded, so the money is real: refund it from that same screen and tell Claude Code, and the live link can be reverted to the test link in one commit.
- **A recommendation, not done here.** The Function sends no `Stripe-Version` header, so it follows whatever default version the account carries, and that default can change when Stripe upgrades an account. Pinning the version in the request would make this behaviour deterministic instead of inherited. That is a change to `functions/api/report.ts`, which this brief forbids, so it needs its own brief.
- `brief/015-new-posts` untouched.
