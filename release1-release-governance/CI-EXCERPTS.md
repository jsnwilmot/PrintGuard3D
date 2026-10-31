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
