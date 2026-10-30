# 🔴 STOP — unchanged-source operational preflight report

2026-10-30 UTC. Issue [#32](https://github.com/jsnwilmot/PrintGuard3D/issues/32), related #15/#16/#25. Branch `release1/isolated-operational-preflight`, based on approved main **aa6ae5892fde8e0d621bbb34b765c41739e7a2ba**. This is a documentation/fixture/test-script evidence PR, not a source-remediation PR. **Operational compatibility FAILS. Release 1 remains unapproved.**

## Outcome and observed risks

The complete final audit executed **42 operational cases: 30 PASS, 12 FAIL**, plus one human-only **NOT VERIFIED** disposition. All three engines reproduced the same four failing checks: two historical writers, the held-old-tab update case, and the hypothetical version-number-only fence. The audit command exited **1**, preserving those failures. Final run has **zero unexpected harness exceptions**. Green baseline CI is a separate result and does not override these FAILs.

Both actual old UIs opened native v20 data and committed a new fan-10-hour reminder completion without structured `recommendation` provenance. Existing task decisions remained present, but the new log omitted them; those missing facts must not later be backfilled from current task information. The old runtime's exported file was rejected by its own old strict reader and the current reader; the current reader reported the missing recommendation policy marker. A download alone is therefore not a verified recovery copy.

In the held-tab case the current worker activated, replaced the old cache and claimed clients. The old page still ran `/assets/index-CyBCToO1.js` while the new page ran `/assets/index-DLvU2FnS.js`; the old tab successfully wrote the incomplete log. Soft reload loaded the new bundle afterward. Actual cache/controller events and script lists are in RESULTS. Chromium also executed CDP HTTP-cache-disabled/service-worker-bypass reload; Firefox/WebKit physical hard-refresh and actual installed-PWA/browser coexistence are **NOT EXECUTED**, not passed via emulation.

A disposable native version-only change to **30** still allowed the pre-Phase-5 Dexie v1 executable to open it. A numeric schema/version bump is not an adequate old-writer fence. No such bump is proposed as an app fix or committed to application source.

The nine saved collision/held-tab before/after comparisons preserved every earlier log and observation by identity/value. Old replacement retained the four observations in these tested cases. **Do not describe the observed defect as blanket erasure of prior history/observations**: the confirmed loss is provenance on newly written stale-code records and an unusable old-code export. Pristine new-origin data/backups remained intact after all destructive experiments.

## Environment and exact application versions

Automated tester: **Codex synthetic harness**, not a named human/device tester. Final execution UTC **2026-10-30T16:49:48.433Z–2026-10-30T16:56:20.826Z**. Application test clock was separately fixed at 2026-10-30T12:00:00Z; timestamps/acknowledgments are explicitly synthetic, not real owner's consent or pre-service conduct.

- Windows `10.0.26300`, Node `v22.23.3`; Playwright `1.64.1`, Dexie `4.4.7`, Vite `6.4.5`, TypeScript `5.8.3`.
- Persistent headless Chromium `156.0.8078.4`, Firefox `157.0`, WebKit `27.2`. These are bundled test browsers, not actual Chrome/Edge/Safari/AT/OS client acceptance.
- Pre-Phase-5: `616e26ee5c0834a3d0900294981bcf8963d2c053`; pre-recommendation: `d03eb59cb887cfad335241b9f56d260b5a75abdc`; current: `aa6ae5892fde8e0d621bbb34b765c41739e7a2ba`.
- Fresh unchanged Git archives; identical reviewed lock SHA-256 `36f77ffc59578790270b9ffe370b614a5e7731110675c197fef83e5ecbff14ef`; TypeScript/Vite build succeeded for all three. [VERSION-MANIFEST.json](VERSION-MANIFEST.json) identifies exact source trees, produced files and separate test-probe bytes. Not historical hosted binaries or a universal bit-reproducible-host claim.
- **45 distinct loopback origins and 45 new short disposable profiles**, with intentional old/current sharing only within named synthetic upgrade/collision/update cases. Cold-reopen tests intentionally reopen the same disposable profile. All actual origin/profile mappings and on-disk hashes are indexed; no real workshop/browser/production origin was used.

## Synthetic data and positive recovery evidence

Input is the repository's legacy-schema1.synthetic.json, with deterministic `fixture()` labels/serials `SYNTHETIC OP32`, no real equipment identities, and p2 archived. The current UI independently registered Creator 5 Pro, created the four exact 5/10-hour owner-approved review reminders, recorded CAD123.45/USD67.89 inspection completions with metadata and started prospective observation capture. Each current baseline contains **4 printers, 10 tasks, 5 logs, 6 readings, 2 inventory items, 1 repair, 3 profiles and 4 observations**. Original profile versions, custom/resin work, images, unknown historical currency and independent ownership remain present. Per-engine UUIDs/times/hashes differ and are recorded, not normalized away.

PASS in all three engines:

- Each old build exported, validated and actually restored its own full pre-upgrade backup before upgrade/collision. Separate old-version rollback restored only that recorded earlier state. Later recommendation decisions, observations and maintenance are **not represented** in the old snapshot; retain the upgraded origin and complete new-format file.
- Actual v10→v20 upgrade preserved all original stores/preferences and created an empty observations store with no startup backfill.
- Current full file restored all seven core stores, embedded data and observations in a fresh origin; disclaimer v1.0 was renewed after replacement. Cancellation and repeated identical merge wrote nothing; immutable conflicts blocked both modes.
- The native quota/transaction failure was deliberately injected after writes began, confirmed consumed, and rolled every store/preference/observation back. This is not actual disk exhaustion or browser quota eviction.
- Legacy core replacement retained immutable observations. Existing earlier log/observation values remained unchanged through old write experiments.
- After actual browser process closure, the local server destroyed requests and an uncached direct request failed; a new browser process using the same disposable profile reopened cached current app/data without changes. This is not a full OS restart or physical network-switch/device test.
- Explicit clearing of only disposable database/cache/registration demonstrated local loss; a protected full backup restored all core data and observations in another fresh origin. Actual browser-policy eviction remains unexecuted.

## Reproduction and evidence custody

Actual commands: `node release1-operational-preflight/prepare.mjs op32-run2`; then PowerShell browser-cache setting shown in [README.md](README.md), and `node release1-operational-preflight/run.mjs .verification-local/operational/op32-run2 | Tee-Object -FilePath .verification-local/operational/op32-run2/final-console.log; exit $LASTEXITCODE`. Historical builds run the installed TypeScript and Vite CLIs from the unchanged archives. [CONSOLE.txt](CONSOLE.txt) retains the final command output; [RESULTS.json](RESULTS.json) contains each ID, expected/actual, UTC, status and hashes.

[EVIDENCE-INDEX.json](EVIDENCE-INDEX.json) indexes **158 raw synthetic artifacts**, packaged-file hashes and nine reviewed earlier-history preservation checks. Full snapshots/backups/controller/server logs and closed-profile disk indexes remain ignored local artifacts, reproducible using a fresh run ID. No raw browser profile is committed. Selected safe unchanged screenshots: [old loaded tab](evidence/held-old-tab.png), [current tab](evidence/current-tab.png), inspected before inclusion. Checksums assert identity within the recorded run, not identical UUID/time/port hashes across reruns. No manufacturer manual/video/media was fetched/copied.

Harness development diagnostics were excluded from final acceptance counts and retained locally: plain esbuild did not transform Vite profile globs, so probes use Vite; long Windows profile paths caused native backing-store failures, so unique short paths are used; same-document navigation behavior reset a WebKit page-local failure hook, so the injector is installed immediately before the transaction and its consumption asserted. No application defect was fixed or assertion weakened to address these harness issues. Nonfunctional unused-import/property cleanup does not change the executed checks.

## Baseline, quality and acceptance boundary

All pre-existing application source, schemas, SW generator, manufacturer profiles/schedules, legal v1.0, history/observation logic, dependency lock, hosting configuration and CI workflow are unchanged. The existing **242 regression /45 original acceptance /140 native** five-job CI is preserved; the draft PR records final-head observed job results, exact SHA and artifact links. The intentionally failing operational audit is a separate manual local command, not silently included in or hidden by baseline totals. [Scoped matrix](MATRIX.md) retains the original [86 historical requirements/evidence](../release1-consumer-transparency/MATRIX.md) without editing them.

Quality review checks script syntax, isolated path/origin guards, no new dependencies/credentials, immutable evidence hashes, safe synthetic screenshots and document links. No app runtime environment variables. The test probe changes neither archived source nor deployed bundle, and native/version/quota/site-clear manipulations occur only in disposable synthetic databases.

## Recommended sequence / remaining limitations

1. Keep **🔴 STOP on legacy same-origin deployment/coexistence**. Architect reviews [MITIGATION-PROPOSAL.md](MITIGATION-PROPOSAL.md); owner separately authorizes a narrow safeguard/isolation implementation. New-code-only cooperation and numeric version increments cannot retroactively fence the tested old code.
2. Preserve old/new origins and pre/post-upgrade full backups; verify restore with supported readers. No field stripping, in-place downgrade, automatic history reconstruction or unauthorized remediation.
3. Owner/human testers execute the [M01–M22 handoff](HUMAN-WORKSHEET.md): named AT/zoom/touch, actual OS/browser/PWA/clients/notification, A4/Letter driver and physical paper evidence. All remain NOT EXECUTED/NOT VERIFIED here.
4. Actual live host/cache/headers/DNS/provider facts, external preview and deployment require separate authorization and #16 evidence. No connection to a third-party host, preview provisioning, production browser/data access, hosting/access change, merge or release approval occurred.

This completes a research/test package for independent Architect review; **it does not complete #15/#16/#25 or approve Release 1**. Any application code change requires separate owner authorization before implementation and merging.

Evidence files use folder-local Git attributes to preserve indexed bytes across Windows/Linux checkouts. CONSOLE.txt is an LF review copy; original CRLF console bytes are separately indexed.

## Changed-file inventory

All 15 files are new under `release1-operational-preflight/`; no pre-existing file is modified.

- `release1-operational-preflight/.gitattributes`
- `release1-operational-preflight/CONSOLE.txt`
- `release1-operational-preflight/EVIDENCE-INDEX.json`
- `release1-operational-preflight/HUMAN-WORKSHEET.md`
- `release1-operational-preflight/MATRIX.md`
- `release1-operational-preflight/MITIGATION-PROPOSAL.md`
- `release1-operational-preflight/README.md`
- `release1-operational-preflight/REPORT.md`
- `release1-operational-preflight/RESULTS.json`
- `release1-operational-preflight/VERSION-MANIFEST.json`
- `release1-operational-preflight/evidence/current-tab.png`
- `release1-operational-preflight/evidence/held-old-tab.png`
- `release1-operational-preflight/harness.mjs`
- `release1-operational-preflight/prepare.mjs`
- `release1-operational-preflight/run.mjs`
