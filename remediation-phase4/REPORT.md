# Phase 4 — safety, legal disclosures and accessibility

2026-10-27 UTC. Repository: [jsnwilmot/PrintGuard3D](https://github.com/jsnwilmot/PrintGuard3D); [Issue #8](https://github.com/jsnwilmot/PrintGuard3D/issues/8). Branch: `remediation/phase4-safety-accessibility`, based on approved Phase 3 merge `e8cd43314d158229e55698b59c0d43f56d1423db`. Phases 1–3 are accepted. **Phase 4 is submitted for Architect review only; Release 1 remains NOT approved.**

## Result

The application reads no workshop records before current disclaimer acknowledgment. Public exploration uses blank data, so Dashboard, routes, search, notification content, dialogs, print and exports cannot disclose previously stored/restored records. Recording acknowledgment preserves all existing preferences and records. The supplied disclaimer wording/version is unchanged; **qualified independent Canadian legal review remains NOT VERIFIED / PENDING**.

Maintenance details/completion and profile documentation have keyboard-accessible full-disclaimer paths and truthful applicability/source warnings. CSV/ICS and printed schedules carry concise safety/non-affiliation wording within the exported file. Light/dark surfaces and measured text/control/focus pairs are corrected. Dialogs have unique labels, top-layer focus isolation, inert underlying content and focus return; mobile navigation uses the same mechanism. Reflow, skip links, control state announcements and async errors are improved without replacing the architecture.

Local results: **125/125 standard tests**, **45/45 unchanged acceptance assertions**, **20/20 native Chromium cases**, TypeScript, static repository/profile validation and production build pass. All 114 prior regression contracts, 45 acceptance assertions and 13 native sources are preserved, with 11 focused tests and seven new native journeys. Twenty-four axe scans detect zero violations; **18 incomplete contrast evaluations and the explicit manual plan remain outstanding**. This is not a WCAG conformance claim.

## Root causes and corrections

| Finding / cause | Correction | Evidence |
|---|---|---|
| F18: navigation/action checks left full data available to the Dashboard/shell before renewed consent; notifications tested presence rather than current version. | A consistent read transaction obtains preferences first and reads record tables only after current acknowledgment. Pending context contains blank records/public preferences. Notification delivery requires current acknowledgment; transient selection/dialog states reset on renewal. | L01–L03; C01/C07; preserved N01/P3B01 |
| Acknowledgment used the displayed preference object, which would overwrite hidden preferences once the public context was sanitized. | Explicit checkbox action transactionally reloads stored preferences and changes only acknowledgment version/date. No auto-consent or record rewrite. | L03; C01 |
| F18: task/profile legal paths and missing/offline/source context were incomplete; completion relied on disabled/required UI only. | Reusable full-disclaimer link, exact model/technology/source/date presentation, missing/flagged/offline warnings and explicit completion-handler acknowledgment guard. Empty profile source URLs no longer open misleading external links. | L08/L09/L11; C03/C06 |
| F18: CSV/ICS lost safety context outside the app. | All report CSVs append a quoted safety field/header, including empty files. ICS adds calendar metadata and warning-bearing standard event descriptions, correct escaping, UTF-8 line folding and original UID/date semantics. Print includes notices before the table/footer. | L04/L05; C02 |
| F19: theme foregrounds changed without matching page surfaces; low-contrast literal text, whole-calendar-cell opacity and dark control borders remained. | Paired theme surfaces/foregrounds, primary action label/fill tokens, input/focus boundaries, readable calendar states and controlled print colour scheme. | C04; contrast.csv; 24 axe scans |
| Shared dialogs reused one ID, all trapped keys simultaneously, left background interactive and retained stale close handlers. | Portal-based shared Modal with stable unique heading IDs, top-layer stack, current close ref, inert/hidden lower layers, focus containment/entry/return and scoped Escape handling. | L06; C03/C05 |
| Offscreen mobile sidebar remained keyboard reachable; skip hash changed route; selected control states were only visual. | Same sidebar rendered in a modal on narrow screens; hidden closed navigation, expanded/current/pressed states, decoded multiword routes and a skip link that focuses main without changing the route. | C04/C05; prior navigation/segmented date tests |
| Reflow overflow included report grid minimum sizes and absolute screen-reader link text positioned outside its scrolling table. | Constrain responsive cards, wrap headings/controls, anchor clipped link text to its link, and provide named keyboard-focusable local table scrolling regions. | C05; narrow/text-spacing screenshots |

The final PDF inspection also identified dark print page margins and pale safety copy despite white body styles. Print now forces a light colour scheme and dark notice text. Full long-table readability remains a documented separate failure/limit, not silently passed.

## Preserved architecture and data

React/TypeScript/Vite/Dexie, the existing PWA caching mechanism, source verification controls, profile identities/versions, IndexedDB layout, maintenance engine, recurrence/history calculations and backup format are retained. No schema change, migration, new authentication/server/cloud storage, telemetry or production operation is introduced. The only added dependency is pinned **test-only** `@axe-core/playwright@4.14.0` / axe-core; it is injected into owned audit contexts and is not a runtime third-party script. Runtime dependencies and existing CI permissions/deployment boundaries are unchanged. No new application environment variables are required.

The disclosure gate is intentionally not encryption/authentication: a device owner using IndexedDB/DevTools can access local data. Already-downloaded external backups are not revoked. Before acknowledgment the app exposes only safe blank/help/disclaimer UI; afterward the existing Settings backup path remains available. Source documents are not automatically cached; missing/flagged/offline references require current manufacturer instructions or qualified assistance, not a fabricated servicing guide.

Completion, import, profile update and independent-printer preservation guards remain passing. Native replacement compares all seven stores exactly, clears imported consent and verifies hidden restored data before renewed acknowledgment. No printer record, usage reading, custom interval or historical log is modified to fix presentation/consent. Consent storage updates only the legal acknowledgment within the retained preference record. Printer updates, perpetual scheduling through 2400 and unchanged prior native restoration all remain verified.

## Verification and evidence

| Check | Actual result |
|---|---|
| Automated regressions | **125/125 PASS**, 114 preserved +11 new L01–L11; no skipped/pending/failed tests |
| Existing acceptance assertions | **45/45 PASS**, sources/expectations unchanged |
| Native Chromium | **20/20 PASS**, 13 preserved +seven new C01–C07; retries disabled |
| Axe | **24 scans**, zero detected violations; 18 incomplete contrast evaluations retained for manual review |
| TypeScript | `tsc -p tsconfig.json --noEmit --incremental false` **PASS** |
| Static checks | Tracked/staged source paths, obvious secret patterns, MJS syntax, fixture identity, platform lock entries and all reviewed profile digests **PASS** |
| Build | `npm run build` **PASS**; local validation only, not deployment |
| PDF | Actual A4 PDF warning text extracted; locked print contains no stored printer names; rendered page visually inspected; readable notice/print scheme corrected. Long-table readability **not passed**. |

See [evidence and manual plan](EVIDENCE.md), [55-criterion register](accessibility-register.csv), [legal register](legal-register.csv), [actual contrast pairs](contrast.csv), [axe inventory](axe-audit.csv), [86-row matrix](MATRIX.md) and [findings](findings.csv). Native/browser environment, exact ratios and manual NOT VERIFIED items are recorded there. Human screen-reader/keyboard and real Ctrl+zoom checks are not inferred from automation. The reflow test uses 640/320 CSS pixels as 200%/400% equivalents and separately exercises expanded text spacing and landscape.

L01–L03 verify acknowledgment/current-version nondisclosure and retained data/preferences; L04 parses quoted/multiline/empty CSV output independently; L05 tests calendar/event warnings, injection escaping, dates/UIDs and 75-octet folding; L06/L07 verify dialog semantics and field descriptions; L08/L09/L11 check task/missing documentation and completion safety; L10 locks the supplied legal text hash. C01–C07 exercise actual browser/IndexedDB workflows, not simulated DOM restoration. The existing 13 native journeys and all prior assertions remain unchanged. One inherited profile test, V18, now controls Date during its fixed-date completion/install scenario and restores it afterward; its assertions are unchanged. This prevents the original today-based install baseline from making the fixture fail on subsequent CI dates.

Known build warnings are retained: vendor annotation comments, empty React chunk and an application chunk around **523 kB**. No warning threshold is raised. `npm install` reported zero known dependency vulnerabilities at the checked snapshot; that is not an exhaustive security assessment. Raw local reports, screenshots/PDFs, traces and synthetic exports stay ignored; CI preserves its standard, acceptance and native artifacts for 14 days.

### Reproduce

```powershell
npm ci
node scripts/validate-repository.mjs
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --incremental false
node node_modules/vitest/vitest.mjs run tests --reporter=json --outputFile=test-results/standard.json
node node_modules/vitest/vitest.mjs run --config remediation-phase1/vitest.review.config.mts --reporter=json --outputFile=test-results/acceptance.json
npm run build
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.verification-local\browsers'
npx playwright install chromium
npm run test:native
```

Node 22.12+ is needed by the pinned test audit package. CI uses Node 22 and installs Chromium with `npx playwright install --with-deps chromium`. Build must finish before native tests start; port 4357 must be free. Run acceptance/native sequentially because the existing fixture preparation shares an ignored file. Historical runner/artifact names are retained. All contexts are isolated and block requests outside the loopback test origin. Do not seed or reset consent on a live origin.

## Files changed

- `src/App.tsx`: consent-aware read/context, preserved preference acknowledgment, notification guard, safe transient-state renewal, skip-link/routing focus and modal mobile navigation.
- `src/Modal.tsx`, `src/components.tsx`: unique/stacked accessible dialogs, controlled focus/background state, explicit field labels/hints and reusable legal/safety/applicability presentation.
- `src/safety.ts`, `src/Calendar.tsx`, `src/Reports.tsx`: shared export copy, valid warning-bearing CSV/ICS, preserved event identity/dates, readable print warning and named scrolling table regions.
- `src/forms.tsx`, `src/Maintenance.tsx`, `src/ProfileDocuments.tsx`: completion acknowledgment guard, current source/model warnings and full-disclaimer access; explicit absent-link handling.
- `src/styles.css`: paired screen/print colours, measured borders/focus, readable calendar states, target sizing, reflow/text spacing support and navigation/modal presentation.
- `src/Dashboard.tsx`, `src/Printers.tsx`, `src/Settings.tsx`: pressed control states, preserving existing behavior.
- `tests/safety.test.tsx`, `tests/native/safety.browser.mjs`: 11 regressions and seven native journeys; existing assertions unchanged. `tests/profiles.test.ts` only adds a controlled Date/cleanup around the existing V18 fixed-date fixture.
- `package.json`, `package-lock.json`: pinned test-only axe dependency; no runtime dependency version changes.
- `README.md`, `docs/DEVELOPMENT.md`, `remediation-phase3/MATRIX.md`: current review pointers with historical evidence retained.
- `remediation-phase4/`: report, all 86 matrix rows, findings and curated legal/accessibility/contrast/axe registers.

`src/legal.ts`, `src/db.ts`, `src/domain.ts`, `src/engine.ts`, `src/scheduleView.ts`, reviewed profile JSON/manifest, application images/assets, existing acceptance/native sources, PWA build logic, CI workflow and hosting/access files remain unchanged from the approved baseline.

## Architect acceptance and remaining risks

The 29 section summaries are **6 PASS, 21 PARTIAL, 2 FAIL**. Technical export-warning and measured contrast subrequirements now pass; broad accessibility moves from FAIL to PARTIAL while complete manual accessibility remains NOT VERIFIED. F18 remains PARTIAL because its legal-review component is pending, even though technical disclosure/consent/export defects are corrected. F19's documented contrast/surface defects are corrected for the tested scope. Stale carry-forward wording about accepted Phase 2 calendar/report fixes and Phase 3 Pro scope is reconciled without changing those statuses or erasing earlier evidence. All remaining manufacturer/video/Pro/usage-band, legacy backup-reader, historical currency/KPI, print layout, external integration, cross-browser/large import and host-security limits remain recorded. No unrelated features are introduced.

Recommended sequence: Architect reviews the technical gate, export syntax/warnings, data preservation, modal/reflow and measured contrast evidence; qualified independent Canadian counsel assesses legal sufficiency; independent users/testers execute the manual plan and review incomplete axe checks; the owner then evaluates remaining Release 1 blockers separately. No self-approval, merge, deployment, hosting/access change, production-data modification or Phase 5 work is authorized by these results.
