# Issue #41 diagnostic reproduction

Use only disposable localhost data. Runtime is pinned to approved main `0d388b42afff7f57db01028a64deac85e293d2ba`, independently of this investigation branch's HEAD. Node22, the committed lockfile, Python3 standard library and Playwright's Chromium/Firefox/WebKit binaries are required. No runtime environment variables, provider credentials or signing keys are needed. Do not open a real browser profile or the private hosted application.

## Prepare an isolated source/artifact

From the repository root, run `npm ci` if dependencies are absent, then `npx playwright install chromium firefox webkit` (Linux CI uses `--with-deps`). Run:

```sh
node release1-sw-readiness/prepare.mjs fresh-run-id
```

The script creates a new detached worktree under `.verification-local/sw-readiness/fresh-run-id/approved`, checks out only the approved SHA, links the existing dependencies, compiles its ordinary nondeployable build, and invokes its unchanged compatibility-fixture preparation. It records ordinary file hashes in SOURCE.json and the frozen generation1/2/3 hashes in the generated manifest. Generation3 changes only the title and remains deliberately compatible with generation1. All outputs are nondeployable. The optional third argument is an existing, hash-checked synthetic historical preparation cache; it changes preparation cost, not the source pin or browser assertions. Never reuse a run ID or delete prior evidence to rerun.

## Unchanged N09 baseline

Change directory into that detached approved worktree, then run:

```sh
npx playwright test --config release1-reporting/playwright.config.mjs --grep 'N09 zero/one/twelve printers' --repeat-each=10
```

This selects ten independent repetitions in each of three engines, with the original120-second case ceiling, original assertions, original0 retries, original4359 loopback server and original routing/clock setup. Each case runs0/1/12 printers, so30 cases exercise90 fresh storage contexts. Repetition is a prespecified sample, not retry-on-failure; every failure remains in the report. Do not add `--retries`, increase timeouts, or remove failed rows. The earlier anchored `^N09` invocation selected zero tests because Playwright matches a combined title; that setup error is not a readiness outcome. The corrected substring above selected all30.

## Separate diagnostic matrix

Return to the investigation repository root. Use the absolute frozen directory printed by preparation, or its relative path below:

```sh
node release1-sw-readiness/run.mjs .verification-local/sw-readiness/fresh-run-id/approved/.verification-local/clean-origin/approved 10
python release1-sw-readiness/analyse.py PATH-PRINTED-BY-RUNNER/RESULTS.json
```

On Windows this session used the already-installed browser cache through `PLAYWRIGHT_BROWSERS_PATH=.verification-local/browsers`. That is a test-only path; omit it when using Playwright's default installed binaries. The Python executable may be supplied explicitly if `python` is unavailable.

The matrix prespecifies144 cases: per engine, ten clean-process attempts in each cell of clock absent/present × route interception absent/present, plus second navigation, existing registration after online/offline browser-process reopening, injected503/hash installation failures, navigation during an intentionally delayed install, dynamic-import failure, and held old HTML during a compatible worker update/activation. No real installed PWA, OS restart, Safari/iOS or physical storage pressure is simulated as verified.

The separate harness wraps the page's register promise and observes native `ready`, controllerchange, updatefound and worker states. This instrumentation can perturb timing. It logs browser Date/performance separately from Node's real receive times, server response/close timing, errors, URLs, states and selected/failure traces. Five seconds is a diagnostic observation window matching the old G01 assumption, not a replacement for N09's120-second requirement. Diagnostic browser bootstrap is bounded at20seconds, distinct from readiness;120-second work or10-second cleanup ceilings stop subsequent cases as NOT VERIFIED. There are no automatic retries.

503/hash faults are served only for the synthetic workshop.svg response. No file is changed. Import failure is a synthetic503 for the App chunk. Failed-install cases validate a complete synthetic backup, introduce a native fixture generation2 requirement, invoke the real guarded write, compare all store digests, verify cold offline startup fails without a completed cache, and confirm unchanged records return online. The native control change is explicit test input, not data loss or a schedule/profile update. Held-tab activation uses the exact target/control protocol as a synthetic other reviewed client; it does not authorize or perform a public application update.

Original baseline JSON/traces and raw diagnostic RESULTS/ZIPs remain in ignored local directories and CI artifacts. The committed compact RESULTS and selected events preserve statuses and link raw SHA256 digests. The analyser verifies all frozen build bytes and never changes historical failures. CI runs this separately while preserving the existing six-job validation workflow unchanged; original test failures still fail the job and diagnostic evidence is uploaded even if the baseline fails.

## Evidence interpretation

The36-case pilot passed before final instrumentation was complete. An initial longer series under harness commit77172dd retained a120-second Firefox setup failure before Session.open returned. Its session ownership happened after the awaited launch, so late work could escape the deadline. All following recorded cases are conservatively NOT VERIFIED; the raw FAIL remains. Only the diagnostic harness was corrected. SETUP-FAILURES.json records the source, raw digest, exact failure and continuation limitation. This is separate from the historical5-second Firefox controller timeout and120-second Chromium N09 failure, neither of which is explained by that new setup observation.

Do not interpret a green sample, expected injected failure, successful controlled navigation or headless browser as universal offline/installed-PWA acceptance. Root cause of the original two timeouts remains NOT DETERMINED unless independent evidence establishes it. Keep #41 open, #16 RED STOP and Release1 NOT APPROVED. Any runtime warning, registration, claiming, retry or update-lifecycle change requires separate owner implementation authorization after Architect review.
