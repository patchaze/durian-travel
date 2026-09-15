# BRIEF

**Status: DONE**
**Written: 12 September 2026, by Cowork**
**Brief 014**

Promoted to the live work order by Claude Code on 15 September 2026, at Patricia's direct request, ahead of brief 013. Brief 013, the report's visual design, has not been written yet. Retiring `/services/` does not depend on it.

`/services/` is retired. Everything Durian sells is a tool, so `/tools/` becomes the commercial page.

---

## The decision, and why

Patricia asked Cowork to decide this. The decision is recorded here so it is not relitigated.

**The six packages go.** The Schengen Blueprint, The First Journey Package, The Family Expedition Bundle, The Nomad Infrastructure Plan, The Wellness Journey and The Grand Circuit carry **no price, no list of what the buyer receives, no turnaround and no format**. The only action available to a visitor is an enquiry, which costs Patricia an email exchange to discover the person wanted something she does not sell. They also compete with the €5 report, which is cheaper, instant and already built, and several are shaped as ongoing engagements when Patricia has said plainly that she does not take calls and wants to hand something over once.

**Nothing new is built here.** The site has never sold anything to a stranger. Building a second or third product before the first has a customer is the mistake `claude/decision-log.md` records being made three times already, each time by an outside plan that designed a platform for a business with no buyers. The report sells first. What it teaches decides what comes next.

## What to do

### 1. Retire the services section

- Delete `src/pages/services/index.astro`, `src/pages/services/[slug].astro`, `src/data/service-packages.json` and `src/data/service-pages.ts`. **These four are the only files this brief authorises you to delete.**
- 301 every services URL to `/tools/` in `public/_redirects`, both with and without the trailing slash: `/services/`, and the six package URLs `schengen-visa-help`, `first-international-trip`, `family-travel-planning`, `digital-nomad-visa-strategy`, `travel-health-planning`, `multi-region-trip-planning`.
- The existing redirects at lines 10 to 19 currently point at `/services/` and at `/services/schengen-visa-help/`. Repoint them all at `/tools/` so nothing chains through a page that no longer exists.
- Remove `Services` from `navLinks` in `src/components/Header.astro`, and from the footer.
- Remove every internal link to a services URL across the site, and every mention of a package by name.
- Check `astro.config.mjs` for sitemap exclusions referring to services and clean them up.

**The `Rx exclusive` badge on The Wellness Journey and the `health_layer` field on all six are the pharmacist positioning retired on 27 August 2026.** They go with the files. If that framing survives anywhere else on the site, list it in Done rather than fixing it here.

### 2. `/tools/` becomes the page that sells

`src/pages/tools/index.astro`. It already uses the right header, so keep it.

- The eyebrow currently reads "Free Planners". Everything there is no longer free, so change it to something that covers both. "Planners" on its own is fine.
- Restructure the body into two clearly separated groups:
  - **Free**, with the three free tools, each with one line saying what question it answers.
  - **Paid**, with the full cost per country report, its price from the existing constant, one line on what the buyer receives, and the fact that it arrives on screen immediately.
- Keep it short. The current services index runs to 1,669 words and that is the disease, not the symptom. This page should be scannable in under thirty seconds.
- The nav label stays `Planners` unless Patricia says otherwise.

### 3. Fix the header inconsistency Patricia found

Every page except services opens with `<section class="hero-sm hero-gradient">`, a `section-label` set to `color:var(--color-accent-light)`, and a white `hero-sm__title`. Confirmed on `about-us`, `sources`, `contact` and `tools/index`.

- Apply that exact pattern to any page that does not follow it. Services is going, so check the rest of the site for the same drift and list what you changed in Done.
- The orange eyebrow is the pattern. A page missing it is the bug.

### 4. Make `/tools/` the page people want to explore

Patricia's ambition for this page, in her words: something that pops out, that people can move and engage with, that makes them think "let me see how this works" and stay longer, without the page looking huge.

- Each tool card reveals what it does on hover and on focus. On a touch screen, on tap. Never a hover only effect, because most of the audience is on a phone.
- The paid report card opens a short **"what you get"** reveal: the sections of the report, as three or four short items that appear in sequence rather than all at once.
- Movement is quiet. Fades and small slides, nothing bouncing, nothing that moves while being read.
- **Honour `prefers-reduced-motion: reduce`.** Everything must be fully usable and fully visible with animation switched off.
- No animation library. CSS transitions and, where genuinely needed, a small `IntersectionObserver`.

The page still reads in under thirty seconds with every card closed. The reveals add depth for people who want it, not length for people who do not.

### 5. About Us needs a short answer at the top

`src/pages/about-us.astro` is 1,295 words across seven headings, and Patricia's point is that it never plainly answers who this is.

- Add a short summary directly under the `<h1>`, before anything else. Three or four sentences at most. It answers: who runs Durian Travel, what it does, who it is for, and what it does not do.
- **Authorship stays the organisation.** No name, no byline, no `Person` schema. The anonymity decision of 27 August 2026 holds. Write it as "we", and describe experience without naming anybody.
- "The team" heading currently implies a team. Durian Travel is one person writing as an organisation. Reword that section so it is not misleading, without naming her.
- Trim the rest hard. Seven headings for a page nobody scrolls is too many. Keep "What Durian Travel does", "Who we work with", and "What we are and what we are not". Fold or cut the rest.
- Remove any remaining mention of consultations, calls, or document review.

### 6. One line where the packages were

Anyone arriving on an old services URL lands on `/tools/`. They came looking for a service, so the page should acknowledge that in one sentence near the top, something close to: "Durian does not do consultations or document review. Everything here is a tool you use yourself, and one report you can buy."

No apology, no explanation of the history, one sentence.

## Why

A page selling six unpriced packages that nobody can order, for a business that no longer does the work, is worse than no page. It absorbs the attention of anyone genuinely interested and hands them nothing to act on. Moving the commercial weight onto `/tools/`, where the free tools earn trust and one report takes money, matches what Durian actually does and what Patricia is willing to deliver.

## Do not

- Do not build a new product, tool, or paid deliverable. Not one.
- Do not name Patricia anywhere on About Us or imply a team of people.
- Do not add an animation library, a carousel, a parallax effect, or anything that moves while somebody is reading it.
- Do not write a price for anything except the existing report constant.
- Do not delete any file other than the four named in item 1.
- Do not remove any redirect. Repoint the ones that need it and add the new ones.
- Do not reintroduce document review, readiness scoring, approval language, or any offer of a call, in any copy you write here.
- Do not change `/tools/cost-per-country/`, `/tools/cost-per-country/full-report/`, `/tools/budget/` or `/tools/do-you-need-a-visa/` beyond linking to them correctly.
- Do not change `functions/api/report.ts`, the Stripe verification, or the access code.
- Do not touch `public/_headers`, the CSP, or DNS. Only `public/_redirects`.
- Do not add a library or any new runtime dependency.
- Build to the `durian-deliverable-design` skill. Light only.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- Every page carries: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

## Check before you merge

- `grep -rn "Schengen Blueprint\|First Journey\|Family Expedition\|Nomad Infrastructure\|Wellness Journey\|Grand Circuit\|Rx exclusive\|health_layer" src/ dist/` returns nothing.
- Every old services URL 301s to `/tools/`, with and without the trailing slash, and none of them chains through a deleted page.
- No internal link anywhere points at a `/services/` URL.
- `/tools/` shows the free group and the paid group, and reads in under thirty seconds with every card closed.
- Every reveal works on a touch screen, and the page is fully usable with `prefers-reduced-motion: reduce` set.
- About Us answers who this is in its first four sentences, and `grep -ri "azevedo" dist/` still returns nothing.
- Build passes and `grep -ri "azevedo" dist/` returns nothing.

---

## Done

*Claude Code fills this in. Keep it to facts.*

**Completed on:** 15 September 2026
**Branch:** `brief/014-retire-services`

**What changed:**

1. **Services retired.** Deleted only the four named files. `public/_redirects`: the 20 old services rules now point straight at `/tools/`, and `/services` plus the six package URLs, with and without slash, 301 to `/tools/`. 69 rules, none removed, no chains. Services gone from the header; the footer link became Planners. `astro.config.mjs` had no services exclusion. Internal services links and package names removed from the homepage, contact form options, blog post footer cards, destination page schema, the visa guide and ten blog posts. Brief grep clean on `src/` and `dist/`. No `/services/` link in any built page. Link check: 0 broken.
2. **`/tools/`.** Eyebrow "Planners". Free group: visa check, cost per country, budget, one line each. Paid group: the report, `REPORT_PRICE` from `src/data/full-report.ts`, one line on what the buyer gets, "It opens on screen as soon as you pay." 153 words with cards closed, about 40 seconds read word for word (the required disclaimer is 14 of those).
3. **Hero pattern** applied to FAQ (was tinted), 404, thank you and the Schengen visa guide (none had the eyebrow). Hero titles on about-us, blog index, contact, destinations, FAQ, 404, thank you and the guide were rendering in Inter; all now use the serif like sources and `/tools/`.
4. **Reveals.** Cards open on mouse hover (fine pointers only), keyboard focus anywhere in the card, and tap on a "What it does" / "What you get" button. Paid card shows four report sections in sequence. CSS transitions only, no library, no observer. All motion sits inside `prefers-reduced-motion: no-preference`; without script every card is open. Checked in the browser: tap, keyboard Tab, closed heights.
5. **About Us.** Four sentence summary under the h1. Three sections kept. "The team", "Why DURIAN" and "How to Work With Us" cut. 1,295 words to 424. Written as "we", one person project stated without a name, no Person schema.
6. `/tools/` hero: "We do not run consultations or review documents. Everything here is a tool you use yourself."
7. Also changed, because the deletions made them untrue: homepage cards now show the planners and report; homepage trust list lost the partner network and 24/7 on-trip support claims; thank you page no longer promises "1–2 business days"; CLAUDE.md project map no longer lists the deleted files.

**Could not do, and why:**

- Browser tools cannot switch on reduced motion. Checked by reading the CSS instead: no opacity, transform or transition outside the no-preference block.

**For Cowork:**

- **Pharmacist framing still live:** `travel-health-kit-europe.md` tags and keywords, and its line 102.
- **Consultancy wording still live:** `privacy-policy.astro:36`; terms of service meta description; France, Spain and Croatia `metaDescription` in `countries.json`; `destinations.astro` description and line 80 ("arranged flawlessly").
- **Homepage still reads like an agency:** "What Our Clients Say" testimonials, "Why Clients Trust Us", "We build your Europe trip", process steps "We Build Your Plan" / "We design your itinerary", "hand you a plan", "See If We're Right For You". Needs its own brief.
- `how-to-write-visa-cover-letter.md:256` claims "client application experience". `visa-refusal-reasons.md:193` has a sentence close to approval language.
- `src/components/ServiceCard.astro` is now unused. Not deleted, outside the four files.
- `vercel.json` still has 40 services rules pointing at `/services/`. Legacy, untouched.
- Hero titles render at weight 800. The design skill and CLAUDE.md say 400. Left for brief 013.
- Hero drift left on purpose: homepage, blog posts, destination pages and the four tool pages this brief protects.
- Contact form still has an "Urgent, travelling" option.
- `claude/decision-log.md` and `claude/tech-stack.md` are not in this repo.
- Brief 013 is still unwritten.
