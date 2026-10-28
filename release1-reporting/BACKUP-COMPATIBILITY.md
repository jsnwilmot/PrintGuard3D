# Observation schema, backup compatibility and rollback

The [preflight contract](DESIGN.md) preceded schema implementation. Baseline main is `988d7d837849fc7acb9babf90bab4ea579a19a77`. The original seven workshop stores and preferences definitions remain unchanged. Dexie v2/native IndexedDB v20 adds only an empty `observations` table with ID, printer, UTC-instant and compound printer/instant indexes. Native upgrade itself neither samples nor rewrites data. Starting observation recording separately writes the optional preference and actual present facts under one transaction.

| Direction / failure | Behavior | Evidence |
| --- | --- | --- |
| Real Dexie v1 / native v10 → current | Empty additive store; every original row/photo/preferences unchanged; no startup backfill | R01; N01 actual native app upgrade in Chromium/Firefox/WebKit |
| Interrupted version-change transaction | Old version/store/rows retained | R02; N01 actual native abort |
| Explicit native v10 open after v20 | `VersionError`, existing v20 preserved | R01; N01 |
| **Older Dexie application against v20** | **Unsupported. Dexie 4 can fall back to schema discovery and reopen newer databases. Native VersionError is not an old-binary safety guarantee. Never use in-place old-binary operation as rollback.** | Finding from R01 test development; operational boundary documented here, Settings and README |
| Operational rollback | Pre-upgrade backup in a **fresh isolated old-version database**. Keep upgraded database/new full backup intact. Never delete/downgrade it to make old software run. New observations require the updated reader. | R02 fresh old-reader database; original frozen reader tests Q14. Human backup custody remains operational responsibility. |
| Legacy root schema-1 file → current | Original strict graph/profile checks retained; no invented observations; existing observations retained even with core replacement | R09; N07 actual file input |
| Current full backup → current | Optional `overdueHistory:{version:1,records:[...]}` plus original root schema 1. Complete observation roundtrip/merge, including captured deleted-printer history | R09/R10; N07 actual download/file input |
| Printer-only backup | Only requested printer observations; shared legacy inventory/profile behavior retained | R09 |
| Duplicate identical observation | Idempotent import; no replacement/write to existing history | R09/R10; N07 |
| Conflicting immutable ID, ownership, status/counts, duplicate instant, capacity or malformed time | Reject before writes; immutable conflict blocks merge **and core replace** | R07/R08/R10; N07 |
| Unsupported root/extension version | Strict failure; never strip unknown snapshot fields or downgrade export | Q12/Q14 retained; R10; N07 |
| Failure after core clears / writes / history additions | One transaction aborts original-store writes, preferences and all observation additions | R11; retained Q13/D09 native abort tests |
| Current enriched export → old strict backup reader | Old strict envelope/prefs rejects new extension/recording preference; no lossy compatibility export offered | R26 executes frozen original/Phase 1–4 reader schemas: legacy accepted, extension-only and recording-flag-only exports rejected independently. Q14 hash checks retained. No claim every historical application binary was executed. |

New exports omit the observation extension when empty; root schema 2 continues to be rejected by the unchanged baseline. Records are independent captured entities and need not join a still-existing live printer. Every captured task owner must match its captured printer; identity, eligibility, counts and scheduling-state consistency are validated from **only captured fields**. No present printer/profile is used to alter an earlier point. The format is version 1; a future change to these semantics requires a new version and explicit reader design.

Imports append immutable observations across all modes. Core replacement remains explicitly warned and resets legal acknowledgment. Old files cannot supply instructions to erase new history. The preview explains this exception to core replacement; printer deletion likewise warns that captured observation identities remain. Application code does not rewrite/delete observations. This is an application integrity contract, not tamper-proof storage: users can clear site storage or edit local files/devtools. Keep independent backups.

Recording is opt-in and bounded: 20,000 points total, 96/printer/UTC day, 1,000 printers and 10,000 tasks per collection. Reaching capacity stops new sampling and displays an explanation without pruning or expiring schedules. UTC instant plus local date/IANA timezone/offset are captured; calendar reports use captured local dates. Import rejects observations later than their export or over five minutes ahead of the importing clock; clock skew requires review, never automatic timestamp rewriting. Unobserved intervals are always unknown.

The original review harness now initializes the empty current store **before** original raw-store comparisons. Original assertions are unchanged. N01 constructs a genuine v10 fixture without this harness, so its upgrade evidence is independent. Only labelled synthetic records and loopback origins were used. No production database was opened, migrated or restored.
