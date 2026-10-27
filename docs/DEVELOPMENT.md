# GitHub development workflow

Repository: [jsnwilmot/PrintGuard3D](https://github.com/jsnwilmot/PrintGuard3D). The public source repository is separate from the privately hosted application. Pushing source or running CI does not deploy the app.

## History and branches

The genuine original application is commit `c938bd8bdf1e9089f1473d3fb1c2e74597066b58`. Its 36 tracked files match the original acceptance hash inventory, allowing for Git's LF/CRLF normalization. The original commit, author metadata and history were retained; no historical commit was reconstructed or backdated. The existing repository was reused, not nested or reinitialized. There were no previous remotes to replace.

`origin` is `https://github.com/jsnwilmot/PrintGuard3D.git`. `main` contains the approved Phase 1 and Phase 2 merges. Current work is on `remediation/phase4-safety-accessibility` and must remain separate until Architect review. Do not rewrite history, force-push, discard uncommitted work, self-approve or self-merge.

Use a dedicated branch per phase or descriptive feature:

- `remediation/phase1-integrity-safety`
- `remediation/phase2-scheduling-calendar`
- `remediation/phase3-profiles`
- `remediation/phase4-reports-kpis`
- `remediation/phase5-documentation`

These names are workflow guidance, not authorization to begin later phases. Keep unrelated changes out of a phase branch.

## Issues, pull requests and acceptance

[Issue #1](https://github.com/jsnwilmot/PrintGuard3D/issues/1) is the central Release 1 tracker. [Issue #2](https://github.com/jsnwilmot/PrintGuard3D/issues/2) tracks native Phase 1 backup/restore verification. Reference issues in commits and PRs; do not close them until their acceptance criteria are satisfied.

Open significant changes as draft PRs against `main`. Include purpose, associated issue, root causes, summary, modified files, test results, acceptance evidence, known limitations, risks and next action. Architect review and explicit human approval are required before merging. Codex must never approve or merge its own implementation. Repository access settings and branch protection were not changed; these documented rules do not claim enforced GitHub protection.

Phase 1 and Phase 2 have been accepted. Phase 3 implementation and test success require separate Architect acceptance. Release 1 remains blocked by the documented broader requirements.

## Continuous integration

`.github/workflows/validate.yml` runs for PRs targeting `main` and supports manual dispatch. It has read-only repository permissions, pins official Actions to immutable revisions, does not persist checkout credentials, and contains no deployment step or deployment secret.

Three independent jobs report their actual outcome:

1. **Quality:** `npm ci`, tracked-file/static validation, TypeScript, all original/new regression tests and a production build for validation only.
2. **Full Release 1 acceptance:** all 45 unchanged acceptance assertions. There is no `continue-on-error`, skipped failure or expected-failure conversion.
3. **Native Chromium:** production build, nine preserved and four new isolated browser journeys, with synthetic evidence artifacts.

JSON test output is retained as CI artifacts for 14 days, including when acceptance fails. It is not committed to Git. The workflow does not publish application builds. See [Actions runs](https://github.com/jsnwilmot/PrintGuard3D/actions) for results tied to the PR revision.

Local equivalents:

```sh
npm ci
node scripts/validate-repository.mjs
npx tsc -p tsconfig.json --noEmit --incremental false
npx vitest run tests
npx vitest run --config remediation-phase1/vitest.review.config.mts
npm run build
```

The six Phase 2 corrections are accepted and all 45 assertions pass. Actual future failures must still fail CI. Original audit contracts remain historical baseline evidence; the current rerun's R08 exercises the guarded save path and U02 checks both proposed interval labels, as documented in the Phase 1 review.

## Public-source and data policy

Never commit credentials, environment secrets, caches, `node_modules`, build output, database files, personal maintenance exports, raw browser exports or user-generated app data. `.gitignore` excludes local verification output without broadly excluding JSON printer profiles.

Retain application assets, profile definitions, human-reviewed evidence documents and clearly identified synthetic fixtures. `tests/fixtures/legacy-schema1.synthetic.json` contains only the labelled review dataset, not real printer/user records. Raw historical captures, generated reports and source attachments remain local; the public documentation identifies those limits instead of pretending excluded files are available in GitHub. `scripts/validate-repository.mjs` checks the staged/tracked surface for prohibited paths, obvious credential patterns, `.mjs` syntax and the synthetic fixture's identity. This complements manual review and is not a complete security audit.

Before pushing, inspect `git diff --cached --stat` and the staged contents, run the validator and confirm that the remote points to the intended repository. Verify pushed refs against `git ls-remote origin` before claiming synchronization.

## Isolated native verification

Use `node remediation-phase1/server.mjs 4347` after a local build. It binds only `127.0.0.1`; open `/review.html` on that new origin, inspect for an empty database, then seed the labelled fixture. Never run fixture actions on the published app or any origin containing real records. A test-only acknowledgment control requires exactly the three labelled synthetic printers and does not represent a person's legal acceptance. It is outside the production build.

The fixture includes same-model FDM printers, resin, custom rules, completed work, readings, embedded test images, stock, repairs, a pending registry update and an archived applied profile version. Native verification must export via Settings, change only fixture state, import via the actual browser interface, compare every record/relationship, test invalid/conflicting inputs, and record actual outcomes. Do not infer native success from unit tests or a file-picker invocation.

Stop UI automation if the browser/security policy cannot validate the target. Do not enable extension file-URL access, change hosting/access settings, or bypass security controls to complete a test. Record NOT VERIFIED and leave Issue #2 open when a native path remains blocked. Fault-injection regressions still run independently in isolated fake IndexedDB.

## Lockfile portability

Generate/update locks without relying on a pre-existing platform-specific `node_modules` tree. The integration repair retained all existing versions and restored missing optional-platform entries; static validation checks required Linux build binaries. Never delete the working dependency tree or silently upgrade versions to work around a CI startup failure. Inspect and document dependency/lock diffs and run a clean CI install.

## Historical Phase 3 review

Phase 1 and Phase 2 are accepted and merged; approved Phase 2 main is `bfd4cdd8bbb8a9c3f6a14d7730ebb4441d291458`. The earlier Phase 1 setup narrative above is historical. Phase 3 uses `remediation/phase3-profiles`, references Issue #6 and requires a draft PR for Architect review, without merge or deployment. All 45 acceptance assertions now pass unchanged; there are three independent CI jobs including native Chromium. The current suite contains 114 standard tests and 13 native journeys. See [Phase 3 report](../remediation-phase3/REPORT.md), [matrix](../remediation-phase3/MATRIX.md), and [reviewed profile policy](PROFILE-AUTHORING.md). Repository validation now also checks the data-library manifest and immutable content digests. Manufacturer coverage remains partial; Release 1 is not approved.

## Current Phase 4 review

Phases 1-3 are accepted and merged; approved Phase 3 main is `e8cd43314d158229e55698b59c0d43f56d1423db`. Work on `remediation/phase4-safety-accessibility` references Issue #8 and requires a draft PR for Architect review, without merge/deploy or Phase 5 work. See [report](../remediation-phase4/REPORT.md), [all 86 rows](../remediation-phase4/MATRIX.md) and [legal/accessibility evidence](../remediation-phase4/EVIDENCE.md). Current results: 125 standard tests, 45 unchanged acceptance assertions and 20 native Chromium cases. Existing runner/workflow/artifact names are retained. The added pinned axe package is test-only; Node 22.12+ is required. No rules are disabled and raw incomplete audit checks remain available. Counsel, human screen-reader/keyboard, actual browser zoom and cross-browser acceptance remain separate. Release 1 is NOT approved.
