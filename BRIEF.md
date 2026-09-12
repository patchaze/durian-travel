# BRIEF

**Status: DONE**
**Written: 12 September 2026, by Cowork**
**Brief 010**

Promoted to the live work order by Cowork on 12 September 2026, after brief 009 was marked DONE. Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE.

This is the Stripe layer for the full report on `/tools/cost-per-country/`.

**The price is EUR 5.** Patricia decided this on 12 September 2026, having seen that fees take between 6.5 and 8.1 percent at that price against 4.3 to 5.9 percent at EUR 9. Her call, recorded.

- `REPORT_PRICE` in `src/pages/tools/cost-per-country.astro`, added by brief 007, becomes `'EUR 5'` formatted as the page's style requires.
- `REPORT_PRICE_CENTS` is `500` and `REPORT_CURRENCY` is `eur`. Both are Cloudflare values, not repo values.

**The Stripe Payment Link exists.** Created by Cowork in Stripe test mode on 12 September 2026:

`https://buy.stripe.com/test_8x23cu35Va9xgGV9937wA00`

Its success URL is already set to `https://duriantravel.com/tools/cost-per-country/?session_id={CHECKOUT_SESSION_ID}`, so the redirect back is configured. Put the link in a single named constant at the top of the page file, next to `REPORT_PRICE`, so swapping the test link for the live one later is one edit.

**This is a TEST link.** It charges nothing and only accepts Stripe test cards, for example `4242 4242 4242 4242` with any future expiry and any CVC. Patricia's Stripe account still has payments and payouts paused pending an identity review, so a live link cannot charge anybody yet. When the review clears, she replaces the link and the `STRIPE_SECRET_KEY` with their live equivalents. Nothing else changes.

**Do not use Stripe's own Buy button.** It is an embedded script from Stripe, and `public/_headers` allows scripts only from the site itself and Google Tag Manager, with `frame-src 'none'`. It would render nothing. Durian's own button navigating to the link above is the design, and it works behind that header untouched.

---

## A decision was reversed on purpose

`claude/tech-stack.md` says "No checkout endpoint, no webhook handler, no fulfilment code in the repo." **Patricia reversed that on 12 September 2026**, knowing what it means. This brief adds roughly fifteen lines of payment verification to `functions/api/report.ts`. Nothing else changes. There is still no checkout endpoint and no webhook handler.

Update the "What is deliberately not in the stack" section of `claude/tech-stack.md` to match, rather than leaving the repo contradicting itself.

## What to do

### 1. The flow

1. The visitor fills in the form and clicks the button.
2. The answers are already saved to `localStorage` under `durian-cpc-report-v1`. Make sure they are written **before** the browser leaves the page.
3. The browser navigates to the Stripe Payment Link. Plain navigation, so the CSP allows it. **Do not fetch it, do not iframe it.** `frame-src` is `'none'` and that stays.
4. Stripe redirects back to `/tools/cost-per-country/?session_id={CHECKOUT_SESSION_ID}`. Patricia sets that success URL in Stripe.
5. On load, if `session_id` is present, restore the saved answers and POST them with the session id to `/api/report`.
6. The Function verifies the session with Stripe, then returns the report exactly as it does today.

### 2. Verification, server side only

`functions/api/report.ts`. Replace the body of `isPaidRequest` so it accepts **either** route:

- **The access code**, as it works now. Keep it. It is how Patricia tests.
- **A Stripe session id.** Call `GET https://api.stripe.com/v1/checkout/sessions/{id}` with the secret key from `env`, named `STRIPE_SECRET_KEY`.

Accept the session only when **all** of these hold:

- The Stripe call returns 200.
- `payment_status` is exactly `paid`.
- `amount_total` and `currency` match the expected price, read from `env` as `REPORT_PRICE_CENTS` and `REPORT_CURRENCY`. Do not hardcode either.
- The session was created within the last 24 hours. Reject anything older.

Anything else returns the existing 402 with the existing body. **Never fall open.** If `STRIPE_SECRET_KEY` is missing, the Stripe route refuses every request rather than allowing them.

**Do not write any key, price or session id into the repo, a comment, a test file or a log line.** Patricia sets all three in the Cloudflare dashboard as Secrets. Do not log the full session id anywhere.

**A limit to state plainly in Done, not to solve here.** Without storage there is no way to make a session id single use, so somebody could reuse or share their own id within the 24 hour window. At this price that is an acceptable leak. Cloudflare KV would close it and is a later decision.

### 3. Make the button obvious

Patricia's words: make it visually easy for people to understand what happens when they click.

The summary card on the `<details>` becomes a clear offer. It must show, in this order:

- What the report is, in one line.
- **What you get**, three or four short bullets. The seven Eurostat categories weighted to how you travel, every country you are weighing up priced per day and per trip, the ranking that changes once your own habits are counted, and a page you can save or print.
- The price, large, from the `REPORT_PRICE` constant brief 007 added.
- The button itself, primary style, reading "Get the full report for €9" or whatever the constant holds.
- One quiet line under the button: payment is handled by Stripe, the report opens straight after, and no account is needed.

Do not add a fake discount, a countdown, a scarcity claim, or a "was €X" price. Do not promise a refund policy that does not exist.

### 4. Demote the access code to fine print

Right now the access code sits in its own `<fieldset>` with a `tool-block__title` legend reading "Access code", at `src/pages/tools/cost-per-country.astro` around line 246. A paying visitor reads that as "there is a way in without paying" and starts guessing.

- **Remove the whole fieldset from the normal flow.** No legend, no heading, no block.
- In its place, one line of small, muted text under the pay button, worded so it does not advertise free access. Something close to: "Testing this? Enter a code." It is a `<button type="button">` styled as a plain text link, not a visible input.
- Clicking it reveals the single input, which stays hidden until then. Use the same `<details>` and `<summary>` approach as the main form, or a `hidden` toggle. Either is fine, but it must work with the keyboard and it must be collapsed on every page load.
- Do not put the word "free", "discount", "bypass" or "skip payment" anywhere near it.
- The behaviour behind it does not change. The code still goes in the `x-durian-access` header and is still checked server side.

### 5. The states after payment

- **Coming back with a valid session:** open the `<details>`, show the report, and say plainly that it is ready.
- **Coming back with answers missing** because the visitor paid from a different browser or cleared storage: say so plainly, keep the session id, and let them re-enter the answers and generate again without paying twice.
- **A refused session:** a plain message that the payment could not be confirmed, with the contact page linked. Never blame the visitor and never say the payment failed, because you do not know that.
- **Any other failure:** say something went wrong and that no charge was made if none was.

### 6. Sources and the receipt

The report already carries its sources. Add one line to its footer giving the date it was generated, so a person who saves it knows how current it is.

## Why

Nothing on the site takes money today. This is the smallest honest mechanism that does: hosted payment on Stripe's own page, one server side check, and the report rendered on the site the moment the check passes.

## Do not

- Do not embed Stripe Checkout, Stripe Elements, or any Stripe JavaScript. `frame-src 'none'` and `payment=()` stay exactly as they are.
- Do not touch `public/_headers` or the CSP. A hosted Payment Link is navigation and needs no change.
- Do not put the secret key, the price, or any session id in the repo.
- Do not invent a price or a Payment Link URL. Both come from Patricia.
- Do not remove the access code route. It is how she tests without paying.
- Do not add a webhook handler, a checkout endpoint, or Make.
- Do not add a library or any new runtime dependency. Use `fetch`.
- Do not store customer data anywhere. No database, no KV, no logging of answers.
- Do not add a refund, guarantee or delivery promise that Patricia has not made.
- Do not change the report's content, weighting, or appearance.
- Do not change what the free comparison does.
- Nothing added here may score, rate, predict or imply a visa outcome, or comment on whether somebody's money is enough.
- Any page script scopes its queries to its own page root. See brief 006.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- Every page carries: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

## Check before you merge

- `grep -rn "sk_live\|sk_test\|price_\|buy.stripe.com" src/ functions/ dist/` returns nothing.
- A request with no session id and no code returns 402.
- A request with a made up session id returns 402.
- The access code still works.
- Build passes and `grep -ri "azevedo" dist/` returns nothing.

---

## Done

**Completed on:** 13 September 2026
**Branch:** `brief/010-stripe-payment-layer`

**Patricia has to set three Cloudflare variables before a payment can produce a report.**
`STRIPE_SECRET_KEY`, `REPORT_PRICE_CENTS` = `500`, `REPORT_CURRENCY` = `eur`. Until all three are
set the Stripe route refuses every request, which is the designed behaviour, not a fault. The
access code route works without them.

**What changed:**

1. **Price and link.** `REPORT_PRICE` is `'€5'`. `STRIPE_PAYMENT_LINK` sits beside it with the
   test link. Both button labels and the large price all read from `REPORT_PRICE`, so the price
   lives in one place.

2. **The flow.** The pay button saves the answers to `durian-cpc-report-v1` first, then
   `window.location.assign` to the hosted link. Plain navigation, no fetch, no iframe. Stripe
   returns to the page with `?session_id=`, which is read once, moved into `sessionStorage` under
   `durian-cpc-paid-session`, and stripped from the address bar with `replaceState` so a refresh
   cannot fire a second request. The session id goes up in an `x-durian-session` header, matching
   how the access code already travels.

3. **Verification, server side.** `isPaidRequest` is now async and accepts either route.
   `hasValidCode` is the old logic untouched. `hasPaidSession` calls
   `GET /v1/checkout/sessions/{id}` and returns true only when the call returns 200,
   `payment_status` is exactly `paid`, `amount_total` equals `REPORT_PRICE_CENTS`, `currency`
   matches `REPORT_CURRENCY`, and `created` is under 24 hours old. The id is matched against
   `^cs_[A-Za-z0-9_]{10,200}$` before it is put in a URL. A missing key, price or currency, a non
   200, a thrown fetch, all return false. Nothing falls open. No key, price or session id is
   written to the repo or logged.

4. **The offer card** now carries what the report is, four bullets of what you get, the price
   large, the button, and one quiet line saying Stripe handles payment, the report opens straight
   after, and no account is needed. No discount, no countdown, no scarcity, no refund promise.

5. **The access code is fine print.** The fieldset, legend and heading are gone. In their place a
   collapsed `<details>` reading "Testing this? Enter a code." The input is hidden until it is
   opened, it is collapsed on every load, and it is keyboard operable because it is a native
   disclosure. The word free, discount, bypass and skip payment appear nowhere near it. The code
   still goes in `x-durian-access` and is still checked server side.

6. **The three return states**, all driven in a browser: a session with answers saved generates
   immediately; a session with no answers says "Payment received. We do not have your answers on
   this device, so fill the questions in again and press Generate my report. You will not be
   charged twice," keeps the session and turns the button into Generate my report; a refused
   session says we could not confirm the payment and points at the contact page. It never says the
   payment failed, because we do not know that.

**Item 6 needed no change.** The report footer already reads "Cost per country report, generated
9 September 2026 by DURIAN Travel." The generation date has been there since brief 004, and the
brief forbids changing the report's content, so nothing was touched.

**Checks:**

- `grep -rn "sk_live\|sk_test\|price_" src/ functions/ dist/` returns nothing.
- Live endpoint: no session and no code returns 402; a made up session id returns 402; a malformed
  session id returns 402; a wrong access code returns 402; GET still returns 405. Every refusal
  carries the existing body.
- Navigation to Stripe verified for real: the button lands on `buy.stripe.com`, which shows
  "DRNTRVL Sandbox", the product "Full cost per country report" and **€5.00**.
- Answers confirmed written to `localStorage` before the navigation fires.
- Return with `?session_id=` verified: URL cleaned, id retained, button relabelled, request posted.
- Build passes, `grep -ri "azevedo" dist/` returns nothing, no console errors, no sideways scroll
  at 375px, 28 free comparison rows untouched, disclaimer present.

**Could not do, and why:**

**`claude/tech-stack.md` does not exist in this repository.** There is no `claude/` directory, and
git has never tracked one. `git log --all -- 'claude/*'` is empty. Brief 009 referenced
`claude/planners-audit-2026-09-06.md` the same way. Those files live wherever Cowork runs, not
here, so the "What is deliberately not in the stack" section could not be updated. It still needs
correcting: there is now payment verification in `functions/api/report.ts`, though still no
checkout endpoint and no webhook handler.

**For Cowork:**

- **The merge check contradicts the brief body.** The check says
  `grep -rn "sk_live\|sk_test\|price_\|buy.stripe.com" src/ functions/ dist/` returns nothing,
  but the body says to put the Payment Link in a named constant in the page file. A hosted link is
  a public navigation target: it has to reach the browser or the button cannot work, so it is
  necessarily in `src/` and in `dist/`. The part that matters passes: no secret key and no price id
  anywhere. `buy.stripe.com` appears exactly twice, the constant and the built HTML. For future
  sweeps the meaningful term is `sk_live\|sk_test\|price_`.
- **The session id cannot be made single use without storage.** Somebody can reuse or share their
  own id inside the 24 hour window. Stated as accepted in the brief, repeated here so it is not
  forgotten. Cloudflare KV closes it.
- **There are two buttons reading "Get the full report for €5"**, one on the offer card and one at
  the end of the questions. The card's button opens the questions; the one at the end takes
  payment. The brief specifies both labels, so I left them, but somebody may click the first
  expecting to pay. Worth a look.
- **Nothing can be charged yet.** The link is test mode and the account has payouts paused, so
  test cards only, for example 4242 4242 4242 4242. When the identity review clears, the live link
  and the live `STRIPE_SECRET_KEY` replace the test ones and nothing else changes.
