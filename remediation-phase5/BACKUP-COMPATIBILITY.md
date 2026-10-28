# Backup compatibility and resilience register

Schema **1** is an envelope version, not a promise that every schema-1 reader understands every optional record field. The chosen policy is a truthful fail-closed compatibility warning, **not a lossy downgrade export**. Settings displays this before export/import review. Never remove source/version, ownership, image or historical fields to force an old application to accept a newer file. Keep the original backup and use the current/newer supported reader.

| Writer / input | Reader | Observed result / coverage |
| --- | --- | --- |
| Original schema-1 synthetic legacy backup | Current Phase 5 | Accepted; native merge/replacement/download, seven-store fidelity and renewed consent. Q14; D03, existing N01-N06. |
| Legacy synthetic backup | Actual frozen original, Phase 1, Phase 2, Phase 3 and Phase 4 schema readers | All parse successfully. Q14 executes their actual domain/backup schemas with their source hashes verified. This tests the validation boundary, not running an old deployed UI. |
| Enriched schema-1 file containing reviewed newer profile fields, unknown profile JSON metadata, repair currency and goal preferences | Original through Phase 4 strict schema readers | All reject at parsing; newer fields are not silently stripped. Q14. Older readers cannot be changed by this branch; no downgrade compatibility is claimed. |
| Same enriched schema-1 file | Current Phase 5 | Accepted with metadata retained. Verification claims are rechecked against exact canonical definitions. Q11/Q14; D04. |
| Unsupported future schema 2 | Current Phase 5 | Explicit rejection before writes, as required by the unchanged acceptance assertion. Q12, original N03. No future migration/converter is claimed. |
| Unknown structural record fields or invalid nested procedure/reference schema | Current Phase 5 | Rejected; only safe unknown top-level **profile** JSON metadata is retained. There is no blanket permissive task/log/relationship reader. |
| Reserved `__proto__`, invalid JSON-valued or >32-level profile metadata | Current Phase 5 | Explicit fail-closed rejection rather than object-parser omission. Q19. Keep the original file and obtain a separately reviewed migration if needed. |

Frozen sources are in [historical-backup-readers.json](../tests/fixtures/historical-backup-readers.json), captured from `c938bd8`, `e5565f0`, `bfd4cdd`, `e8cd433` and `616e26e`; that fixture stores each full commit and SHA-256 of the unchanged domain source. Q14 compiles those repository-owned historical sources only in the test process. These executable snapshots are not included in the application bundle, and import does not execute any backup content.

## Data and consent invariants

Native tests verify printers, rules, history, readings, inventory, repairs and profiles individually. Per-record canonical SHA-256 comparisons include every nested JSON value and image byte; only the irrelevant ordering of IDB primary-key enumeration is normalized. Arrays inside a record retain their order. Profiles, archives, historical source/currency metadata, distinct owners and custom schedules remain intact. New repair saves capture the current currency once; edits never assign a currency to legacy unknown values or change a captured one.

Merge retains local mutable records, rejects conflicting immutable identity/ownership/history and validates the complete combined graph again inside its write transaction. Identical repeated merge is idempotent. Preview/cancel and malformed/future/duplicate/relationship failures write nothing. Replacement requires explicit confirmation; imported acknowledgment is not consent on this device. Restoring all data clears acknowledgment and locks disclosure until renewed consent. D03 repeats this in all three native engines. Existing 45 acceptance contracts remain unchanged.

Q13 injects `QuotaExceededError` after replacement has cleared stores and started writing. D09 aborts the **native IndexedDB transaction** while adding repairs, after earlier stores were written, and verifies all seven stores and preferences roll back. The exception is intentionally injected: this is not physical disk exhaustion or a measurement of each browser's quota enforcement.

## Capacity evidence and limitations

D04 imports/restores/re-exports 12 synthetic printers, 12 schedules, 600 completion records, 12 readings, 12 inventory items and 12 repairs, with large embedded 900x600 noise PNG images and legacy profile metadata. Actual file byte sizes, timings and available storage/heap measurements are in [backup-measurements.csv](backup-measurements.csv). All seven stores are compared exactly in Chromium, Firefox and WebKit. The synthetic task baselines follow their history; the fixture does not bypass semantic guards.

The import UI rejects files **over 100,000,000 bytes before reading their contents** (Q15). This is a file guard, not a promise that every file below it fits memory/quota. Reading, parsing, validation and transaction planning make additional in-memory copies; exported pretty JSON can be larger than compact input. Chromium `performance.memory`, when available, is a reported JS heap sample rather than process-wide peak RSS. Other engines may expose no heap measurement. No unlimited-capacity claim is made. Low-memory mobile/private modes, actual disk-full conditions, browser eviction and the largest acceptable production workshop need owner/device tests. Keep independent backups.

Actual transport-loss reopen verifies cached public assets and local records without an online server (D05). External manufacturer documentation is not cached or represented as available offline. See [security/offline evidence](SECURITY-OFFLINE.md) and the [manual release pack](MANUAL-RELEASE-PACK.md).
