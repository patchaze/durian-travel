# BRIEF

**Status: DONE**
**Written: 8 September 2026, by Claude Code at Patricia's request**
**Brief 003**

Promoted to the live work order by Cowork on 8 September 2026, after brief 002 was marked DONE. Number unchanged. Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE.

**Both open questions in this brief are answered.** Patricia decided item 6 and the flagged blog post on 8 September 2026, and her answers are written into those two sections. There is nothing left in this brief to ask her about. Recorded in `claude/decision-log.md`.

**A note to whoever runs this, because the wording could trip the halt rule.** `CLAUDE.md` says to stop if a brief asks for a readiness score, an approval claim, or document review. This brief asks you to **remove** all three. That is the opposite of the halt condition. Do not stop over it.

**Overlap with brief 002.** Brief 002 adds a section to `src/pages/sources.astro`. This brief does not touch that file. Run them in order and there is no conflict.

---

## Why

The site is still selling the hands-on Schengen document review business that Patricia retired. Not in one forgotten corner: in **151 places across 23 files**, including the chatbot on 76 of the 77 built pages, the template behind all 30 destination pages, and the homepage FAQ schema that Google and AI assistants quote directly.

Some of it is worse than stale copy. The homepage tells visitors, in bold, that document review "significantly reduces refusal risk". That is a claim about changing an embassy outcome, attached to a service that no longer exists.

Found by a seven-angle audit on 7 September 2026. Line numbers are from that date. If a line has moved, search for the quoted text instead.

---

## What to do

### 1. The chatbot, which offers the retired service on 76 of 77 pages

`src/components/ChatBot.astro`. It is a keyword matcher with hand written answers and no model behind it. Keep it that way.

| Line | The problem |
| --- | --- |
| 278 | "we review your current visa preparation strategy and identify the specific areas you need to strengthen before you submit" |
| 277 | `keywords: ['free audit', 'readiness', ...]` makes readiness a thing the site sells. Retire the trigger with the answer. |
| 224 | "decode your refusal letter and build a stronger application for resubmission" |
| 236 | "help freelancers, contractors and business owners work out which documents to gather and how to present them" |
| 206 | "We help you prepare the strongest possible application" |
| 218 | "educational guidance on how to prepare your application" |
| 212 | "DURIAN is an educational visa application strategy consultancy" |
| 266 | "how coherent your application looks" |
| 299 | "we will tell you plainly if your visa type is outside what we cover" |
| 76 | Input placeholder invites document questions: `Ask about visas, documents, budget...` |

The rule to write to: the chatbot may explain how the system works and link to a published guide. It may not offer to look at anything belonging to the visitor, and it may not say anything about how strong an application is.

### 2. The destination template, one sentence on 30 pages

`src/pages/destinations/[slug].astro` line 194. One sentence breaks three rules at once. It sells "a comprehensive visa document review, cover letter strategy", it calls the business a "personalized consultancy", and it ends "seamlessly arranged", using a banned word.

Replace the whole paragraph. Suggested, adjust to fit:

> Planning a trip to {country.name} means more than picking cities. You need to know how the border rules work, what the trip will cost, and how long to spend in each place. Our free guides cover all three. Start with the {country.name} guide above, then use the budget planner to price it.

Also lines 68 to 71: the `instrument` block in the JSON-LD names "DURIAN Travel Consulting" as a `Service`. Repoint or remove it depending on what survives item 6.

### 3. The homepage

`src/pages/index.astro`. Every item below appears **twice**, once in the visible FAQ and once in the FAQ JSON-LD. Fix both copies or the claim stays live in the schema Google lifts.

- **Line 48.** Service card: "We review your documents, identify refusal risks, and prepare your application so it meets strict embassy requirements." Delete or rewrite for the paid call.
- **Lines 173 and 487.** "Working with an experienced consultant for document review significantly reduces refusal risk." Cut that sentence. Keep the first half of the answer, which is accurate: no one can guarantee a Schengen visa, and the embassy decides.
- **Lines 157 and 479.** "Expert Schengen visa document review services highly recommend using placeholder reservations."
- **Line 86.** "Go to Europe with a clean itinerary, approved visa documents, and a support line." "Approved visa documents" implies an approval.
- **Lines 141 and 165.** Em dashes used as punctuation.

Sweep the whole `faqSchema` array rather than patching single answers.

**Exact replacement copy for the five hard claims. Use these, do not invent your own.** Patricia approved the wording on 8 September 2026. Everything else in this brief you write yourself, against the rules in "Do not".

*Line 48, the "Schengen Visa Strategy" service card.* Retitle it "Schengen Visa Preparation" and replace the body with:

> A checklist of every document the consulate asks for, with the official source linked beside each one, so you can check your own paperwork before you book an appointment. We never see your application and the embassy decides the outcome.

*Line 81, the "We Build Your Plan" step.* Replace the body with:

> We design your route, tell you which border rules apply to your passport, and show you where the official sources are. Written by a person who lives here, not generated from a template.

*Line 86, the "Travel With Confidence" step.* Replace the body with:

> Go to Europe knowing your route, what each day costs, and how the border rules apply to your passport. If something changes on the ground, you already know where to check.

*Lines 157 and 479, the flight reservation answer.* Keep the answer, replace only the last sentence with:

> A refundable reservation covers the requirement without putting your money at risk before the decision comes back.

*Lines 173 and 487, the guarantee answer.* Replace the whole answer with:

> No agency, consultant, or immigration lawyer can legally guarantee a Schengen visa approval, as the final decision rests solely with the consular officers of the European embassy. Anyone who quotes you an approval rate is selling you something they cannot deliver. What you can control is whether your own paperwork is complete and consistent, and the official consulate checklist for your country is the only list that counts.

Apply each of these to both copies, the visible one and the one inside `faqSchema`.


### 4. The FAQ page

`src/pages/faq.astro`, same pattern, visible copy and schema both.

- Lines 57 and 58: "refusal analysis and reapplication strategy is one of our core services"
- Lines 41 to 43: "What is the Free Visa Readiness Audit?" and its answer
- Lines 61 and 62: self-employed financial proof documentation
- Lines 37 and 38: "We help you prepare the strongest possible application"
- Lines 50 and 51: "our document strategy principles"
- Lines 67 and 68: the visa agency comparison
- Lines 12, 13, 18, 28: dashes as punctuation

### 5. Retire "Readiness Audit" as a product name

"Readiness" is on the banned list in `CLAUDE.md`, and this is a named product built on it. It appears in:

- `src/pages/contact.astro` lines 10 and 127
- `src/pages/404.astro` line 27
- `src/components/CTABanner.astro` lines 13, 14, 15: "Ready to apply with confidence?", "Book a free 15-minute visa audit. We'll review your strategy", "Book Free Audit". This banner is on many pages.
- `src/pages/services/[slug].astro` line 78
- `src/pages/blog/[...slug].astro` lines 150 to 163
- `src/content/blog/europe-trip-planning-timeline.md` line 163
- `src/data/service-packages.json` lines 87 and 318, and `src/pages/services/index.astro` lines 86 and 327: "readiness assessment" inside packages

`src/pages/free-visa-audit.astro` is the page all of this points at. Decide with item 6 whether it becomes the booking page for the paid call or goes away.

`src/pages/tools/visa-checklist.astro` line 10 already carries a comment explaining why the site states facts rather than scoring readiness. That is the principle. Apply it everywhere else.

### 6. The package line. **Answered by Patricia. Act on it.**

This part cannot be fixed by rewriting sentences. Two of the seven packages **are** the retired business, end to end.

- **The Recovery Route** (`src/data/service-packages.json` lines 251 to 307) is post refusal reapplication. Its deliverables include refusal letter interpretation, root cause analysis of the visitor's own refusal, a new cover letter addressing the refusal reason, strengthened financial proof coaching, appeal letter drafting, embassy switching strategy, and a 48 hour expedited turnaround. There is no version of this package that is not document review.
- **The Schengen Blueprint** (lines 26 to 64) sells "Document stack review + written gap report", "Cover letter written and reviewed", "Financial proof coaching", "Real refusal-prevention review", "Express 48-hour document review", and "Refusal analysis + reapplication strategy".

The other five carry the same language in individual bullets and can be rewritten. `src/data/service-pages.ts` (26 findings) and `src/pages/services/index.astro` (12) mirror all of it in meta titles, meta descriptions and SEO fields.

**Patricia answered on 8 September 2026. Do not ask again, do not stop here.**

Her decision: **retire The Recovery Route. Keep The Schengen Blueprint but rebuild what it sells. Keep the other five and rewrite their copy.** This replaces the three options that were put to her. It is recorded in `claude/decision-log.md`, 8 September 2026.

**The Recovery Route: retire it.**

- Remove the package from `src/data/service-packages.json` (lines 251 to 307 as of 7 September) and from the category list at line 11 that names it.
- Remove it from `src/pages/services/index.astro` (line 251) and from the "quick way to choose" paragraph at line 501, which currently tells people to pick it if they have already been refused.
- Remove its entry from `src/data/service-pages.ts` if one exists there.
- 301 its URL to `/services/`, not to another package page.

**The Schengen Blueprint: keep the package, rebuild what it sells.**

- It stays paid. Every deliverable that is document review comes out: "Document stack review + written gap report", "Cover letter written and reviewed", "Financial proof coaching", "Real refusal-prevention review", "Express 48-hour document review", "Refusal analysis + reapplication strategy".
- What it becomes is already written and already decided, in `claude/master-strategy.md` section 5.4 and the decision of 1 September 2026: a self checked preparation checklist, with the official embassy or consulate source linked beside each document. The visitor checks their own work. Durian Travel never looks at anything belonging to them.
- No score, no percentage, no risk analysis, no financial review. If a replacement deliverable cannot be written without one of those, drop the deliverable rather than soften the wording.
- Rename it if "Blueprint" stops describing what it sells. Your call. Keep the URL or redirect it.

**The other five: keep the packages, rewrite the copy.** The same rule applies to their bullets, meta titles, meta descriptions and SEO fields in `src/data/service-pages.ts` and `src/pages/services/index.astro`.

**The redirect chain has to be repointed either way.** `/services/document-review` and `/services/cover-letter-strategy` already 301 to `/services/schengen-visa-help/`, and that page still sells document review twice, so the retirement redirect currently leads straight back to the retired product. Either fix the destination page or repoint both redirects at `/services/`.

Record what you did in Done.

### 7. Live blog posts

- `src/content/blog/how-much-does-schengen-visa-cost.md` line 115, "Does paying more improve your approval chances?", and line 119, "What actually improves your chances is:". Reframe to what the fee does and does not buy.
- `src/content/blog/visa-refusal-reasons.md` line 5, description promises "the fixes that usually strengthen a reapplication".
- `src/content/blog/how-to-switch-travel-agencies-schengen.md` line 5, "safely migrate your Schengen visa application to a new travel agency". Consider retiring this post entirely. It only makes sense for the retired business.
- `src/pages/blog/index.astro` line 23 still advertises "cover letter strategy, and refusal analysis".

### 8. Check the disclaimer is actually on every visa page

Every piece of visa content must carry: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

`src/components/CTABanner.astro` line 38 currently says "Educational guidance only. Not legal advice." which is a different sentence. Standardise on the required wording and list any visa page missing it.

### 9. Dashes and banned words

The audit counted 18 em dashes used as punctuation in `service-packages.json`, 18 spaced hyphens in `services/index.astro`, and 8 in `service-pages.ts`, plus more on the homepage and the FAQ page. `CLAUDE.md` says rewrite the sentence rather than keep the dash.

Banned words in the built site: "seamless" on 29 pages, almost all from the destination template in item 2, and "unlock" on 2. Clear both.

---

## Flagged, and now authorised

`src/content/blog/best-schengen-travel-agency.md` is `draft: true`, so none of it is live. It contains a fabricated survey of "100 Users Surveyed" with invented percentages, a comparison table of five agencies that appear to be invented, and the sentence "the best agencies maximize your approval odds (often above 95%)". That is the same shape as the "98% Schengen Approval Rate" claim removed on 26 August 2026, sitting one `draft: false` away from publication.

Patricia's instruction, given 8 September 2026: **delete the file.** This is the authorisation `CLAUDE.md` asks for. Nothing in it is salvageable, so do not strip the fabricated parts and keep the rest. Delete it, then check nothing links to its slug.

---

## Do not

- Do not give the chatbot a model, an API key or a network call. It stays a keyword matcher.
- Do not write any replacement copy that promises or implies an approval, quantifies a chance, mentions refusal risk, or scores readiness. The point of this brief is removing that shape, not renaming it.
- Do not add a byline, an author page or `Person` schema while editing schema blocks. Authorship stays "Durian Travel Editorial Team".
- Do not invent a statistic, price, law or date in any replacement copy.
- Do not use a dash as punctuation in anything you write.
- Deletions authorised by Patricia on 8 September 2026, and no others: The Recovery Route package, and the file `src/content/blog/best-schengen-travel-agency.md`. Do not delete any other package or any other file.
- Do not touch `src/pages/tools/budget.astro` or `src/pages/sources.astro`. Brief 002 owns both.
- Do not touch the CSP in `public/_headers`, payments, or DNS.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json` or the untracked `api/` folder. `api/` is superseded by `functions/api/report.ts` and is waiting on Patricia's word to delete.

---

## Gate before merge

Added 8 September 2026. Run these after the edits and before merging to `main`, on top of the gates already in `CLAUDE.md`. Write the actual numbers into Done. **A count that is not zero means the brief is not finished.**

These are the counts measured on 8 September 2026 against the `dist/` in the working tree, so you have the "before" figure without re-running it. Show both numbers in Done.

| Check | Before | Target |
| --- | --- | --- |
| 1. Retired service named | 99 | 0 |
| 2. Outcome claims | 12 | 0 |
| 3. Banned words | 35 | 0 |
| 4. Dashes in the touched files | 55 | 0 |
| 5. Anonymity | 0 | 0 |
| 6. Recovery Route named | 5 files | 0 |
| Disclaimer present | 76 of 77 pages | 77 of 77, minus the exception below |

Two things already known from that baseline, so you do not have to work them out:

- The only built page without the disclaimer is `dist/about/index.html`, which is the three line 301 to `/about-us/`. It has no content and needs no disclaimer. Leave it alone and note it in Done.
- The Recovery Route is named on five built pages: `contact/`, `services/`, `services/visa-refusal-reapplication/`, `blog/visa-refusal-reasons/` and `blog/how-to-write-visa-cover-letter/`. `services/visa-refusal-reapplication/` is its own page and has to be retired and redirected to `/services/`, not just unlinked.

```bash
npm run build

# 1. The retired service is gone from the built site
grep -rioE "document review|readiness audit|visa readiness|readiness assessment|refusal analysis|reapplication strategy|cover letter strategy" dist/ | wc -l

# 2. Nothing claims to change an outcome
grep -rioE "refusal risk|approval odds|approval rate|approval chances|improve your chances|stronger application|approved visa documents" dist/ | wc -l

# 3. Banned words
grep -rioE "seamless|unlock|dream trip|effortless|game.changer" dist/ | wc -l

# 4. Dashes as punctuation in the files this brief touched
grep -rnP "[\x{2013}\x{2014}]" src/pages/index.astro src/pages/faq.astro src/data/service-packages.json src/data/service-pages.ts src/pages/services/index.astro src/components/ChatBot.astro src/components/CTABanner.astro | wc -l

# 5. Anonymity, the existing gate
grep -ri "azevedo" dist/ | wc -l

# 6. The retired packages are unreachable
grep -ril "Recovery Route" dist/ | wc -l
```

**The one allowed exception.** A page may legitimately use one of these phrases while explaining that the thing is not true, for example a blog post saying no one can quote you an approval rate. If a count will not go to zero for that reason, do not force it. Write in Done the exact file, the exact line, and why it stays. Anything you cannot justify that way, remove.

**Item 8, the disclaimer, checked the same way.** List every built page under `/blog/`, `/destinations/`, `/services/` and the visa guide that does **not** contain the exact sentence "Educational information only. Not legal advice. Always check the official embassy or consulate source." Add it where it is missing, and record in Done how many pages you added it to.

---

## Done

*Claude Code fills this in. Keep it to facts.*

**Completed on:** 8 September 2026
**Branch:** `brief/003-retire-document-review`, merged to `main`

**What changed:**

1. **Chatbot.** Rewrote nine answers and the input placeholder. Retired the `audit` topic and its `readiness` / `free audit` triggers; that question now falls through to the standard fallback. Still a keyword matcher, no model, no key, no network call. Verified live: "was refused", "guarantee approval", "I am a freelancer" and "free readiness audit" all return compliant answers.
2. **Destination template.** Replaced the paragraph on all 30 pages with the suggested wording plus links to the budget planner and the visa guide. Repointed the JSON-LD `instrument` from "DURIAN Travel Consulting" to "Durian Travel trip planning".
3. **Homepage.** Fixed every listed claim in the visible FAQ and the `faqSchema` copy, including "significantly reduces refusal risk" and "Expert Schengen visa document review services". Rewrote the service card, the three process steps and two trust-list items. Cleared all em dashes from visible copy.
4. **FAQ page.** The visible list renders from `faqSchema`, so there is one copy, not two. Rewrote eight answers and retired the "Free Visa Readiness Audit" question.
5. **"Readiness Audit" retired** everywhere: CTABanner defaults, contact, 404, services/[slug], services/index, blog/[...slug], blog/index, terms-of-service, about-us, schengen-visa-guide, and the planning-timeline post.
6. **Packages.** The Recovery Route removed from `service-packages.json`, the tier list, `service-pages.ts` (SEO block plus the slug, icon and tone maps) and the services index. Its URL and both aliases now 301 to `/services/`. The Schengen Blueprint keeps its name and URL and now sells a checklist the visitor completes themselves with the official source linked beside each item; every document-review deliverable is gone. The other five rewritten.
7. **Blog posts.** Reframed the fee section of the cost post around what the fee buys. Rewrote the descriptions of the refusal-reasons and switch-agencies posts, and the switch-agencies summary that claimed a refusal "will stay on your Schengen record". Removed both remaining links to the Recovery Route package. Retitled the "Cover Letter Strategy" heading in the requirements post.
8. **Disclaimer.** Standardised CTABanner on the required sentence. All 74 built pages that mention a visa carry it *visibly*, checked with the chatbot's own hidden copy excluded.
9. **Dashes and banned words.** The five files the brief named are clear of dash-as-punctuation. "seamless" and "unlock" are both at zero pages in `dist/`.

Two things beyond the literal instruction, both flagged rather than silent:

- **`services/index.astro` held a second hand-written copy of all seven packages.** That duplication is why the retired wording survived there. It now derives from `service-packages.json` via `service-pages.ts`. About 430 lines of duplicated data removed; rendered output verified unchanged in shape.
- **`/free-visa-audit/` renamed to `/book-a-call/`** with 301s from both forms. The page content was already clean; only the slug still carried the retired product name in a URL Google indexes. Deleting it was not authorised, so it moved rather than went away. Revert by renaming back and dropping two redirect lines.

**Could not do, and why:**

- **`claude/master-strategy.md` and `claude/decision-log.md` do not exist in this repo.** Neither does a `claude/` folder. I built the Schengen Blueprint replacement from the description in this brief instead. If section 5.4 says something more specific, the Blueprint deliverables are the thing to re-check.
- **`how-to-switch-travel-agencies-schengen.md` was not retired.** The brief says "consider retiring this post entirely", but the Do-not list authorises exactly two deletions and this is not one. I rewrote the description and the summary instead. It still only makes sense for the retired business. Your call.
- **1,305 em dashes remain in the 29 destination guides** (`src/content/destinations/`), between 16 and 44 per file. Item 9 scoped the dash work to `service-packages.json`, `services/index.astro`, `service-pages.ts`, the homepage and the FAQ page, and those are done. Mechanically swapping 1,305 dashes for commas would wreck the prose, so this needs its own brief.

**For Cowork:**

- **`/patricia-azevedo/` has no rule in `public/_redirects`.** It is in `vercel.json` and in the sitemap exclusion list, but Cloudflare is the live host, so that URL 404s today instead of redirecting to `/about-us/`. It touches the anonymity constraint. One line fixes it; it was outside this brief so I left it.
- **The homepage carries three named testimonials** (`src/pages/index.astro` lines 11 to 22): "Emily & James", "Sarah M.", "Mark T.", with quotes. Same shape as the fabricated survey Patricia ordered deleted. Not listed in the brief and not an authorised deletion, so they stand. Worth checking whether they are real.
- **`api/` is still uncommitted and still Vercel-shaped.** Untouched, as instructed. `functions/api/report.ts` exists in the repo and supersedes it.
- **`vercel.json` was mirrored** with the redirect changes, because it is the rollback target until 18 September 2026 and `/free-visa-audit/` would otherwise 404 there after the rename.
- **The package count is now six, not seven.** Any copy elsewhere that says "seven packages" needs updating.
- `src/pages/services/index.astro` has one em dash left, in CSS `content: '— '`, used as a decorative list marker rather than punctuation. Left alone deliberately.
