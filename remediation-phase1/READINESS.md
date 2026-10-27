# PrintGuard 3D — Phase 1 readiness after native verification

Date: 2026-10-27 UTC. **Native verification: 6/6 PASS. Recommend Architect review for Phase 1 acceptance. Phase 1 has not been accepted; Release 1 remains NOT ready.** [Draft PR #3](https://github.com/jsnwilmot/PrintGuard3D/pull/3) and [Issue #2](https://github.com/jsnwilmot/PrintGuard3D/issues/2) remain open. No merge, deployment, access-setting change, production-data operation or Phase 2 implementation.

The actual Chromium/React/IndexedDB workflow now verifies full export and replacement, all supported data and relationships, safe/repeated merge, invalid-file/ownership rejection, incompatible-verification quarantine, commit-time destination revalidation, UI acknowledgment renewal, reload persistence and post-restore completion/weekly recurrence. See [complete native evidence and reproduction](NATIVE-VERIFICATION.md) and the [updated matrix](MATRIX.md), especially row 18.1. The earlier file-upload automation blocker was resolved by an isolated Playwright browser without changing security settings.

| Current check | Result |
| --- | --- |
| Original tests | 29/29 PASS, unchanged |
| Phase 1 regressions | 49/49 PASS |
| Native Chromium | N01–N06, 6/6 PASS; zero skipped/retried/flaky cases |
| Full acceptance | 39/45 PASS; U07/U08/U10/U11/U12/U18 remain FAIL |
| TypeScript / production build | PASS |
| Application source change in this continuation | None (`git diff -- src` empty) |
| Dependencies | Only three new pinned development packages; zero existing version changes; npm audit zero advisories |
| 29-section assessment | 4 PASS, 22 PARTIAL, 3 FAIL; native row 18.1 upgraded to PASS |

The native gate is complete for the documented scope. The next decision belongs to the Architect: review the code, native evidence and compatibility limits, then explicitly decide Phase 1 acceptance. Keep the PR draft and issues open until that decision. Release 1 and Phase 2 remain separate decisions. The six known acceptance failures and other documented manufacturer, history/currency, safety/legal, accessibility and integration gaps have not been corrected by this verification task.

## Historical Phase 1 implementation and integration assessment

The following narrative is retained as the earlier assessment, including the browser restriction at that time. Its NOT VERIFIED statements about the native restore gate are superseded by the current results above; other implementation limitations remain applicable. It is not the current verification verdict.

> GitHub integration update — 2026-10-27: the original baseline is preserved on `main`; Phase 1 remains a separate, unaccepted development branch. See [current integration and verification status](../docs/GITHUB-INTEGRATION.md) and [workflow rules](../docs/DEVELOPMENT.md). Raw captures/results are retained locally and excluded from the public repository. Original document copies were archived locally before portable-link edits. Native export is now verified; native restore remains NOT VERIFIED due to browser/Windows automation policy limits. No application deployment or access change occurred.

# PrintGuard 3D — Phase 1 remediation review

GitHub draft review: [PR #3](https://github.com/jsnwilmot/PrintGuard3D/pull/3), related to [Issue #1](https://github.com/jsnwilmot/PrintGuard3D/issues/1) and [Issue #2](https://github.com/jsnwilmot/PrintGuard3D/issues/2). Source synchronization is verified against remote refs; no merge or application deployment occurred. Native restoration remains unverified, as explained in the integration addendum.

**Decision: Phase 1 corrections are implemented locally and ready for review. The application is NOT Release 1 ready.** Phase 2 has not begun. The current native file-chooser restore remains **NOT VERIFIED**.

Development branch: `remediation/phase1-integrity-safety`. Baseline commit: `c938bd8bdf1e9089f1473d3fb1c2e74597066b58`. The Phase 1 application changes remain unmerged. GitHub source publication is separately authorized in the integration request; current synchronization/PR details are recorded in the integration report. No application deployment, hosting/access-setting operation, production database access, external database or authentication change was performed.

The React/TypeScript architecture, Dexie IndexedDB store layout/version, perpetual recurrence model, branding and supplied legal text are retained. Existing data is not rewritten on startup. Testing used fake IndexedDB and a new labelled localhost origin, never the published application's origin.

## Verification results

| Check | Result | Evidence |
| --- | --- | --- |
| Original automated tests, unchanged | **29/29 PASS** | `all-tests.json`: core 22, UI 7; original file hashes in `protected-files.json` |
| New targeted regressions | **49/49 PASS** | `all-tests.json`: domain/integrity 42, UI 7; cases P01–P49 in `test-index.csv` |
| Standard suite total | **78/78 PASS**, no skipped tests | `all-tests.json` |
| Updated acceptance contracts | **39/45 PASS, 6 FAIL** | `review-tests.json`; original result was 25/45 |
| Previously passing acceptance checks | **All 25 remain passing** | A01–A19, U03, U13–U17 |
| TypeScript | **PASS** | `tsc -p tsconfig.json --noEmit --incremental false`; also checked by build |
| Local production build | **PASS** | `build.log` |
| Protected application assets, legal text, direct dependency declarations and original tests | **Unchanged**; lock metadata exception below | `protected-files.json`: hosting manifest, direct dependency declarations, logo, legal module, styles, build configuration and original tests; see the documented lockfile portability exception |
| Current native backup/restore journey | **NOT VERIFIED** | Local fixture opened and seeded; file-chooser automation returned without an import preview. No restore success is inferred. |

The updated matrix retains **86 entries across all 29 sections**: **4 PASS, 22 PARTIAL, 3 FAIL** at section level. Granular rows include NOT VERIFIED where appropriate. These are implementation assessments with stated evidence, not a release approval. Unchanged browser, offline, printing and external-source evidence is explicitly carried forward from the original review, rather than represented as freshly repeated.

## Corrected findings

| Finding / requirement | Root cause | Correction | Regression evidence |
| --- | --- | --- | --- |
| **F01 — §8, §18:** unsafe ownership and merge | Import checked existence in the incoming file, then independently skipped destination IDs; ownership of the resulting graph was unchecked. | Shared graph checks validate task → printer, history → task → printer, compatible consumed stock, repair references and profile versions. Preview identifies conflicts per record. Merge rejects conflicting identities/history and revalidates the destination inside one transaction. Invalid imports change nothing. | R01/R02; P01–P09, P13–P16, P35, P41; existing merge and identical-printer tests |
| **F02 — §9, §18:** impossible usage | Schema checks validated individual rows without cumulative relationships. | Reject usage above current printer totals, baselines above totals or behind completed work, decreasing readings across dates, invalid operating-period dates and fractional print counts. Validate new record inputs before writes. | R03/R07; P10/P11/P25/P26/P41/P44 |
| **F03 — §5, §8:** verified FDM task moved to resin | Form reassignment retained the verification label and stable task ID while existing logs remained with the original printer. | A rule with any history cannot change printer. Reassignment without history explicitly becomes user defined and clears active verification/version claims. Creation, editing, copying/import, automatic registration and profile application all check model/technology applicability. Old history and documentation URLs remain intact. | U05; P17–P21/P23/P37 |
| **F04 — §9, §29:** cadence edit moved backwards | Form reset the cycle offset against the old original anchor. | A shared edit helper rebases changed cadence on the last processed scheduled boundary, retains the original recommendation, and drives both next-due preview and save. Jan 31 progressed through June → two months now gives Aug 30. | R08; P24/P38 |
| **F05 — §9, §12, §29:** backdated completion | Completion compared dates with the original scheduled anchor, not latest work/usage. | Completion and skip reject dates before the latest event for that printer, while keeping printers independent. No silent historical-correction path was introduced. | R05; P25/P26/P46 |
| **F08 — §4, §5:** self-declared verification | A JSON classification was treated as proof of official maintenance applicability. | Missing required verified documentation/date/version metadata is rejected. Plausible claims remain pending unless they match application-reviewed exact model, technology, version, procedure and profile documentation metadata. Acknowledging a package does not grant verification. No new maintenance interval was invented or approved. | R06; P19–P22/P40/P43 |
| **F09 — §3, §4:** installed models unusable | Selectors read only the static catalogue. | Installed canonical definitions extend manufacturer/model choices and supply technology. Pending definitions never advertise or automatically apply verified schedules. This is supporting profile-safety work, not expansion of manufacturer coverage. | U01/P36 |
| **F11 — §9:** zero default usage baseline | Printer selection and baseline initialization used different identifiers. | Resolve the selected printer first and initialize both baselines from its actual readings; guard saves against inconsistent usage. | U06/R07/P11 |
| **F21 — §9:** early one-time work rejected | A one-time due date was incorrectly treated as the previous service date. | Chronology checks distinguish the one-time due date from tracking/service baselines. Valid early completion is accepted and ends that one-time rule. This small correction is part of the guarded completion boundary. | R04; original one-time test |

Additional related guards reject stale task/printer edits after concurrent completion; prevent deleting or reassigning consumed inventory while history refers to it; and keep existing repair ownership fixed. The actual repair form uses the guarded writer, verified by P47. These close normal-write paths that could otherwise recreate invalid relationships after import validation.

## History and profile work completed, with remaining limits

**F10 — PARTIAL.** Profile updates now archive earlier definitions in the existing profiles store, resolve exact applied versions, reject same-version redefinitions and reserved archive-key misuse, and preserve active task IDs, customizations and all logs. Stable `templateId` is supported across title changes. Preview displays current/incoming intervals, descriptions, materials and safety text. Evidence: U02–U04, P31–P33/P40–P42. Legacy definitions without a stable ID still use title fallback; a complete semantic field diff and explicit legacy-identity mapping remain outstanding. Existing legacy tasks are not automatically relabelled or rewritten.

**F15 — PARTIAL.** New completion, skip and postponement logs capture category, priority, manufacturer, model, technology, profile/template identity, source version and currency. Historical filters use captured facts and recorded outcomes instead of the current rule. Original source references remain unchanged. Evidence: U09, P23/P34/P39/P45. Older rows without snapshots remain unknown; they remain visible without category/priority filtering and are not retrospectively assigned current metadata. Individual costs use their snapshot currency. Legacy currency and mixed-currency aggregate semantics still require further reporting work; there is no conversion or historical reconstruction claim.

## Data preservation and fault testing

The full fixture has two independently registered Creator 5 printers, a resin printer, custom recurring/condition/print schedules, completed records, usage readings, shared and printer-specific inventory, a repair, embedded images and profiles. P16 verifies full and individual-printer JSON restoration. P45 restores the **original native-browser schema-1 export** and compares all seven data arrays exactly, leaving legacy history fields absent. Imported consent is not reused; replacement deliberately renews acknowledgment.

Fault injection uses real Dexie creating hooks, not a success stub. P13 throws after replacement has cleared stores and begun reinserting rows; P14 interrupts merge after an earlier new row; P46 throws during history creation after stock deduction. Every affected store is compared with its pre-operation snapshot after rejection. P15 changes the destination after a successful preview and confirms commit-time rejection. Repeated same-file merges are idempotent. Matching mutable rows are disclosed and retained; conflicting history is rejected rather than overwritten. Duplicate maintenance activity under a different identifier is rejected. P48/P49 also prove that repeated identical completion saves are blocked and unchanged postponements do not append duplicate audit rows, so normal repeated saves cannot create a file rejected by the duplicate validator.

No migration is needed for this phase: new attribution/identity fields are optional and the IndexedDB schema remains version 1. The updated reader accepts original schema-1 input. **The original strict application may reject enriched schema-1 exports from this development version.** Keep the updated reader with new exports; introduce an explicit format-evolution/migration policy before a future incompatible schema. No claim of backward importing enriched files into the original published app is made.

If existing records already violate these invariants, guards fail closed. Export remains available; this phase does not silently repair, delete, reassign or reinterpret them. Any real-data correction needs a separate, explicit, traceable plan based on an intact backup.

## Acceptance harness changes

Original reports, matrices, raw results and native evidence remain under `acceptance-review/`. Current rerun sources/results are under `remediation-phase1/`; no original failing assertion was skipped or converted into an expected-success case.

Two rerun harness corrections are explicit:

1. **R08** originally manufactured the defective object by resetting its offset directly. The rerun calls the actual repaired `saveTask` path and asserts the exact forward due date. The original test remains retained as baseline evidence; directly constructing an invalid edited object is not a test of the repaired save boundary.
2. **U02** originally required a unique interval text match despite proposing two tasks with that interval. The rerun requires both interval matches. It strengthens the visibility check without changing the required result.

A17 writes its generated fixture into the current evidence folder. An earlier exploratory invocation of the original suite refreshed its generated `acceptance-review/fixture-backup.json`; the original browser export, native restore comparison, baseline result reports and matrices remain retained. The native export is separately used by P45 as the legacy preservation fixture.

Current automation tests are unit, component and isolated database checks; they are not presented as native end-to-end journeys. Native checks in this phase confirmed an empty new localhost database, seeded only labelled synthetic records, and opened the app/Settings. File-chooser automation did not reach the import preview, so neither a current native replacement nor native export/restore was claimed. The isolated server was stopped. The published app and its browser database were not inspected or changed.

## Remaining failures and remediation sequence

| Contract | Remaining issue | Finding |
| --- | --- | --- |
| U18 | Segmented entry of 2035 leaves NaN calendar cells | F06 |
| U11 | Actual due hour/print work is absent from the calendar | F12 |
| U10 | Completed calendar events ignore selected filters | F16 |
| U07 | Upcoming report omits due usage-only work | F12 |
| U08 | Parts report columns do not match values | F14 |
| U12 | Upcoming horizon includes overdue/undated work incorrectly | F13 |

Other unresolved findings remain visible in `findings.csv` and the matrix: complete official Creator 5 coverage (F07); the remaining parts of F10/F15; print content/layout (F17); disclaimer distribution, renewed-consent preview and qualified legal review (F18); contrast/dark surfaces and full accessibility testing (F19); notification/email integration acceptance (F20); and genuine R2 backlog (F22). Automatic forecasting, guided procedures, richer charts, cloud connectivity and additional cosmetic work were not added in Phase 1.

Recommended next sequence, **only after Phase 1 review and separate authorization**:

1. Recheck the final development build with the native chooser, full/printer export, merge, replacement and exact post-restore comparison. Review fail-closed handling of any actual legacy inconsistency before touching real records.
2. Repair calendar date entry and actual due-work visibility/filtering: F06/F12/F16, including real segmented entry through 2035 and beyond.
3. Research the full exact-model Creator 5 documentation and finish profile identity/diff limits: F07/F10. Retain earlier reviewed allowlist definitions when future app versions add profiles; do not promote package assertions to proof.
4. Correct reporting, KPI horizons, historical/currency semantics and print output: F12–F15/F17. Agree R1 versus enhanced R2 forecasting scope explicitly.
5. Complete safety-warning distribution, renewed-consent behavior, accessibility and controlled integration checks: F18–F20. Obtain qualified legal review before any separately authorized public launch.
6. Rerun the complete acceptance journey, native backup/offline workflows and cross-browser/device checks before considering release readiness.

Phase 1 is suitable for code review and planning the next remediation scope. It is not approval to start Phase 2, merge, deploy or release. The native restore gap must remain an explicit verification item.

## Changed files and final quality review

| File | Purpose |
| --- | --- |
| `src/integrity.ts` | Shared graph validation, semantic identity comparison, grouped chronology and duplicate-activity detection |
| `src/domain.ts` | Optional provenance/history fields and stricter verified metadata/whole-print schemas |
| `src/db.ts` | Guarded import preview/commit, completion/edit/postponement/repair/inventory/printer writes and immutable profile definitions |
| `src/profiles.ts` | Evidence-based applicability, quarantine, registry identity and exact applied-version resolution |
| `src/engine.ts` | Shared fixed-cadence edit rebasing helper; recurrence generation remains perpetual |
| `src/forms.tsx` | Route forms through guards, initialize actual baselines, preview next due, show truthful pending profiles |
| `src/Settings.tsx` | Per-printer import relationships/conflicts and safe profile review/application |
| `src/Printers.tsx` | Exact applied documentation version and truthful pending labels |
| `src/Maintenance.tsx`, `src/Calendar.tsx` | Guarded postponement with historical snapshots; preserve source/interval behavior |
| `src/Reports.tsx` | Historical snapshot filters and per-record currency display |
| `src/App.tsx` | Guard deletion of stock referenced by history |
| `tests/integrity.test.ts`, `tests/integrity-ui.test.tsx` | 49 targeted domain, persistence, fault-injection and actual-form regressions |
| `README.md` | Updated behavior, compatibility constraints, verification scope and reproduction commands |
| `remediation-phase1/` | Updated 86-row matrix, findings, raw test/build results, reproducible rerun and evidence generator |

Quality review checked transaction boundaries, stale writes, guarded UI wiring, legacy-field handling, verification labels, archive-key collisions, duplicate detection and documentation accuracy. All modified modules are free of unused-local diagnostics. An optional repository-wide `--noUnusedLocals` check still reports eight pre-existing unused imports in unchanged `components.tsx`, `Dashboard.tsx` and `Help.tsx`; the configured TypeScript check/build passes. Vendor annotation and empty-chunk build warnings are nonfatal and retained in `build.log`. No dependencies or environment variables were added.

Reproduce from this application directory:

```powershell
node node_modules/vitest/vitest.mjs run tests --reporter=json --outputFile=remediation-phase1/all-tests.json
node node_modules/vitest/vitest.mjs run --config remediation-phase1/vitest.review.config.mts --reporter=json --outputFile=remediation-phase1/review-tests.json
npm run build
python remediation-phase1/generate-results.py
```

The acceptance command is expected to return nonzero until the six remaining contracts are corrected. Retain the acceptance fixture module and original synthetic native export with the regression tests that use them. Inspect `summary.json`, `test-index.csv`, `findings.csv`, `MATRIX.md` and `acceptance-matrix.csv` alongside this assessment.

## GitHub integration final-verification addendum — 2026-10-27

The original 29 tests and all 49 Phase 1 regressions pass again (78/78); the full acceptance rerun remains 39/45 with U07/U08/U10/U11/U12/U18 failing. A17 now prepares a richer synthetic native fixture with both a pending current registry definition and an immutable archived applied definition. P45 uses the same original synthetic legacy dataset from its reviewed fixture namespace, rather than relying on an excluded raw browser export. Neither change bypasses a failing assertion or changes application behavior.

Native Chrome exported the complete three-printer dataset through Settings. All seven exported data arrays and the preferences at export match the labelled native IndexedDB inspection, including images, repairs, stock and three profile definitions. The export SHA-256 is `8b34dc3cb1e53dba81d9416e717515a969225b07960c4054e67b15c0d27f1061`. A synthetic printer was then archived as a reversible replacement-test marker. The upload API required disabled extension file-URL access; settings were left untouched. The native Windows fallback was stopped because the browser URL could not be validated confidently. No restore or native invalid-import success is claimed. Automated import/rollback/safety coverage stays passing, but it does not replace this native gate.

Application source under `src/` is byte-identical to the previously verified Phase 1 source manifest. GitHub workflow/documentation and test-fixture packaging were added; Phase 2 and production changes were not started. Native restore, conflict/repeated imports, native post-restore completion and native classification checks remain outstanding in Issue #2. Do not accept or merge Phase 1 until they are evidenced and an Architect approves.

### CI lockfile portability exception

The integration CI found omitted Linux optional build binaries before any tests could start. The lockfile correction adds 77 missing optional entries and registry URL/integrity metadata for four same-version bundler packages. No existing package version or direct dependency declaration changed, and no existing package entry was removed. This is a documented exception to the initial lockfile-unchanged preservation check; the original remains in Git history. Native restoration is still unverified.
