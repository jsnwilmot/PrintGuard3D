# Reproduce the bounded diagnostic experiment

Use a clean disposable checkout and synthetic Playwright installations. No production URL, user profile, real backup, Cloudflare or deployment credential is needed. Review [DESIGN](DESIGN.md) / [PLAN](PLAN.json) first. Baseline and matrix failures are retained, not retried. Each run requires a **new** run ID; preparation refuses an existing source worktree.

Node22, npm lockfile, Git full history (including PR46 commit `3bf57b4b1c5142fc5619c06b4946f4be6ccf4c64`), Chromium/Firefox/WebKit dependencies required. `npm ci`; `npx playwright install --with-deps chromium firefox webkit`. A user-installed browser is not used. On Windows set `PLAYWRIGHT_BROWSERS_PATH` to a new disposable cache if desired. Do not run unrelated browser suites concurrently. Local ports4351/4359 must be unused; the pristine original server uses its unchanged configured port.

PowerShell, from repository root:

```powershell
node release1-claim-causality/prepare.mjs architect-sample
$env:PRINTGUARD_CAUSAL_RUN = Join-Path (Get-Location) '.verification-local/claim-causality/architect-sample'
node release1-claim-causality/baseline.mjs $env:PRINTGUARD_CAUSAL_RUN
# A red baseline is an outcome: preserve it and continue to independent controls.
$env:PRINTGUARD_CAUSAL_MODE = 'controls'
npx playwright test --config release1-claim-causality/playwright.config.mjs
# Run the matrix only if controls qualify; record missing matrix cases NOT VERIFIED otherwise.
$env:PRINTGUARD_CAUSAL_MODE = 'matrix'
npx playwright test --config release1-claim-causality/playwright.config.mjs
node release1-claim-causality/analyze.mjs $env:PRINTGUARD_CAUSAL_RUN
node release1-claim-causality/environment.mjs $env:PRINTGUARD_CAUSAL_RUN
```

For Linux use `export PRINTGUARD_CAUSAL_RUN="$PWD/.verification-local/claim-causality/architect-sample"` and `export PRINTGUARD_CAUSAL_MODE=controls` /`matrix`. The supplementary [workflow](../.github/workflows/claim-causality.yml) runs exactly one prespecified sequence, even when the pristine original fails, and runs the matrix only after qualified controls. It never retries a red case. It uploads all failure/success traces and JSON/logs for14days. Archive the artifact before expiry; links do not guarantee indefinite server retention.

Do not edit the five fingerprinted harness files during a run. Preserve SOURCE, mode-HARNESS, original/control/matrix reporters, all events/page-events/case-outcomes, delivered worker copies, traces and resource logs. All ordinary frozen17files must match SOURCE; direct/proxy arms use those same bytes. CI hashes can differ from Windows because of build-environment bytes; compare each run against its own manifest before interpreting.

`analyze.mjs RUN` derives the ledger without changing outcomes. `environment.mjs RUN` hashes only test-engine installations after browser measurement, avoiding extra hashing I/O during the experiment. `package.py` is an optional packaging recipe for the exact four recorded local directories; it refuses an existing evidence folder and is **not** a browser runner or portable inference of another run's expected counts. Inspect its assertions before using on any different run. Preserve every raw failed trace; never overwrite an earlier run with a green repetition.

## Read the evidence

Start with `evidence/original.json` (29/1,original120s) and `evidence/matrix.json` (106/38,diagnostic10s). `SUMMARY.json` includes every case, actual mappings, cache counts and selected timelines; MATRIX lists all48cells. Extract `synthetic-logs.zip` to inspect complete worker/page/server logs. Each nested red archive contains original Playwright `trace.zip` and failure context. The32.6MB `original-firefox-repeat3-trace.zip` is copied byte-for-byte from the pristine source worktree. Use `npx playwright show-trace PATH` on an extracted trace (local viewer only).

`PACKAGE-HASHES.json` covers committed evidence files; RAW-INVENTORY hashes remaining raw local traces too. Mode-HARNESS is authoritative for executed source; the manually written early HARNESS is only in the raw inventory. Logs contain only synthetic localhost identities and machine/test paths. HYGIENE records targeted credential checks and ZIP CRC validation, not a comprehensive security assurance.

Original data/history preservation assertions remain meaningful independently of service-worker state, but a failure before offline proof means that proof is NOT VERIFIED. No diagnostic10s failure may be labeled a120s N09 failure. No passing altered case may replace the original oracle. New sampling requires a newly recorded bounded plan; do not run until green.
