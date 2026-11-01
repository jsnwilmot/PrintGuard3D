# Issue #41: bounded navigation / claim investigation

Diagnostic submission for independent Architect review, November 1, 2026. **Issue #41 OPEN; #16 P1 RED STOP; Release 1 NOT APPROVED.** No runtime remedy or acceptance change is included.

## Finding and confidence

The selected navigation timing is sufficient to produce a controlled old document followed by a different, uncontrolled replacement document in the disposable instrumented environment. Across all three engines, both clocks and both transports, the 36 deliberately spanning cases failed the prespecified **10-second diagnostic controller criterion**. All 72 before/after cases passed that criterion and the actual offline reload/history assertions. Ungated cases passed 34/36; two Firefox cases showed the same old-controlled/new-uncontrolled state. Fixed historical page time, the extra HTTP proxy hop and deliberate navigation gating are therefore **not necessary for this observed instrumented Firefox pattern**.

This is a discriminating result, not proof of a browser defect or a universal explanation. **ROOT CAUSE OF ALL ORIGINAL N09 FAILURES: NOT DETERMINED.** The untouched original oracle independently retained 29 PASS /1 FAIL: Firefox repetition 3 timed out at 120 seconds in its combined ready/controller evaluation. That uninstrumented evaluation does not reveal which await blocked. Diagnostic failures at 10 seconds are not original N09 timeouts; their later original-120-second outcome and offline proof remain NOT VERIFIED.

## Scope and provenance

Owner [authorization comment 6563589947](https://github.com/jsnwilmot/PrintGuard3D/issues/41#issuecomment-6563589947) and [Architect instructions](https://github.com/jsnwilmot/PrintGuard3D/issues/41#issuecomment-6563321470). Branch `release1/sw-navigation-claim-causality`; approved/frozen runtime `0d388b42afff7f57db01028a64deac85e293d2ba`. Separate from PRs #44/#46/#47, whose heads and draft/unmerged state are preserved. No production site, browser profile, real workshop data, provider settings, Cloudflare, DNS, signing authority, deployment or merge was accessed or changed.

The [plan](PLAN.json) was committed before browser execution: `6494c4a` initial proposal, then `959894d` added the ungated arm and fixed the final 144 cases before sampling. [DESIGN](DESIGN.md) records the intervention and limitations. `ea2162d`/`af6f8d9`/`ee36aa1` added the harness and corrected setup. `9029db7` moved the client probe away from the native claim promise; `a3b950703c7ca774cba69a84391052eaf1530663` pins the actual five-file runtime fingerprint used by the completed comparison and final controls. The PR head additionally contains analysis, evidence, documentation and the supplementary CI workflow; the final exact head and its CI links are recorded in the PR description.

All 17 ordinary built files, original N09 source, original config and extracted PR46 tracing prefix are hashed in [SOURCE](evidence/SOURCE.json). The five executed harness files are hashed in [matrix-HARNESS](evidence/matrix-HARNESS.json), independently checked on worker restart; none changed during sampling. The original six-job validation workflow, application source, service-worker generator, schemas, backups, profiles, schedules, disclaimer and historical evidence are unchanged. The original [86-row matrix](../release1-consumer-transparency/MATRIX.md) remains intact; this [scoped matrix](MATRIX.md) supplements it without reclassifying its evidence.

## Actual local results

Windows 10.0.26300 x64, Node v22.23.3, AMD Ryzen 9 PRO 6950H, 16 logical CPUs, 30,907,015,168 bytes RAM. Disposable Playwright Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2. [Executable SHA-256 inventory](evidence/BROWSER-BINARIES.json); paths are synthetic test installations, never the owner's browser profile. Single test worker, zero retries; no unrelated browser suites ran concurrently.

| Executed group | Chromium P/F | Firefox P/F | WebKit P/F | Total |
| --- | --- | --- | --- | --- |
| Untouched original N09, 10 per engine, original 0/1/12 loop and 120s ceiling | 10/0 | 9/1 | 10/0 | **29 PASS /1 FAIL** |
| Final observer controls: 503 / hash mismatch / delayed success | 3/0 | 3/0 | 3/0 | **9 PASS** |
| Ungated supplemental natural navigation | 12/0 | 10/2 | 12/0 | **34 PASS /2 FAIL** |
| Reload committed before install/claim release | 12/0 | 12/0 | 12/0 | **36 PASS** |
| Navigation response held across native claim | 0/12 | 0/12 | 0/12 | **36 FAIL** |
| Reload initiated after observed native claim completion | 12/0 | 12/0 | 12/0 | **36 PASS** |
| Supplemental matrix total | 36/12 | 34/14 | 36/12 | **106 PASS /38 FAIL** |

No skips, retries or flaky reclassifications. All 144 requested timing arms qualified; all 144 preserved the previously captured observation rows and seven core store arrays. All 106 controlled cases proved the original backend index unreachable, then loaded the cached application and preserved observation contents. For the other 38, that offline step was not reached: **NOT VERIFIED, not an inferred offline/data-loss failure**. Zero-printer preservation is necessarily vacuous for observations but still compares other stores. These checks do not claim whole-database or backup certification.

All cases contain successful digest/cache/marker evidence and a native claim completion; no hash mismatch occurred in the matrix. 141 cases have one 15-digest/15-put/one-marker sequence. Three passing WebKit `before-1` cases show two installation sequences during the retained legacy setup/unregister/reload workflow; both sequences and boot IDs are preserved, not silently deduplicated. They are listed in [QUALIFICATION](evidence/QUALIFICATION.json).

Two setup attempts failed before any browser case (wrong server working directory; missing extracted disposable tooling in a copied run). Their raw reporters remain `controls-attempt-1/2.json`, **0 executed /9 NOT VERIFIED each**, not nine application failures. The initial observer controls then passed 9/9 in `causal-local-3`, before the claim-wrapper refinement. Final controls separately passed 9/9 in `causal-local-4`. Only the latter qualify the 144-case run. Manual preliminary `HARNESS.json` is not the execution fingerprint; authoritative `controls-HARNESS.json`/`matrix-HARNESS.json` are included. No successful rerun replaced a red browser outcome.

Local non-browser checks and CI results are recorded in [VERIFICATION](VERIFICATION.json) and the PR description. CI executes the original six-job suite plus the bounded supplementary experiment; red outcomes remain red. CI can run on GitHub's synthetic PR merge ref; its checked-out SHA and head-tree correspondence must be distinguished from an actual merge approval.

Local root-only regressions passed330/330; acceptance45/45, TypeScript, static validation and ordinary production-build validation passed. An initial `vitest run tests` discovered the disposable frozen worktree as well and passed660tests (two copies of330); its raw report is retained and is **not** claimed as660distinct regressions. `vitest run --dir tests` then selected exactly the original18root files/330tests without disabling any root requirement. The unchanged CI quality job has a clean checkout and no diagnostic source sub-worktree in that job. Build warnings are unchanged third-party annotation and empty React chunk warnings; build output remains nondeployable.

## Client and navigation evidence

Every red case maps two different immutable document UUIDs to two different native `MessageEvent.source.id` client IDs. The old document is observed controlled; the replacement resolves `ready`, reaches complete readyState and remains uncontrolled at the measurement horizon. All 36 spanning replacements are absent from the asynchronous after-claim snapshot while the previous client is observed. Example `chromium-native-direct-spanning-1`:

| Native/server milestone (UTC receipt) | Observation |
| --- | --- |
| 21:06:43.675 | Reload HTML held at origin |
| 21:06:43.790 | Install gate released |
| 21:06:43.820 /43.821 | Native claim start / completion |
| 21:06:43.829 | Old document maps to controlled client |
| 21:06:43.906 | HTML released for replacement commit |
| 21:06:43.949 | New document maps to different client, uncontrolled |

The **two ungated Firefox failures differ materially**: their later after-claim enumerations already include the replacement client, still uncontrolled. Thus absence from that later snapshot is not a necessary explanation. Native claim promise settlement and asynchronous `matchAll` are different observation times; enumeration does not expose the browser's internal client eligibility at the instant claim iterates. The before snapshot is at install start, not a synchronous native claim target list. Missing events are UNKNOWN. Correlation and negative controls support navigation/client-selection timing, but do not establish whether an execution-ready/reserved-client transition, another lifecycle interaction or instrumentation explains each natural original failure.

Use raw per-source monotonic values and boot/document IDs; page fixed time must not be sorted as host time. Node receipt timestamps include transport lag and are not exact browser execution order. The native-clock replacement DOMContentLoaded measurements (72 samples) differ from Node wall receipt by -2 to65ms, median1ms; fixed replacements show year2500. [QUALIFICATION](evidence/QUALIFICATION.json) includes the actual distributions. Server 500ms sampling: 1,887 samples, median interval505.3ms, maximum524.2ms; free RAM minimum14.57GiB; server RSS maximum65.48MiB. CPU/runner/host samples are raw logs. These observations do not rule out browser-process contention; Windows load average is unavailable.

## Primary-source interpretation

The [W3C Service Workers Candidate Recommendation Draft, October29,2026](https://www.w3.org/TR/2026/CRD-service-workers-20261029/), reviewed November1, distinguishes an active registration reached by `ready` from a page controller. Its [claim algorithm](https://www.w3.org/TR/2026/CRD-service-workers-20261029/#clients-claim) considers eligible clients at execution; [enumeration](https://www.w3.org/TR/2026/CRD-service-workers-20261029/#clients-matchall) also has lifecycle eligibility rules. These support the distinction, not a conclusion about unobserved browser internals. No specification passage proves that every replacement here was skipped for a particular internal flag.

## Confounds and boundaries

Both diagnostic transports instrument worker responses; direct means the exact original handler invoked in-process, not an unmodified worker. Pristine ordinary delivery exists only in the separate original baseline. The extra-hop proxy uses the same handler/headers/bytes but does not recreate every prior proxy cookie-binding implementation detail. The old prefix retains up to1s terminal logging drain; the new observer adds `matchAll`, document mapping, event transport, sampling and disk I/O. Explicit install/HTML gates substantially change timing. Native claim itself is invoked immediately and neither enumeration nor telemetry is awaited inside its wrapper. Instrumentation can increase or decrease the race window.

Each cell has three observations, one each0/1/12 printers; order is fixed, not randomized, and Playwright restarts workers after failures. Counts are completed outcomes, not failure probabilities or performance estimates. Same-day native observation dedup differs intentionally from fixed-date expectations. The fixed arm, not the native arm, tests the retained year2400/2500 observations. Real OS-installed PWAs, physical devices, Safari/iOS, hosting, accessibility assistive technology, legal and manufacturer gates are NOT VERIFIED by this work.

## Historical reconciliation (no superseding negatives)

| Preserved evidence | Disposition |
| --- | --- |
| Original CI41246412988 attempt1, source5c0feb2, reporting74/1 Chromium N09 | Original combined wait120s failure retained; blocked stage unknown |
| PR44 CI41316238711 30/0 then41317785445 28/2 on all17 identical artifacts;41317785405 reporting74/1 Chromium | Green sample did not invalidate later Chromium/Firefox failures |
| PR44 final41320990075 standard6/6;41320990085 original29/1 Chromium rep7 +observer144PASS | Separate observer success not original remediation |
| PR44 local observer143/1 Firefox App503 empty snapshot; setup70/1/73NV | Distinct observation/setup limits retained |
| PR46 local pristine30/0; initial controls7/2 then refined9/9; instrumented26/4 Firefox | Earlier controls and failures not discarded |
| PR46 CI41339404745 standard6/6;41339404755 original29/1 Chromium, controls9PASS, instrumented29/1 Firefox | Successful cache/install/activate/claim +ready localized instrumented Firefox controller wait only |
| PR47 CI41342224047 standard5/6, reporting74/1 Firefox N09;41342224203 warning24PASS | Warning behavior is not N09 remediation; PR47 unmerged |
| PR47 earlier warning23/1 local Firefox and CI41340748501 Chromium reconnect20s;41340748385 WebKit N08 contrast2.45 | Separate reconnect and accessibility negatives remain; no claim they share this cause |
| PR47 initial duplicate-status setup40/5; restore checkbox and intermediate WebKit D02 drilldown failures | Retained in PR47's report; not redrawn as N09 |
| Original operational audit30PASS/12FAIL/1humanNV; earlier Firefox G01 controller5s vs fixed G06 polling race | Distinct historical obligations preserved |

Prior [PR44](https://github.com/jsnwilmot/PrintGuard3D/pull/44), [PR46](https://github.com/jsnwilmot/PrintGuard3D/pull/46) and [PR47](https://github.com/jsnwilmot/PrintGuard3D/pull/47) retain their raw evidence/CI links. The current baseline adds a new120s Firefox negative; it does not reinterpret the old ones.

## Recommendations for independent review

1. Audit the recorded client mappings and the before/spanning/after contrasts, including the contrary later-snapshot membership in the two natural Firefox failures. Review the frozen fingerprints and raw red traces before assigning causation.
2. Separately review N09's first-document-control assumption and its actual offline/history oracle. A future test-protocol proposal could distinguish install readiness, current control and navigation into an already-active worker, while preserving explicit first-page failure reporting and original negatives. **No test change is implemented or authorized here.**
3. If Architect recommends production remediation, obtain a new explicit owner authorization defining bounded status/recovery/registration behavior and data/backup/update protections before edits. Do not add repeated claim, forced reload, cache reset, extra retries or a longer acceptance deadline from this report. PR47's fail-closed warning remains separate and unmerged.
4. Keep #41 open and #16 red. No release approval, legal conclusion, hosting verification or merge recommendation follows from this diagnostic package.

All raw comparison/control logs and delivered worker copies are in `synthetic-logs.zip`; all38 red comparison traces and the untouched original red trace are committed. All raw green traces remain locally, hashed in RAW-INVENTORY; CI uploads every trace for14days. [REPRODUCTION](REPRODUCTION.md) describes acquisition and preservation; [FILES](FILES.md) lists changes. Evidence hygiene checked3,849 entries/CRC with no targeted credential matches; that is not an exhaustive security audit.
