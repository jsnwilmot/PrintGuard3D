# First public origin and writer safety — #37

Design prepared 2026-10-31 against approved main `aa8ade54061dec95ee51c65ba2e4ed46c0261c5d`; refined during implementation/testing. Owner selected **Option B**, new users only, planned **https://printguard3d.roseandpaw.ca**. The historical #34 conditional migration design is preserved. No source reader, cross-origin migration, private browser data, provider action or deployment is included. This implementation requires independent Architect review and separate owner merge authorization.

## Initialization and persistent format

Retain database name `PrintGuard3D` within the new origin. The public build refuses noncanonical hosts before importing App/database code or registering its worker; loopback development is allowed. A path, preview or pages.dev hostname does not share the canonical origin's storage. The client guard does not prove provider redirects, DNS or access controls.

| Layout | Behavior |
| --- | --- |
| Absent database | Create first-public schema atomically; only the local operational control row is populated before consent. No user workshop/default-instance/observation rows |
| Supported native 10 / Dexie 1, eight original stores | Existing additive v1-to-v2 upgrade retains all original records and preference bytes; adds empty observations and writer control. Tested synthetic compatibility, not a private-site migration facility |
| Historic native 20 with nine stores and no writerControl | Refuse before Dexie opens; no schema patch, adoption, data rewrite or deletion. Use the original compatible application and valid user-controlled files in an independently authorized workflow |
| First-public native 20 / Dexie 2, ten stores | Original nine stores/indexes plus `writerControl` (`id` key). Strict protocol/epoch checks govern writes |
| Unknown/future native number or store set | Refuse before Dexie's automatic schema-patching behavior; do not guess compatibility |

**Architect scrutiny required:** the first public footprint adds an operational store while retaining the private app's declared native number 20. This is scoped to a different origin with zero existing public users, and deliberately does not upgrade historic native-20 storage. Exact layout and protocol, not the number, determine compatibility. Future PUBLIC store-layout changes must increment the schema/native version. No production database was inspected. The original supported native-10-to-20 preservation assertions remain unchanged. If this first-public layout decision is rejected, it must be revised and retested before merge; passing tests are not architectural acceptance.

The initial reserved-preference-row prototype was discarded because a nonportable preference would break the portable preferences-store contract. The final dedicated store preserves that contract. The only baseline fixture change is explicit preparation of the first-public operational store in the loopback-only review harness; all original test assertions remain unchanged. There is no test-origin exception in the production fence.

Control record: `{id:'__printguard_writer_control_v1__', protocol:1, generation:1, capabilities:['backup:1','observations:1','profiles:1','recommendations:1']}`. No extra fields; generations are positive integers and capabilities must match exactly and in canonical order. This is local operational metadata, not legal consent, historical evidence or a portable user preference. The generation-2 executable is a build-time test fixture with the same supported data format; it is not a released future version.

## Transaction barrier and activation

Dexie DBCore middleware adds `writerControl` to every readwrite native transaction and compares the persisted contract before its first mutation. All later mutations in that transaction reuse the successful comparison: the shared native readwrite lock on the control store prevents a concurrent epoch change until commit/abort. The HTML/build identity is still checked on each mutation. Refusal explicitly aborts the entire transaction even if application code catches an individual rejection. No prior write in that transaction may survive. This avoids hundreds of redundant control reads during a large atomic restore.

Ordinary add/put/delete of operational controls is rejected. Generic range-clear of that dedicated store is a **fenced no-op**, so workshop reset cannot reset the epoch. Restore excludes the control store from replacement. Bootstrap uses only native control insertion within the versionchange/populate transaction; mixed build identity aborts that initialization too. It does not write user records or consent.

A separate explicit control-only activation API compares the exact previewed old record inside one native control transaction, and can only advance to the executing reviewed build's generation with the same supported capabilities. It never decrements or edits workshop records. Every ordinary writer shares that lock. The UI requires a full backup download and explicit confirmation before activation; downloading/checkbox acknowledgment alone does not prove independent recovery. Imports cannot activate a generation. New capabilities/protocols or data migrations require separately reviewed release changes, not a user setting or URL parameter.

This protects **cooperating first-public-and-newer builds**, including a held old tab. It is not an ACL against raw IndexedDB, XSS, extensions, modified binaries or device owners. Already shipped unguarded executables cannot be retroactively fenced. Ordinary browser-origin separation keeps those old-origin executables from directly opening the new origin's database. Original same-origin failures remain failures.

## Write-path inventory

| Files / functions | Persistent writes through the central barrier |
| --- | --- |
| db.ts completeTask / postponeTask | Logs, task anchors/postponement, printer usage, readings and stock consumption |
| db.ts savePrinter / saveTask / installProfile | Registrations, readings, recurring rules, accepted profile updates and immutable applied archives |
| db.ts saveInventory / deleteInventory / saveRepair | Inventory and repair records |
| db.ts restoreBackup / acceptReviewReminder / flagSource | Replace/merge, recommendation decisions and source flags |
| App.tsx acknowledgment and read notices; Settings.tsx save/export | Device acknowledgment v1.0, preferences and lastBackup timestamp |
| Printers.tsx delete/archive; forms.tsx UsageForm | Cascading user deletion, archive and cumulative readings |
| Maintenance.tsx task notes/pause | Notes and enabled state |
| observationStore.ts collectObservations / pauseObservations | Prospective immutable observations and explicit recording preference |
| writerSafety.ts activateWriter; db.ts initialization | Strict local operational control only; intentional, bounded native transactions |

No normal bootstrap seeds printer/task/history/profile instances or observations. Immutable bundled definitions remain source assets. Public Help/data-handling disclosures and disclaimer v1.0 wording/acknowledgment remain intact. The UI consent gate and writer compatibility checks serve separate purposes.

## Backup and rollback

Strict portable backup schema 1, observation v1 and recommendationPolicy v1 are unchanged. All seven core stores, ordinary preferences, original IDs/profile versions/images/readings/decisions and observations are included. Local operational controls are excluded and reconstructed by the compatible executable at a fresh origin/profile; no sidecar is required for workshop recovery. Imported files cannot set controls, consent or READY. Replacement renews legal acknowledgment; merge retains current local acknowledgment and immutable observations retain their existing conflict protections.

`makeBackup` retains its raw consistent-snapshot API for integrity inspection. User-facing full-backup downloads validate that snapshot without applying validator normalizations to exported records. An acknowledged stale writer can export supported data read-only; the export timestamp preference cannot bypass refusal. Unsupported future data requires a compatible reader. ExportedAt is assigned after the consistent read completes, preventing an observation committed while a readonly transaction waited from appearing later than the export itself.

Rollback is a fresh isolated compatible executable/profile/origin with an independently verified valid original file. Preserve later complete data separately. Never decrement an active epoch, strip new fields, overwrite later history or call a hosting rollback a data rollback. Cleared storage without a recoverable file can remain unrecoverable.

## Service worker and mixed assets

HTML and compiled code carry a content identity derived from source, public assets, lockfile, build configuration and generation. Missing/mismatched production identity refuses mutations. Each worker stages and SHA-256 checks every application asset before installation succeeds. Its own build-specific complete set serves root/index navigations and known assets online and offline. Other routes are not intercepted; test-only review/probe documents are not shipped in dist.

No install-time skipWaiting, update-time clients.claim or automatic old-cache deletion. Only the FIRST installation may claim previously uncontrolled pages; its persisted install marker is false for updates. An actual update waits for explicit backup/confirmation/activation/reload. Held clients retain their executable memory and original cache; the persistent transaction fence is the write protection after a generation advances. Old caches are retained intentionally, so capacity/eviction and eventual retirement need later reviewed policy. A failed/mixed install leaves the active build intact; missing cached assets return 503 rather than silently mixing network assets.

Actual installed-PWA/browser coexistence, OS restart, Safari/iOS, disk-full/eviction and provider behavior are NOT VERIFIED by headless local tests. See the [test plan](TEST-PLAN.md), [hosting proposal](CLOUDFLARE-PLAN.md) and final report for actual evidence and remaining gates. No technical or AI assessment approves legal compliance or Release 1.
