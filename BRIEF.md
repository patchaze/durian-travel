# BRIEF

**Status: DONE**
**Written: 12 September 2026, by Cowork**
**Brief 012**

Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE. There are no questions for Patricia in this brief.

Patricia bought the report with her own code and read it as a customer would. Her verdict: it gave her no value and raised questions she could not answer. She is right. This brief rebuilds what the report does and what it says. **Brief 013 will follow for the visual design.** Do not spend time on styling here beyond what item 7 asks for.

Files: `src/lib/report.ts`, `src/data/full-report.ts`, `src/pages/tools/cost-per-country/full-report.astro`.

---

## The problem in one line

The report shows its calculation. It should lay out options and let the reader decide. Everything below follows from that.

## What to do

### 1. Fix the plain bugs first

These are wrong, not merely unhelpful.

- **"Couple" produces one adult.** A couple is always two adults. Check every party option against the headcount it produces, and make the party size drive every per person figure.
- **The header claims a trip that is not happening.** It reads like "seven nights across Portugal, Italy, Germany and France", which says they visit all four. They are *comparing* four. Reword so it says what is true: seven nights, comparing these four.
- **Country by country shows only one country.** Patricia picked four and got Portugal. Every chosen country must appear, in every section that says "country by country". This is the product failing, not a detail.
- **"Where your money goes" has the same fault.** It must cover every chosen country, or say clearly which one it is showing and why.

### 2. The report becomes scenarios, not a table

The reader's ceiling is the spine. Build these, in this order:

1. **Each chosen country on its own**, for the full trip length.
2. **The combinations of the chosen countries** that are realistic for the nights they have. Do not generate every permutation of four countries for a five night trip. Cap the combinations sensibly and say in Done what cap you used.

For every scenario, produce: the total for the whole party, the per person per day figure, and **how much of their ceiling it uses**, stated as money left over or money short.

The headline is that comparison, written as sentences a person reads once and understands. The shape to aim for:

> Portugal on its own leaves you about €1,200 spare. Portugal and Spain together leaves about €400. Adding Switzerland puts you roughly €900 over.

### 3. Say what combining actually costs

Nobody tells them this and it is the most useful thing in the report.

- Extra travel between countries, using the `A010703` transport services index already in `country-costs.json`.
- Time. Moving between countries spends days that are not spent anywhere. Say how many days each combination costs them, based on the number of moves.
- Both stated in words, not left for the reader to work out from a table.

### 4. Three new questions

`src/data/full-report.ts`. Add to the existing set, each one changing something in the output.

- **"Where are you flying from?"** A text input for their city or country. It does not feed a calculation. It appears in the report so the reader sees their own trip described back to them, and it tells Patricia where her audience is, which she has never been able to measure.
- **"What return fare are you seeing?"** A number, optional, with an explicit "I do not know yet" state. When given, it goes into every scenario total. When not, every total is shown without flights and each one says so.
- **"Are you set on one country, or open to combining?"** Set on one, open to combining, or not sure. It decides which scenarios lead and which are shown as alternatives. It does not hide any scenario.

**On flights, the rule does not move.** Durian has no fare data and none is invented. The number is the reader's own and the report says so in the sentence where it appears.

### 5. Rewrite every sentence in the report

The current copy is fragments. Patricia's words: it is not natively English, it is not organic, it is hard to understand. Examples she quoted: "the dearest of the countries you picked is France", and "the biggest change in Germany".

The rules for the rewrite:

- Full sentences that connect to each other. No labels pretending to be prose.
- Second person, present tense, plain words. Read each sentence aloud. If it does not survive that, rewrite it.
- **No British words.** "Dearest" becomes "the most expensive". `Coach` becomes `Bus` everywhere, in `src/data/full-report.ts` line 126, in the label map at `src/lib/report.ts` line 339, and anywhere else it appears in tool copy. Leave the Switzerland destination page alone, PostBus is a proper noun there.
- **The reader never sees the phrase "personal index"** or any internal term. If a concept needs a name, name it in plain words, and explain it the first time it appears.
- Every figure sits in a sentence that says what it is and where it came from.

### 6. Hide the method, keep the sources

Patricia does not want the recipe published, because it can be lifted.

- **Remove the section that shows the component weights.** That table is the method.
- **Keep every Eurostat source, dated, in the sentence.** Showing sources is the site's whole positioning and it stays.
- In place of the weights, describe in words what each part of the cost covers, for example that eating out is priced differently from cooking for yourself. Describe the inputs, not the arithmetic.

### 7. The two page level fixes

- **`noindex` the report.** It is a paid deliverable and must never rank. Add `noindex` through `BaseLayout`.
- **Give it a title and a description anyway**, for the browser tab and for anyone who shares the link. Add a canonical. These are for humans, not for search.

## Why

A person who pays €5 and gets a table of numbers with no explanation feels cheated, and correctly. The report has the right data underneath and answers the wrong question with it. Scenarios against a budget ceiling turn the same data into a decision the reader can actually make, which is what they paid for.

## Do not

- Do not decide for the reader. Lay out the options with the numbers and let them choose. No recommendation, no "best" country, no ranking presented as advice.
- Do not invent a flight fare, a seasonal adjustment, or any figure that is not either the reader's own or from `country-costs.json`.
- Do not change the Eurostat data, the seven categories, or `src/data/country-costs.json`.
- Do not publish the component weights anywhere a reader can see them.
- Do not remove or weaken any source line or date.
- Do not change `functions/api/report.ts`, the Stripe verification, or the access code.
- Do not change the price or the Payment Link.
- Do not change the free comparison on `/tools/cost-per-country/`.
- Do not restyle beyond item 7. Brief 013 covers colour, animation and typography.
- Do not touch `public/_headers`, the CSP, or DNS.
- Do not add a library or any new runtime dependency.
- Nothing may score, rate, predict or imply a visa outcome, or comment on whether somebody's money is sufficient for an application. This report talks about the cost of a trip and nothing else.
- Any page script scopes its queries to its own page root. See brief 006.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- The report carries: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

## Check before you merge

- A couple produces two adults, and a family with children produces the right headcount.
- Generate a report with four countries and confirm all four appear in every country by country section.
- The header does not claim the reader is visiting every country they picked.
- `grep -rn "Coach\|dearest\|personal index" src/lib/report.ts src/data/full-report.ts src/pages/tools/` returns nothing.
- With no fare entered, every total says flights are not included.
- The report page is `noindex` and has a title, description and canonical.
- Build passes and `grep -ri "azevedo" dist/` returns nothing.

---

## Done

**Completed on:** 13 September 2026
**Branch:** `brief/012-report-scenarios`

**What changed:**

1. **The bugs, confirmed by rendering the old report before changing anything.** Test case: a
   couple comparing Portugal, Italy, Germany and France for 7 nights.
   - **Couple produced one adult.** The party answer never set the head count, and the adults
     field starts at 1. The old report read "A couple, 1 adult" and priced Portugal at €1,101 for
     the whole trip. The party now decides: solo is 1 adult, a couple 2 adults and no children, a
     family at least 1 adult and 1 child, friends at least 2 adults. This is enforced in
     `normalise()` on the server and mirrored in the form. Portugal for that couple is now €2,202.
   - **The header claimed a trip across every country.** It read "7 nights across Portugal, Italy,
     Germany and France". It now reads "You are comparing France, Germany, Italy and Portugal for
     a trip of 7 nights."
   - **The one-country sections were not the one named "Country by country".** That table did list
     all four. The faults were "Your basket", which showed price levels for Portugal only, and
     "Where your money goes in Portugal". Both are gone. "What a day costs in each country" now
     covers every chosen country, in a table and in one sentence each.

2. **Scenarios, not a table.** Each chosen country on its own for the full trip, then the
   combinations. Nights are split evenly. Every option gives the total for the whole party, the
   per person per day figure before flights, and the money spare or over against the ceiling. The
   headline is sentences, and it always includes the lowest and the highest total in each group, so
   an option that goes over the ceiling is never left out of it. Each group is listed from the
   lowest total to the highest, said as an order, with no best option and no recommendation.
   **The cap:** combinations are built only when 2 to 6 countries are picked, every country in a
   combination gets at least 3 nights, a combination holds at most 4 countries, and at most 10
   combinations are shown, lowest total first. Countries on their own are never capped. Past 6
   countries, or with too few nights, the report says why there are no combinations.

3. **What combining costs.** One journey between countries, per person, is the reader's daily
   figure, scaled by the existing editorial between-cities figure for the way they travel, and
   priced at the average `A010703` transport services level of the countries involved. Each journey
   also costs half a day. Both are stated in words as Durian's estimates.

4. **Three new questions** in `src/data/full-report.ts`. "Are you set on one country, or open to
   combining?" defaults to Not sure yet and decides which group leads, without hiding either.
   "Where are you flying from?" is text, capped at 80 characters, escaped, and shown back in the
   report. "What return fare are you seeing?" takes a per person number plus an "I do not know yet"
   box. A given fare, times the party, goes into every total. With no fare, every total says flights
   are not included, in the headline sentences and in the table heading.

5. **Every sentence rewritten** in full sentences, second person, American spelling. The reader
   never sees "personal index", "dearest", "weight", or "index". Coach is Bus in both places. The
   stored value stays `coach`, so answers already saved in a visitor's browser still restore.
   "Travelling", "fortnight" and "weighing up" are gone from the report and the form. I printed
   the whole report as prose and read it aloud twice, and seven sentences were rewritten after the
   second read.

6. **The method is hidden, the sources are kept.** The basket table, the formula box and the
   comparison chart are removed. Each of the nine parts of a trip is described in words, with the
   Eurostat category and code that prices it. Every source stays in a sentence with its dates:
   dataset `prc_ppp_ind`, indicator `PLI_EU27_2020`, reference year 2024, updated by Eurostat on
   10 July 2025, retrieved 8 September 2026.

7. **Page level.** The generated report keeps `noindex, nofollow` and gains a meta description
   and a canonical pointing at `/tools/cost-per-country/full-report/`. See the note below on how I
   read this item.

**Also changed:**
- The offer bullets in `src/data/full-report.ts` described the old report ("the ranking that
  changes... with the biggest mover named"). They now describe what it does. The bullets show on
  both pages, so the offer on `/tools/cost-per-country/` changed too. The free comparison did not.
- The form's intro and its country legend no longer say the report "ranks" or "weighs up".
- `cleanText` in `report.ts` contained three raw control characters (0x00, 0x1F, 0x7F) that I
  introduced while writing it. It now tests code points directly, and the file contains none.

**Checks:**
- Build passes, 76 pages. `grep -ri "azevedo" dist/` returns nothing. The brief's search for
  Coach, dearest and personal index returns nothing. `functions/api/report.ts`,
  `src/data/country-costs.json` and `public/_headers` are unchanged. Type check clean on the report,
  the questions and the Function.
- 43 checks across twelve rendered scenarios, all passing. The couple gets two adults and
  €2,202. A family left at 0 children gets one child. A family of 2 and 3 is priced for five.
  Friends left at 1 adult become two. All four countries appear in the options, the day table and
  the day sentences. With no fare, every headline sentence and the table heading say flights are
  not included. A fare of €650 for a couple adds €1,300. "I do not know yet" overrides a typed
  fare. With no ceiling, the wording changes. One country builds no combinations. 5 nights and
  2 countries explain why there are none. So do 8 countries. 14 nights and 4 countries give 11
  combinations and show 10. "Open to combining" puts combinations first. A script tag typed as
  the origin comes out escaped. The head has noindex, a description, a canonical and a title. The
  disclaimer is present, there are no dashes, and the dates sit in sentences.
- In a browser: all 23 form fields render, "Not sure yet" is preselected, and no label is nested
  inside another. Party sync sets 2/0 for a couple, 2/1 for a family left at 2/0, 2/0 for friends
  left at 1/0 and 1/0 for solo from 3/2. "I do not know yet" disables the fare and keeps the number.
  The payload carries every new field. Everything, the checkbox included, restores after a reload.
  No console errors, and nothing overflows at 375px.

**Could not do, and why:**

Nothing in the brief was skipped. The generated report itself cannot be requested on the live site
without Patricia's code or a paid session, so it was verified by rendering the same module locally
across the twelve scenarios above. On the live site I can check the form and that the endpoint
still refuses.

**For Cowork:**

- **How I read item 7.** "Noindex the report... through `BaseLayout`" cannot apply literally to the
  generated report, because it is an HTML string built in `report.ts` and never passes through
  `BaseLayout`. It was already `noindex`, so I added the description and canonical there.
  `/tools/cost-per-country/full-report/` stays indexable and in the sitemap, as brief 011 set it
  up. If the intent was to take that form page out of search, it is `noindex` on its `BaseLayout`
  plus an exclusion in the sitemap filter.
- **"Where are you flying from?" does not reach Patricia yet.** It is shown back to the visitor in
  the report and saved in their browser, but nothing records it anywhere. Brief 010 forbade logging
  answers and this brief did not authorise analytics. Measuring where the audience is needs a
  decision, for example a GA4 event that carries only the country, never the text.
- **Journey costs ignore distance.** The dataset has no distances and inventing them would break
  the rule. In the test case every journey came out at about €20 to €30 per person by bus, and
  Lisbon to Rome costs the same as Paris to Brussels. The report says this in the sentence. A real
  fix needs distance or route data.
- **The method can still be worked backwards with effort.** The report prints the daily figure and
  the money for each part of a day in each country, and the Eurostat levels are public, so the
  weights can be recovered by division. Closing that fully means dropping the per part table or
  the daily figure. The percentages and the formula are no longer shown.
- Headline sentences keep the brief's own shape, "Italy and Portugal together leaves you about
  €520 spare", singular verb included.

