# Durian Travel — working notes for Claude

## What this site is
Durian Travel (duriantravel.com) helps people from outside Europe plan a trip to Europe. Patricia owns it. She is European, has travelled widely inside the continent, and builds her own web tools. She is not a professional developer — explain things in plain language and skip the jargon.

## Stack
- Astro, deployed on Vercel
- **GitHub repo: `patchaze/durian-travel`. Vercel project: `my-website`.** These are two different names for the same thing and are easy to confuse. The repo was renamed from `my-website`; GitHub still redirects the old name, which is why stale references appear to work.
- Domains: duriantravel.com and [www.duriantravel.com](https://www.duriantravel.com)
- Local preview: `npm run dev`, then open localhost:4321

## Where the business is going
Moving AWAY from hands-on Schengen visa document review. Patricia does not want responsibility for anyone's paperwork or their embassy result.

Moving TOWARDS three things:
1. Small self-serve tools people pay a low price for (trip budget planner, cost-per-country estimator, visa readiness checklist)
2. Free educational content about visas, money and routes
3. Paid 1-to-1 calls with Patricia

## Hard rules — never break these
- Never write copy that promises or implies a visa will be approved.
- No approval-rate numbers, ever, unless Patricia supplies the real figure and its source. The former "98% Schengen Approval Rate" claim was removed from the homepage on 26 August 2026 along with two service-page H1s implying outcomes. Do not reintroduce anything of that shape.
- Every piece of visa content carries: "Educational information only. Not legal advice. Always check the official embassy or consulate source."
- Never invent statistics, prices, laws or dates. Look them up, or say you don't know.
- Border rules change often (EES, ETIAS). Check the date and the official EU or embassy source before stating a rule.
- Don't write anything that reads as immigration advice rather than education.

## Voice
Calm, direct, useful. A friend in Europe explaining how the system actually works. Second person ("you"). Short sentences. Banned words: unlock, seamless, dream trip, effortless, game-changer.

## How to work with Patricia
- Short answers. Bullets. Plain words. No jargon.
- Short version first. Details only if she asks.
- One question at a time when you need a decision.
- Push back if an idea is weak. Don't just agree.
- Say when you're guessing.
- Never edit files through the GitHub or Vercel website. This folder is the only place code gets changed.
- Always work on a branch. Never commit straight to the production branch.
- Show the diff and wait for approval before applying changes.

## Anonymity is a hard constraint
Decided 27 August 2026, confirmed 1 September 2026.

- The founder's name appears nowhere in the built output. Verify with a grep over `dist/` before pushing, not just over `src/`.
- Authorship is **Organization, not Person**. Blog posts, the visa guide and article schema all credit "Durian Travel Editorial Team".
- Do not add a byline, an author page or `Person` schema. `/patricia-azevedo/` is retired and 301s to `/about-us/` in `vercel.json`.
- Copy says "we". Describe experience without naming anyone.
- This costs some E-E-A-T signal. That trade was made deliberately; do not undo it to chase authority.

## Design
Match the existing site. Editorial and hand-built, never generic or template-looking. Mobile first. New standalone tools should be self-contained and work offline where possible.

## Current priorities
Tracked in `BUILD-BRIEF-001.md` at the repo root. The three original priorities (this file, the 98% contradiction, and the budget calculator) were completed on 26 and 27 August 2026.

---

# Project map

## The folder structure, in plain language

Everything that becomes the website lives in `src/`. Everything outside `src/` is either config, build output, or old junk.

- **`src/pages/`** — one file here = one page on the site. This is the whole routing system; there is no router config anywhere.
- **`src/content/`** — the writing. Two folders: `blog/` (21 markdown posts) and `destinations/` (27 markdown country write-ups, one per Schengen-ish country). `src/content/config.ts` defines what fields each type of file is allowed to have, and the build fails if a file breaks those rules.
- **`src/data/`** — structured facts that aren't prose:
  - `countries.json` — the master list of destination countries (slug, name, facts). This list is what actually creates the destination pages.
  - `destination-overrides.ts` — per-country tweaks layered on top of `countries.json`.
  - `service-packages.json` + `service-pages.ts` — the seven service packages. The `.json` is the raw data; the `.ts` file cleans it up, maps old slugs to new ones, and attaches icons and SEO copy.
- **`src/layouts/BaseLayout.astro`** — the shell every page sits inside: `<head>`, Google Analytics, header, footer, chatbot.
- **`src/components/`** — eight reusable pieces: `Header`, `Footer`, `SEO`, `Breadcrumb`, `CTABanner`, `BlogCard`, `ServiceCard`, `ChatBot`.
- **`src/styles/`** — `tokens.css` (all colours, fonts, spacing as CSS variables) and `global.css` (reset plus shared classes like `.btn`, `.card`, `.section`, `.prose`).
- **`src/assets/images/`** — 126 images used *inside* pages. These get optimised and resized at build time.
- **`public/`** — files copied to the site untouched: `favicon.svg`, `robots.txt`, one blog image. Nothing here is optimised.
- **`dist/`** — the built site. Generated, gitignored, never edit by hand.
- **Root clutter** — `setup-*.mjs` (15 old one-off image-scraping scripts), `blog.html`, `blog2.html`, `home.html`, `brevo_main.js`, several `.log` files, `visa_consultant_strategy.md.resolved`. None of these are part of the site or the build. Safe to ignore; probably safe to delete, but ask first.

## How to add a new page

1. Create a `.astro` file in `src/pages/`. The filename becomes the URL: `src/pages/faq.astro` → `/faq/`. A subfolder becomes a path segment: `src/pages/tools/budget.astro` → `/tools/budget/`.
2. Start it the way every other page starts — wrap the content in `BaseLayout` and give it a title and description:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page title" description="One-line summary for Google.">
  <section class="section">
    <div class="container">
      <h1>Heading</h1>
    </div>
  </section>
</BaseLayout>
```

3. `title` and `description` are required. Optional extras `BaseLayout` accepts: `canonical`, `ogImage`, `ogType`, `article`, `breadcrumb`, `schema` (JSON-LD), `noindex`, `hreflang`, `keywords`, `lcpImageSrcset`, `lcpImageSizes`.
4. Use the shared classes from `global.css` first (`.section`, `.container`, `.btn`, `.card`, `.prose`). If the page needs its own styling, add a `<style>` block at the bottom of the file — Astro scopes it to that page only. Most pages do this.
5. To put the page in the top nav, add it to the `navLinks` array at the top of `src/components/Header.astro`.
6. Pages that shouldn't appear in the sitemap are excluded by hand in `astro.config.mjs`.

Pages with `[slug]` in the name are generated, not written one at a time:
- `src/pages/destinations/[slug].astro` builds one page per entry in `countries.json`
- `src/pages/services/[slug].astro` builds one page per service package
- `src/pages/blog/[...slug].astro` builds one page per blog post

## How to add a new blog post

1. Create a `.md` file in `src/content/blog/`. The filename becomes the URL: `europe-trip-budget.md` → `/blog/europe-trip-budget/`.
2. Frontmatter at the top. Required: `title`, `description`, `pubDate`. Everything else is optional:

```markdown
---
title: "The title shown on the page"
seoTitle: "Shorter title for Google (optional)"
h1: "Different on-page headline (optional)"
description: "One-line summary. Required."
pubDate: "2026-08-26"
modDate: "2026-08-26"
author: "Patricia Azevedo"
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

3. `tags` do real work: the post page picks its three related posts by counting shared tags.
4. `faq` entries are turned into Google FAQ structured data automatically.
5. `draft: true` keeps a post out of the build entirely.
6. That's it — no index to update. The blog listing and the post page both read the folder directly.

Destination pages work the same way but with a different set of fields (`title`, `metaTitle`, `metaDescription`, `keywords`) — and a country only gets a page if it's also listed in `src/data/countries.json`.

## Where the design system lives

- **Colours, fonts, spacing, shadows, radii: `src/styles/tokens.css`.** All CSS variables. Main colours: `--color-primary` midnight blue `#1B3A5C`, `--color-accent` coral `#C44B36`, `--color-navy` `#0F2138`. Always use the variable, never the raw hex.
- **Shared classes: `src/styles/global.css`** (823 lines, imports tokens.css). The ones worth knowing: `.container`, `.section` (+ `--sm`, `--lg`, `--dark`, `--tinted`), `.btn` (+ `--primary`, `--secondary`, `--ghost`, `--accent`, `--sm`, `--lg`), `.card`, `.badge`, `.notice` (+ `--warning`, `--info`, `--danger`), `.prose` for long-form text, `.grid-2`, `.grid-3`.
- **Fonts:** Inter for body, a serif for display headings. Loaded from Google Fonts in `src/components/SEO.astro`.
- **Reusable components: `src/components/`.** `Header` (nav lives in an array at the top of the file), `Footer`, `SEO` (all meta tags plus Organization JSON-LD), `Breadcrumb`, `CTABanner`, `BlogCard`, `ServiceCard`, `ChatBot`.
- **Critical CSS is duplicated.** `BaseLayout.astro` has an inline `<style is:inline>` block repeating a handful of tokens plus header and hero styles, so the top of the page paints fast. If you change a header or hero colour, you have to change it in two places.

Three things that don't line up, flagged rather than fixed:
- `tokens.css` sets `--font-serif` to `'DM Serif Display'` first, but `SEO.astro` only loads Inter and Playfair Display. So headings actually render in Playfair. The inline block in `BaseLayout.astro` names Playfair directly.
- `global.css` uses `--max-width-content`, `--max-width-narrow` and `--color-border-focus`, which aren't defined in `tokens.css`. Where they come from is **unclear** — possibly nowhere, in which case those rules silently do nothing.
- `tokens.css` sets `--color-surface: #FFFFFF` but the inline block in `BaseLayout.astro` sets it to `#FAFAFA`.

## What's under /api/

**There is no `/api/` folder in this project.** No `src/pages/api/`, no root `/api/`, no serverless functions, no Astro API routes anywhere. The site is fully static (`output: 'static'` in `astro.config.mjs`) — every page is built to plain HTML ahead of time, so there is no server to run an API on.

The only thing that behaves like an API is the chatbot, and it runs entirely in the visitor's browser: `src/components/ChatBot.astro` calls Pollinations and the Google Gemini API directly with `fetch()`.

⚠️ Worth knowing: that chatbot uses `PUBLIC_GEMINI_API_KEY`. The `PUBLIC_` prefix means Astro bakes the key into the JavaScript that ships to every visitor — anyone can read it and use it. Same for `PUBLIC_OPENAI_API_KEY` in `.env.local`. If the chatbot is meant to stay, that key should move behind a server function. Patricia's call.

## How to run the dev server and how to build

```bash
npm install        # first time only
npm run dev        # local preview at http://localhost:4321
npm run build      # builds the static site into dist/
npm run preview    # serves what's in dist/, to check the real build
```

- Node version used on Vercel is 24.x (from `.vercel/project.json`).
- `npm run build` runs `astro build`. It type-checks the content frontmatter against `src/content/config.ts`, optimises the images in `src/assets/`, and writes everything to `dist/`. Build assets land in `dist/_assets/`.
- **Deployment is automatic.** Push to `main` on `patchaze/durian-travel` (the Vercel project it feeds is named `my-website`) and Vercel builds and deploys. Nothing to run by hand.
- `vercel.json` at the root holds the redirects (50 at the time of writing, mostly retired service and blog URLs) and 4 header rules, including the Content-Security-Policy. Add new redirects there, before the trailing-slash catch-all at the end of the array.
- `netlify.toml` and the stale `public/vercel.json` were both deleted on 26 August 2026. Netlify is not used. The root `vercel.json` is the only deployment config.

Two housekeeping notes:
- `.gitignore` contains `*.html`, which means any `.html` file you create anywhere in the repo is silently ignored by git.
- ⚠️ The git remote URL in `.git/config` has a GitHub personal access token written into it in plain text. That token is sitting on disk unencrypted and would leak if this folder were ever shared or backed up somewhere public. Worth rotating and switching to SSH or the GitHub CLI.
