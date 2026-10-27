# Phase 1 native browser verification

Date: 2026-10-27 UTC. Run began `2026-10-27T15:49:34.833Z`; duration 27.2 seconds. **6/6 PASS**, zero skipped, flaky or failed cases. Native restoration is now **PASS for the tested Chromium workflow**. Phase 1 is recommended for Architect acceptance review; it has not been accepted, merged or deployed. Release 1 remains not ready.

## Method and isolation

Pinned development dependency `@playwright/test@1.64.1` launched its matching Chromium 156.0.8078.4 in fresh nonpersistent contexts. Tests use only `http://127.0.0.1:4357`; the existing local verification server is owned and stopped by Playwright. Server reuse is disabled. Exact origin is asserted before uploads and IndexedDB inspection. Requests outside that origin are blocked. No existing browser profile, extension, hosted app, production records or browser security settings are used.

The fixture reuses the reviewed synthetic legacy export, adding a pending registry 2.0.0 and archived applied 1.0.0 definition. It contains three printers (two independently registered Creator 5 FDM plus resin), five independent rules, three completed logs, three readings, two inventory records, one repair, three profiles, preferences and embedded one-pixel test images. Every context is confirmed empty before initial setup. Only initial fixture creation uses the existing guarded review harness. All restoration uses the actual React Settings file input via Playwright `setInputFiles`, the real preview, confirmation and commit handlers. Read-only native IndexedDB inspection compares outcomes; no application import function is called directly and no restored record is written by the test.

This is an actual browser/React/IndexedDB journey using supported file-input automation, not a witnessed OS file-picker dialog. See [Playwright file uploads](https://playwright.dev/docs/input#upload-files) and [browser installation](https://playwright.dev/docs/browsers).

## Acceptance evidence

| Case | Result | Actual evidence |
| --- | --- | --- |
| N01 export and replacement | PASS | Settings downloaded JSON. All seven collections and preferences at export matched native IndexedDB. A printer name and preference were changed through the app, then full replacement restored every record exactly. |
| N01 regenerated metadata | PASS | Imported acknowledgment becomes null; the real unchecked disclaimer gate appears. A fresh synthetic acknowledgment is recorded through the UI. Export captures lastBackup before the export handler updates it; restoring that exact backed-up value is expected. No other restored values are normalized for comparison. |
| N01 persistence | PASS | All restored records survive reload and another page in the same isolated context. This does not claim cross-device sync or persistence after deliberate browser-data deletion. |
| N02 safe/repeated merge | PASS | Adds a custom task and stock record; retains locally changed printer name and destination preferences; preserves every existing collection. Repeating the same import changes nothing. A valid incoming graph conflicting with destination ownership is blocked; commit is disabled and all stores remain unchanged. |
| N03 invalid imports | PASS | Malformed JSON, unsupported schema 99, duplicate task IDs and cross-printer log ownership are rejected through the actual file input. Every store, including preferences, is unchanged. |
| N04 incompatible verification | PASS | A Creator 5 verified-task claim on resin is disclosed as pending before confirmation and stored as Pending Verification after explicit merge. Other records are unchanged and the task dialog never shows Manufacturer Verified. This is deliberate quarantine, not rejection of otherwise valid custom scheduling data. |
| N05 restored maintenance | PASS | Opens all three printers, checks their independent plans/history, and resolves the FDM applied 1.0.0 documentation while registry 2.0.0 remains pending. Task dialogs show independent thresholds 1100 h, 1150 h and 8 prints. |
| N05 completion and recurrence | PASS | Completes the restored weekly task on 2026-10-27 through the safety/maintenance form; next due is 2026-11-03 and recurrence remains indefinite. Every prior log remains; other rules and printers remain unchanged. Completion persists after reload. |
| N06 changed destination at commit | PASS | A second real app tab changes ownership after a valid import preview. The first tab's commit rejects with `Import rejected. No records changed.` All stores match the post-edit snapshot; a proposed new inventory marker is absent. |

N01 actual downloaded export SHA-256: `3993953a16719708a3102059488afbb930fc7732d2ada6edd3c073a317710bd9`.
Final native JSON report SHA-256: `8511ec31c84258b2b72c64715366efebfed26986506d5f9d45687533d0e23115`. Export digests differ between runs because exportedAt is current metadata. No application records are ignored in exact comparisons.

The native failed-import cases prove unchanged native storage for rejected inputs and changed-destination commit rejection. Deliberate failures after partial transaction writes remain separately covered by P13/P14/P46 using real Dexie hooks and fake IndexedDB; no such browser fault injection is claimed.

## Regression results and preservation

- Original 29 plus 49 Phase 1 tests: **78/78 PASS**.
- Full acceptance: **39/45 PASS; U07/U08/U10/U11/U12/U18 FAIL**. No skip or expected-failure conversion.
- TypeScript and production build: **PASS**. Existing vendor annotation/empty-chunk warnings remain nonfatal.
- `src/`, existing tests, legal text, assets, architecture and IndexedDB schema are unchanged by this continuation. No Phase 2 implementation.
- Only three locked packages were added: @playwright/test, playwright and playwright-core at 1.64.1. No existing locked package version changed or entry was removed. npm audit reported zero advisories at verification time.
- CI adds an independent native job; the full acceptance job remains red until separately authorized corrections. CI has no deployment step.

## Reproduction and retained evidence

From the application repository root (Node 22):

```powershell
npm ci
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.verification-local\browsers'
npx playwright install chromium
npm run build
npm run test:native
node node_modules/vitest/vitest.mjs run tests
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --incremental false
node node_modules/vitest/vitest.mjs run --config remediation-phase1/vitest.review.config.mts
```

On Linux CI use `npx playwright install --with-deps chromium`. Port 4357 must be unused; never retarget the suite at a hosted URL. The generated synthetic fixture is rewritten during initial setup, never from personal backups. Run acceptance and native commands sequentially because both prepare this ignored fixture file.

Evidence: `test-results/native-results.json`, each N01–N06 directory under `test-results/native/` (trace.zip; actual synthetic downloads for N01/N02/N05; comparison attachments; two success screenshots), and `playwright-report/`. Inspect with `npx playwright show-report playwright-report` or `npx playwright show-trace <trace.zip>`. CI uploads these synthetic-only artifacts for 14 days. Raw exports, traces and reports are ignored by Git; this curated assessment and test source are committed. Standard/acceptance raw reruns remain in `.verification-local/native-final-standard.json` and `.verification-local/native-final-acceptance.json` locally.

During test authoring, fixture inspection initially raced its asynchronous result; a selector expected an exact label despite the select's option text; and the server cwd needed explicit configuration. These harness issues were corrected without app changes, test skips, retries or relaxed expected outcomes. Direct navigation to an encoded multiword hash (`/#My%20Printers`) was also observed to show the fallback page; tests use actual navigation controls. This existing deep-link issue is recorded for later review; it was not repaired or hidden as a restore failure.

## Remaining risks and recommendation

Recommend **Architect review for Phase 1 acceptance**: the remaining native verification gate has supporting evidence. This recommendation is not self-approval. Keep draft PR #3 and Issue #2 open pending human review. No merge, application publication, access change or production modification occurred.

Release 1 remains not ready: six calendar/reporting failures, incomplete manufacturer coverage, remaining profile diff/legacy identity and historical currency limits, warning/accessibility/legal/integration gaps persist. Only the existing app-reviewed Creator 5 procedure is verified; this test does not approve new maintenance advice. Cross-browser/device/assistive-technology coverage, real-world large images and backups near 100 MB are not established. Existing contradictory real data still fails closed and needs an explicit separate repair plan. The original strict reader may reject enriched schema-1 files. Phase 2 requires separate authorization.
