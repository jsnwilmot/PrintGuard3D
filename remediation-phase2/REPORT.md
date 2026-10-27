# PrintGuard 3D — Phase 2 remediation report

2026-10-27 UTC. Issue [#4](https://github.com/jsnwilmot/PrintGuard3D/issues/4). Branch `remediation/phase2-scheduling-calendar`. Approved Phase 1 baseline/merge: `e5565f02f4fe9edb28598380db58ea280663e2b1`.

**All six Phase 2 defects have passing unchanged acceptance assertions. Recommend Architect acceptance review for Phase 2. Release 1 remains NOT ready.** No merge, deployment, production-data access, hosting/security setting change or Phase 3 work. Phase 1 is accepted and merged; earlier reports are retained as historical evidence.

## Root causes and corrections

| Contract | Root cause | Correction | Regression/native proof |
| --- | --- | --- | --- |
| U18 / F06 | Intermediate year input generated unpadded dates and invalid DOM keys; numeric Date constructors also reinterpret years0–99. | Four-digit local date serialization, validated committed cursor separate from input draft, cloned-date month bounds. Navigation updates draft and cursor together. | S01; B01 types real keyboard events through0002/0020/0203/2035 and asserts exact final year,42valid cells, leap2040/2400, recurrence and navigation. |
| U11 / F12 | Calendar only used dated occurrences, so reached usage thresholds vanished. | A separate current usage-due section exists in all views, honors active printer/category/priority/status and actual inclusive thresholds. Explicit owner postponements are real dates; no automatic usage forecast. | S02/S03/S11; B02. |
| U10 / F16 | Completed events only filtered printer/date; month events excluded adjoining visible dates; agenda omitted completed history. | Filter captured historical metadata and Completed outcome in every view; generate events over the full42-cell range; show history in agenda. | S04/S05; B02. |
| U07 / F12 | Upcoming reports only expanded dated recurrence rules. | Include reached hour/print thresholds with empty calendar date and explicit current status, only when today is in the reporting range. | S06/S09; B03 current versus future custom range. |
| U08 / F14 | Parts rows reused the generic history headers although materials occupied the usage position. | Explicit matching parts headers/values; record-currency cost; screen/CSV/print use the same rows. | S07 exact headers/cells; B03 downloadedCSV and print-media values. |
| U12 / F13 | Dashboard counted every undated task and all dates less than the horizon, including overdue; report range lacked a current/future boundary. | Shared presentation selectors apply inclusive lower/upper dates, active/enabled guards and current status. Dashboard counts next dated rules; reports label future recurrences projected and current usage separately. Combined rules already reached by usage do not advertise their later calendar deadline as upcoming (S12). | S08/S09 inclusive day0/day7, day8, overdue/undated exclusions; B03. |

Selectors live in `src/scheduleView.ts`; they never write records. `src/engine.ts` changes only year padding in `localDate`; recurrence/advance/chronology calculations are unchanged. No artificial schedule end, expiry year or occurrence cap was introduced. Existing recurrence tests through2400 and new native navigation through2400 pass.

### Explicit display policies

- Current usage due work is labeled **as of today**, independently of the selected calendar period. It is outside date cells and ICS because its calendar date is unknown. The real task dialog remains actionable; CSV reports preserve a blank date and actual Due Today/Overdue status. Unreached thresholds are not predictions. Future postponements suppress current due work until their owner-entered date.
- Dated report occurrences are within the selected inclusive range and on/after today. An overdue next occurrence is excluded; later valid perpetual recurrences can appear only as explicitly projected. Current reached usage work may be overdue and is labeled accordingly; it appears only if today is in the range. Future-only and past-only ranges do not imply a date for that work. Invalid/reversed ranges produce no upcoming work.
- Dashboard upcoming counts distinct next dated rules, not all projected cycles; overdue and undated tasks stay out of that count. Existing due-today/overdue KPIs continue using actual thresholds.
- Captured historical category/priority filters are independent of current rules. **Legacy rows without these snapshots remain visibly unclassified under category/priority filters; printer/status filters always apply.** This preserves the unchanged U10 compatibility expectation without inventing historical metadata. Reports retain their existing Phase1 policy of excluding unknown snapshots from a specific category/priority filter. The difference is explicit in calendar text and documented here for Architect review; no stored record is relabeled.

## Verification results

| Check | Actual local result |
| --- | --- |
| Original and Phase1 automated tests | **78/78 PASS**, source unchanged |
| New focused regressions | **12/12 PASS**, S01–S12 |
| Standard total | **90/90 PASS** |
| All unchanged acceptance assertions | **45/45 PASS**, including U07/U08/U10/U11/U12/U18 |
| Original native backup/restore cases | **6/6 PASS**, N01–N06 source unchanged |
| New native Phase2 journeys | **3/3 PASS**, B01–B03 |
| Native total | **9/9 PASS**, zero skipped/flaky/retried cases |
| TypeScript and production build | **PASS**; only existing nonfatal vendor annotation/empty chunk warnings |
| Static/public-source review | PASS targeted staged-file path, credential-pattern and JavaScript syntax guard; final CI/PR links preserve remote evidence |

Native final run started `2026-10-27T17:28:19.049Z` and took 31.2s. It uses pinned Playwright1.64.1/Chromium156 on isolated `http://127.0.0.1:4357`, fresh empty contexts, synthetic-only fixtures and external-request blocking. The existing test server is owned/stopped by Playwright. No personal browser profiles or production app were used.

Raw evidence SHA256:

- Standard90: `6a61e81280fc423cf73c28ed1d29b7623f5686a0be794daf1100c55d3a35a329`
- Acceptance45: `3c45f8564a472b84f3282f49d869ed473e5e26ff19415fe61d0565c68361b83c`
- Native9: `2987ac90c06d22387b8eb91e1303154c5e8f45dbb132178d7f5e1ece45ab5e47`

Preserved raw files: `.verification-local/phase2-standard.json`, `.verification-local/phase2-acceptance.json`, `.verification-local/phase2-build.log`, `test-results/native-results.json`, per-case `test-results/native/` traces/downloads/screenshots, and `playwright-report/`. CI uploads standard/acceptanceJSON and native evidence for14days. Only this curated evidence and synthetic test source belong in Git.

An initial exploratory native test used `locator.press()` for each digit, which refocused and reset Chromium's date segment even on a plain input without React. A blank synthetic probe demonstrated direct `page.keyboard.press()` yields0002→0020→0203→2035. B01 now uses uninterrupted keyboard events and asserts every intermediate value as well as the final2035 and42valid cells. Temporary input workarounds were removed; no failing assertion was relaxed. A native selector was also corrected to identify the actual Report control. Full final runs include all original cases; focused exploratory runs are not reported as complete suite results.

## Reproduction

From repository root, Node22:

```powershell
npm ci
node node_modules/vitest/vitest.mjs run tests --reporter=json --outputFile=test-results/standard.json
node node_modules/vitest/vitest.mjs run --config remediation-phase1/vitest.review.config.mts --reporter=json --outputFile=test-results/acceptance.json
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --incremental false
node scripts/validate-repository.mjs
npm run build
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.verification-local\browsers'
npx playwright install chromium
npm run test:native
```

LinuxCI installs Chromium with `npx playwright install --with-deps chromium`. Port4357 must be unused. Run acceptance and native commands sequentially because their initial setup prepares the same ignored fixture file. `remediation-phase1/` runner names are retained deliberately; all45 assertions are unchanged. Earlier Phase1 report-generation scripts describe their historical baseline and are not the Phase2 report generator.

## Files and preservation

- `src/Calendar.tsx`: date draft/range guards, full visible range, historical filters/agenda, separate usage due panel; existing add/open/drag-postpone/ICS behavior retained.
- `src/scheduleView.ts`: shared read-only display selectors for actual usage, valid dates and upcoming windows/history.
- `src/Dashboard.tsx`: accurate upcoming window and postponed-date sorting.
- `src/Reports.tsx`: actual due usage rows, future/current range semantics and explicit parts mapping/currency.
- `src/engine.ts`: four-digit year serialization only; scheduling arithmetic retained.
- `src/styles.css`: narrowly scoped readability/spacing for the new usage panel; existing theme issues are not redesigned.
- `tests/scheduling.test.tsx`:12 targeted regressions.
- `tests/native/scheduling.browser.mjs`:3 native journeys; print-media content and actualCSV download included.
- `.github/workflows/validate.yml`: remove obsolete unresolved-failure wording from acceptance job; no bypass or deployment change.
- `README.md`, `remediation-phase1/MATRIX.md`: current-review links while retaining accepted historical evidence.
- `remediation-phase2/REPORT.md`, `MATRIX.md`, `acceptance-matrix.csv`, `findings.csv`: current report and all86 preserved requirements.

No package/lockfile changes, new dependencies, application environment variables, IndexedDB schema changes, migrations, manufacturer recommendations, legal text changes or record repairs. `src/db.ts`, `integrity.ts`, `profiles.ts`, `domain.ts`, forms and all existing automated/native/acceptance test files match the approved baseline. Fault/ownership/profile safeguards pass again.

## Acceptance and remaining limitations

The [current86-row matrix](MATRIX.md) carries forward all29sections; section counts are **{'PARTIAL': 21, 'PASS': 5, 'FAIL': 3}**. The six named contracts now pass; perpetual section29 upgrades toPASS for its tested contracts. Broad calendar/report/KPI/testing sections retain their remaining stated limits. Earlier baseline/Phase1 documents remain inspectable; current links do not erase their previous failures.

Recommend Architect review for **Phase2 acceptance only**. Do not merge or deploy without a separate human decision. Release1 is not ready merely because45 assertions pass. Outstanding work includes full exact-model manufacturer profile coverage, legacy profile identity/diff and history/currency semantics, other requested KPIs/forecasting, printing/layout, safety-warning distribution/legal review, contrast/accessibility and external integrations. Legacy unclassified-calendar policy needs explicit review; history detail actions remain limited. Native coverage is Chromium with small synthetic images/backups; Safari/Firefox/assistive technology and full device/large-file coverage are not certified. The pre-existing encoded multiword hash deep-link fallback remains outside this scope. Phase3 is not started or authorized by this report.
