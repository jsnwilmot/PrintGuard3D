# Chart, export and observation verification register

Standard reporting cases are in [tests/reporting-history.test.ts](../tests/reporting-history.test.ts) and [tests/reporting-ui.test.tsx](../tests/reporting-ui.test.tsx); actual browser workflows are in [native/reporting.mjs](native/reporting.mjs). The latter runs identically in Chromium, Firefox and WebKit. Exact observed totals/CI links belong in [REPORT.md](REPORT.md), not inferred from source presence.

| Contract | Regression checks | Native checks |
| --- | --- | --- |
| Completion trend and monthly counts (shared chart) | R14/R15 monthly exact completed IDs/date intersections | N04 keyboard control and actual SVG bar pointer action |
| Recorded compliance trend | R14 actual on-time denominator, explicit skips, postponed exclusion, empty null | N04 selected eligible monthly record drilldown |
| Activity per printer | R16 distinct IDs for same names, truthful zero records | N04 per-printer record selection |
| Workload horizon / actual vs usage vs estimate | R18 one next occurrence, undated reached usage, unchanged actual status/rules | N04 current-overdue drilldown; original S06/S08/S09/B03/D02 retained |
| Expenses by recorded currency | R15/R17 CAD/USD/unknown, no preference fallback or mixed sums | N04 currency-preserving exact records; original Q01/Q02/Q16/D02 retained |
| Prospective overdue trend | R03–R08 consent, opt-in, dedupe, actual transitions, gaps, bounds/timezone/2500 | N02 legal gate/reload/real UI usage; N04 captured-task drilldown; N09 0/1/12, leap timezone and offline reopen |
| Captured history immutability | R05/R07/R10/R12/R13 live deletion/archive/disabled, no current name join, conflict rejection | N02 unchanged earlier points; N07 immutable import conflicts |
| Every dashboard KPI | Existing Q04 plus report query/selector R19 and status-filter UI R24 | N03 keyboard activation of all 12 KPI cards and exact report families/representative row counts |
| All 18 tabular choices / ten original families | R20 parameterized tests compare typed row order/IDs/values, warning-bearing CSV and HTML record count | N05 downloads JSON/HTML for every report selection and compares actual onscreen IDs/rows |
| Scope/privacy / unknown historical attribution | R15/R21 primary vs explicit unclassified, no hidden record IDs/notes/printer serials | N05 excluded printer/unclassified markers absent from downloads; original Q03 retained |
| Inert HTML / URL / image / CSS / long text | R22/R23 hostile markup, unsafe URL plain text, rejected SVG/mislabeled image, fixed CSS/CSP, typed null/currency/safety/generated UTC | N06 actual downloaded file opened offline, no script/active nodes/network/dialogs; A4/Letter PDFs |
| Native upgrade, abort and rollback boundary | R01/R02 exact original rows, native VersionError, fresh old-version database rollback | N01 genuine v10 app upgrade and native version-change abort |
| Backup compatibility / atomic restore | R26 frozen legacy schemas independently reject new fields; R09–R11 full/single printer, old replacement retention, immutable conflicts and final-write rollback | N07 real download/file input/replacement/acknowledgment/future-extension rejection; original native abort preserved |
| Accessibility / reflow | R25 directly associated accessible names/list values; unknown and empty states textual | N08 both-theme axe WCAG 2.2 AA subset, 360px reflow; N03/N04 native keyboard; original Phase 4/5 checks unchanged |
| Perpetual schedules | R06/R18 unchanged intervals and recurrence into 2500; original perpetual tests unchanged | N08 calendar 2035/2400/2500; N09 actual sampling after 2400 without schedule expiry |

Automated checks do not certify screen-reader usability, real Safari, mobile hardware, colour perception, physical printers, legal approval or hosted response headers. Axe incomplete nodes remain manual review items. Observation points measure actual sampled application state, not work performed while closed or machine reliability. Browser-generated PDFs are evidence for layout checks, not physical-print certification.

Raw synthetic JSON results, PDFs, screenshots and failure traces stay in ignored `test-results/`, `playwright-report/` and `.verification-local/`, and CI artifacts. New traces are retained on failure only; no private browser data or production exports are committed.
