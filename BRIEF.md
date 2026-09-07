# BRIEF

**Status: DONE**
**Written: 6 September 2026, by Cowork**
**Brief 001**
**Amended: 7 September 2026, by Cowork.** Item 1 gained three safety lines, item 1b is new, and the "Do not" list grew. Nothing already written was removed or reordered.

This is the current work order from Cowork. Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section at the bottom and set the status to DONE. Do not ask Patricia to approve changes. The only question in this brief is item 3.

---

## What to do

### 1. Commit the corrected `CLAUDE.md`

Cowork rewrote `CLAUDE.md` on 6 September 2026. It now describes Cloudflare Pages as the host, explains the `api/` folder, corrects the chatbot description, and adds the `BRIEF.md` workflow and the automatic path to live at the top. `.claude/settings.json` was added at the same time so git and build commands run without prompts. Both are sitting uncommitted. Commit them on the current branch.

Three things to get right in this commit, added 7 September:

- `git status` shows `api/report.ts` and `api/_report.ts` already staged. Unstage them first with `git restore --staged api/` so they do not ride along. They wait for item 3.
- Stage by name: `git add CLAUDE.md .claude/settings.json`. Never `git add -A` and never `git add .` in this repo.
- Leave `My Account _ Billing.pdf`, `BUILD-BRIEF-001.md` and `CC-PROMPT-STEP-1.md` untracked. They are not part of the site and `.gitignore` does not cover them.

### 1b. One wrong sentence, on two pages

Added 7 September from the planners audit. The cost comparison uses Eurostat category A0111, restaurants and hotels. Both pages say so correctly, then two sentences later call it "economy-wide", which it is not. Fix the one sentence on each page and leave everything around it alone.

- `src/pages/tools/cost-per-country.astro`, line 131. Replace "This is an economy-wide price level, not a tourist basket." with "This is the price level for restaurants and hotels only, not a full tourist basket."
- `src/pages/sources.astro`, line 109. Replace "This is an economy-wide price level, not a basket of tourist prices." with "This is the price level for restaurants and hotels only, not a basket of every tourist price."

Do this on `fix/booking-and-cloudflare-cleanup` before item 2, so it goes live in the same merge. Commit it on its own with a plain message.

### 2. Get the fix branch live

`fix/booking-and-cloudflare-cleanup` is 9 commits ahead of `main` and has never been pushed. It carries real fixes the live site is still missing: internal SEO notes removed from the package pages, the Organization schema corrected, the budget presets filling the middle of the range, the Calendly embed replaced by the contact form.

Run the gates (`npm run build`, then `grep -ri "azevedo" dist/` must print nothing), push the branch, merge to `main`, push. Cloudflare deploys.

### 3. Decide what happens to `api/`

`api/report.ts` and `api/_report.ts` are staged but not committed. They are the paid Trip Budget Report generator, written as a Vercel Function. Cloudflare Pages does not run root `/api/` files, so this code cannot work on the current host.

Do not commit them as they are. Put the three options to Patricia, one question, and wait:

- **Port to a Cloudflare Pages Function.** Move the logic into `functions/report.ts`. Free tier gives 10 ms of CPU per request; measure the generator first. If it needs more, the paid Workers plan is USD 5 a month.
- **Let Make build the report after payment.** Removes all server code from the repo. Matches the "no fulfilment code in the repo" rule in `claude/tech-stack.md`.
- **Park it.** Unstage the files, leave them on `feat/report-generation`, and come back when the first paid product is decided.

Whichever she picks, record it in the Done section.

### 4. Small cleanups, only if time allows

- `.gitignore` has `*.html`. Confirm nothing in `public/` is being silently ignored.
- The folder name on disk is `Durian Travel ` with a trailing space. Not a code change, but note in Done whether Patricia wants it renamed to `durian-travel`.

## Why

Nothing on the live site can take money yet, and the fixes that unblock that are sitting unmerged on a local branch. The `CLAUDE.md` correction has to land first or every future session starts from wrong facts.

## Do not

- Do not touch the CSP beyond what is already on the branch.
- Do not add Stripe anywhere yet. That is a later brief.
- Do not delete the root clutter files without asking.
- Do not commit `api/` until Patricia has chosen.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `My Account _ Billing.pdf`, `BUILD-BRIEF-001.md` or `CC-PROMPT-STEP-1.md`.
- Do not change anything in `cost-per-country.astro` or `sources.astro` beyond the one sentence each in item 1b.

---

## Done

*Claude Code fills this in. Keep it to facts.*

**Completed on:** 7 September 2026
**Branch:** `fix/booking-and-cloudflare-cleanup` (items 1, 1b, 2) and `brief/001-report-pages-function` (item 3). Both merged to `main` and pushed. `main` is at `a9de9a7`.

**What changed:**

1. **Item 1.** `git restore --staged api/` first, then `git add CLAUDE.md .claude/settings.json` by name. Committed as `aef6368`. Left untracked, as instructed: `.claude/launch.json`, `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`. `My Account _ Billing.pdf` is not in this folder, so there was nothing to leave alone.
2. **Item 1b.** Both sentences replaced with the exact wording in the brief, committed as `2414df2`. The two paragraphs were rewrapped to keep the line width. Checked mechanically that every other word in both paragraphs is unchanged. `economy-wide` now appears nowhere in `src/`. The correction is right: `country-costs.json` gives the category as `A0111, restaurants and hotels`.
3. **Anonymity gate, resolved by decision.** `grep -ri "azevedo" dist/` printed two lines, both in `dist/_redirects`: the `/patricia-azevedo` to `/about-us/` 301s, which reach `dist/` because Astro copies `public/`. Pre-existing on `origin/main`, so already live, and not introduced by this branch. Put to Patricia. She chose to delete the redirect. Removed in `afe3854`. The gate now prints nothing. Accepted cost: `/patricia-azevedo/` returns 404 instead of passing visitors and link equity to `/about-us/`.
4. **Item 2.** Build passed, gate clean, branch pushed, merged to `main` with `--no-ff`, rebuilt and re-gated on `main` before pushing. Merge `1a218f0`.
5. **Item 3. Patricia chose PORT**, over parking it or moving generation into Make. The handler is now `functions/api/report.ts`, which Pages routes at `/api/report`, the same URL as before, so the existing `Disallow: /api/` in `robots.txt` still covers it. The calculation is now `src/lib/report.ts`, byte identical to `api/_report.ts` below the header comment, placed outside `functions/` because Pages routes every file under it. Measured before committing, as the brief asked: **0.082 ms of CPU per report against the 10 ms free tier limit**, so the USD 5 Workers plan is not needed. The generated report carries the required disclaimer, is `noindex`, names nobody, and contains no approval or readiness language. `isPaidRequest` still returns false, so the endpoint answers 402 to every caller. Astro stays `output: 'static'` with no adapter, still 77 pages. Merge `a9de9a7`.
6. **Item 4a.** Nothing in `public/` is being silently ignored. Ran `git check-ignore` over every file in `public/`: no matches, and all six files are tracked. `public/` contains no `.html` file at all, so the `*.html` rule currently bites nothing there. It would still bite a new standalone HTML tool, so the warning in `CLAUDE.md` stays true.

**Verified on the live site after deploy:**

| Check | Result |
| --- | --- |
| `POST /api/report` | 402 with the JSON refusal body, so the Pages Function is routing and `isPaidRequest` is doing its job |
| `GET /api/report` | 405, so the method check is running |
| `/patricia-azevedo/` | 404, the redirect is gone as decided |
| `/about-us/`, `/free-visa-audit/` | 200 |
| `economy-wide` on `/tools/cost-per-country/` and `/sources/` | 0 on both |
| `calendly` on `/free-visa-audit/` | 0 |
| Founder name across the homepage, about, services, sources, cost tool and audit page | 0 |

The Function did not answer for the first few minutes after the push. That was Cloudflare still building, not a fault. It came up on its own.

**Could not do, and why:**

- **The folder rename was not performed.** Patricia asked for `durian-travel`. Renaming the folder changes the working directory of the running session and the path Claude Code keys its history to, so doing it mid session would break the session that is doing it. It has to happen with no session open in the folder.
- **`api/` was left on disk, untracked.** It is now superseded by the port. Not deleted, because `CLAUDE.md` says to stop rather than delete files the brief did not ask to delete, and the brief only authorised choosing what happens to the code, which is done. Safe to delete whenever Patricia says so.

**For Cowork:**

- **A hard rule is being broken on the live site right now, and it is not from this brief.** `Express 48-hour document review` ships as a sellable add-on on `/services/` and `/services/schengen-visa-help/`, from `src/pages/services/index.astro:45` and `src/data/service-packages.json:54`. That contradicts "No document review under any product name." It is pre-existing on `origin/main` and outside this brief's scope, so it was left alone. It needs its own brief.
- **The anonymity gate needs rewording.** "It must print nothing" collided head on with the `/patricia-azevedo/` retirement redirect that `CLAUDE.md` itself says should exist. The gate should say what to do when the name is required by a redirect rule rather than leaking into a page. Resolved this time by deleting the redirect, at the cost above.
- **The name still appears in two tracked files**, neither of which reaches `dist/`: `astro.config.mjs:19`, now a dead sitemap exclusion for a page that no longer exists, and `vercel.json`, the rollback reference. The GitHub repo is public. Worth a decision.
- **`api/report.ts` and `api/_report.ts` were never committed anywhere.** The brief's "park it" option assumed they were safe on `feat/report-generation`. They were not on that branch, and `git log --all --diff-filter=A` finds them in no commit. They existed only as untracked files on one disk. They are now in git for the first time, at the new paths.
- **`package.json` carries dependencies the site does not use.** `@google/generative-ai` is dead weight now the chatbot is confirmed to be a keyword matcher with no model. `puppeteer`, `puppeteer-extra` and `puppeteer-extra-plugin-stealth` are only used by the root `setup-*.mjs` scrapers, and `vercel` is still a devDependency. All four install on every Cloudflare build.
- **Local Node is 22.14.0 while `.node-version` pins 24.20.0.** Local builds are not running the deploy runtime. It built clean on both here, but the two are not the same check.
- **`npx wrangler` cannot run on this machine.** `~/.npm/_cacache` contains root owned files, so any `npx` install fails with EACCES. That is why the Pages Function was verified against the live deploy rather than locally first. The fix needs a password, so it was not run: `sudo chown -R 501:20 ~/.npm`.
- **A stale `.git/index.lock` dated 6 September was blocking every git write** in the folder. Empty file, no git process running, left over from an interrupted command. Removed.
- **The branch was tracking `origin/main` rather than itself** before it was pushed, which is why `git status` reported "ahead 5" while the brief said 9. Both were right: 9 ahead of local `main`, 5 ahead of `origin/main`, because local `main` was 4 behind.
- **Five review agents went over the branch before the merge** on hard rules, anonymity, code correctness, deploy config and copy. They raised 14 findings; every one was traced back to `origin/main` and refuted as pre-existing rather than introduced here. The two worth knowing about are the document review add-on above and the budget tool's `Comfortable` 380 ceiling, which is not published in the guide the page links to. Both pre-existing, both untouched.
