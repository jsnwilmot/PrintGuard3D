# Initial supplementary CI failure retained

Source8f90fb5, run41316238711, job124876777704. There were144 PASS observer lines and zero FAIL observer lines, after30 original N09 cases passed. The job then failed in report generation. This failed job remains FAIL; the local Firefox observer failure is separate and unchanged. Final-head results are linked in PR44.

```text
2026-11-01T14:27:00.3659219Z HEAD is now at 8371b18 Merge 8f90fb5e631f7e68df5d7ba66a9145c263538f53 into 0d388b42afff7f57db01028a64deac85e293d2ba
2026-11-01T14:27:52.2905231Z HEAD is now at 0d388b4 Merge reviewed Release 1 release-contract and exact-update safeguards (#40)
2026-11-01T14:32:51.7773012Z   30 passed (3.8m)
2026-11-01T14:33:43.9925155Z PASS chromium-held-old-tab-update-1
2026-11-01T14:36:25.1975877Z PASS firefox-held-old-tab-update-1
2026-11-01T14:37:52.6168993Z PASS webkit-held-old-tab-update-1
2026-11-01T14:38:02.6539445Z Traceback (most recent call last):
2026-11-01T14:38:02.6577588Z KeyError: 'milliseconds'
2026-11-01T14:38:02.6748824Z ##[error]Process completed with exit code 1.
```
