# Changed-file inventory

Only this diagnostic directory and the supplementary workflow are added. No previously tracked application/runtime/test/evidence file is edited. Exact final inventory is also available from `git diff --name-status 0d388b42afff7f57db01028a64deac85e293d2ba HEAD`.

| File | Purpose |
| --- | --- |
| `.github/workflows/claim-causality.yml` | Read-only CI, fixed bounded original/control/matrix sequence and raw artifacts |
| `release1-claim-causality/PLAN.json`, `DESIGN.md` | Prespecified experiment and observer limitations |
| `prepare.mjs` | Detached approved-source build/hash and pinned PR46 observer extraction |
| `baseline.mjs` | Unaltered original30case command and external resource sampling |
| `cases.mjs`, `playwright.config.mjs` | Separate144diagnosticcases/9controls,zero retries,actual outcome ledger |
| `worker.mjs`, `server.mjs`, `observe.mjs` | Disposable worker/client/document probes and navigation timing selection |
| `analyze.mjs`, `environment.mjs` | Derived full ledger,actual test-browser executable hashes |
| `package.py` | Preserve exact local raw evidence,red traces,hashes,qualification and hygiene |
| `.gitattributes` | LF preservation of diagnostic text/log data |
| `REPORT.md`, `MATRIX.md`, `REPRODUCTION.md`, `FILES.md`, `VERIFICATION.json` | Findings,all48cells,reproduction,inventory and checks |
| `evidence/SOURCE.json`, `controls-HARNESS.json`, `matrix-HARNESS.json`, `BROWSER-BINARIES.json` | Exact runtime/observer/browser provenance |
| `evidence/original.json`, `BASELINE-ENVIRONMENT.json`, `BASELINE-EXIT.json` | Pristine original results/environment and retained nonzero exit |
| `evidence/controls-attempt-1.json`, `controls-attempt-2.json`, `controls-attempt-3.json`, `controls.json` | Both pre-browser setup negatives,initial controls and final controls |
| `evidence/matrix.json`, `SUMMARY.json`, `QUALIFICATION.json` | Raw reporter,fullcase/client ledger,resources/clock/qualification |
| `evidence/synthetic-logs.zip` | Complete initial/final control and144case worker/page/server logs/copies;baseline resource samples |
| `evidence/original-firefox-repeat3-trace.zip` | Unmodified original120s red trace |
| `evidence/chromium-red-traces.zip`, `firefox-red-traces.zip`, `webkit-red-traces.zip` | All38 red diagnostic traces and failure context |
| `evidence/RAW-INVENTORY.json`, `HYGIENE.json`, `PACKAGE-HASHES.json` | Local raw inventory,targeted no-match/CRC findings and package SHA-256 |

No new production environment variables. `PRINTGUARD_CAUSAL_RUN`, `PRINTGUARD_CAUSAL_MODE` and optional `PLAYWRIGHT_BROWSERS_PATH` are diagnostic-only. No dependencies or public release build configuration changed. Final quality review includes script syntax,protected-tree diff,evidence counts/hashes/CRC,static repository validation,TypeScript,original regression/acceptance/build and CI. Remaining risks and human verification requirements are in REPORT.
