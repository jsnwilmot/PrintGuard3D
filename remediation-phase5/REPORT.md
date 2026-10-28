# Phase 5 engineering submission

Release 1 is **NOT APPROVED**. This branch is for Architect review under [Issue #11](https://github.com/jsnwilmot/PrintGuard3D/issues/11), with release tracking in [#1](https://github.com/jsnwilmot/PrintGuard3D/issues/1) and independent Canadian counsel review in [#10](https://github.com/jsnwilmot/PrintGuard3D/issues/10). No merge, deployment, production-data operation, hosting/access change or next phase is included.

The branch `remediation/phase5-release-compatibility` starts at approved main `616e26ee5c0834a3d0900294981bcf8963d2c053`. The React/TypeScript/Vite/Dexie architecture, IndexedDB version/store layout, scheduling engine, manufacturer definitions and legal draft are preserved. Protected engine/legal/profile/test definitions are unchanged; see [preservation.csv](preservation.csv). All test data is synthetic on isolated localhost origins. Previous [Phase 4](../remediation-phase4/REPORT.md), [Phase 3](../remediation-phase3/REPORT.md), [Phase 2](../remediation-phase2/REPORT.md) and [Phase 1](../remediation-phase1/READINESS.md) evidence remains in place.

## Corrections and causes

| Finding | Root cause | Correction and evidence |
| --- | --- | --- |
| F13/F15: inaccurate monetary totals | Different recorded currencies were summed and labelled with current preferences; legacy rows were retrospectively assigned the current currency | Shared `reporting.ts` groups currencies, explicitly labels unknown currency, includes explicitly recorded maintenance amounts regardless of outcome and repair expenses once, and preserves missing historical facts. New repairs capture currency once; edits retain their original/unknown currency. Q01/Q02/Q16; D02. |
| F15: inconsistent unknown-history filters | Reports excluded missing metadata while calendars silently combined it with classified matches | One metadata predicate; unknown records remain visible as a distinctly labelled context. Reports exclude them from classified totals/main CSV and provide a separate safe CSV. Current rules never backfill attribution. Calendar labels explicitly separate unknown filter matches. Q03, original U09/S04; D02. |
| F13: missing core summaries/drilldowns | Dashboard exposed four primary cards and no cost, open-repair or critical/missed goals | Add actual-record summaries, configurable application targets, grouped currency totals, status-defined open repairs and precise report/month/printer drilldowns. Explicit skips plus captured elapsed cycles count as recorded missed occurrences; postponements are excluded. Q04-Q06/Q16/Q17; D02. Full requested chart coverage remains incomplete, explicitly listed below. |
| §9.6 forecasting conflict | No distinction between the basic estimate explicitly required by §9 and enhanced forecasting deferred by §26 | Implement only conditional, labelled estimates from actual readings. Minimum 7-day span, at most 90 days between endpoints, positive rate, latest reading within 30 days matching current totals, monotonic history, unreached threshold. Unknown otherwise. No confidence probability is fabricated. Estimates appear in task details and a dedicated report; they never enter calendar/ICS/due/overdue calculations. Q07-Q09/Q18. Enhanced forecasting stays R2. |
| F16: historical calendar detail | Completed events were static text | Keyboard-accessible buttons open read-only historical details, source/version, unknown attribution, original usage/cost and image. No mutable task/completion action is provided. Q10; D02. |
| F17: fragmented print output | A twelve-column screen table was reused for paper; descriptions were missing | A dedicated print presentation uses the same filtered rules, grouped by printer, with readable descriptions and definition lists, original/active intervals, usage thresholds, current status/date, exact identity, source/version/review date, full links, warnings and images. Screen/CSV leading columns remain compatible; CSV gains descriptions/model/original interval. Digital PDFs and rendered-page review are recorded in [PRINT-QA.md](PRINT-QA.md). D08 x12 (24 PDFs at scales 1 and 0.9). |
| Backup compatibility | Schema 1 identifies an envelope, not the reader's supported optional fields | Test frozen actual original/Phase 1-4 schemas, retain enriched exports, and add truthful reader warnings. No downgrade stripping/converter. Unknown top-level profile JSON metadata survives losslessly and invalid/reserved/deep metadata fails closed. Q11-Q15/Q19; D03-D05/D09. See [compatibility register](BACKUP-COMPATIBILITY.md). |
| F19: incomplete contrast evidence | Gradients, chart backgrounds, short text and partially clipped scrolling content prevented automatic determinations | Inspect all 139 node evaluations in 18 prior scans. Correct the confirmed light workspace-initial contrast, give text opaque backgrounds and chart labels theme tokens, remove a decorative search glyph represented as a keyboard shortcut. Remaining uncertain evaluations stay visible with manual requirements. See [ACCESSIBILITY.md](ACCESSIBILITY.md). |
| F20: missing compatibility/host evidence | Chromium-only workflow and unverified deployment assumptions | Add real pinned Firefox/WebKit workflows, offline transport loss/reopen, native transaction abort, file inputs/downloads, large image round trips, keyboard/reflow/forced-colour emulation and local source-header checks. No Safari/OS prompt/mail-client/production-host certification. |

## Scope decisions

Original §9 explicitly says to support estimated calendar dates when sufficient operating-hour history exists and forbids using them as overdue triggers. That is sufficient authority for the narrowly bounded R1 estimate above. §26 explicitly defers enhanced forecasting, guided maintenance workflows, expanded verified catalogue, repair/inventory/photo enhancements, advanced analytics/PDF composition and additional backup options to R2; connectivity/cloud/shared farms/reliable background push are R3. Existing enhanced data is preserved, not removed.

The complete 86-row outcome is 56 PASS, 22 PARTIAL, 3 FAIL and 5 NOT VERIFIED. Across the 29 broad specification sections, 8 PASS, 19 PARTIAL and 2 FAIL. Narrow passes do not close the broader or external gates.

No requirement has been silently removed to achieve a green matrix. The historical guided-procedure row 12.2 remains FAIL against the full specification, with its explicit R2 scope identified. The complete §11 chart suite, historical outstanding-overdue data contract and requested HTML/JSON report delivery still require Architect decisions against the R1/basic-report and R2/advanced-analytics boundary. Their matrix rows remain PARTIAL; they are not reclassified as implemented by the new core summaries. See [remaining gates and sequence](REMAINING-BLOCKERS.md).

## Verification and reproducibility

Use Node 22.12+ (local 22.23.3), the existing lockfile and pinned Playwright 1.64.1 / axe-core 4.14.0. Local Windows browser binaries: Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2. These are automation engines, not branded browser/device certification.

```sh
npm ci
node scripts/validate-repository.mjs
npx tsc -p tsconfig.json --noEmit --incremental false
npx vitest run tests
npx vitest run --config remediation-phase1/vitest.review.config.mts
npm run build
npx playwright install chromium firefox webkit
npm run test:native
npx playwright test --config remediation-phase5/playwright.config.mjs
```

The standard suite contains **151 tests: all 125 baseline tests plus 26 new regressions**. The original **45 acceptance assertions** and **20 native Chromium cases** are unchanged. Phase 5 adds **45 native cases: 11 in each of Chromium, Firefox and WebKit plus 12 Chromium PDF cases**. See [verification-results.json](verification-results.json), [browser matrix](BROWSER-MATRIX.md), [print log](print-qa.csv) and [backup measurements](backup-measurements.csv) for observed results. CI runs standard/static/TypeScript/build, original acceptance, original Chromium and new compatibility suites independently, with no skip, expected-failure conversion, retry or continue-on-error.

Large-file download preparation allows 60 seconds rather than the normal 15-second action window; one Windows WebKit run exceeded the shorter harness limit. The dataset, exact-content comparisons and transaction assertions are unchanged.

Initial harness failures were corrected rather than hidden: implicit-label selectors were replaced with accessible combobox selectors; large synthetic records were given valid post-history baselines; IndexedDB primary-key iteration order was distinguished from insertion order using exact canonical SHA-256 record comparisons; first-install assertions were corrected to respect the returning parent printer dialog and unordered reading IDs. An overstrict draft metadata cycle check was corrected to allow harmless shared object references; unchanged P31/V20 verify that behavior. Final checks use the corrected implementation and contracts.

Firefox's `setOffline(true)` failed a new-tab navigation while Chromium/Windows WebKit passed. This result is retained as a tooling/environment limitation. The final common test physically disables GET responses at the local test origin, verifies that direct requests fail, closes the app tab, reopens from cache and verifies every store. It does not serve substitute HTML/assets or suppress application assertions. [Playwright documents routing/service-worker limitations](https://playwright.dev/docs/service-workers); upstream [Firefox/new-page report](https://github.com/microsoft/playwright/issues/34402) and [WebKit offline emulation report](https://github.com/microsoft/playwright/issues/42775) support keeping emulation and actual transport evidence distinct. Actual browser Work Offline/OS network-disconnection acceptance remains in the manual pack.

No environment variables or runtime credentials are needed. `PLAYWRIGHT_BROWSERS_PATH` is optional for test binary storage. The optional `--source-headers` and `--offline-control` flags affect only the loopback review server, never the deployed app/server. The latter exposes a synthetic POST toggle only when expressly started for testing; it is absent from `dist` and normal baseline server operation.

## Preservation and limits

No historical records are rewritten on startup or for reporting. No profile/package is automatically updated. Exact-model verification remains canonical and fails closed for modified definitions; unknown metadata cannot promote verification. All seven stores, consent renewal, profile archives, ownership, readings, schedules and images remain covered. No IndexedDB migration/schema bump is introduced. Profile metadata that cannot be represented safely (reserved `__proto__`, deeper than 32 levels, invalid non-JSON fields) is rejected with an explanation rather than stripped.

The [86-row matrix](MATRIX.md), [22-finding register](findings.csv) and original [55 accessibility criteria](accessibility-register.csv) are retained. Remaining mandatory gates include counsel #10, qualified human accessibility/device/zoom testing, manufacturer F07 coverage, explicit reporting/chart scope decisions, configured external clients, actual notification delivery, physical printing and actual-host security/offline checks. The legal draft is unchanged; technical consent and safety behavior is not legal approval. No WCAG conformance claim is made.

Current dependency audit on 2026-10-28 reports **zero known advisories**. The build still reports an existing >500 kB chunk warning, an empty React chunk and third-party Zod annotation warnings. They are recorded without suppressing build checks or redesigning the architecture. Large-file timing/heap figures apply only to this test environment; no unlimited storage or low-memory-device guarantee is implied.

The [changed-file inventory](changed-files.txt) and exact final commit/CI links in the draft PR identify the submission. Raw synthetic browser backups, traces, PDFs and screenshots remain ignored locally or in time-limited CI artifacts; only source fixtures and reviewed non-sensitive summaries are committed.

Recommendation: **review Phase 5 engineering and evidence; keep Release 1 blocked** until the owners complete every mandatory gate. No merge or deployment is authorized by this submission.
