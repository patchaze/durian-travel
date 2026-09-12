# BRIEF

**Status: DONE**
**Written: 10 September 2026, by Cowork**
**Brief 008**

Promoted to the live work order by Cowork on 12 September 2026, after brief 007 was marked DONE.

Claude Code: once promoted, read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

**Patricia does not take calls. At all.** Not paid, not free, not fifteen minutes, not video. The site currently offers calls in at least ten files, and the chatbot tells people "Everything runs online via video call". Every one of those is a promise she will not keep. This brief removes the offer and routes everybody to email instead.

The replacement already exists and already works: `src/pages/contact.astro` posts to `https://formsubmit.co/contact@duriantravel.com` and `public/_headers` already allows `form-action ... https://formsubmit.co`. **No header change is needed and none is permitted.**

---

## What to do

### 1. Retire the booking page

- Delete `src/pages/book-a-call.astro`. This is the one file this brief authorises you to delete.
- Add a 301 in `public/_redirects` sending `/book-a-call/` to `/contact/`, matching the style of the redirects already in that file.
- Check whether `/free-visa-audit/` still resolves. It has no page in `src/pages/`, but it is still referenced in content. If it is a live redirect, point it at `/contact/` too. If it is a dead link, fix the references.

### 2. The chatbot

`src/components/ChatBot.astro`.

- The `human` answer at line 278 currently reads: "Of course. Everything runs online via video call. You can [book a call](/book-a-call/) or reach us through the [contact page](/contact/)." **Replace it.** No call, no video, no phone. It should say that the way to reach a person is the contact form, that messages go to Patricia's inbox, and that she replies by email. Keep it to two sentences in the site voice.
- The quick reply label at line 17, "Talk to a person", stays. It is the right label. Only the answer changes.
- Remove `'book a call'`, `'consultation'` and `'phone'` from that entry's `keywords` array, and check every other entry in the file for the same words.
- The `language` answer at line 283 ends "Mention your preferred language when you book." Nobody books anything. Rewrite that clause.
- The chatbot stays a keyword matcher with no model behind it. Do not add an API call.

### 3. The CTA banner, which is the widest reach

`src/components/CTABanner.astro`. Its defaults are a call:

- `subtitle` defaults to "Book a free 15-minute call about your route, your budget and your timing. No documents are reviewed."
- `ctaHref` defaults to `/book-a-call/`.

Change the defaults to point at `/contact/` and to offer a written reply rather than a call. Then check every page that uses the component and passes its own `cta`, `subtitle` or `ctaHref`, because a prop overrides the default and those are the ones a default change will miss.

### 4. Sweep the rest

Every remaining call reference. Known from a scan on 10 September 2026, line counts may have moved:

`src/pages/404.astro`, `src/pages/about-us.astro`, `src/pages/contact.astro`, `src/pages/faq.astro`, `src/pages/terms-of-service.astro`, `src/pages/schengen-visa-guide.astro`, `src/pages/services/[slug].astro`, `src/pages/blog/[...slug].astro`, `src/pages/destinations.astro`, `src/pages/destinations/[slug].astro`, and in content: `src/content/blog/europe-trip-planning-timeline.md`, `src/content/destinations/liechtenstein.md`, `src/content/destinations/slovenia.md`, `src/content/destinations/croatia.md`, `src/content/destinations/spain.md`.

Search for and remove: `book a call`, `book a free`, `15-minute`, `30-minute`, `video call`, `schedule a call`, `planning call`, `consultation`, `calendly`, `free visa audit`, and `/book-a-call/`.

**Do not simply delete the sentences.** Where a call was the offer, replace it with the written one: send a message through the contact page and get a reply by email. Where a call is only mentioned in passing, cut the clause and leave the paragraph reading naturally.

Also check `src/data/service-packages.json` and `src/data/service-pages.ts`, and the JSON-LD on any page that describes a service, since structured data is what Google and AI assistants quote.

### 5. Make the contact page carry the weight

`src/pages/contact.astro` is now the only way to reach a person, so it has to say so.

- It should state plainly that Durian answers by email, usually within a stated number of working days. **Do not invent that number.** Use "within a few working days" unless Patricia has given you one.
- It must not promise a call, a meeting, or a time slot.
- Leave the form action, the field names and `formsubmit.co` exactly as they are. It works.

## Why

Every call reference on the site is an offer Patricia will not honour, and the chatbot states it as fact on 76 of 77 pages. That is worse than a stale link: somebody fills in a booking expecting a video call that will never happen.

Email also suits the business better. It is asynchronous, it survives her being nine hours ahead of most of her audience, and it leaves a written record of what was asked.

## Do not

- Do not touch `public/_headers` or the CSP. `formsubmit.co` is already allowed under `form-action` and nothing else needs to change.
- Do not change the contact form's action, method, field names or destination address.
- Do not add a scheduling tool, a calendar embed, Calendly, or any booking widget, in any form.
- Do not invent a response time, a number of working days, or an availability window.
- Do not delete any file other than `src/pages/book-a-call.astro`.
- Do not add Stripe or a price. Separate work.
- Do not touch `/tools/cost-per-country/`, `/tools/budget/` or `/tools/visa-checklist/` in this brief. The checklist is under review separately and gets its own brief.
- Do not change `functions/api/report.ts` or `src/lib/report.ts`.
- Do not add an API call or a model to the chatbot.
- Nothing you write may promise or imply a visa outcome, offer document review, or comment on whether somebody's money is enough.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- Every page keeps: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

## Check before you merge

- `grep -ri "book a call\|video call\|15-minute\|calendly\|schedule a call" dist/` returns nothing.
- `/book-a-call/` returns a 301 to `/contact/`, not a 404.
- The chatbot's "Talk to a person" reply mentions no call.
- The build passes and `grep -ri "azevedo" dist/` returns nothing.

---

## Done

**Completed on:** 12 September 2026
**Branch:** `brief/008-retire-calls-route-to-email`

**What changed:**

19 files, one deleted. The site builds 75 pages instead of 76.

1. **The booking page is gone.** `src/pages/book-a-call.astro` deleted. `public/_redirects` now
   301s both `/book-a-call` and `/book-a-call/` to `/contact/`. `/free-visa-audit/` was a live 301
   to the booking page, confirmed against the live site before the change, and now points at
   `/contact/` too.

2. **The chatbot.** The `human` answer no longer mentions a call, video or a phone: it says to
   send a message through the contact page, that it lands in the inbox, and that we reply by
   email. `'book a call'`, `'consultation'` and `'phone'` are out of its keywords. The `location`
   answer said "All sessions are conducted online via video call" and now says the work happens in
   writing, by email; `'video call'` is out of its keywords too. The `language` answer no longer
   ends "when you book". The "Talk to a person" label is unchanged, and so is the keyword matcher:
   no API, no model.

3. **The CTA banner.** Defaults now point at `/contact/` with "Send Us a Message" and a subtitle
   offering a written reply. Nine pages use the component; two passed their own props
   (`destinations.astro` and `destinations/[slug].astro`) and both were changed.

4. **The sweep.** Every remaining reference: `404.astro`, `about-us.astro`, `faq.astro`,
   `terms-of-service.astro`, `privacy-policy.astro`, `schengen-visa-guide.astro` (three places),
   `services/index.astro`, `services/[slug].astro` (two places), `blog/[...slug].astro`,
   `destinations.astro`, `destinations/[slug].astro`, `europe-trip-planning-timeline.md` and
   `public/llms.txt`. Where a call was the offer it became the written one; where it was a passing
   clause it was cut and the sentence rewritten.

   The FAQ needed care: the visible list and the JSON-LD both render from one `faqSchema` array, so
   fixing the array fixed both. "What is the free planning call?" became "How do I get in touch?"
   and "Do sessions happen online?" became "How does the work happen?", answered with writing and
   email.

5. **The contact page.** Says plainly that everything happens in writing and that we answer by
   email, usually within a few working days. The "Skip the Queue" booking card is now "Write a
   Better Message". The meta description and keywords no longer sell a consultation or a planning
   call. **The form action, method, field names and formsubmit.co destination are untouched**,
   verified in a browser: `https://formsubmit.co/contact@duriantravel.com`, POST, fields `_next`,
   `_captcha`, `_subject`, `_template`, `name`, `email`, `subject`, `nationality`, `visa-type`,
   `message`. `public/_headers` was not touched.

**Checks:**

- No `/book-a-call/` link anywhere in `dist/` except the redirect rules themselves.
- A link check across all 75 built pages and 77 distinct internal targets: no broken links.
- `grep -ri "azevedo" dist/` returns nothing. All 75 pages still carry the educational notice.
- The chatbot was driven in a browser: "Talk to a person" returns the new answer and the panel
  contains no call, video or phone wording.
- The sitemap has no reference to the deleted page.

**Could not do, and why:**

Nothing in the brief was skipped.

**For Cowork:**

- **The paid packages promised live sessions and the term list would have missed all of them.**
  `service-packages.json` contained "Schengen planning session (60 min)", "Second planning
  session", "Group planning session (2+ travellers)", "Currency exchange strategy session",
  "Post-trip debrief for next-trip planning" and "Pre-trip briefing call with the full Durian
  team". None match the brief's search terms, but a 60 minute planning session is a call, and the
  brief says "not paid, not free". All six are now written deliverables. **This changes what the
  paid packages promise**, so it needs Patricia's eye more than anything else in this brief.
- **Four items say "briefing" and I left them alone**: two pharmacist briefings, a Europe health
  risk briefing, and a post-travel monitoring brief. A briefing can be a written document, so
  changing them would have been me deciding what the service is. If any of them is spoken, they
  need the same treatment.
- **The brief's own merge check has two false positives.** `grep -ri "15-minute" dist/` matches a
  15 minute bus ride in Croatia and a 15 minute walk in Liechtenstein. Both are accurate travel
  copy, not calls, and I left them. A tighter term for future sweeps is `[0-9]+[- ]minute call`.
  Everything else in that check returns nothing.
- **Three "consultation" mentions remain and all three are protective.** The travel health blog
  post says the package is "explicitly not a medical consultation", and the Wellness Journey FAQ
  asks "Is this a medical consultation or a travel-planning service?" and answers that it is not.
  Removing them would weaken a disclaimer. Two SEO keywords on that page did contradict it, and
  those are changed: "medical travel consultation service" and "travel health pharmacist
  consultation" are now planning wording. Two keywords still read "consultant", on the Nomad and
  Grand Circuit packages. Those are positioning, not a call promise, so they are Patricia's call.
- **`vercel.json` still redirects `/free-visa-audit` to `/book-a-call/`.** It is the rollback
  reference and the brief did not authorise touching it. A rollback that reverts the repo is
  consistent, because the page exists in any earlier commit. It only bites if somebody switches
  the live host back to Vercel at current HEAD. One line if you want it mirrored.
- **`CLAUDE.md` still lists "Paid 1 to 1 calls with Patricia" as where the business is going.**
  That now contradicts this brief and it is the kind of line that makes a future session write
  call copy again. I did not edit it, because the brief was about the site. It should be corrected.

