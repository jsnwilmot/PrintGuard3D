# Release 1 reporting implementation — Architect submission

**Release 1 remains NOT APPROVED.** Engineering implementation only for [#18](https://github.com/jsnwilmot/PrintGuard3D/issues/18), approved [#13](https://github.com/jsnwilmot/PrintGuard3D/issues/13), tracker [#1](https://github.com/jsnwilmot/PrintGuard3D/issues/1), final program [#17](https://github.com/jsnwilmot/PrintGuard3D/issues/17). Base main `988d7d837849fc7acb9babf90bab4ea579a19a77`; branch `release1/reporting-chart-export-history`. Draft PR/head and exact CI run are recorded in the PR submission. No merge, deploy, production-data access, hosting/access modification or unrelated phase is included.

## Problems and resulting behavior

| Root cause | Correction / resulting behavior |
| --- | --- |
| The original dashboard exposed only a subset of chart subjects and several card actions opened broad or mismatched reports. | Six existing-library chart panels satisfy seven approved subjects; monthly completions explicitly cover trend/count overlap. Every plotted item has an exact pointer action and labelled keyboard record control. All 12 KPI cards open the corresponding records. Upcoming KPI shows its one-next-rule set rather than repeated projections. The compliance ring also opens eligible recorded occurrences. |
| Reports independently formatted screen/CSV values, with no standalone HTML or typed report JSON envelope. | Shared typed report selectors supply row IDs, columns, typed values, provenance and scope to screen/CSV/JSON/HTML/print. All 18 tabular choices retain ten original report families. Main exports exclude unselected/unclassified history; separately labelled exports preserve deliberate unclassified review. Report-card completion drilldowns retain the actual selected status set, including an honest empty subset. |
| Current task state cannot truthfully reconstruct earlier outstanding overdue work. | Explicit opt-in collection appends actual present states after acknowledgment and loading. Per-printer immutable observations capture exact UTC/local timezone, identities, usage, baseline/interval/status/eligibility/category/priority/source version. Display/drilldown uses those facts after live edits/archive/deletion. No first-launch backfill, closed-app inference, past-task reinterpretation or assumed continuous history. |
| No store/envelope represented these observations, and legacy replacement could otherwise erase new history. | [Preflight design](DESIGN.md) preceded schema modification. Add-only Dexie v2/native v20 observation store; original store definitions/rows remain intact. Optional strictly versioned backup extension under root schema 1. Observations append/idempotently merge in every import mode; immutable conflicts block replacement too. Atomic rollback covers original stores, preferences and new observation additions. |
| Untrusted local text/assets in HTML could become executable or leak unrelated records. | Fixed CSS, escaped text/attributes, validated optional embedded PNG/JPEG/WebP, HTTP(S)-only documentation links, no scripts/SVG/imported CSS/forms/external resources/analytics/fetches, and restrictive CSP. Reports open as actual local offline files. Typed report JSON is distinct from full-backup JSON and includes only selected rows/provenance. |

The scheduling engine, manufacturer definitions/verification controls, immutable historical profiles and legal wording/version are unchanged. Schedule print consumes the selected reminder preference. Printer deletion and Settings import review explain retained captured observations. Observation limits affect recording only; perpetual schedules do not expire.

## Modified-file inventory

| Files | Purpose |
| --- | --- |
| `src/reportModel.ts`, `src/reportExports.ts` | Shared typed selectors, filter/query/record contracts, all chart subjects, safe standalone HTML/JSON/CSV serialization |
| `src/RecordChart.tsx`, `src/DashboardCharts.tsx`, `src/Dashboard.tsx`, `src/Reports.tsx`, `src/styles.css` | Reused Recharts visualizations with accessible associated controls; exact KPI/report drilldowns, export buttons and responsive layout |
| `src/observations.ts`, `src/observationStore.ts`, `src/db.ts`, `src/domain.ts`, `src/context.tsx`, `src/App.tsx` | Strict frozen facts, consent/opt-in/dedupe/capacity checks, additive store, atomic extension merge/restore, consent-gated live queries and actual collection |
| `src/Settings.tsx`, `src/Printers.tsx`, `src/SchedulePrint.tsx` | Import/rollback/history-retention disclosure, deletion warning, selected reminder preference in schedule print |
| `acceptance-review/review-harness.js` | Initialize empty current store before original baseline raw-store comparisons. Original assertions unchanged; genuine legacy upgrade tested separately. |
| `tests/reporting-history.test.ts`, `tests/reporting-ui.test.tsx` | 44 added automated cases (parameterized coverage included), preserving all original test files |
| `release1-reporting/playwright.config.mjs`, `release1-reporting/native/{helpers,reporting}.mjs` | 9 actual workflows × 3 engines, fresh synthetic contexts on port 4359, real local file/download/restore/offline/browser interactions |
| `.github/workflows/validate.yml` | Additional reporting workflow job; all four existing jobs/assertions retained; no deployment workflow |
| `README.md`, `release1-reporting/{DESIGN,DECISION-ADDENDUM,BACKUP-COMPATIBILITY,TEST-REGISTER,MATRIX,REPORT}.md` | Current behavior, approved scope, architecture/compatibility preflight, evidence/risks and successor 86-row matrix |

No package/runtime dependency or environment secret was added. Local verification used Windows, Node 22.23.3, TypeScript 5.8.3, Vitest 5.0.5, Playwright 1.64.1 and axe 4.14.0 already present. New/original native JSON results report zero skipped, unexpected or flaky cases. No production export or raw personal data is versioned.

## Stable tabular JSON contract

Report JSON uses `application: "PrintGuard3D"`, `kind: "tabular-report"`, `reportSchemaVersion: 1`, `reportName`, exact UTC `generatedAt`, `classification` (`classified` or explicit `unclassified`), selected `filters`, ordered `columns`, `rows`, `safetyNotice` and `caveats`. It is deliberately incompatible with full-backup restoration. Each column has a stable key for its report/version, label and value type (`text`, `number`, `date`, `datetime`, `url`, `money`, `money-groups`); display-friendly dates do not change typed ISO values. Rows contain stable selected `id`, `printerId` (or null), values keyed by the ordered column keys, and captured provenance. Money is `{amount: number, currency: string | null}`; grouped money is an array with no mixed-currency aggregate. Missing attribution/currency remains null, not a current-rule or preference fallback. Unknown compliance is null. Row/column semantic changes require a new report schema version. No full app state, private registration fields, secondary unclassified rows or drilldown query objects are embedded. Filter record restrictions are normalized to exported visible IDs.

## Verification

Commands and results are recorded below; final CI independently reruns every suite against the PR head. Raw synthetic results/PDFs/failure traces stay in ignored local output and CI artifacts.

| Check | Observed result |
| --- | --- |
| Standard regressions | **195/195 PASS**: all original 151 plus 44 new cases |
| Unchanged focused acceptance assertions | **45/45 PASS** |
| Original native Chromium | **20/20 PASS**, final sequential rerun |
| Preserved Phase 5 cross-engine/printing | **45/45 PASS**, final build (33 cross-engine + 12 printing cases) |
| New reporting native | **27/27 PASS**: 9 workflows × Chromium/Firefox/WebKit, actual local-origin outage |
| TypeScript no-emit | PASS |
| Production build | PASS; existing large-chunk advisory remains (main approximately 572 kB minified) |
| Static repository/profile checks | PASS: 157 tracked/staged files; all 3 reviewed definitions/immutable digests valid |

```sh
npx vitest run tests --reporter=json --outputFile=test-results/standard.json
npx vitest run --config remediation-phase1/vitest.review.config.mts --reporter=json --outputFile=test-results/acceptance.json
npx tsc -p tsconfig.json --noEmit --incremental false
node scripts/validate-repository.mjs
npm run build
npm run test:native
npx playwright test --config remediation-phase5/playwright.config.mjs
npx playwright test --config release1-reporting/playwright.config.mjs
```

Run acceptance fixture generation **before**, never concurrently with, original native tests: they share `remediation-phase1/fixture-backup.json`. An early parallel run demonstrated fixture interference, not a production-data failure; the final run is sequential. A Firefox offline-emulation flag fails before service-worker fallback; the new check instead uses the established actual loopback-server transport outage, verifies the origin is unreachable, then reopens cached application state. No assertion is skipped, reclassified or expected-failed. Initial testing also caught reduced-snapshot strict parsing rejecting full input records and a report KPI escaping a status filter; corrected implementations have dedicated regression coverage.

The offline hostile-content history export produced A4 and Letter PDFs, six pages each with 10,000+ characters of inert markup/long notes. Text checks found the title, generation instant and safety notice; rendered first/continuation/final pages were inspected for wrapping, legibility and footer placement. Long notes intentionally continue across pages; no advanced PDF pagination engine or physical-print approval is claimed. Original schedule A4/Letter/theme/1–3–12-printer/scale-1–0.9 tests remain required.

## Updated acceptance and remaining risks

[MATRIX.md](MATRIX.md) retains all original 86 IDs/order and previous evidence: **59 PASS, 19 PARTIAL, 3 FAIL, 5 NOT VERIFIED**, for the evidence-scoped checks above. Only rows 11, 11.2 and 15 move to evidence-scoped PASS under the approved R1 chart/export scope. Row 12.2 remains FAIL / enhanced R2. Section 26 retains PARTIAL while external release gates remain open. A technical reporting pass cannot approve Release 1.

- **Rollback boundary:** native explicit downgrade fails, but older Dexie binaries may reopen newer databases through schema discovery. Do not run old binaries in place. Use a pre-upgrade backup in a fresh old-version database while preserving the upgraded database/new backup. Older strict backup readers reject enriched fields; no data-stripping compatibility export exists. See [compatibility register](BACKUP-COMPATIBILITY.md).
- **Observation coverage:** recording starts explicitly, collects while the app is open, and retains only actual samples. No pre-capture or closed-app history exists. Sampling stops at documented capacity without pruning; historical charts are observations, not machine health or proof of physical work. Browser storage/clock/custody limitations remain. Maximum-capacity UI performance is not certified.
- **Exports:** external documentation hyperlinks require internet; remote/SVG photos are omitted. Currencies remain independent; unknown source/attribution/currency is never guessed. JSON report schema 1 is not a backup. Local-file safety is verified for the tested engines, not every future external report consumer.
- **External gates remain open:** legal review #10, complete official manufacturer/variant coverage #14, qualified human/device accessibility and physical printing #15, and actual production hosting/security #16. WebKit automation is not real Safari/device certification. Axe incomplete nodes require human review. No WCAG/legal/manufacturer completeness or Release 1 approval is asserted.

Code-quality review: no new runtime service/secrets/dependencies, no unrelated engine/profile/legal changes, shared selectors/serializers instead of parallel report logic, meaningful new tests and unchanged baseline assertions. Architect must review the immutable-data/rollback design and draft PR before any merge. No merge/deployment is authorized here.
