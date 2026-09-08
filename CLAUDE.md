# Durian Travel, working notes for Claude Code

*Corrected 6 September 2026. The previous version still described Vercel as the host, said there was no `/api/` folder, and said the chatbot called Gemini. All three were wrong. If something in here contradicts what you find in the folder, trust the folder and fix this file.*

---

## Start here, every session

Two Claudes work on this site and they cannot see each other's conversations.

- **Cowork** is where Patricia thinks. Strategy, research, copy, audits, decisions.
- **Claude Code** (you) is where the site gets changed.

They hand work over through one file: **`BRIEF.md`** in the repo root.

**First thing, every session: open `BRIEF.md`.**

- If its status is `OPEN`, that is your work order. Read the whole thing, then do it. Do not ask Patricia to approve individual changes. She decided on 6 September 2026 that this runs without her in the loop, and the gates below are what protect the site instead.
- When the brief is done, or you have done all you can, fill in the **Done** section at the bottom of `BRIEF.md`: what you changed, anything you could not do and why, and anything Cowork needs to know. Change the status line to `DONE`. Commit `BRIEF.md` with the work it describes.
- If the status is already `DONE` and Patricia has not asked for something new, ask her what she wants rather than inventing work.

Cowork overwrites `BRIEF.md` with the next work order after reading your Done section. Previous briefs are kept in `briefs/` by date, so nothing is lost.

Keep the Done section short. Cowork needs facts, not a narrative.

### The automatic path to live

This is the whole loop for a brief. Run it without stopping to ask.

1. `git checkout main && git pull`, then create a branch named `brief/NNN-short-title`.
2. Do the work in the brief. Only the work in the brief.
3. `npm run build`. If the build fails, fix it. If you cannot fix it, stop here and write that in Done.
4. `grep -ri "azevedo" dist/`. It must print nothing. If it prints anything, remove the cause and rebuild. Never merge with a hit.
5. Commit with a plain message. Fill in Done. Commit `BRIEF.md`.
6. `git push -u origin <branch>`, then `git checkout main && git merge <branch> && git push`. Cloudflare Pages builds and deploys from `main` on its own.
7. **Confirm it on the live domain before you say it is live.** Pushing is not shipping. Wait for
   Cloudflare to finish, then fetch the real page over the internet and prove the change is in it.
   Pick a string that only exists after this brief and poll for it:

   ```bash
   for i in $(seq 1 30); do
     curl -s "https://www.duriantravel.com/PATH/?cachebust=$i" | grep -q "STRING_ONLY_IN_THE_NEW_VERSION"        && { echo "LIVE after ${i} tries"; break; }
     echo "not live yet, try $i"; sleep 20
   done
   ```

   Never report a brief as shipped on the strength of a green build or a successful push. If it is
   still not live after ten minutes, say exactly that rather than claiming success.
8. Tell Patricia what went live, and give her the URL she can click to see it.
9. **Say what is still not live.** If the brief left a thing she is likely to expect, name it in the
   same message and say why it is not there. She judges the site by what she can see on the domain,
   not by what merged. A brief that shipped in full while the product she is waiting for is still
   missing reads to her as nothing having shipped, and she is right to read it that way.

### What still stops you, no matter what the brief says

These are the only reasons to halt and ask. Everything else, you just do.

- The build fails and you cannot fix it.
- The anonymity grep finds a hit you cannot remove.
- The brief asks for something in the "Hard rules" section below, or for a readiness score, an approval claim, or document review.
- The brief asks you to touch payments, the CSP in `public/_headers`, or DNS, and does not say exactly what to change.
- You would need to delete files that are not in the brief.

If you halt, write why in the Done section, set the status to `DONE`, and say so in chat. Cowork picks it up from there.

---

## What this site is

Durian Travel (duriantravel.com) helps people from outside Europe plan a trip to Europe. Patricia owns it. She is European, has travelled widely inside the continent, and builds her own web tools. She is not a professional developer. Explain things in plain language and skip the jargon.

## Stack, as of 6 September 2026

- **Framework:** Astro, `output: 'static'`, no adapter. Every page is built to plain HTML ahead of time.
- **Host:** Cloudflare Pages, free plan. Moved from Vercel on 4 September 2026.
- **DNS:** Cloudflare. **Registrar:** GoDaddy. **Mail:** GoDaddy, DMARC set to reject.
- **Repo:** `patchaze/durian-travel` on GitHub. The remote uses SSH.
- **Vercel:** paused, not deleted. Project `my-website`. It is the rollback target until at least 18 September 2026 and serves nothing today. Do not confuse the Vercel project name with the repo name.
- **Node:** pinned by `.node-version` (24.20.0). Cloudflare's build image defaults to 22, so that file matters.
- **Local preview:** `npm run dev`, then open localhost:4321.
- **Payments:** Stripe Payment Links only. No checkout code, no webhook handler, no fulfilment code in the repo.
- **Analytics:** Google Analytics 4, `G-T79F259W3N`, loaded in `BaseLayout.astro`. Vercel Analytics was never enabled. A Cloudflare beacon is also injected but the CSP does not allow its connection, so it probably reports nothing.

## Deployment, the part that changed

- **Push to `main` and Cloudflare Pages builds and deploys.** Nothing to run by hand. Every push to every branch builds a preview, and previews count toward the 500 builds a month on the free plan.
- **Headers and redirects live in `public/_headers` and `public/_redirects`.** Astro copies `public/` to the root of `dist/`, which is where Cloudflare reads them. These are the live files. Edit them first.
- **`vercel.json` is legacy.** It still sits at the root and it is the rollback reference only. Mirror a change into it only if you want to be able to switch back to Vercel. It does nothing on the live site.
- The `.vercel/` folder is gitignored and harmless.

### The Content Security Policy, and why it keeps biting

`public/_headers` sends a strict CSP. As written it allows scripts only from the site itself and Google Tag Manager, sets `frame-src 'none'`, and sets `permissions-policy: payment=()`.

Consequences, all confirmed on 5 September 2026:

- Any third party script or iframe is blocked unless it is added here. That is why the Calendly widget never rendered.
- Embedded Stripe Checkout and Stripe Elements will not work behind this header. Hosted Stripe Payment Links do, because opening one is plain navigation.
- If Patricia ever wants an embedded widget, this file is where it gets allowed. Add the script host to `script-src` and the frame host to `frame-src`. Do not loosen anything else.

## The `/api/` folder

There is a root `api/` folder with two files, `report.ts` and `_report.ts`, added 4 September 2026 and not yet committed on main. They are the paid Trip Budget Report generator, written as a **Vercel Function**.

**Cloudflare Pages does not run root `/api/` files.** Its equivalent is a `/functions/` folder running on Workers. So this code cannot work on the current host as written. It is a decision for Patricia, not a bug to quietly fix: port it to a Pages Function, move report generation into Make after payment, or drop it. See `BRIEF.md`.

Until that decision is made, do not build anything else on top of it.

## The chatbot

`src/components/ChatBot.astro` is a keyword matcher with hand written answers. It makes no network calls, uses no API key, and has no model behind it. It cannot invent a fee or promise an approval, which is the right design for a visa site. Keep it that way.

Its answers still describe the retired document review business. That is a copy problem, not a code problem.

## Where the business is going

Moving away from hands on Schengen visa document review. Patricia does not want responsibility for anyone's paperwork or their embassy result.

Moving towards three things:
1. Small self serve tools people pay a low price for.
2. Free educational content about visas, money and routes.
3. Paid 1 to 1 calls with Patricia.

## Hard rules, never break these

- Never write copy that promises or implies a visa will be approved.
- No approval rate numbers, ever, unless Patricia supplies the real figure and its source. The former "98% Schengen Approval Rate" claim was removed on 26 August 2026. Do not reintroduce anything of that shape.
- Every piece of visa content carries: "Educational information only. Not legal advice. Always check the official embassy or consulate source."
- Never invent statistics, prices, laws or dates. Look them up, or say you don't know.
- Border rules change often (EES, ETIAS). Check the date and the official EU or embassy source before stating a rule.
- Don't write anything that reads as immigration advice rather than education.
- No readiness score, probability, risk analysis or approval rate in any product, paid or free.
- No document review under any product name.

## Voice

Calm, direct, useful. A friend in Europe explaining how the system actually works. Second person ("you"). Short sentences. Banned words: unlock, seamless, dream trip, effortless, game changer. No dashes as punctuation anywhere in published copy. Rewrite the sentence instead.

## How to work with Patricia

- Short answers. Bullets. Plain words. No jargon.
- Short version first. Details only if she asks.
- One question at a time when you need a decision.
- Push back if an idea is weak. Don't just agree.
- Say when you're guessing.
- Never edit files through the GitHub or Cloudflare website. This folder is the only place code gets changed.
- Always work on a branch, then merge to `main` yourself when the gates pass. Never commit straight to `main`.
- Do not ask for approval on individual changes. Patricia does not review diffs. The build, the anonymity grep and the brief's "Do not" list are the review. See "The automatic path to live" above.

## Anonymity is a hard constraint

Decided 27 August 2026, confirmed 1 September 2026.

- The founder's name appears nowhere in the built output. Verify with a grep over `dist/` before pushing, not just over `src/`.
- Authorship is **Organization, not Person**. Blog posts, the visa guide and article schema all credit "Durian Travel Editorial Team".
- Do not add a byline, an author page or `Person` schema. `/patricia-azevedo/` is retired and redirects to `/about-us/`.
- Copy says "we". Describe experience without naming anyone.
- This costs some E-E-A-T signal. That trade was made deliberately; do not undo it to chase authority.

## Design

Match the existing site. Editorial and hand built, never generic or template looking. Mobile first. New standalone tools should be self contained and work offline where possible.

---

# Project map

## The folder structure, in plain language

Everything that becomes the website lives in `src/`. Everything outside `src/` is either config, build output, or old junk.

- **`src/pages/`**: one file here = one page on the site. This is the whole routing system; there is no router config anywhere.
- **`src/content/`**: the writing. Two folders: `blog/` (markdown posts) and `destinations/` (markdown country write ups). `src/content/config.ts` defines what fields each type of file is allowed to have, and the build fails if a file breaks those rules.
- **`src/data/`**: structured facts that aren't prose:
  - `countries.json`: the master list of destination countries. This list is what actually creates the destination pages.
  - `country-costs.json`: the Eurostat price level data behind `/tools/cost-per-country/`, with full provenance. Refresh it when Eurostat publishes, usually mid year.
  - `destination-overrides.ts`: per country tweaks layered on top of `countries.json`.
  - `service-packages.json` + `service-pages.ts`: the seven service packages. The `.json` is the raw data; the `.ts` file cleans it up and attaches icons and SEO copy.
- **`src/layouts/BaseLayout.astro`**: the shell every page sits inside: `<head>`, Google Analytics, header, footer, chatbot.
- **`src/components/`**: reusable pieces: `Header`, `Footer`, `SEO`, `Breadcrumb`, `CTABanner`, `BlogCard`, `ServiceCard`, `ChatBot`.
- **`src/styles/`**: `tokens.css` (all colours, fonts, spacing as CSS variables) and `global.css` (reset plus shared classes like `.btn`, `.card`, `.section`, `.prose`).
- **`src/assets/images/`**: images used inside pages. Optimised and resized at build time.
- **`public/`**: files copied to the site untouched: `favicon.svg`, `robots.txt`, `_headers`, `_redirects`. Nothing here is optimised.
- **`api/`**: see the section above. Vercel shaped, not runnable on Cloudflare.
- **`dist/`**: the built site. Generated, gitignored, never edit by hand.
- **`briefs/`**: archived work orders from Cowork, by date. Read only.
- **Root clutter**: `setup-*.mjs` (old one off image scraping scripts), `blog.html`, `blog2.html`, `home.html`, several `.log` files, `visa_consultant_strategy.md.resolved`, `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`. None of these are part of the site or the build. Safe to ignore; probably safe to delete, but ask first.

## How to add a new page

1. Create a `.astro` file in `src/pages/`. The filename becomes the URL: `src/pages/faq.astro` becomes `/faq/`. A subfolder becomes a path segment: `src/pages/tools/budget.astro` becomes `/tools/budget/`.
2. Start it the way every other page starts. Wrap the content in `BaseLayout` and give it a title and description:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page title" description="One line summary for Google.">
  <section class="section">
    <div class="container">
      <h1>Heading</h1>
    </div>
  </section>
</BaseLayout>
```

3. `title` and `description` are required. Optional extras `BaseLayout` accepts: `canonical`, `ogImage`, `ogType`, `article`, `breadcrumb`, `schema` (JSON-LD), `noindex`, `hreflang`, `keywords`, `lcpImageSrcset`, `lcpImageSizes`.
4. Use the shared classes from `global.css` first (`.section`, `.container`, `.btn`, `.card`, `.prose`). If the page needs its own styling, add a `<style>` block at the bottom of the file. Astro scopes it to that page only.
5. To put the page in the top nav, add it to the `navLinks` array at the top of `src/components/Header.astro`.
6. Pages that shouldn't appear in the sitemap are excluded by hand in `astro.config.mjs`.

Pages with `[slug]` in the name are generated, not written one at a time:
- `src/pages/destinations/[slug].astro` builds one page per entry in `countries.json`
- `src/pages/services/[slug].astro` builds one page per service package
- `src/pages/blog/[...slug].astro` builds one page per blog post

## How to add a new blog post

1. Create a `.md` file in `src/content/blog/`. The filename becomes the URL.
2. Frontmatter at the top. Required: `title`, `description`, `pubDate`. Everything else is optional:

```markdown
---
title: "The title shown on the page"
seoTitle: "Shorter title for Google (optional)"
h1: "Different on page headline (optional)"
description: "One line summary. Required."
pubDate: "2026-08-26"
modDate: "2026-08-26"
tags: ["Budget", "Europe"]
keywords: "budget, europe"
readTime: 12
ogImage: "/images/something.png"
draft: false
faq:
  - question: "A question"
    answer: "The answer."
---

Body text in markdown starts here.
```

3. Do not set an `author` field to a person's name. Authorship is the Organization.
4. `tags` do real work: the post page picks its three related posts by counting shared tags.
5. `faq` entries are turned into Google FAQ structured data automatically.
6. `draft: true` keeps a post out of the build entirely.
7. No index to update. The blog listing and the post page both read the folder directly.

Destination pages work the same way but with a different set of fields (`title`, `metaTitle`, `metaDescription`, `keywords`), and a country only gets a page if it's also listed in `src/data/countries.json`.

## Where the design system lives

- **Colours, fonts, spacing, shadows, radii: `src/styles/tokens.css`.** All CSS variables. Main colours: `--color-primary` midnight blue `#1B3A5C`, `--color-accent` coral `#C44B36`, `--color-navy` `#0F2138`. Always use the variable, never the raw hex.
- **Shared classes: `src/styles/global.css`** (imports tokens.css). The ones worth knowing: `.container`, `.section` (+ `--sm`, `--lg`, `--dark`, `--tinted`), `.btn` (+ `--primary`, `--secondary`, `--ghost`, `--accent`, `--sm`, `--lg`), `.card`, `.badge`, `.notice` (+ `--warning`, `--info`, `--danger`), `.prose` for long form text, `.grid-2`, `.grid-3`.
- **Fonts:** Inter for body, Playfair Display for headings, loaded from Google Fonts in `src/components/SEO.astro`. Headings render at weight 400.
- **Reusable components: `src/components/`.**
- **Critical CSS is duplicated.** `BaseLayout.astro` has an inline `<style is:inline>` block repeating a handful of tokens plus header and hero styles, so the top of the page paints fast. If you change a header or hero colour, you have to change it in two places.

Three things that don't line up, flagged rather than fixed:
- `tokens.css` sets `--font-serif` to `'DM Serif Display'` first, but `SEO.astro` only loads Inter and Playfair Display. So headings actually render in Playfair. The inline block in `BaseLayout.astro` names Playfair directly.
- `global.css` uses `--max-width-content`, `--max-width-narrow` and `--color-border-focus`, which aren't defined in `tokens.css`. Where they come from is unclear.
- `tokens.css` sets `--color-surface: #FFFFFF` but the inline block in `BaseLayout.astro` sets it to `#FAFAFA`.

## How to run the dev server and how to build

```bash
npm install        # first time only
npm run dev        # local preview at http://localhost:4321
npm run build      # builds the static site into dist/
npm run preview    # serves what's in dist/, to check the real build
```

- `npm run build` runs `astro build`. It type checks the content frontmatter against `src/content/config.ts`, optimises the images in `src/assets/`, and writes everything to `dist/`. Build assets land in `dist/_assets/`.
- Before pushing anything that touches copy: `grep -ri "azevedo" dist/` must return nothing.

Two housekeeping notes:
- `.gitignore` contains `*.html`, which means any `.html` file you create anywhere in the repo is silently ignored by git. If you ever add a standalone HTML tool to `public/`, you will have to force add it or change that rule.
- The old note about a GitHub token in `.git/config` is resolved. The remote is SSH now.
