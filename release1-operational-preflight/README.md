# Isolated operational preflight replay — #32

**STOP: operational compatibility is not accepted.** See [REPORT.md](REPORT.md), machine-readable [RESULTS.json](RESULTS.json), [mitigation proposal](MITIGATION-PROPOSAL.md), [matrix](MATRIX.md) and [human worksheet](HUMAN-WORKSHEET.md). This package tests existing source; it implements no application safeguard or deployment. Baseline CI and the failing operational acceptance audit are separate evidence.

## Sources and preparation

- Pre-Phase-5 application: `616e26ee5c0834a3d0900294981bcf8963d2c053`.
- Accepted application before recommendation metadata: `d03eb59cb887cfad335241b9f56d260b5a75abdc`.
- Approved current application: `aa6ae5892fde8e0d621bbb34b765c41739e7a2ba`.

These are fresh builds of exact repository archives with the same installed, reviewed dependency lock, not copies of historical deployed binaries. `prepare.mjs` refuses a differing historical lock, makes new ignored source directories, links the already installed dependencies, runs TypeScript/Vite and indexes every produced `dist` file. All three lock files matched in this execution. It also builds a separate Vite-transformed API probe from each unchanged `db.ts`: the test-only probe runs in a separate loopback test document, never in the deployed bundle. Vite transformation is required for the source's `import.meta.glob` profile loading. Real application imports/exports/completions and updates are exercised through the actual UI; probe usage is explicitly limited to initial synthetic setup, strict validation, and native/Dexie version/table inspection.

Use Node 22 with the repository's installed lockfile dependencies, Git, `tar`, and the pinned Playwright browsers. No account/provider credentials or new runtime environment variables. Windows commands from the repository root:

```powershell
# Pick a new run ID each time. Existing output is never deleted or reused.
node release1-operational-preflight/prepare.mjs op32-review-replay
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.verification-local/browsers'
node release1-operational-preflight/run.mjs .verification-local/operational/op32-review-replay
```

The browser cache variable is test-tool configuration, not an application setting. If browsers/dependencies are absent, install only the pinned reviewed toolchain on the authorized developer machine before testing. Single-engine diagnosis: append `chromium`, `firefox` or `webkit` to the run command. The default runs all three sequentially. No external preview/tunnel/hosting command exists.

The audit exits **1 when any acceptance case FAILS**. Do not turn that into success merely because the known risk was reproduced. Inspect `RESULTS.json` and per-case actuals/errors: a harness exception is not evidence of a safe refusal. New profiles and attempts are generated on every invocation, with loopback-only application requests; no owner's normal profile or actual backup is opened. Browser profile paths stay short under ignored `.local/op32/` because deeply nested Windows storage paths caused backing-store failures during harness development.

## Artifacts and meaning

Each prepared run contains `manifest.json`, source archives/build logs/probe digests, `EVIDENCE-INDEX.json`, `final-console.log` when captured, and uniquely dated `evidence-*` directories. Each attempt records full synthetic snapshots/backups, SHA-256 indexes, per-case loopback origins, browser versions, server/controller events, scripts/cache identities, screenshots and a closed-profile disk-file index. Profiles are separate short directories mapped in events; keep them private/disposable, not in Git. No cleanup deletes a browser profile or source tree.

Committed evidence is the reviewed synthetic RESULTS/version/index summary and selected app-only screenshots. Full snapshots and browser profiles are ignored, reproducible local artifacts. Do not substitute GitHub's temporary baseline CI artifacts for long-term operational evidence. The manifest hashes identify these actual produced bytes; no universal bit-for-bit historical-host build claim is made.

| Case family | What actually runs |
| --- | --- |
| 01 × two old sources | Matching synthetic old workshop → actual download → old validation and UI restoration; native versions and original rows |
| 02 | Current independent origin, Creator 5/Pro, archived/custom data, original definitions/images/readings, four exact-boundary opt-ins, costly CAD/USD completions with captured decisions, four actual prospective observations, full backup |
| 03 | Disposable native v10 → current v20 upgrade, original stores/preferences unchanged, empty observation store/no startup backfill |
| 04 | Fresh current restore, actual preview/cancel, repeat merge, immutable observation conflicts in both modes, native transaction abort with injected quota exception, legacy replacement retaining observations |
| 05 × two old sources | Strict old UI reader rejects enriched file with no writes; pre-upgrade backup restored only into another fresh old origin; no field stripping |
| 06 × two old sources | Deliberate same-origin collision, old UI writes against actual v20 records; inspect missing new provenance, old/current export validity and existing observation preservation |
| 07 | Old loaded tab, actual new-worker activation/cache replacement, new current tab, stale writer attempt, soft reload and Chromium CDP HTTP-cache/SW-bypass reload. Real installed-PWA and physical key testing are not simulated as PASS |
| 08 | Prior cache → browser process close → server destroys requests → direct uncached request fails → new browser process with same disposable profile opens cached app/data; on-disk artifact index |
| 09 | Native version-only change to 30 in a disposable copy, actual old Dexie opening behavior; this is a hypothetical counterexample, not a new app schema |
| 10 | Explicit deletion of only disposable origin database/cache/registration (simulated site clearing), empty app, full backup recovery in another fresh origin; not actual quota eviction |
| 11 | Pristine current origin and complete new-format file remain intact after all separate destructive cases |

Each engine runs 14 cases (01/05/06 each have two versions). Human-only disposition is additional and remains NOT VERIFIED. Do not interpret a cold headless process reopen as an OS restart, actual Safari execution or installed PWA/browser coexistence. Real disk-full, policy eviction, OS notifications/clients/AT and paper are explicitly unexecuted.

## Baseline verification and source boundary

Keep the existing 242 regressions, 45 unchanged assertions and 140 native/printing cases, TypeScript/static/build jobs intact. The existing workflow runs those on the draft PR; it does **not** execute this deliberately failing historical operational audit. No baseline assertion/configuration or app source is altered to conceal the findings. The report/PR link exact final-head CI separately. Historical [86-row acceptance evidence](../release1-consumer-transparency/MATRIX.md) is unchanged; the new scoped matrix does not approve #15/#16/#25 or Release 1.
