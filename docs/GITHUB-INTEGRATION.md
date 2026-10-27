# GitHub integration and Phase 1 final verification

Date: 2026-10-27 UTC. Related: [Issue #1](https://github.com/jsnwilmot/PrintGuard3D/issues/1), [Issue #2](https://github.com/jsnwilmot/PrintGuard3D/issues/2).

**Phase 1 is not accepted. Native restoration remains NOT VERIFIED. Release 1 is not ready.** The GitHub branch and draft PR are for review, not permission to merge or deploy. See the issues/PR and [Actions](https://github.com/jsnwilmot/PrintGuard3D/actions) for the final remote head and CI results.

## Repository and preservation

- Official repository/remote: `https://github.com/jsnwilmot/PrintGuard3D.git` (`origin`, fetch and push).
- The existing local repository was reused. No nested repository was created; no history was overwritten, reset, rebased or force-pushed.
- The genuine original root commit is `c938bd8bdf1e9089f1473d3fb1c2e74597066b58`. All 36 tracked files match the original acceptance SHA-256 inventory after accounting for Git line endings. No historical commit was fabricated.
- `main` was published at that exact commit, then checked using the remote Git ref. It contains the original application, assets, documentation and 29 original tests, without Phase 1 source changes.
- Phase 1 remains on `remediation/phase1-integrity-safety`. Its original work was uncommitted when this integration started; there were no prior Phase 1 commits to rewrite or discard. New commits reference Issues #1/#2.
- No remote existed before integration. Existing Git author identity was retained. Git Credential Manager successfully pushed source; the unrelated GitHub CLI login was invalid and was not changed or used to publish.
- `src/` is byte-identical to the previous Phase 1 verified source manifest. Integration changes are GitHub/CI/documentation and synthetic fixture packaging, not an application rebuild or Phase 2 implementation.

## Public-source review

The original baseline scan found no obvious credential patterns. The branch's staged surface is checked by `scripts/validate-repository.mjs` and manually reviewed before pushing. Build output, caches, environment secrets, local databases, personal backups, raw browser exports, generated JSON test reports and workstation captures stay outside Git. No production browser records were read or committed.

Human-reviewed matrices/finding registers are retained as project documentation. Public copies use portable links or immutable baseline source links. Original copies and raw captures remain in the ignored local verification archive. The original legacy export is included only as the explicitly reviewed, labelled synthetic fixture `tests/fixtures/legacy-schema1.synthetic.json`; it contains no real personal maintenance data. Printer-profile JSON remains eligible for tracking.

## Tests and build

| Verification | Result |
| --- | --- |
| Original tests | 29/29 pass, original test files unchanged |
| Phase 1 regressions | 49/49 pass |
| Standard total | 78/78 pass |
| Current acceptance suite | 39/45 pass; six actual failures remain |
| Perpetual recurrence | Passing cases retained through 2035/2040/2100/2200 and annual leap-day coverage through 2400 |
| TypeScript and local production build | Pass; build is validation only |
| New CI | Separate quality and full acceptance jobs, no deployment or failure bypass |

The acceptance failures are U07 (due usage work omitted from upcoming reports), U08 (parts columns), U10 (completed calendar filters), U11 (due usage work omitted from calendar), U12 (upcoming horizon) and U18 (segmented year entry). They belong to later authorized remediation and are not silently skipped. The updated 29-section assessment remains **4 PASS, 22 PARTIAL, 3 FAIL**, with additional NOT VERIFIED granular rows. The full application remains unapproved for Release 1.

## Native browser evidence

Chrome opened a new `127.0.0.1:4347` origin, confirmed an empty database and seeded only labelled synthetic records. The production site was not targeted.

| Actual native step | Result |
| --- | --- |
| Empty isolated database confirmed | PASS |
| Synthetic dataset loaded | 3 printers (two identical FDM models plus resin), 5 rules, 3 completed logs, 3 readings, 2 stock items, 1 repair, 3 profile definitions and preferences |
| Actual Settings “Back Up My Data” export | PASS; a new browser-downloaded JSON file was verified synthetic before copying to ignored local evidence |
| Export versus native IndexedDB inspection | PASS for all seven data arrays and preferences at export; embedded test images and archived/current profile versions preserved |
| Export digest | SHA-256 `8b34dc3cb1e53dba81d9416e717515a969225b07960c4054e67b15c0d27f1061` |
| Reversible replacement marker | Synthetic printer p1 archived after export; only fixture state changed |
| Upload/restore | NOT VERIFIED; extension upload required disabled file-URL permission, which was not enabled |
| Windows native picker fallback | Stopped by Computer Use because the current browser URL could not be validated confidently |
| Native malformed/conflicting/repeated imports | NOT VERIFIED in this final session |
| Native post-restore recurrence/completion/classification | NOT VERIFIED; automated regressions remain passing |

No successful native restore, native rollback or complete native end-to-end acceptance is inferred from the export or automated tests. The actual unit/component import, reference, verification, fault-injection and repeated-import tests still pass. Earlier pre-remediation native restoration remains historical evidence and cannot certify the updated UI.

The loopback server is stopped at completion. Raw export/inspection files remain local and excluded from public source. Existing synthetic browser state is retained rather than deleted. No production database, user history, hosting setting, extension permission or application audience was changed.

## Review recommendation

Keep the PR in draft and Issue #2 open. Review the Phase 1 code and passing automated checks, but do not accept Phase 1 until the actual native restore and invalid/repeated import workflow has a supported execution environment or a documented human verification result, and an Architect approves. The disabled extension permission must not be changed as a workaround under the current authorization.

After native verification, compare every supported table and ownership relationship, check historical source snapshots, test incompatible FDM/resin attribution and immutable profile references, then verify another completion advances only its printer's recurrence. Preserve the original 29 tests, all 49 Phase 1 regressions and future-year coverage. Later calendar/reporting/profile/accessibility work requires separate phase authorization. No deployment, self-approval, merge or issue closure is part of this integration.

See [development workflow](DEVELOPMENT.md), [Phase 1 readiness](../remediation-phase1/READINESS.md), [current matrix](../remediation-phase1/MATRIX.md) and [finding register](../remediation-phase1/findings.csv).
