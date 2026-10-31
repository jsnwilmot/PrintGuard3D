# Issue #37 implementation report — independent review package

Prepared 2026-10-31. Approved base: `aa8ade54061dec95ee51c65ba2e4ed46c0261c5d`. Draft [PR #38](https://github.com/jsnwilmot/PrintGuard3D/pull/38), branch `release1/option-b-clean-origin-update-safety`. **Implementation candidate; not deployment or Release 1 approval.** Final verification fields below are populated only from executed results.

## Outcome and authorized boundary

The owner-selected Option B is implemented for a clean first public origin, planned at **https://printguard3d.roseandpaw.ca**, with zero existing launch users. Noncanonical aliases refuse App/database initialization. The application keeps its React/Vite/Dexie architecture, scheduling engine, registered-record model, modular profiles and strict supported file formats. No private-origin reader, migration wizard, source-to-destination copy or reconciliation feature was introduced.

All actual tests use synthetic records, disposable profiles and loopback servers. No production browser data, private application, Cloudflare account/project, GitHub-to-Cloudflare connection, DNS, hosting setting or deployment was accessed or changed. The PR must remain draft for independent Architect review; owner merge and any hosting work require separate authorization.

## Corrected failure mechanisms

| Finding / cause | Corrective action | Evidence boundary |
| --- | --- | --- |
| Historical unguarded binaries can mutate a same-origin database and omit new provenance; numeric version/cache activation alone does not stop them | Separate planned origin; first-public participating-writer protocol enforced inside every ordinary mutating native transaction | Exact old source builds write only A; same-profile B remains intact and cross-origin window access throws SecurityError. Original same-origin FAILs remain unchanged |
| Direct component writes, background captures and export timestamps could bypass a function-specific check | Central DBCore barrier adds persistent writerControl lock; exact protocol/capability/generation comparison before mutation; rejection explicitly aborts the whole transaction | Actual positive and stale counterparts for all 22 listed mutation paths; before/after hashes for every store/control |
| Dexie may automatically patch a mismatched layout, including a race after preliminary inspection | Read-only native preflight, per-instance whitelist of only 0-to-20/10-to-20 upgrades, sticky ready-time inspection and native-version check inside mutating transactions | W10/W12/W13 preserve unknown schema/rows and block attempted patch; actual interrupted-upgrade N10 preserves original native-10 data |
| A fresh generation could deadlock an unacknowledged visitor/restored workshop: no backup before consent, no consent before writer adoption | Explicit acknowledgment-only transaction for current or NEWER same-format/same-disclaimer clients. Independent expected-value clone, strict schema, one exact preference put, no epoch promotion or other preference changes | W14/W15 and N11 empty/restored; stale acknowledgment is included in S-action coverage. Ordinary writes still refuse after consent until backup/review/adoption |
| Network-first HTML and automatic update activation/cache pruning can mix builds or discard offline assets needed by held clients | Content identity in HTML/code; complete SHA-256-checked install; build-specific root/asset cache; waiting update and explicit activation/reload; retain old caches | N02 actual worker lifecycle and held executable, N08 mixed-identity refusal, N05 cold persistent-process offline reopening |
| A backup timestamp could be computed before the native readonly transaction acquired its snapshot; a newly committed observation could then appear later than the export | Assign exportedAt after every snapshot read completes. Validate user-facing full downloads without applying validator normalizations to exported data | W11 and actual strict validation/independent restoration of downloaded new-format files |
| Portable replacement could erase local controls or trust imported consent | Exclude operational controls from portable files/replacement, reconstruct controls locally, retain strict file validation and existing acknowledgment renewal/observation conflict rules | W05/W07/W08, N04/N11 and original native restore suites |

The initial reserved-preferences-row prototype was discarded before final implementation because nonportable metadata would violate the portable preferences-store contract. The final dedicated store keeps original preferences/history bytes portable.

## Protocol and storage decision requiring scrutiny

The first-public footprint retains database name **PrintGuard3D** and declared **Dexie 2/native 20**, adding one operational `writerControl` store to the original nine. First-public protocol 1 has generation 1 and exact capabilities `backup:1`, `consent:1.0`, `observations:1`, `profiles:1`, `recommendations:1`. Generation 2 is an executable test fixture with the same supported data format, not a released product.

This native-number retention applies only to a **different origin with zero existing public users**. Historic private native-20 layouts without the control store are refused unchanged; they are not silently adopted, repaired or migrated. The existing supported native-10 additive upgrade retains every original row and adds only empty observations/control storage. Future PUBLIC layout changes must increment schema/native version and independently review the transition whitelist. **Architect must explicitly accept or revise this first-public layout decision before merge.** Passing tests do not approve it.

Ordinary operations require exact generation. Two narrowly defined operations have their own persistent comparisons: explicit monotonic control-only adoption, and explicit acknowledgment by a current/newer client with the same known format and exact disclaimer version. The latter changes only the legal stamp and never promotes the generation. It prevents consent/backup deadlock while retaining the same v1.0 wording, checkbox/button and stored acknowledgment shape. A stale/unknown/mixed client cannot use it. It does not establish legal compliance.

The shared native control lock serializes cooperating writers. A successful comparison can be reused within the same transaction because another control writer cannot change the epoch until it finishes. Imported JSON cannot grant transaction authority or set an epoch. The full [architecture/write inventory](ARCHITECTURE.md) documents every path and exception.

## Backup, rollback and perpetual history

Portable backup schema 1, observation extension v1 and recommendationPolicy v1 are unchanged. Files contain all seven core stores, ordinary preferences, original IDs/profile versions/images/readings/decisions and actual recorded observations. Operational controls are local derived requirements, deliberately nonportable; no sidecar is required to recover workshop data. Restoring a supported file creates no imported consent/READY/epoch privilege. Replace renews acknowledgment; merge preserves current device acknowledgment and existing immutable conflict rules.

Read-only clients may download supported full files after acknowledgment; export timestamp preference writes remain fenced. Actual independent UI restore/readback is required evidence. A downloaded file/checksum alone is not a recovery proof. No historical observations are fabricated, recalculated or repaired. Manufacturer definitions, exact-model compatibility, opt-in reminders and scheduling engine remain unchanged, including recurrence through 2400 and beyond.

Rollback uses a verified compatible executable and valid original file in a **fresh isolated profile/origin**. Preserve later complete data separately. Do not decrement an active epoch, strip new fields, overwrite later history or treat code rollback as data rollback. Older historical readers reject enriched files. No generic future format migration, private-site transfer or in-place downgrade was implemented.

## Executed verification

**Executed local verification: all required suites PASS.** Production source is `c06ce50925f71a0fa9f411f9c0a17d698d143b28`; the complete tested source/test tree is `c140bb37822b086ae415d9e2eeeeef7db08d9d22`. All six [CI jobs on that tree](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41220051691) also passed. The subsequent documentation/evidence commit preserves that runtime and test implementation; its exact final SHA and CI run are recorded in the draft PR. See [VERIFICATION.json](VERIFICATION.json), [RESULTS.json](RESULTS.json), [runtime manifest](RUNTIME-MANIFEST.json) and [selected artifact checksums](EVIDENCE-INDEX.json).

| Check | Actual result | Evidence |
| --- | --- | --- |
| Original 242 +45 new automated regressions | 287/287 PASS | Local standard JSON; final-head CI quality job |
| Original unchanged acceptance assertions | 45/45 PASS | Local acceptance JSON; final-head CI acceptance job |
| Original Chromium workflows | 20/20 PASS; zero skipped/flaky | Native results SHA-256 in VERIFICATION.json; CI native job |
| Original compatibility/printing | 45/45 PASS; zero skipped/flaky | Phase 5 results SHA-256 in VERIFICATION.json; CI compatibility job |
| Original reporting/safety/privacy native workflows | 75/75 PASS; zero skipped/flaky | Reporting results SHA-256 in VERIFICATION.json; CI reporting job |
| New executable ledger | 171/171 PASS; 57 per Chromium/Firefox/WebKit; all 66 stale cases preserve every store/control digest | RESULTS.json, build/probe hashes and before/after store digests; CI isolated-safety job |
| TypeScript / production build | PASS on implementation source | Local logs and CI quality job |
| Static repository / immutable definitions | PASS; 241 tracked files and three immutable definitions | Targeted repository guard, three reviewed definition digests; not a comprehensive security audit |
| Actual provider, installed PWA/OS/real Safari/AT/paper | NOT VERIFIED | Separate existing gates; no local PASS inference |

The one baseline preparation change is in **acceptance-review/review-harness.js**: the raw localhost fixture now creates the first-public operational store/record. All original assertion/spec files and limits remain unchanged. Old nine-store native-20 data is a separate explicitly unsupported case, not silently upgraded just to make tests pass. Architect must review this fixture adaptation alongside the storage decision.

Development failures remain traceable: the initial worker rule intercepted the test-only review route, so caching was narrowed to actual root/index app routes. Repeated control reads during large restores were reduced to one locked comparison per transaction. A queued Firefox update-call Promise was removed as the test oracle in favor of actual waiting-worker state/new compiled identity; API rejections still fail. Firefox cold-reopen setup now retains a replacement window until closing the whole process. Native adoption checks wait for the actual reload before reading its new context. No failing safety assertion was suppressed or reclassified.

See [TEST-PLAN.md](TEST-PLAN.md) for commands and fixture/probe limits. The Node server emulates the documented Pages extensionless SPA fallback; actual CDN routing is unverified. The original [86-row history](../release1-consumer-transparency/MATRIX.md), all previous reports and [operational RESULTS.json](../release1-operational-preflight/RESULTS.json) remain unchanged: **30 PASS /12 FAIL /1 human-only NOT VERIFIED**. New oracles do not retitle those results.

## Changed-file inventory

| Files | Purpose |
| --- | --- |
| src/db.ts, src/storageLayout.ts, src/writerSafety.ts | First-public layout, native upgrade/open race guard, transaction fence, protected controls, acknowledgment permission, backup timestamp/replacement boundaries |
| src/appOrigin.ts, src/main.tsx | Canonical bootstrap guard and controlled worker registration; safe asset-load error |
| src/UpdateSafety.tsx, src/App.tsx, src/styles.css | Read-only/update/backup/adoption UI, explicit consent ordering, readable responsive panel and version information |
| src/Settings.tsx | Strict full-download validation and truthful handling of refused backup metadata writes |
| src/vite-env.d.ts, vite.config.ts | Typed identities/generation, full hash-checked offline asset generation, controlled activation and cache retention |
| public/_headers | Proposed conservative executable Cache-Control; existing security policy retained |
| tests/writer-safety.test.ts, tests/origin-safety.test.ts | 35 storage/writer/consent and 10 canonical-origin regressions |
| acceptance-review/review-harness.js | Explicit first-public raw synthetic fixture preparation only |
| .github/workflows/validate.yml | Additional isolated safety job; five original jobs retained; no deployment job or write permission |
| release1-clean-origin/prepare.mjs, harness.mjs, actions.mjs, run.mjs | Frozen actual builds/probes, exact historical hashes, disposable native sessions, per-path positive/stale cases and evidence |
| release1-clean-origin/ARCHITECTURE.md, TEST-PLAN.md, CLOUDFLARE-PLAN.md, wrangler.pages.jsonc.example | Design, capability/approval boundaries, reproduction and proposed hosting configuration |
| README.md; release1-clean-origin/.gitattributes, REPORT.md, MATRIX.md and selected verification artifacts | Scoped acceptance, actual results and limitations; original 86 rows/evidence preserved |

No runtime external service or new dependency was added. No runtime environment variable is required. PRINTGUARD_WRITER_GENERATION is a reviewed **build-time fixture/release contract**, never a URL or user setting. No active Wrangler configuration, account binding or deploy automation exists.

## Remaining risks and required decisions

1. Architect acceptance of first-public native-20 layout reuse, strict transition whitelist, protected operational clear and the narrow forward-consent permission remains pending. No owner approval is inferred from tests.
2. The protocol protects participating reviewed code. Arbitrary same-origin/XSS/extension/device-owner code and an operator redeploying unguarded historical code are outside that boundary. Future authors must update generation/capabilities when behavior becomes incompatible and test the actual first-public artifact against the next real release. The generation-2 fixture proves the mechanism, not every future implementation.
3. Old complete caches are retained intentionally. Real device quota/eviction and an eventual safe retirement policy remain unresolved; injected failures are not physical disk-full testing. Incomplete/failed updates retain the active build; native browser diagnostics may be needed for installation failures. Root/index/hash routes are the supported cached entry points.
4. Cloudflare project type/name, initial creation exposure, canonical alias redirect/access, actual DNS/TLS/CSP/cache responses and provider logs/privacy are unverified. The [local hosting proposal](CLOUDFLARE-PLAN.md) requires separate owner authorization before any account/project/GitHub/DNS/upload action. No application/client check proves provider behavior.
5. Installed PWA plus browser coexistence, OS restart, actual Safari/iOS, real assistive-technology users, external clients and physical A4/Letter remain unexecuted human/device requirements. Local headless evidence cannot close them.
6. Existing manufacturer, legal/privacy/geographic/multi-AI and release gates remain open. No AI or technical result establishes Canadian legal compliance or manufacturer approval. Disclaimer v1.0 is unchanged.

## Human handoff and review sequence

Use the preserved [Issue #25 worksheet](../release1-operational-preflight/HUMAN-WORKSHEET.md) without auto-filling its NOT VERIFIED fields. Add real-device evidence for: fresh canonical-only first use; consent and restored-data lock; both new unacknowledged-update paths; full file custody and independent restoration; installed PWA plus held browser window during an actual update; zero stale-write changes; cold OS restart/offline use; real keyboard/AT interactions with the new panel; and paper/client workflows. Record exact reviewed SHA, device/browser/OS/AT, tester, UTC, before/after data evidence and exceptions. Use only separately authorized synthetic host data.

Independent Architect reviews this draft and evidence first, particularly the explicit storage/consent decisions. Owner must separately authorize merge. Project creation/connection, live-host verification and deployment require further separate authorization and all existing gates. **#16 remains P1 RED STOP; #15/#25, #14/#22, #10/#30/#31 and #1/#17 are not closed by this PR. Release 1 remains NOT APPROVED.**

Final quality review: shared validation/comparison patterns reused; no source-profile/engine/legal wording changes; no new remote data flow/dependency; transaction authority is not importable; unverified device/provider claims remain explicit. Selected backup JSON and all screenshots contain only disposable synthetic workshop data. The evidence index pins their exact bytes; browser profiles and manufacturer source media are excluded. No source or test implementation was changed while packaging this evidence.
