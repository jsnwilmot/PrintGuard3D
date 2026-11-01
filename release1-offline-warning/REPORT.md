# Issue #45: accessible first offline-install warning

Independent Architect review requested. This warning implementation is separate from Issue #41's diagnostic-only branch. It does not resolve N09. Issue #41 OPEN, Issue #16 P1 RED STOP, Release 1 NOT APPROVED. No merge or deployment is authorized.

## Corrective implementation

The previous bootstrap swallowed registration errors and had no explicit offline-install failure guidance. The new small observer starts after the existing origin/release gates and successful App import, registers once with the unchanged options, and separately records registration, native ready, installed, activated, current-page controller and complete-cache milestones. A registration or ready promise alone never removes the warning.

A read-only worker message exposes the already-public compiled cache name/asset list/hashes and exact worker build identity. This is the sole change to the worker generator. Cache/install/hash/marker/activation/claim/update-adoption semantics are unchanged. The page reads only CacheStorage.match for the identified cache, verifies every expected response's native SHA-256 and the existing final marker, and rechecks controller identity. Unknown older workers, denied cache access, mismatched build/hash, missing entries or an incomplete marker stay unconfirmed. No speculative cache is opened or created. This is a point-in-time preparation check, not a guarantee against later eviction, browser shutdown or host failure.

The 15-second observation window bounds an unknown state; it is not a permanent-failure verdict or cold-start SLA. Delayed installs can later complete on native events. Registration rejection/redundant first install warns; offline/unavailable states have truthful alternative guidance. The online warning is exactly:

> Offline access is not ready. Your workshop remains available while online. Stay online, keep a backup and reconnect/recheck before relying on offline use.

The notice reuses the existing UpdateSafety surface/buttons/styles. Confirmed failure is an alert; unknown/offline guidance is a polite atomic live region. Nominal preparation uses the existing sr-only class and a polite atomic announcement, without a visible flow box or hidden focusable controls. Failed/unconfirmed guidance remains visible. Meaningfully unchanged checks do not create new revisions/alerts. It never moves focus automatically. Explicit dismissal retains a short unresolved message, restores focus to Recheck, and applies only to that in-memory revision/session; Recheck/new state/reload restores unresolved details. Verified preparation removes the notice. Recheck only reads current registration/cache, never re-registers or navigates.

No database imports exist in the observer. It persists no status, emits no telemetry and makes no record/control changes. No download, automatic reload, skipWaiting, clients.claim, cache deletion, schema/backup/profile/history/manufacturer/disclaimer change is introduced. Consent, exact-update confirmation, monotonic writer fences, backups, observations and perpetual schedules remain separate controls.

## Regression found during verification and corrected

Initial implementation 32fcb1f249b26da94814ecda9c891cd57d3d1aa2 passed 351 regressions, 45 original acceptance assertions and 21 new native checks. Original native restoration passed 20/20, but the unchanged Phase 5 suite produced 40 PASS / 5 FAIL. The new pending paragraph's global role=status collided with the existing notification toast's role=status in D07 denied/unsupported assertions. All five actual failures and raw synthetic traces are retained. The correction uses an explicit polite atomic live region instead of another global status role; the confirmed failure alert remains. No original selector, test, retry or timeout was changed. Final review also added an explicit installed milestone plus O17, distinguishing it from activation/control. The intermediate corrected source was 048f9b9 (full SHA in evidence/PR).

The initial compatibility run recorded 114 PASS / 1 FAIL, then left remaining WebKit-dependent cases unexecuted/NOT VERIFIED. WebKit N01's actual restore confirmation click did not change the checkbox state. No cause is established and no unrelated restore change is made under this warning scope. The ledger is retained separately, never reclassified by subsequent results. The later 048f9b9 recovery sample passed 171/171 and governance 27/27; that does not explain the earlier click failure.

A local regression invocation accidentally discovered untracked historical diagnostic checkout test copies. It was interrupted and is not counted as application regression evidence. The proper local invocation excludes only `.verification-local/**`; it runs every checked-in tests file. Clean CI retains the unchanged existing quality command. No checked-in test/assertion is excluded.

## Layout correction and intermediate exact-source outcomes

On source 048f9b9, the new warning suite passed 21/21; original native restoration passed 20/20; the full recovery suite passed 171/171; exact-update/release governance passed 27/27. Original full reporting passed 75/75. Original Phase 5 passed 44/45, retaining a WebKit D02 failure where the maintenance-cost click was followed by a missing Report selector. Native trace shows a scroll change around that click; this does not establish the cause. No routing/KPI/report source or original assertion was changed. This failure remains FAIL in the intermediate ledger.

Review identified an avoidable new layout transition: a nominal preparing banner above the content disappeared after a healthy first installation. Final source 8d51f7fb31379858297690bad0843f3e2b721c7b keeps preparation as a screen-reader-only polite announcement without focusable hidden controls, so healthy preparation adds/removes no content-flow height. Three new native layout cases hold first-install completion, compare actual heading boxes before/after genuine readiness, click the actual maintenance-cost KPI and compare all native store digests. They supplement rather than replace the unchanged D02. Causality for that earlier D02 failure remains unproven; no green result reclassifies it.

## Verification coverage and review limits

New unit/UI/worker tests: O01-O17 and W01-W05, 22 tests; W01 also requires a non-flow preparation announcement without hidden focusable actions. They cover strict cache/build binding, ready without control, delayed/redundant/denied/offline/unsupported states, cleanup/cancellation, duplicate revisions, installed versus activated, safe dismissal/focus, exact warning and the worker query's zero write/cache/activation effects. All 330 prior regressions remain included: final total 352 PASS; 45 unchanged acceptance assertions PASS. TypeScript, normal nondeployable production build and targeted static validation PASS.

The final native runner has eight cases per engine (24 total), using actual Chromium/Firefox/WebKit workers and disposable synthetic persistent profiles: first-install SVG 503; HTTP 200 with bad SHA; delayed install past the observation window then genuinely complete; worker policy blocked/no cache; offline during incomplete install then explicit reconnect/reload; real browser-process cold reopen with the application origin unreachable; test-only removal of one active cache entry; and stable heading geometry plus a usable actual KPI drilldown when healthy preparation finishes. Negative cases retain a usable workshop, validate a full backup, restore independently, compare every native store digest including observations/history/recommendation/profile/schedules, and inject a future writer requirement to prove transactional refusal. All warning interactions, both themes, 390px reflow and axe scans retain record/control digests. Runtime code never performs those test-only native mutations.

Raw traces and screenshot/response logs contain synthetic data only. Original first-use, backup, compatibility, reporting, accessibility and printing suites are preserved unchanged. The PR's final evidence ledger reports every executed outcome, with remaining cases labeled honestly. The standalone new workflow adds only warning verification; the original six-job validation workflow is unchanged.

Actual installed PWA/OS restart, iOS Safari, assistive technology, physical storage eviction/disk exhaustion, real hosting/provider headers and public signed-release acceptance are NOT VERIFIED. Browser online state is a hint, not proof of internet or host availability. An active old-build controller can remain unconfirmed until the owner completes the existing reviewed update process; the observer never authorizes an update. Hash scanning is event-driven/coalesced and bounded, but consumes read/digest work; no persistent polling interval is added. The warning is not a certified offline-resilience guarantee.

## Final local disposition

| Source / suite | Actual result |
| --- | --- |
| Final runtime 8d51f7fb31379858297690bad0843f3e2b721c7b: regressions | 352 PASS / 0 FAIL |
| Same source: original unchanged acceptance | 45 PASS / 0 FAIL |
| Same source: new native warning/layout cases | **23 PASS / 1 FAIL**: Chromium 8/0, Firefox 7/1, WebKit 8/0 |
| Same source: TypeScript / normal nondeployable build | PASS |
| Intermediate 048f9b9 original native / Phase 5 / full reporting | 20/20 PASS; **44 PASS / 1 FAIL**; 75/75 PASS — total139 PASS / 1 FAIL |
| Intermediate 048f9b9 full recovery / governance | 171/171 PASS; 27/27 PASS |
| Initial 32fcb1f original native / Phase 5 / recovery | 20 PASS; **40 PASS / 5 FAIL**; **114 PASS / 1 FAIL**, remaining cases NOT VERIFIED |

The final new native failure is Firefox offline-before-first-install: after the test explicitly reconnects, releases the held asset and reloads, controller remains false until the existing 20-second poll expires. The application correctly keeps the exact visible offline-not-ready warning and online workshop available. The offline-unknown warning and pre-reload store preservation assertions had passed; the post-reload store comparison was not reached and is NOT VERIFIED for that failed case. This is not proof of the exact same causal failure as #41; it is a related uncontrolled-page symptom without worker-phase instrumentation in this runner. The failure stays FAIL, its actual DOM/response/trace evidence is retained, and no retry, timeout extension or forced activation is added. The other Firefox delayed-install, stable-layout and actual cold offline-reopen cases pass independently and do not override it.

All three final healthy-layout cases pass, with identical recorded heading boxes before/after preparation and working actual expense drilldowns; all three genuine cold offline browser reopen cases pass. Initial/intermediate/final evidence directories and native runner hashes distinguish the executed samples. UI screenshots were also reviewed at390px in light/dark themes: the visible warning/actions remain readable and contained. Every final raw native file is inventoried; selected success/layout traces and the actual failed Firefox trace are committed, with all raw data retained locally. Targeted archive CRC/path/credential scans passed; this is not an exhaustive security audit.

The unchanged original140 and198 suites will also execute on the exact submitted evidence head in the original CI jobs; final CI URLs/outcomes are maintained in the PR body. These are additional exact-source observations, not retries used to erase local negatives. The complete overall acceptance gate is **not green**. Architect review is requested on the narrowly scoped warning implementation and unresolved failures; no Release 1 approval is claimed.

## Reproduction and independent review

Run locked dependencies, `npx vitest run tests --exclude '**/.verification-local/**'`, the unchanged acceptance config, TypeScript, static validation and `npm run build`. Run original native/Phase 5/reporting configs individually (no two reporting servers at localhost 4359). Prepare fresh synthetic fixtures with `node release1-clean-origin/prepare.mjs NEW-ID`, then run `node release1-offline-warning/run.mjs .verification-local/clean-origin/NEW-ID`. The unchanged clean-origin and release-governance runners use that same frozen manifest. The prepare script builds three explicit fixture writer generations without producing a deployable public artifact. Do not point any runner at a real browser profile or workshop.

See DECISION.md for success/unknown semantics and MATRIX.md for scoped acceptance. The PR body lists exact submitted SHA, file inventory and actual CI links. Architect should independently review read-only cache binding, event cleanup, state/announcement transitions, preserved negative results and the original N09 gate. Owner merge approval is separate. No external preview/provider/key/DNS/private Sites/real-user-data operation occurred.
