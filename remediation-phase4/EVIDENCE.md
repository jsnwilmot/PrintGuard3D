# Phase 4 legal and accessibility evidence

2026-10-27 UTC. **No legal approval or WCAG conformance certification is claimed.** [Issue #8](https://github.com/jsnwilmot/PrintGuard3D/issues/8), [report](REPORT.md), [86-row matrix](MATRIX.md).

## Scope and actual environment

Windows 11, build 26300, Node 22.23.3, pinned Playwright 1.64.1, Chromium **156.0.8078.4**, axe-core / axe Playwright **4.14.0**. Tests use fresh nonpersistent contexts on `http://127.0.0.1:4357`, labelled synthetic records and blocked external requests. No hosted application or production IndexedDB was opened. Browser keyboard tests dispatch real Chromium keyboard events through Playwright; they are **automated browser journeys**, not a claim that a human or screen-reader user performed manual acceptance. Fixture acknowledgment is simulated test conduct, never acceptance on a person's behalf.

Normative references: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). The [55-criterion register](accessibility-register.csv) covers Level A/AA criteria individually, with scope, evidence and remaining checks. Not-applicable entries state their reasons and must be reassessed if scope changes. The register is a review aid, not a conformance report.

## Automated evidence

- [Legal test register](legal-register.csv): D01–D06 technical contracts pass; **D07 qualified independent Canadian legal review is NOT VERIFIED / PENDING**.
- [Axe audit inventory](axe-audit.csv): **24 scans, zero detected violations**. These include eight application pages in each theme, renewal/onboarding, full disclaimer, nested disclaimer, completion, async error, profile review, restore warning and mobile navigation. No axe rules or failure assertions are disabled. **18 incomplete evaluations**, all `color-contrast`, remain available in raw artifacts and need manual review; complex/gradient/graphic backgrounds are not certified by a zero-violation result.
- [Computed contrast](contrast.csv): actual computed browser foreground/background pairs, input border contrast and focus outline contrast against adjacent surfaces. Threshold assertions use 4.5:1 for tested normal text and 3:1 for tested input boundaries/focus indicators. Text values with no asserted boundary are explicitly labelled rather than interpreted as border passes.
- Native evidence includes traces, downloads, screenshots, generated PDF files and raw axe results in ignored `test-results/` / CI artifacts. Curated CSVs contain only reviewed environment/count/colour data. No raw user backup is committed.

| Measured pair | Light | Dark |
|---|---:|---:|
| Muted text on page surface | 5.632:1 | 7.043:1 |
| Muted text on panel / inactive navigation | 6.040:1 | 6.217:1 |
| Primary button label/fill | 6.651:1 | 8.758:1 |
| Input text/fill | 12.576:1 | 10.054:1 |
| Input boundary/fill | 4.309:1 | 4.953:1 |
| Minimum focus/adjacent surface among captured samples | 5.411:1 | 8.295:1 |

Dark buttons use a light fill and dark label; the previous white-on-light-blue pair is no longer used. The page/body background now follows the same theme as its foregrounds. Outside-month calendar cells retain text contrast instead of reducing whole-cell opacity. Actual icon/graphic meaning, gradients, disabled controls, user images and every possible hover/content state still require independent evaluation.

## Native journey coverage

| ID | Exercised contract |
|---|---|
| C01 | Existing-data stale-version renewal: no stored names/work in DOM, search, routes, notifications, print or exports; unchecked keyboard consent; all record stores/preferences preserved. |
| C02 | Real ICS/CSV downloads; 75-octet UTF-8 ICS folding and event warning fields; safety column; actual A4 PDF, light print scheme and readable notice colour. |
| C03 | Nested disclaimer, completion, async error, profile review and restore overlays: unique IDs, top-layer focus, inert background, Tab containment, Escape, return focus and unchanged data on error. |
| C04 | Both themes on every page; pressed theme state, actual computed text/input/focus pairs; zero detected axe violations. |
| C05 | 640/320 CSS-pixel viewports, 568x320 landscape, reduced motion, expanded text spacing, skip link, mobile keyboard navigation and date-field rescheduling without dragging. |
| C06 | Unsupported custom/resin model, missing manufacturer link, flagged source and offline warning remain truthful; safety checkbox stays unchecked. |
| C07 | Actual backup replacement: all seven stores restored exactly, imported consent cleared, restored data/search/export remain hidden until renewal. |

The 640/320 CSS widths are the **reflow equivalents** of a 1280px viewport at 200%/400% zoom. This does **not** claim that browser Ctrl+zoom, text-only resizing or a magnifier was manually exercised. Table regions deliberately scroll horizontally, have accessible names and can receive keyboard focus; whole tested pages do not require horizontal scrolling. Text spacing was exercised on narrow Settings using line-height 1.5, paragraph spacing 2em, letter spacing .12em and word spacing .16em. All-content spacing/resize acceptance is still pending.

Native A4 PDF text extraction confirms the warning; a locked-workshop print contains no stored printer names. The rendered schedule was visually inspected. The test fixture produces a long, narrow-column schedule; **its full table readability is not passed**. White print surfaces, a light colour scheme and dark warning text are corrected, while long-table/large-farm/Letter/physical-printer acceptance remains separate. CSV/ICS carry the safety notice within their files; third-party calendar/spreadsheet import/display is NOT VERIFIED. ICS clients may collapse descriptions; recipients must open the event description or use the warning-bearing CSV/PDF alternative. Undated usage-only work remains outside date-based ICS, as in the accepted scheduling policy.

## Manual checks still required

| Environment / role | Reproducible check | Current status |
|---|---|---|
| Qualified independent Canadian counsel | Review supplied disclaimer, acknowledgment, non-waivable rights, liability/consumer context and export wording. Record reviewer/date/opinion and any explicitly approved version change. | **NOT VERIFIED — PENDING** |
| Human keyboard-only user, Windows Chromium/Edge | Traverse all pages/forms, nested dialogs, disclosure content, menus, tables and error recovery; verify logical order, visible focus and no obscured targets. | **NOT VERIFIED**; automated subset passes |
| NVDA with supported Windows browser | Read first-use/renewed disclaimer, labels/hints, status alerts, profile diff, restore warnings, tables/calendar and nested dialog return; ensure no background record exposure. | **NOT VERIFIED** |
| JAWS / VoiceOver, appropriate supported platforms | Repeat actual assistive-technology journeys and verify spoken labels, reading order and control states. | **NOT VERIFIED** |
| Real browser zoom / text-only resize / magnifier | Test 200% and 400%, enlarged text, focus visibility, every dialog/content state, long names/URLs and text spacing without loss of information/function. | **NOT VERIFIED**; CSS-width subset passes |
| Firefox, Safari and physical mobile/touch | Repeat consent, export, focus, orientation/reflow and source warnings; inspect native date controls, target spacing and touch cancellation. | **NOT VERIFIED** |
| Forced colours / high contrast / all graphic states | Review meaningful boundaries, focus, badges, charts, disabled states and incomplete axe contrast checks. | **NOT VERIFIED** |
| Calendar/spreadsheet clients / physical printer | Import actual warning-bearing files, inspect descriptions/columns, and print A4/Letter and long schedules at intended scale. | **NOT VERIFIED** |

Do not substitute axe results, DOM assertions or fixture clicks for these manual/legal records. Technical acknowledgment is a local UI disclosure gate, **not authentication or encryption**; IndexedDB remains accessible to someone with browser/device tools. Existing exports already held outside the app are not revoked. Recovery uses normal Settings backup after current acknowledgment; the app does not delete records or auto-consent to enable recovery.

The supplied `src/legal.ts` is unchanged, including version 1.0 and non-waivable-rights wording. Its LF-normalized SHA-256 is `0850b9239a7fa435f4f2857ccfcb7b9e225671d529037b778cdbff9c64a3f94f`; L10 compares it with the approved baseline. Technical implementation cannot establish legal sufficiency or remove rights/liability by assertion.
