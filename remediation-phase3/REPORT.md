# Phase 3 remediation — manufacturer maintenance profiles

2026-10-27 UTC. Repository: [jsnwilmot/PrintGuard3D](https://github.com/jsnwilmot/PrintGuard3D), [Issue #6](https://github.com/jsnwilmot/PrintGuard3D/issues/6). Branch: `remediation/phase3-profiles`, based on approved Phase 2 merge `bfd4cdd8bbb8a9c3f6a14d7730ebb4441d291458`. **Implementation submitted for Architect review; Release 1 is NOT approved.** No merge, deployment, production-data operation, hosting/access change or Phase 4 work is included.

## Result and scope

The verified Creator 5 library expands from one legacy procedure to **eight fixed-interval procedures plus eight explicitly selected usage-band procedures** in v1.1.0. The exact accepted v1.0.0 body remains intact and is still the initial registration default. Owners can deliberately select v1.1.0 during registration or review an update in Settings. Creator 5 Pro has a separate v1.0.0 definition with only its own guide's **1,000-hour shaft-cleaning procedure** verified for automatic activation. Standard-model evidence is not inherited by Pro.

The [documentation register](DOCUMENTATION-REGISTER.md) and [225-row CSV](documentation-register.csv) inventory all 18 official maintenance text articles, both exact-model PDF guides, official hardware/safety/manual context, condition references and 63 indexed setup/corrective video links. The CSV includes separate exact-model rows and repeated references; 225 is not a claim of 225 verified procedures. **Overall manufacturer coverage remains PARTIAL.** Video contents, broader Pro applicability, optional equipment and ambiguous usage-band boundaries remain unresolved. Corrective links never become recurring tasks merely because they are listed.

## Root causes and corrective actions

| Root cause | Correction | Evidence |
|---|---|---|
| An inline one-procedure allowlist could not represent a complete modular library or exact variant uncertainty. | Data-only versioned JSON library, reviewed manifest/digests, strict schemas, exact-model checks and reference-only content. The scheduler remains unchanged. | V01–V06/V17/V20; P3B02/P3B03; static manifest validation |
| Documentation inventory did not distinguish fixed, usage-band, condition and corrective requirements. | Audited all 18 text pages and separate guides; retained eight inactive usage-band bases with published options, excluded stock filtration, recorded condition/corrective references and missing video review. | Source register; V02–V06/V20; P3B01/P3B02 |
| Profile comparisons exposed only selected fields, with weak legacy rename identity and same-version protection. | Recursive complete field/addition/removal/order comparison; stable IDs/confirmed legacy aliases; atomic ambiguity rejection; immutable archives; SemVer downgrade/redefinition guards. | V07–V16/V24; P3B01/P3B03 |
| Profile installation needed an explicit per-printer, per-procedure owner decision. | Review/defer/accept flow, exact compatible target list, procedure/band selection, unchecked acknowledgment, acknowledgment reset after changes, unresolved-band blocking and stale-registry rejection. | V10–V15/V21–V23; P3B01/P3B03 |
| New definitions could obscure old service evidence or silently alter active custom rules. | Preserve every existing rule/log/reading/owner/custom interval/baseline; add only selected new identities at current recorded usage/today; retain exact applied versions on registration/update and in backups. | V10–V18; P3B01/P3B02; preserved N01–N06 |
| As-of source verification could be mistaken for ongoing availability/safety assurance. | Show coverage/source dates and links, local unavailable/changed-source flags, task/completion warnings and complete-schedule provenance/flag columns. | V19; P3B04; profile/help/source inspection |

## Manufacturer evidence and safety decisions

Official HTML and both PDFs returned HTTP 200. Text was read directly from the official site; both PDF maintenance pages were also rendered and visually inspected. Source revisions are recorded as EN/CN-A04 (standard) and EN/CN-A05 (Pro); wiki revisions are explicitly unknown, with checked dates and snapshot hashes. Reviewer attribution is **Codex source audit; Architect review pending**, not an invented human or manufacturer approval. Raw manufacturer documents remain local/ignored rather than copied into the public repository.

The new fixed Creator 5 rules are cold pull 400 h; positioning balls/needle rollers 500 h; X/Y pulley 1,500 h; feed gear, X/Y belt, Z pulley and Z belt 3,000 h; plus shaft wiping 1,000 h from its own guide. Daily-use fan bands are 9/6/3 months; X/Y cleaning/lubrication bands are 1/2/3 months; Z bearing/screw/bearing bands are 3/4/5 months. Each exact published option and its source is retained. No automatic daily-use estimate or invented boundary is applied. Fan bands omit exactly 5/10 hours and axis bands overlap at 5: the UI requests manufacturer clarification rather than inferring a band.

Materials and procedure-specific safety include the official grease/silicone lubricant distinctions, tools/cloths, PEI removal before positioning-ball work and material-specific heated nozzle procedures. General precautions reference hot surfaces, moving equipment, grounding and ventilation. A blanket unplug instruction is not fabricated for procedures that require controlled heating. The source's restricted-extrusion diameter example is explicitly nozzle-specific. No servicing duration is fabricated; unknown minutes remain zero. Users must read the linked procedure before work; summaries are not replacement instructions.

The exact-model overview establishes Pro filtration/Hall sensor differences. Exhaust-fan/filter procedures are not scheduled for stock Creator 5, and the optional enclosure is not evidence of stock filtration. Pro's broader series procedures remain pending despite its separately verified guide interval. No media contents were audited merely by retrieving a YouTube title/link. Detailed counts and source limitations are in the register.

## Data preservation and update behavior

The IndexedDB layout/version is unchanged. New optional fields extend strict task/profile/preferences schemas; there is no startup migration or historical rewrite. Existing Phase 1 integrity controls, ownership checks, cumulative-usage guards, transactional import/completion and exact verification quarantine remain operational. The shared record comparator moved unchanged into `comparison.ts` to avoid a dependency cycle; `integrity.ts` re-exports its old API.

Installation preserves current, incoming and used reviewed definitions under reserved version keys. A known released body cannot be overwritten, even if not yet installed. Installation rejects malformed versions, downgrades, equal-precedence aliases, identity/technology changes, stale registry previews, duplicate/ambiguous title mappings and conflicting immutable archives. New stable IDs survive renames; unknown legacy mappings require explicit resolution outside this update, rather than guessing. Registry version, printer-applied version and individual rule version remain distinct.

**Acceptance does not replace changed existing rules.** Those rules remain completely pinned, including custom intervals and service baselines. Owners can add selected new procedures; existing rules require a separate explicit edit to adopt a changed recommendation. Removed definitions never delete active rules. New baselines mark the start of tracking, not a fabricated historical completion; no service log is invented. Native evidence confirms that another Creator 5, resin printer and existing custom schedules remain unchanged. New registrations can choose the expanded version; only fixed verified rules activate automatically.

Full backups retain all seven record stores, preferences, both old/new definitions, usage-band selections and source flags. The real Chromium file input/preview/replacement path restores exact records, then clears imported legal acknowledgment and survives reload. No restoration uses injected JavaScript writes. Initial synthetic setup uses the existing guarded local fixture harness; read-only inspection uses its Inspect control in a separate tab. All requests outside `127.0.0.1:4357` are blocked, with fresh nonpersistent contexts and no production origin.

Backup envelope remains schema 1 to preserve the approved legacy reader contract and existing unsupported-schema assertion. Phase 3 reads old schema-1 exports; **earlier strict builds may reject enriched Phase 3 exports**. No downgrade compatibility, format-migration registry or cross-browser certification is claimed. Legacy non-SemVer data remains readable, but an install over an ambiguous non-SemVer registry fails closed. Source flags are idempotent local preferences; they do not rewrite historical verification or notify anyone remotely.

## Verification

| Check | Result | Evidence |
|---|---|---|
| Preserved automated suite plus new regressions | **114/114 PASS**, 90 existing +24 new; zero skipped/pending/failed | `tests/profiles.test.ts` V01–V20/V24; `tests/profile-ui.test.tsx` V21–V23; `.verification-local/phase3-standard.json` |
| Complete unchanged acceptance suite | **45/45 PASS**, no assertion edits, suppression or reclassification | Existing `remediation-phase1/*audit*`; `.verification-local/phase3-acceptance.json` |
| Native Chromium | **13/13 PASS**, 9 existing +4 new; retries disabled | Existing restore/scheduling journeys unchanged; `tests/native/profiles.browser.mjs`; `test-results/native-results.json`, traces/downloads/screenshots |
| TypeScript | **PASS** | `tsc -p tsconfig.json --noEmit --incremental false` and production build |
| Static repository/profile checks | **PASS** | Tracked/staged paths, obvious secret patterns, MJS syntax, synthetic fixture identity, platform lock entries, three profile content digests/provenance |
| Production build | **PASS**, local validation only | `npm run build`; no deployment command |
| Perpetual scheduling | **PASS for tested contract** | V18 new selected profile rule/completion/projections through 2400; preserved S10/B01 leap/month-end/2035/2400 tests; scheduler source unchanged |

The standard tests cover exact intervals/options, Pro/FDM/resin compatibility, tampered definitions/options, SemVer, same-version immutability, stale review rollback, duplicate/colliding identities, unchanged custom/history/usage/other printers, full backup restoration, auto-activation scope, perpetual completion, source flags, acknowledgment and full semantic comparisons. Native P3B01 checks comparison/defer/update/baselines/independent records/exact export/restoration/reload; P3B02 performs real registrations of expanded Creator 5 and separate Pro, then updates one of two Creator 5 printers with distinct histories while preserving Pro and the other printer; P3B03 imports a tampered released package, discloses pending verification and rejects installation with all stores unchanged; P3B04 flags a source and checks task/report/export visibility. A screenshot was visually inspected; existing dark-theme contrast problems remain documented, not passed.

Build warnings are retained: vendor annotation comments are removed by Rollup, an empty React chunk and a roughly 517 kB application chunk warning. No warning threshold was raised or hidden. The additional reference metadata increases bundle size; external manuals/videos are not embedded. Raw test outputs, browser captures and manufacturer snapshots remain ignored local/CI artifacts; curated evidence documents, synthetic tests and profile data are committed. CI retains test artifacts for 14 days; commit-linked workflow results belong to the draft PR.

### Reproduction

```powershell
npm ci
node scripts/validate-repository.mjs
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit --incremental false
node node_modules/vitest/vitest.mjs run tests --reporter=json --outputFile=test-results/standard.json
node node_modules/vitest/vitest.mjs run --config remediation-phase1/vitest.review.config.mts --reporter=json --outputFile=test-results/acceptance.json
npm run build
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.verification-local\browsers'
npx playwright install chromium
npm run test:native
```

Linux CI installs Chromium with `npx playwright install --with-deps chromium`. Acceptance and native commands run sequentially because existing setup prepares the same ignored fixture path. Build must finish before native tests start. Port 4357 must be free. The browser and existing 45-assertion runners retain their historical `remediation-phase1` names. No package, lockfile, test expectation, deployment workflow or dependency change is needed.

## Changed files

- `src/profile-library/flashforge/*.json`, `src/profile-manifest.json`: unchanged legacy body plus two reviewed exact-model definitions, references, options and immutable content inventory.
- `src/profiles.ts`, `src/profileChanges.ts`, `src/comparison.ts`: modular registry, complete verification/ordering/diff/identity logic and shared comparator.
- `src/domain.ts`, `src/db.ts`, `src/integrity.ts`: optional strict metadata, transactional review/apply/archive/source flags and all-reviewed-version relationship lookup.
- `src/ProfileReview.tsx`, `src/ProfileDocuments.tsx`: focused review/source controls and coverage/reference presentation.
- `src/Settings.tsx`, `src/forms.tsx`, `src/Printers.tsx`, `src/Maintenance.tsx`, `src/Reports.tsx`, `src/Help.tsx`: optional update/version selection, exact docs/source warnings and schedule provenance. Original page architecture and workflows retained; touched text encoding normalized without UI redesign.
- `src/styles.css`: scoped comparison/procedure/reference styles.
- `scripts/validate-profiles.mjs`, `scripts/validate-repository.mjs`: reviewed data manifest/provenance guard integrated into existing CI static command.
- `tests/profiles.test.ts`, `tests/profile-ui.test.tsx`, `tests/native/profiles.browser.mjs`: 24 new regressions and four native journeys. All prior test and acceptance sources remain unchanged.
- `README.md`, `docs/DEVELOPMENT.md`, `docs/PROFILE-AUTHORING.md`, `remediation-phase3/*`: current policy, findings/register/report and all 86 matrix rows; `remediation-phase2/MATRIX.md` adds only a successor pointer. Historical Phase 1/2 evidence remains intact.

`src/engine.ts`, `src/scheduleView.ts`, Phase 2 calendar behavior, legacy synthetic fixture, package/lock files, legal text, application assets, hosting/access configuration and CI workflow remain unchanged from the approved baseline.

## Acceptance and remaining risks

The [86-row successor matrix](MATRIX.md) retains all 29 sections: **6 PASS, 20 PARTIAL, 3 FAIL** at section level. Section 4's modular versioning/review/preservation contract now passes; F10 is corrected for that bounded contract. F07 remains PARTIAL because unresolved source evidence cannot be manufactured into complete coverage. Prior evidence and remaining failures are retained in [findings](findings.csv).

Recommended Architect sequence: review source applicability/materials/precautions and partial-coverage policy; inspect update/diff/immutable archive and native restoration evidence; review backup forward-reader/legacy mapping limits; decide Phase 3 acceptance. Any later work requires separate authorization. Remaining release risks include broader manufacturer/video coverage, ambiguous bands, manual usage input, earlier-reader compatibility, changed-rule adoption requiring owner edits, unreviewed Safari/Firefox/assistive technology/large backups, existing theme contrast/nested-dialog and encoded multiword hash-link limitations, legal/warning distribution and other reporting/KPI/integration gaps. Wider complete-schedule columns still need multi-page print/layout acceptance. Offline app-shell preservation is unchanged; current external manufacturer instructions cannot be guaranteed offline. Nothing in the passing automation constitutes Release 1 approval or authorizes publication.
