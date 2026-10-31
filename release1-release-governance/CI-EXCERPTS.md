# CI source excerpts — Issue #39

Source: `5c0feb2ec374bc62439cb7cd7b85d7f370644653`; [run 41246412988](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41246412988), quality job 124670740145. GitHub checks out its synthetic PR merge; the excerpt names both exact head and approved base. These are selected actual log lines, not replacement test results.

```text
2026-10-31T22:03:46.2843559Z HEAD is now at af5c0ed Merge 5c0feb2ec374bc62439cb7cd7b85d7f370644653 into f93bbf5297ac1ca858a521cc2781777b4c492073
2026-10-31T22:03:55.2504973Z Validated 3 reviewed data definitions and immutable content digests. Manufacturer evidence still requires human review.
2026-10-31T22:03:55.2562659Z Validated 251 tracked files: no prohibited output paths, obvious credential patterns or invalid .mjs syntax. Synthetic fixture identity confirmed. This is a targeted guard, not an exhaustive security audit.
2026-10-31T22:04:10.8780581Z  ✓ tests/release-contract.test.ts (24 tests) 762ms
2026-10-31T22:04:10.8828760Z    ✓ G19 actual release configuration refuses missing signed approval before writing build output 534ms
2026-10-31T22:04:11.9131418Z  ✓ tests/update-review.test.ts (15 tests) 17ms
2026-10-31T22:04:16.0075670Z       Tests  326 passed (326)
2026-10-31T22:04:27.5075619Z ✓ built in 5.21s
```

The first reporting attempt is retained as FAIL: [job 124670740077](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41246412988/job/124670740077). Its trace's last pending page operation waits for serviceWorker.ready/controllerchange before the offline portion of N09; cleanup then hit the overall test deadline. Root cause is not established. The original assertion and 120-second case ceiling remain unchanged.

```text
2026-10-31T22:11:48.1163069Z     Test timeout of 120000ms exceeded.
2026-10-31T22:11:48.1243344Z   1 failed
2026-10-31T22:11:48.1245653Z   74 passed (6.7m)
```

The same unchanged original N09 completed three local repetitions (4.3s, 4.5s, 4.7s). The full unchanged CI reporting retry passed; final attempt conclusions are recorded in VERIFICATION.json / the PR. No automated retries or suppression were added to the original suite. This failure must not be retitled PASS; a later passed run is separate evidence.

Actual retry job 124674302894:

```text
2026-10-31T22:19:21.1469764Z HEAD is now at af5c0ed Merge 5c0feb2ec374bc62439cb7cd7b85d7f370644653 into f93bbf5297ac1ca858a521cc2781777b4c492073
2026-10-31T22:21:28.4441805Z   ✓  25 [chromium] › release1-reporting/native/reporting.mjs:57:1 › N09 zero/one/twelve printers, leap timezone boundaries, post-2400 and offline reopen preserve real samples (3.2s)
2026-10-31T22:22:54.8239310Z   ✓  50 [firefox] › release1-reporting/native/reporting.mjs:57:1 › N09 zero/one/twelve printers, leap timezone boundaries, post-2400 and offline reopen preserve real samples (4.7s)
2026-10-31T22:24:58.4142363Z   ✓  75 [webkit] › release1-reporting/native/reporting.mjs:57:1 › N09 zero/one/twelve printers, leap timezone boundaries, post-2400 and offline reopen preserve real samples (6.4s)
2026-10-31T22:24:58.6995257Z   75 passed (4.7m)
```

## Corrected serialized-polling source

[Run 41249438174](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41249438174), quality job 124679738404; all six source jobs passed on the first attempt. Runtime `6198e42b5d58827c0761f8cdb68eb7bc3d958388`, tested tree `dd72c705449947ab598373f2e4fad74f8cef1741`.

```text
2026-10-31T22:43:43.8299064Z HEAD is now at 2c3aed1 Merge dd72c705449947ab598373f2e4fad74f8cef1741 into f93bbf5297ac1ca858a521cc2781777b4c492073
2026-10-31T22:43:53.9447766Z Validated 3 reviewed data definitions and immutable content digests. Manufacturer evidence still requires human review.
2026-10-31T22:43:53.9507842Z Validated 268 tracked files: no prohibited output paths, obvious credential patterns or invalid .mjs syntax. Synthetic fixture identity confirmed. This is a targeted guard, not an exhaustive security audit.
2026-10-31T22:44:05.5979673Z  ✓ tests/release-contract.test.ts (24 tests) 539ms
2026-10-31T22:44:05.5984811Z    ✓ G19 actual release configuration refuses missing signed approval before writing build output 364ms
2026-10-31T22:44:06.6704246Z  ✓ tests/update-review.test.ts (18 tests) 13ms
2026-10-31T22:44:09.4103108Z       Tests  329 passed (329)
```

The stronger background-timeout G06 fails on pre-fix runtime 5c0feb2 with checked/enabled review, then passes without an activation click in all three engines after serialization. Exact current ledgers and negative calibration are separate from the retained earlier readiness failure.

## Final canonical-worker boundary source

[Run 41252563922](https://github.com/jsnwilmot/PrintGuard3D/actions/runs/41252563922), quality job 124688930696, final runtime/test tree `cca78eff8c50e3d584084b819dad3072aa9ec1de`. G25 adds actual generated-script install rejection before canonical asset/cache access, with a declared-deployable positive control. Provider operation remains unverified.

```text
2026-10-31T23:26:54.1861091Z HEAD is now at 30465dd Merge cca78eff8c50e3d584084b819dad3072aa9ec1de into f93bbf5297ac1ca858a521cc2781777b4c492073
2026-10-31T23:27:02.9748517Z Validated 3 reviewed data definitions and immutable content digests. Manufacturer evidence still requires human review.
2026-10-31T23:27:02.9816926Z Validated 268 tracked files: no prohibited output paths, obvious credential patterns or invalid .mjs syntax. Synthetic fixture identity confirmed. This is a targeted guard, not an exhaustive security audit.
2026-10-31T23:27:18.1354128Z  ✓ tests/release-contract.test.ts (25 tests) 737ms
2026-10-31T23:27:19.9927346Z  ✓ tests/update-review.test.ts (18 tests) 18ms
2026-10-31T23:27:23.6411418Z       Tests  330 passed (330)
2026-10-31T23:27:35.0901125Z ✓ built in 5.17s
```

Final-source reporting job 124688930625 passed all 75 on the first attempt, including the unchanged N09 in every engine. This additional result does not resolve or reclassify the earlier failed run.

```text
2026-10-31T23:26:54.8176399Z HEAD is now at 30465dd Merge cca78eff8c50e3d584084b819dad3072aa9ec1de into f93bbf5297ac1ca858a521cc2781777b4c492073
2026-10-31T23:31:58.4883538Z   ✓  25 [chromium] › release1-reporting/native/reporting.mjs:57:1 › N09 zero/one/twelve printers, leap timezone boundaries, post-2400 and offline reopen preserve real samples (4.2s)
2026-10-31T23:33:38.6545853Z   ✓  50 [firefox] › release1-reporting/native/reporting.mjs:57:1 › N09 zero/one/twelve printers, leap timezone boundaries, post-2400 and offline reopen preserve real samples (6.3s)
2026-10-31T23:36:11.1555609Z   ✓  75 [webkit] › release1-reporting/native/reporting.mjs:57:1 › N09 zero/one/twelve printers, leap timezone boundaries, post-2400 and offline reopen preserve real samples (8.4s)
2026-10-31T23:36:11.5005707Z   75 passed (5.6m)
```
