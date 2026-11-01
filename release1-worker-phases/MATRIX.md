# Scoped Issue #41 acceptance register

This supplements the unchanged [86-row matrix](../release1-consumer-transparency/MATRIX.md) and [historical operational audit](../release1-operational-preflight/MATRIX.md). No old PASS, FAIL or NOT VERIFIED is overwritten. See REPORT.md and machine-readable evidence for exact sample outcomes.

| Requirement | Status | Verification evidence / test coverage | Outstanding issue | Priority / corrective action |
| --- | --- | --- | --- | --- |
| Approved source, original oracle/config/deadline/retries preserved | PASS | Detached approved main; 17-file ordinary artifact and source SHA guards; original 120s / zero retries; original source unchanged | Instrumented worker is intentionally a different delivered response | P1: independently compare hashes/diff |
| Worker hash/cache/install/activate/claim observability | PARTIAL | Native digest results/puts/marker/events; revised controls 9/9; raw first controls 7/2 retained | Telemetry perturbs timing, may be dropped at termination; cannot infer absence as proof | P1: inspect complete correlated traces |
| Separate ready versus controller await outcome | PASS | Instrumented failed Firefox samples: ready resolves, controllerchange await times out at original ceiling | Does not determine phase of older combined-only traces | P1: retain instrumented distinction |
| Original readiness/offline reliability | FAIL | Historical original N09 CI 28/2, 29/1 and full reporting 74/1 unchanged; new instrumented sample 26/4, all four FF controller waits | Local greens and warning implementation do not repair failures | P1 RED STOP: further bounded causal evidence |
| Exact universal root cause | NOT VERIFIED | New failure phase localized; complete cache/claim in captured contexts | Navigation/first-claim race remains hypothesis; Chromium historic causality unproved | P1: Architect review proposed discriminating experiment |
| Runtime fix / production offline acceptance | NOT VERIFIED | No production source changes in this branch | Implementation requires separate authorization; installed/physical/host testing absent | P1: no merge/deploy or Release 1 approval |
