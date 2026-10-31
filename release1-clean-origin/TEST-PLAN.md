# Reproduction and evidence contract — #37

All data is synthetic. No private application, production browser profile, external preview, Cloudflare account/project or domain operation is involved. Run from the repository root with Node 22, the unchanged lockfile dependencies and pinned Playwright browsers. The baseline suites and new ledger serve different purposes; the historical red audit is not rerun or reclassified by these tests.

## Commands

```powershell
npm ci
npx tsc -p tsconfig.json --noEmit --incremental false
node scripts/validate-repository.mjs
npx vitest run tests --exclude '.verification-local/**' --reporter=default --reporter=json --outputFile=test-results/standard.json
npx vitest run --config remediation-phase1/vitest.review.config.mts --reporter=default --reporter=json --outputFile=test-results/acceptance.json
npm run build
# If using the pinned local browser cache on this Windows developer machine:
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.verification-local/browsers'
npx playwright test --config remediation-phase1/playwright.config.mjs
npx playwright test --config remediation-phase5/playwright.config.mjs
npx playwright test --config release1-reporting/playwright.config.mjs

# New run ID; existing output is retained, never deleted/reused.
node release1-clean-origin/prepare.mjs review-run-01
node release1-clean-origin/run.mjs .verification-local/clean-origin/review-run-01
```

Local preparation may reuse an already prepared historical run as a third argument, e.g. `.verification-local/operational/op32-run2`. It verifies exact historical source SHAs and every historical artifact/probe hash before reuse. Without that argument, the existing unchanged historical preparer builds the exact source archives. Its dependency lock must match. Do not replace those sources with current stubs. The Vitest exclusion only removes ignored historical source archives from duplicate discovery; all current tracked original tests remain selected. Fresh CI has no such archives in its quality job.

New preparation copies source/public/config/lock into a fresh ignored directory, links local dependencies and builds TWO actual production applications with generation 1 and generation 2. It also compiles test-only probes from the same frozen production db/writer/observation functions. Probes are not shipped in dist and do not mock completion, restore or fences. Generation 2 changes only writer generation, with the same readable data format. The script does not alter ordinary dist while another baseline suite uses it. A final source change requires a new preparation/run.

## New ledger, each of Chromium / Firefox / WebKit

| Family | Observable oracle |
| --- | --- |
| N01 | Clean app has only operational control before consent, public disclosure works without workshop writes, actual synthetic acknowledgment and UI file replacement; rich multi-printer decision/completion/image/observation backup |
| P-action ×21 | Compatible positive control executes each actual mutation path and changes persistent data; invalid selectors/arguments cannot count as stale-write protection |
| N02 | Actual complete waiting worker, both-theme mobile/keyboard/axe checks, explicit backup/update/reload and monotonic activation; every user store preserved, held executable remains loaded and its actual full backup download leaves metadata unchanged |
| S-action ×21 | Same actual operations in the held generation-1 client reject after generation-2 activation; every user store and operational control is exactly unchanged, with per-store digests |
| N03 | Generation-2 completion retains captured recommendation provenance; full file passes the actual strict validator |
| N07 | Caught control-write refusal and an explicitly injected quota exception both abort preceding mutations atomically; not real disk-full evidence |
| N08 | Deliberately mismatched HTML/build identity refuses mutation with no persistent changes |
| N04 | Separate browser profile/origin, actual UI cancel/replace/repeated merge, exact independent readback of all seven core stores and observations, legal renewal and locally reconstructed control |
| N05 | Real persistent browser-process close/relaunch with same disposable profile; server destroys requests and a direct network request demonstrably fails; cached current executable/data open and calendar remains valid in 2400 |
| N09 | Synthetic noncanonical loopback alias serves verified build bytes via test routing; no App module execution, IndexedDB or worker registration. Not provider redirect proof |
| N10 | Injected interruption in actual PrintGuardDB upgrade leaves native-v10 schema, original rows/images and no new control store |
| O-prePhase5 / O-preRecommendations | Exact historical executable and its real usage UI change only origin A; origin B in the SAME browser profile remains intact; cross-origin window IndexedDB access throws SecurityError. A second disposable profile is also clean at B. Older reader rejects enriched file; verified original compatible file restores independently |

Expected executable cases: **53 per engine, 159 total**. New unit cases additionally cover unknown/missing/future controls, protected operational clear, activation refusal, pre-Dexie layout rejection, timestamp consistency and canonical-origin policy. No PASS may be inferred from a mere warning, checksum/download, unopened restore, expected locator failure or different browser profile alone.

Cases have a 120-second diagnostic ceiling; exceeding it fails the run and leaves remaining cases NOT VERIFIED. Firefox update testing observes the actual installed waiting worker and post-reload compiled identity, rather than depending on resolution of a queued update-call Promise; reported API rejections still fail. A replacement window is opened before closing the last held Firefox tab, then the entire browser process is closed/relaunched for the offline oracle.

Each new run writes RESULTS.json with exact IDs/status/UTC/source commit, build/probe hash inventory, browser/profile/origin identities, before/after per-store digests and actual errors. N01 captures an app-only screenshot. SUMMARY.json records counts; any failure exits 1. Full local profiles/builds remain ignored and are never deleted by these scripts. Selected synthetic ledger evidence can be committed; raw personal data must never be substituted. CI uploads only manifest/build logs/evidence, not profiles/source archives. The report must distinguish prepared source commit and final documentation-only commits, and link final-head CI separately.

## Mandatory limits and outstanding human/host work

Headless WebKit is not actual Safari/iOS. A persistent-process reopen is not an OS restart or installed PWA/browser coexistence. Synthetic alias routing is not DNS/CDN configuration. Injected quota/upgrade errors are not physical disk-full/eviction proof. Downloading does not prove the user kept the file or performed a real recovery rehearsal. No manual hard-refresh key sequence, external calendar client, AT user, actual paper/printer or host/provider privacy claim is verified here. Those remain under #15/#25/#16 and existing legal/manufacturer gates.

Original [86-row matrix](../release1-consumer-transparency/MATRIX.md), [red operational results](../release1-operational-preflight/RESULTS.json) and all historical reports remain unchanged: **30 PASS / 12 FAIL / 1 human NOT VERIFIED**. New Option B/future-protocol oracles are separate. Release 1 remains NOT APPROVED regardless of executable counts.
