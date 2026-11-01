# Issue #41: worker-phase forensic addendum

ROOT CAUSE NOT DETERMINED. Independent Architect review requested; Issue #41 OPEN, Issue #16 P1 RED STOP, Release 1 NOT APPROVED. This branch contains diagnostic code and synthetic evidence only. The separate Issue #45 warning does not repair N09. Historical PR #44 remains draft, unmerged and unchanged at da6f01b39eb58c1ede99f080b0879ae5309823fa.

## Experiment and isolation

The approved main pin is 0d388b42afff7f57db01028a64deac85e293d2ba. `prepare.mjs` creates a detached source checkout, performs the ordinary nondeployable build and hashes all 17 output files, original reporting source and original configuration. The local uninstrumented sample uses identical hashes for all 17 files. Ordinary output contains no forensic code. No source/runtime/schema/cache lifecycle, history, manufacturer, backup, legal or original test changes are included.

Prespecified sampling: original N09 ten times per engine; separate instrumented N09 ten times per engine; three independent telemetry controls per engine. Chromium, Firefox and WebKit, one worker, zero retries, original 120-second N09 case ceiling. The source case still sets up the actual legacy fixture, zero/one/twelve printers, mocked calendar through 2500, reload and offline reopen. A failed early printer-count iteration leaves later iterations NOT VERIFIED. An instrumented variant is not the original oracle.

The proxy at disposable localhost 4359 streams ordinary assets byte-for-byte from the original helper server at 4351, preserving source headers and the original offline control. Only the `/sw.js` response for a synthetic context cookie is prefixed with instrumentation. Original and delivered worker SHAs are recorded per context. The out-of-band telemetry route remains reachable while the application origin's ordinary routes are intentionally offline; it never serves application assets offline. This is a diagnostic exception, not offline-product proof.

Worker-origin events observe the actual native SHA result of each staged response (expected/actual/length), cache puts and completion marker, install resolution/rejection, activation and native claim start/end. No second hashing pass substitutes for the original worker's digest. Page events separately record the actual ready and conditional controllerchange awaits, independent ready, native worker states, navigation IDs, errors and request failures. Node receipt UTC and hrtime are independent of the original test's page clock. Page Date/performance values are virtualized by that original clock and must not be subtracted from worker timestamps. Worker sequence/boot IDs order events even when POST receipt order differs. Missing logging alone never proves that a worker operation did not occur.

## Diagnostic transport correction retained as negative evidence

Initial controls at harness commit c3e989d87814995ae03bd70b9e7ea896216ccbbf: 7 PASS / 2 FAIL. Firefox 503 and bad-hash controls did not receive terminal install-reject records within ten seconds. Earlier worker records existed; rejected-worker termination could cut off queued logging. Those two assertions remain FAIL in `evidence/controls-1-controls.json`, with the raw synthetic archive retained.

A new, separately recorded control series adds a bounded one-second maximum drain of in-flight telemetry to the **instrumented copy's** install/activate promise settlement, and native page worker-state listeners. Controls then passed 9/9. This deliberately perturbs lifecycle timing and may change reproduction frequency. It is not a production fix, not byte identity of the delivered worker, and not proof of causation. The original worker remains unchanged. No rerun was used to reclassify the first controls.

## Executed local outcomes

| Sample / exact source | Chromium | Firefox | WebKit | Total |
| --- | --- | --- | --- | --- |
| Original N09, approved main, original config | 10 PASS | 10 PASS | 10 PASS | 30 PASS / 0 FAIL |
| Initial phase controls c3e989d | 3 PASS | 1 PASS / 2 FAIL | 3 PASS | 7 PASS / 2 FAIL |
| Revised phase controls 592670b | 3 PASS | 3 PASS | 3 PASS | 9 PASS / 0 FAIL |
| Instrumented N09 592670b | 10 PASS | 6 PASS / 4 FAIL | 10 PASS | 26 PASS / 4 FAIL |

The four failed Firefox repetitions are 0, 2, 4 and 9. All fail in the first zero-printer context at the original 120-second ceiling, after ready resolves and while controllerchange is pending. All four record 15/15 matching hashes, 15 puts, completed initial marker, completed install/activate/claim. Of 90 planned printer-count contexts, 78 complete, four fail and eight later contexts are NOT VERIFIED because their parent case aborted. The instrumented sample duration is 17.6 minutes. Raw case outcomes, actual expected/actual hashes, per-context worker SHAs, page/server/worker logs and all failed traces (four separate byte-for-byte native ZIPs) are in evidence; SOURCE pins the unchanged 17 ordinary files. Original local baseline JSON is separate. No successful worker response is substituted for a failed one.

The Windows run IDs are phases-local-1 (initial controls) and phases-local-2 (revised controls plus natural instrumented series, sharing the same immutable source tree). Other authorized #45 suites and one interrupted overbroad local Vitest discovery ran concurrently on this host. These are not controlled-load performance trials; reproduction frequencies cannot be generalized or compared statistically. Supplemental CI uses its own isolated job. Receipt order is not worker execution order.

## Findings and confidence

In captured Firefox instrumented failures the exact ready await resolves; the subsequent conditional controllerchange await reaches the original 120-second case deadline. Each captured failed context records 15 matching native digests, 15 successful asset cache puts, the final marker with initial=true, install completion, activation and resolved clients.claim. The reloaded document starts without a controller and no later controllerchange is observed for that document. This is stronger phase evidence than the historical combined pending evaluation, but applies only to these instrumented failures.

A navigation/first-claim lifecycle race is a supported hypothesis: the one-time initial claim completes around the original test's reload, and the resulting document remains uncontrolled despite an active registration. We have not established the browser's reserved-client selection/commit ordering, proved this is a browser defect, excluded routing/clock/proxy interference, or linked it causally to all historical Chromium/Firefox failures. Matching bytes/cache completion excludes an observed precache/hash/put rejection in these specific captured failures; it does not exonerate every historical run. Root cause remains NOT DETERMINED.

The platform explicitly distinguishes an active registration (`ready`) from a current document's controller. Primary references reviewed 2026-11-01: [ready](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready), [controller](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/controller), [claim](https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim), [Service Workers specification](https://www.w3.org/TR/service-workers/). These explain API semantics, not this application's causal failure.

## Historical acceptance evidence remains unchanged

- Pinned CI [41316238711](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41316238711): original N09 30 PASS / 0 FAIL.
- Same 17 ordinary file hashes, [41317785445](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41317785445): 28 PASS / 2 FAIL (Chromium 9/1, Firefox 9/1, WebKit 10/0).
- Full reporting [41317785405](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41317785405): 74 PASS / 1 FAIL, Chromium N09.
- Exact PR #44 head supplemental [41320990085](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41320990085): 29 PASS / 1 FAIL (Chromium repetition 7), lifecycle observer 144 PASS. Standard [41320990075](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41320990075): six successful jobs. These greens do not override the supplemental FAIL.
- PR #44 local observer 143 PASS / 1 FAIL and initial setup 70 PASS / 1 FAIL / 73 NOT VERIFIED stay separate; the original operational audit's 30 PASS / 12 FAIL / 1 NOT VERIFIED is untouched.

## Recommended bounded discriminating follow-up

Do not implement a claim/reload/retry workaround under this diagnostic authorization. For Architect review, propose three separately labeled synthetic arms, ten cases per engine each, retaining the unchanged original N09 arm and deadline: (A) native clock/navigation with equivalent fixture; (B) original mocked clock; (C) original clock plus controlled reload-start timing relative to test-only pre/post-claim barriers. Record navigation request/response/commit and worker matched clients (including uncontrolled client IDs) before/after the real claim. Include a no-proxy observation arm to measure proxy/flush timing effects. Any altered arm is supplemental evidence, never replacement acceptance. Stop at the prespecified count and retain every failure. Confirm the exact blocked document/client before proposing corrective scope; production lifecycle changes require subsequent owner authorization.

## Reproduction and review

Install locked dependencies and Playwright engines. Run `node release1-worker-phases/prepare.mjs NEW-ID`. Set PRINTGUARD_FORENSIC_RUN to the absolute new run directory. Run the original N09 from its detached `source` checkout using its original configuration and `--grep 'N09 zero/one/twelve printers' --repeat-each=10`; retain reporting-native.json and traces. With the same frozen source, set PRINTGUARD_PHASE_CONTROLS=1 and run `npx playwright test --config release1-worker-phases/playwright.config.mjs`. Then set it to 0 and run that config with the same grep/repetition count. Finally run `node release1-worker-phases/analyze.mjs RUN-DIRECTORY`. Never run original and instrumented localhost 4359 servers concurrently. Existing synthetic profiles/artifacts remain disposable; never point this at a real profile.

The supplemental workflow repeats this protocol and uploads failed as well as successful evidence. Original six-job validation is unchanged. The PR body records exact submitted SHA and CI links; evidence hashes/inventory identify the local executed artifacts. No production signer, hosting/device/installed-PWA/manual Safari or real owner data was accessed. Those gates remain NOT VERIFIED.

Packaging note: the first combined 132.58 MiB phase archive was rejected by GitHub's 100 MiB per-file limit; no branch/ref update occurred. Its bytes remain local. The four native failed traces are now separate unchanged archives (~30 MiB each), with the correlated logs/controls in phase-2.synthetic.zip. The unpublished evidence commit was amended solely for this packaging; statuses and trace contents are unchanged.
