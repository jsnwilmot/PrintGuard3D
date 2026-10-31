# Issue #39 - implementation and independent-review evidence

Prepared 2026-10-31. Approved base `f93bbf5297ac1ca858a521cc2781777b4c492073`. Branch `release1/release-contract-update-confirmation`; [draft PR #40](https://github.com/jsnwilmot/PrintGuard3D/pull/40). Final runtime and complete tested tree: `cca78eff8c50e3d584084b819dad3072aa9ec1de`. Subsequent evidence/documentation changes preserve that runtime and test logic; exact submitted SHA and final-head CI are recorded in the PR. **Engineering submission only: no merge, deployment or Release 1 approval.**

## Root causes and corrections

F1: changing a build hash did not advance persisted writer generation, and an environment fallback could silently retain generation 1. Runtime cannot infer invisible semantic drift. The single release-contract.json now declares version, immutable ancestor baseline, writer protocol/generation/capabilities, native layout, affirmative compatibility classification, reasoning and evidence. Compatible declarations retain the baseline generation; same-format writer bumps must increase it. Unknown layout/format/capability transitions STOP rather than guessing migration.

Public packaging additionally requires clean exact source SHA/build-bound compatibility review and an Ed25519 signature from an independently enrolled public key. Altered source/build/decision, unknown signer, inconsistent generation, missing review or invalid signature fails before new output. **The real reviewer register is empty.** Ordinary development/fixture builds are marked nondeployable and refuse canonical App/database/worker bootstrap. The generated worker independently rejects canonical installation before asset fetches or cache writes, so an existing installed PWA cannot adopt development bytes through its worker update check. G25 executes the generated script with synthetic negative and positive worker globals; it does not access the real host or constitute release approval. No URL/preference/import can change generation. No public approval or real signing authority was manufactured.

F2: separate worker/control polling retained unscoped backup/confirmation booleans. The replacement authority is bound to executing build, concrete waiting-worker object/build/writer descriptor and persisted control snapshot. Candidate/control/offline/error/unknown/acknowledgment changes revoke it; late/ABA backup completion cannot authorize a different candidate. Final activation rechecks exact state. The target worker independently checks its build and expected persisted requirements; native epoch adoption and every ordinary transaction fence remain intact. No forced timeout reload or record rewriting occurs after failure.

Final code review found an additional error-starvation race: overlapping 3-second checks could perpetually supersede 5-second identity timeout errors. CandidatePoller now serializes interval/focus reads; current errors revoke review, interrupted results are ignored, and stopped callbacks cannot revive state. The stronger G06 drops identity replies and requires background polling alone to revoke confirmation within 15 seconds, without an activation click. **Calibration against pre-fix runtime 5c0feb2 failed as intended:** after the timeout window, the checkbox remained checked and activation button enabled. That old case remains FAIL in DIAGNOSTICS. Corrected G06 passes in Chromium/Firefox/WebKit; F16/F17/F18 independently test ordering/cancellation/unmount. Earlier passing immediate-error cases did not cover this race and are not represented as its proof.

## Preservation and architecture

React/Vite/Dexie, native20 ten-store first-public layout, strict portable backup schema 1, five runtime capabilities, observation/recommendation formats, profiles, schedules, history and disclaimer 1.0 are unchanged. No database migration or private-origin transfer was introduced. Records, original IDs, versions, images, currencies, recommendations, immutable observations and custom schedules remain intact. Recurrence through 2400 and beyond remains covered. See [DESIGN.md](DESIGN.md) for the release matrix, signing format, protocol and trust boundaries.

The accepted #38 zero-existing-public-users premise and exact acknowledgment-only W14/W15 exception remain. All prior reports, the original [86-row matrix](../release1-consumer-transparency/MATRIX.md) and [operational audit](../release1-operational-preflight/RESULTS.json) are unchanged: **30 PASS /12 FAIL /1 human NOT VERIFIED**. New tests do not reclassify those failures.

Original assertion/spec files, deadlines and retry settings are unchanged. N11's synthetic candidate-delivery setup now uses the required target/control handshake; its consent/backup/history/adoption assertions are identical. Preparation adds a nondeployable generation-1 title-only compatible fixture, plus generation 2 for same-format adoption. Probes call actual frozen persistence functions. Additive controlled-session preparation awaits the active worker, navigates into it, and verifies controller plus every store before the scenario; it does not assert a guaranteed cold-first-page claim deadline. Runner/harness hashes match committed blobs.

## Executed results

| Check | Actual result | Evidence |
| --- | --- | --- |
| Regression tests | **330/330**, 287 preserved +43 additive | [43 new unit cases](UNIT-RESULTS.json), raw report hash and CI |
| Original acceptance assertions | **45/45 unchanged** | VERIFICATION and CI |
| Original Chromium | **20/20**, no skip/flaky | Native JSON hash and CI |
| Original compatibility/printing | **45/45**, no skip/flaky | Three-engine/PDF result hash and CI |
| Original reporting/safety/privacy | **75/75**, no skip/flaky | Reporting result hash and CI |
| Preserved compatibility/recovery | **171/171**, all **66** stale cases preserve every store/control digest | [Preserved ledger](BASELINE-RESULTS.json) |
| Additive native governance | **27/27**, nine per Chromium/Firefox/WebKit | [Current native ledger](RESULTS.json), including background G06 |
| TypeScript, static, production build | **PASS**, three immutable definitions preserved | Local and source CI |
| Actual unsigned release command | **Expected rejection**, existing artifact bytes unchanged, no new files | [RELEASE-GATE.json](RELEASE-GATE.json) |
| Complete source CI | **Six jobs SUCCESS on first attempt** at cca78ef | [Run 41252563922](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41252563922) |
| Real signing enrollment, host/device/manual/legal/manufacturer gates | **NOT VERIFIED** | Outside authorized execution |

All current local results use the corrected runtime/tree above. See [VERIFICATION](VERIFICATION.json), [runtime/build/probe manifest](RUNTIME-MANIFEST.json), [artifact checks](ARTIFACT-CHECK.json) and [portable checksums](EVIDENCE-INDEX.json). Final documentation-head CI and exact SHA are linked in the PR. All fixture assets are hash-checked; 15 precache entries and manifest/icon sizes were inspected. Screenshots and the selected actually downloaded full backup are exclusively synthetic.

## Retained failures and test adjustments

[DIAGNOSTICS](DIAGNOSTICS.json) retains prior failures, not renamed PASS. Initial parallel G19 exceeded its default 5-second unit deadline while the real Vite subprocess took 7.7 seconds. Only that new integration case has a bounded 30-second test /20-second child ceiling; its nonzero exit and exact missing-signature assertion remain. A parallel local run missed original L03/acknowledgment heading waits under browser load; original limits were not edited. The subsequent complete current 330-case run passed.

One early additive Firefox setup did not observe its first-page controller within 5 seconds. Controlled-navigation preparation now verifies all store bytes and a controller before arranging updates. That is fixture preparation, not proof that every first cold page is claimed by a deadline. Original controller/update assertions are retained.

Separately, source CI 41246412988 attempt 1 had 74 PASS/1 FAIL: original Chromium N09 stalled at serviceWorker.ready/controllerchange, before offline assertions, with a synthetic clock in 2400/2500. The same unmodified case passed three local repetitions, the full unchanged CI retry passed 75/75, and corrected-source current CI plus the full local suite passed. The intermittent cause is **not established**; a green rerun is not a root-cause fix. See [actual CI excerpts](CI-EXCERPTS.md). No automated retry/suppression was added. Existing intentional Dexie W13 SchemaDiff and dependency annotation/empty-chunk warnings remain visible.

The later deterministic background-polling failure is a different, identified defect: old runtime fails stronger G06 with checked/enabled review; corrected runtime passes all three engines. Its negative proof and F16/F17/F18 are preserved separately from readiness diagnostics.

## Complete changed-file inventory

[FILES.json](FILES.json) lists every changed path/status. Main groups:

| Files | Purpose |
| --- | --- |
| release-contract.json; scripts/release-contract.mjs and .d.mts | Explicit contract, immutable baseline, exact build identity, signature gate and describe-only CLI |
| scripts/service-worker.mjs and .d.mts; vite.config.ts | Typed build declarations/metadata, complete offline cache and target/control activation handshake |
| src/writerSafety.ts; src/main.tsx; src/vite-env.d.ts | Single writer declaration and canonical nondeployable guard; existing data fence unchanged |
| src/updateReview.ts; src/UpdateSafety.tsx | Scoped authority, serialized reads, lifecycle/error invalidation and final revalidation |
| package.json | Local build:release /release:describe commands; no dependency/lock changes |
| tests/release-contract.test.ts; tests/update-review.test.ts | 25 release tests and18 authority/ordering tests |
| release1-clean-origin preparation/harness/runner; release1-release-governance/run.mjs | Frozen real builds, compatible fixture, N11 setup adapter, actual failure/positive controls and 27 additive native cases |
| .github/workflows/validate.yml | Immutable Git ancestry and additive native evidence; original six jobs/permissions retained, no deployment |
| README; release1-release-governance documentation, ledgers, selected synthetic evidence | Exact inventory/results, diagnostics and remaining gates; original evidence untouched |

No runtime environment variables/new services are needed. Build-only fixture/review inputs are documented in DESIGN. No signing private key, real review attestation, hosting/project/GitHub connection, DNS or access setting was created or changed.

## Remaining risks and Architect review

1. **Signer enrollment is intentionally blocked.** Review public-key enrollment, reviewer identity, custody/rotation/revocation and exact source/build selection. Empty registry/PENDING describe output is not approval. A compatibility signature does not authorize merge, hosting, legal compliance or Release 1.
2. **Semantic compatibility needs human judgment.** The gate prevents silent reuse and binds decisions to source/build; it cannot infer invisible semantic drift. Compromised reviewers/tooling, modified validator/trust, raw same-origin/XSS/extensions or operator bypass are outside the boundary. Future format changes need separately approved migrations, not an environment override.
3. **Worker lifecycle and IDB are not one atomic system.** Exact worker targeting/control reads and native locked write fencing bound the remaining race. Another reviewed tab or native activation after all clients close is independent of this checkbox. Browser-reported online is only a hint. Timeouts do not erase data or force reloads.
4. **Intermittent readiness remains unexplained.** The old N09/early controller failures are retained despite subsequent green runs. Architect should assess the trace, startup/installed-PWA behavior and required real-device evidence; do not treat retries or controlled-session preparation as proof of a universal initial-claim guarantee.
5. **External/manual evidence is unverified.** Actual installed PWA/browser coexistence, OS restart, Safari/iOS/AT users/manual hard refresh, physical quota/eviction/paper, cache retirement and live domain/headers/provider logs remain separate. Downloading does not prove user backup custody or a recovery rehearsal.
6. **All release gates remain open.** #16 RED STOP; #15/#25 human/device, #14/#22 manufacturer, #10/#30/#31 legal/privacy/market and #1/#17 release acceptance. No AI/technical/cryptographic result establishes Canadian legal compliance. **Release 1 NOT APPROVED.**

Request independent Architect review of the release gate/signing policy; compatible same-generation co-writes; bump/stale proofs; G02-G06/G09 authority refusal; negative polling calibration; W14/W15/N02/N11; and retained readiness diagnostics. Owner must separately authorize merge. No hosting action follows from this draft.

Internal quality review: shared validation/state logic reused; no new dependency, remote data flow, persisted authority, schema or unrelated feature. Protected source, original86 IDs/audit, all case identities and artifact/runner/harness checksums were checked. Final-head CI is recorded in the PR.
