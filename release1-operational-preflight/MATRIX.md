# Scoped operational acceptance matrix — #32

**30 PASS /12 FAIL /1 NOT VERIFIED disposition; operational acceptance FAIL / STOP.** This matrix does not rewrite the [86 original requirement IDs, statuses or historical evidence](../release1-consumer-transparency/MATRIX.md). Baseline CI remains separate from these actual old/new operational tests. Details, UTC, expected/actual and severity are in [RESULTS.json](RESULTS.json); reproduction in [README.md](README.md).

| Requirement | Chromium | Firefox | WebKit | Verification evidence | Outstanding issue / corrective action |
| --- | --- | --- | --- | --- | --- |
| Pre-Phase-5 own backup/restore | PASS | PASS | PASS | `*-01-prePhase5` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Pre-recommendation own backup/restore | PASS | PASS | PASS | `*-01-preRecommendations` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Current representative synthetic workshop | PASS | PASS | PASS | `*-02` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Native upgrade / no backfill | PASS | PASS | PASS | `*-03` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Current restore/cancel/merge/conflict/abort/legacy retention | PASS | PASS | PASS | `*-04` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Old strict rejection + fresh old rollback (pre-Phase-5) | PASS | PASS | PASS | `*-05-prePhase5` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Old strict rejection + fresh old rollback (pre-recommendation) | PASS | PASS | PASS | `*-05-preRecommendations` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Old writer against v20 (pre-Phase-5) | FAIL | FAIL | FAIL | `*-06-prePhase5` in RESULTS.json; per-case hashes/index | P1 STOP; separate approved mitigation required |
| Old writer against v20 (pre-recommendation) | FAIL | FAIL | FAIL | `*-06-preRecommendations` in RESULTS.json; per-case hashes/index | P1 STOP; separate approved mitigation required |
| Worker activation / held stale writer | FAIL | FAIL | FAIL | `*-07` in RESULTS.json; per-case hashes/index | P1 STOP; separate approved mitigation required |
| Cold process offline reopen | PASS | PASS | PASS | `*-08` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Version-only numeric fence | FAIL | FAIL | FAIL | `*-09` in RESULTS.json; per-case hashes/index | P1 STOP; separate approved mitigation required |
| Disposable site clearing / independent recovery | PASS | PASS | PASS | `*-10` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Pristine current origin/backup preservation | PASS | PASS | PASS | `*-11` in RESULTS.json; per-case hashes/index | Bounded synthetic evidence; actual host/human checks remain open |
| Actual installed PWA + browser; physical hard refresh; native human/AT/device/clients/OS restart/paper | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | HUMAN-NOT-EXECUTED; HUMAN-WORKSHEET.md M01–M22 | P1 human execution; no surrogate PASS |
| Actual physical quota exhaustion/browser-policy eviction | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | Explicitly injected transaction/site-clear tests only | Owner/device evidence required |
| Actual hosting / deployment compatibility | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | No external host/preview accessed; #16 remains open | Separate authorization and host facts required |

Both old writer cases and the held-tab case are genuine failing acceptance assertions. Existing prior logs/observations were preserved in the recorded checks; newly written stale-code logs omitted recommendation provenance. Old-code exports were rejected, not silently adapted. No failure was reclassified as a success because it was expected. The version-30 test is a deliberate disposable counterexample, not a committed app schema. Safe supported restore does not approve unsafe same-origin legacy coexistence.

Legal/manufacturer/manual/hosting/release gates remain open. [Mitigation proposal](MITIGATION-PROPOSAL.md) is unimplemented; owner approval is required for any application change. No merge/deployment or Release 1 approval.
