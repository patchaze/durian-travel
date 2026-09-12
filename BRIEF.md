# BRIEF

**Status: DONE**
**Written: 12 September 2026, by Cowork**
**Brief 009**

Promoted to the live work order by Cowork on 12 September 2026, after brief 008 was marked DONE. Claude Code: read all of it, run "The automatic path to live" from `CLAUDE.md`, then fill in the Done section and set the status to DONE.

Retire `/tools/visa-checklist/` and replace it with a tool that answers the question that actually comes first: **do you even need a visa?**

Patricia decided this on 12 September 2026. The reasoning is in `claude/planners-audit-2026-09-06.md` and repeated in short under "Why".

---

## What to do

### 1. Build the new tool

New page at `src/pages/tools/do-you-need-a-visa.astro`, URL `/tools/do-you-need-a-visa/`.

**One input:** a single select, "The passport you will travel on". Every entry from the data file in item 2, alphabetical, no default selection.

**Four possible answers, and only these four.**

1. **Free movement.** EU, EEA and Swiss nationals. No visa, no ETIAS, no time limit under the Schengen short stay rules.
2. **No short stay visa needed.** Annex II. Say plainly that ETIAS will apply once it starts, and use the ETIAS status line from item 3.
3. **No short stay visa needed, with a condition.** Same as above, but the condition is the headline, not a footnote. Biometric passport only, or a passport type restriction, or an exemption that depends on an agreement being in force.
4. **A Schengen short stay visa is required.** Annex I. Point them at the consulate of their main destination and stop there.

**Scope, stated on the page before the answer:** tourism and other short stays, up to 90 days in any 180 day period, in the Schengen area. Not work, not study, not residence, not long stay. Anything else is a different rule and this tool does not cover it.

**Every answer carries, in the sentence and not in a footer:** the regulation, the consolidated version date, and the date Durian last checked it.

### 2. The data file

New `src/data/visa-requirements.json`, same shape and discipline as `country-costs.json`: a `_source` block plus the entries.

`_source` must carry: publisher (European Union), instrument (Regulation (EU) 2018/1806), the annex each entry comes from, the consolidated version date, the EUR-Lex URL, and the date retrieved.

Each entry needs: the name as the regulation writes it, an ISO code where one exists, the category (`free_movement`, `exempt`, `exempt_conditional`, `visa_required`), and for conditional entries the exact condition in plain words.

**Cowork's transcription is below as a starting point. It is NOT authoritative and must not ship unverified.**

- Annex I, visa required: Afghanistan, Armenia, Angola, Azerbaijan, Bangladesh, Burkina Faso, Bahrain, Burundi, Benin, Bolivia, Bhutan, Botswana, Belarus, Belize, Democratic Republic of the Congo, Central African Republic, Congo, Côte d'Ivoire, Cameroon, China, Cuba, Cape Verde, Djibouti, Dominican Republic, Algeria, Ecuador, Egypt, Eritrea, Eswatini, Ethiopia, Fiji, Gabon, Ghana, The Gambia, Guinea, Equatorial Guinea, Guinea-Bissau, Guyana, Haiti, Indonesia, India, Iraq, Iran, Jamaica, Jordan, Kenya, Kyrgyzstan, Cambodia, Comoros, North Korea, Kuwait, Kazakhstan, Laos, Lebanon, Sri Lanka, Liberia, Lesotho, Libya, Morocco, Madagascar, Mali, Myanmar/Burma, Mongolia, Mauritania, Maldives, Malawi, Mozambique, Namibia, Niger, Nigeria, Nepal, Oman, Papua New Guinea, Philippines, Pakistan, Qatar, Russia, Rwanda, Saudi Arabia, Sudan, Sierra Leone, Senegal, Somalia, Suriname, South Sudan, Sao Tome and Principe, Syria, Chad, Togo, Thailand, Tajikistan, Turkmenistan, Tunisia, Turkey, Tanzania, Uganda, Uzbekistan, Vanuatu, Vietnam, Yemen, South Africa, Zambia, Zimbabwe, and the Palestinian Authority.
- Annex II, exempt: Andorra, United Arab Emirates, Antigua and Barbuda, Argentina, Australia, Barbados, Brunei, Brazil, Bahamas, Canada, Chile, Colombia, Costa Rica, Dominica, Micronesia, Grenada, Guatemala, Honduras, Israel, Japan, Kiribati, Saint Kitts and Nevis, South Korea, Saint Lucia, Monaco, Marshall Islands, Mauritius, Mexico, Malaysia, Nicaragua, Nauru, New Zealand, Panama, Peru, Palau, Paraguay, Solomon Islands, Seychelles, Singapore, San Marino, El Salvador, Timor-Leste, Tonga, Trinidad and Tobago, Tuvalu, United Kingdom, United States, Uruguay, Holy See, Saint Vincent and the Grenadines, Venezuela, Samoa.
- Annex II with conditions: North Macedonia, Albania, Bosnia and Herzegovina, Georgia, Moldova, Montenegro, Serbia and Ukraine are biometric passport only. Hong Kong SAR and Macao SAR cover those passport holders only. Taiwan covers passports carrying an identity card number. Kosovo is biometric passport only. The United Kingdom entry excludes certain categories of British national, and British nationals (Overseas), British overseas territories citizens, British overseas citizens, British protected persons and British subjects are listed separately. Several Annex II entries apply only from the date an exemption agreement entered into force.

**Verification is a gate, not a nicety.** Before you merge, open the consolidated regulation on EUR-Lex, `https://eur-lex.europa.eu/eli/reg/2018/1806/`, take the most recent consolidated version, and check every entry and every condition against it. Correct anything Cowork got wrong and record in the Done section what you changed and which consolidated version you used. **If you cannot reach EUR-Lex, stop and say so. Do not ship the list unverified.**

EU, EEA and Swiss nationals appear in neither annex. Add them as `free_movement` and say in `_source` that this category comes from free movement rules rather than from 2018/1806.

### 3. ETIAS, checked and dated

Verified by Cowork on 12 September 2026 from the official ETIAS site, `https://travel-europe.europa.eu/etias_en`:

> "ETIAS is currently not in operation and no applications for travel authorisations are collected at this point."

The fee shown on that page is EUR 20, and the site describes it as covering 30 European countries with stays of up to 90 days.

- Put that status into a single named constant so one edit updates every mention.
- The page must say ETIAS is not yet in operation, give the date Durian checked, and link to the official site.
- **Never tell somebody to apply for ETIAS.** Nobody can. Applications are not being collected.

### 4. Retire the checklist

- Delete `src/pages/tools/visa-checklist.astro`. This is the only file this brief authorises you to delete.
- 301 `/tools/visa-checklist/` to `/tools/do-you-need-a-visa/` in `public/_redirects`.
- Update every internal link, the tools index at `src/pages/tools/index.astro`, the navigation, the sitemap config in `astro.config.mjs`, and any JSON-LD naming the old tool.
- The old page saved state under `durian-visa-checklist-v1`. Do not read it, do not migrate it, do not delete it. It simply stops being used.

### 5. Sources page

Add a section to `src/pages/sources.astro` for the new tool, matching the Eurostat section already there: publisher, instrument, annex, consolidated version, retrieval date, and what it does not cover.

**Also resolve the ETIAS fee conflict already on that page.** It currently shows EUR 7 from the EEAS against EUR 20 from the Commission. The official ETIAS site states EUR 20 as of 12 September 2026. Update the section to say so and keep showing both figures with their dates, in the style that section already uses.

## Why

The checklist showed 23 documents to everybody, including the large share of visitors whose passport needs no visa at all. It never asked. Every rule on it was uncited and undated, on a subject where an out of date rule causes real harm. It carried "Commonly in the range of EUR 50 to EUR 100 per day of stay", which is unsourced and is the closest thing on the site to telling somebody their money is enough. It was also the last surviving piece of the document review business Patricia retired.

The replacement answers the first real question, rests on a citable legal instrument, captures passport nationality, which is item 1 of the 90 day plan and audience data Durian has never had, and carries no paperwork liability at all.

## Do not

- Do not list, describe or link a set of documents to gather. Not one. That is the business Patricia retired.
- Do not state any financial requirement, daily amount, or bank balance figure anywhere on this tool.
- Do not score, rate, predict or imply an outcome. This tool reports whether a rule applies. It never comments on an application.
- Do not tell anybody to apply for ETIAS. It is not in operation.
- Do not ship the annex lists without checking them against EUR-Lex.
- Do not invent an entry, a condition, or a date. If the regulation is unclear on an entry, leave it out and say so in Done.
- Do not carry over any copy from the old checklist.
- Do not delete any file other than `src/pages/tools/visa-checklist.astro`.
- Do not touch `public/_headers`, the CSP, or DNS. Only `public/_redirects`.
- Do not touch `/tools/cost-per-country/` or `/tools/budget/` beyond fixing links to the retired page.
- Do not change `functions/api/report.ts` or `src/lib/report.ts`.
- Do not add Stripe or a price.
- Do not add a library or any new runtime dependency. Self contained, mobile first, works offline.
- Build it to the `durian-deliverable-design` skill. Light only, no dark palette.
- Any page script scopes its queries to its own page root. See brief 006.
- Do not `git add -A` or `git add .`. Stage files by name.
- Do not commit `BUILD-BRIEF-001.md`, `CC-PROMPT-STEP-1.md`, `.claude/launch.json`, the untracked `api/` folder, or any `.xlsx` file in the repo root.
- Every page carries: "Educational information only. Not legal advice. Always check the official embassy or consulate source."

## Check before you merge

- Every annex entry verified against the consolidated regulation, and the version recorded in Done.
- `grep -ri "bank statement\|proof of funds\|per day of stay" dist/tools/` returns nothing.
- The old URL 301s to the new one.
- No page tells anybody to apply for ETIAS.
- Build passes and `grep -ri "azevedo" dist/` returns nothing.

---

## Done

**Completed on:** 12 September 2026
**Branch:** `brief/009-do-you-need-a-visa`

**Consolidated version used: `32018R1806 EN, 30 December 2025`** (CELEX `02018R1806-20251230`), read from
EUR-Lex on 12 September 2026. That is the most recent consolidated version listed on the ELI page.

**What changed:**

1. **New tool** at `/tools/do-you-need-a-visa/`. One select, 204 entries, alphabetical, nothing
   selected by default. Four answers and only four. The scope sits above the answer: short stays in
   the Schengen area, up to 90 days in any 180 day period, not work, study, residence or long stay.
   Every answer carries the instrument, the consolidated version and the check date in the
   sentence.

2. **New data file** `src/data/visa-requirements.json`: a `_source` block plus 204 entries.
   104 `visa_required`, 43 `exempt`, 26 `exempt_conditional`, 31 `free_movement`.

3. **Checklist retired.** `visa-checklist.astro` deleted, `/tools/visa-checklist/` and the
   unslashed form 301 to the new tool, tools index entry replaced, `llms.txt` updated. The sitemap
   needed no change: its filter is an exclusion list and the deleted page drops out on its own.
   `durian-visa-checklist-v1` in localStorage is untouched and simply unused.

4. **Sources page** has a section for the new tool matching the Eurostat one, and the ETIAS fee
   conflict is resolved: the official ETIAS site itself states EUR 20, checked 12 September 2026.
   Both figures stay visible with their dates.

**What the verification changed, against Cowork's transcription:**

- **Annex I matched exactly.** 104 entries including the Palestinian Authority, no additions, no
  omissions. One spelling: the regulation writes **São Tomé and Príncipe** with accents.
- **Fourteen entries listed as plainly exempt are conditional.** United Arab Emirates, Dominica,
  Micronesia, Grenada, Kiribati and Saint Lucia carry footnote 7; Marshall Islands, Nauru, Peru,
  Palau, Timor-Leste, Tonga, Tuvalu and Saint Vincent and the Grenadines carry footnote 11. Both
  read: the exemption applies from the date an exemption agreement with the European Union entered
  into force. They are `exempt_conditional` and the tool says so rather than claiming visa free
  travel. It does not assert any agreement is or is not in force, because the regulation does not
  say and the brief forbids inventing a date.
- **Serbia has changed and the brief had the old position.** Amendment M5 makes the entry read
  "Serbia (including holders of Serbian passports issued by the Serbian Coordination Directorate)".
  It used to exclude them. Condition is biometric passports to ICAO standards.
- **The regulation still writes "former Yugoslav Republic of Macedonia".** Stored as
  `regulationName`; the tool displays North Macedonia, because that is the passport somebody holds.
- **Kosovo is correct but for a reason worth recording.** It carries three footnotes, not one.
  Footnote 19 is the biometric condition. Footnote 20 says the exemption applies from the day ETIAS
  starts operations **or 1 January 2024, whichever comes first**. That date has passed, so the
  exemption is live and the biometric condition is the only live one. Read on its own, footnote 20
  would have made Kosovo visa required, which is why it is recorded in the entry's note.
- **Vanuatu is in Annex I, not Annex II.** Amendment M6 moved it. The brief had it right; noting it
  because it is the kind of entry a stale list gets wrong.
- Hong Kong SAR, Macao SAR and Taiwan carry their own passport type conditions, as the brief said.
  The five British national categories in Annex II part 3 are separate exempt entries, and the
  United Kingdom entry records that it excludes them.

**ETIAS**, verified independently on the official site on 12 September 2026, not taken from the
brief: "ETIAS is currently not in operation and no applications for travel authorisations are
collected at this point." Fee stated as EUR 20, covering 30 European countries, stays up to 90
days. It lives in one `ETIAS` constant. No page tells anybody to apply.

**Checks:**

- `grep -ri "bank statement\|proof of funds\|per day of stay" dist/tools/` returns nothing.
- `grep -ri "azevedo" dist/` returns nothing. No stale `visa-checklist` reference outside the
  redirect rules.
- Link check across all 75 pages and 77 distinct internal targets: no broken links.
- Twelve passports driven in a browser covering all four answers, including Vanuatu, Kosovo,
  Serbia, Peru, Taiwan, Hong Kong SAR and a British national (Overseas). Every verdict correct.
- No console errors. No sideways scroll at 375px. Light only, no `prefers-color-scheme`, no
  `data-theme`. h1 is Playfair at weight 400.
- Copy checked for dashes, banned words and the disclaimer. Clean.

**Could not do, and why:**

Nothing in the brief was skipped.

**For Cowork:**

- **A bug worth knowing about for any future tool.** Astro scopes a page's `<style>` to elements in
  its template. The answer card here is built by JavaScript, so it never carried the scoping
  attribute and none of its styling applied: no border, no terracotta, the verdict in Inter instead
  of Playfair. It rendered as plain text and the build gave no warning. The fix is
  `#answer :global(.answer__card)`, which keeps the rules on this page while reaching injected
  nodes. Any future tool that injects markup needs the same treatment.
- **The fourteen agreement dependent entries are the weakest part of the data.** In practice most
  of those agreements have been in force for years, so those travellers are visa free today, but
  the regulation does not carry the dates and I was told not to invent them. The tool tells them to
  check with the consulate of their main destination. If you want a firmer answer, each agreement
  has its own OJ reference and it is a separate piece of research.
- **204 entries in one select is a lot to scroll on a phone.** It works and it is searchable by
  typing, which is how a native select behaves, but a type ahead filter would be kinder. Out of
  scope here, worth a later brief.
- `vercel.json` still lists the old tool's URL structure only implicitly, so nothing to mirror
  there. It was not touched, and neither were `public/_headers`, the CSP, the report endpoint or
  the other two planners beyond the tools index entry.
