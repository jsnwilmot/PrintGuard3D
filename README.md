# PrintGuard 3D

Protect Your Printer. Maintain Your Performance.

A React / TypeScript / Vite / Tailwind application developed for Rose & Paw Digital Designs. User data lives in IndexedDB through Dexie; the production application caches its complete app shell for offline use. There is no application account, remote record database, telemetry, or automatic synchronization. The initial Sites deployment is private; its hosting access screen is separate from the application. The same `dist/` output can be hosted on Cloudflare Pages.

## Run

```sh
npm ci
npm run dev
npm test
npm run build
```

Production preview: `npx vite preview --host 127.0.0.1`. Open the production site at least once, allow its service worker to finish caching, then reopen offline. External official instructions are not mirrored into the cache. Browser storage persistence and notification permission are optional and browser-controlled.

## Core modules

- `domain.ts`: strict schemas, versioned domain types, preferences and validation. New attribution fields are optional so legacy records can be read without a database migration.
- `integrity.ts`: shared ownership, cumulative usage, chronology, duplicate activity and profile-version relationship checks.
- `profiles.ts`: independently versioned, model-specific data definitions and manufacturer catalogue.
- `engine.ts`: perpetual daily/monthly, operating-hour, print-count, every-print, combined, condition and one-time rules. Fixed cadence retains the original month-end anchor using a cycle offset. Future occurrences are generated per viewport; outstanding rules are never duplicated into an infinite overdue backlog.
- `db.ts`: versioned database, atomic completion/inventory transactions, full/printer backup, import validation, safe merge and confirmed replacement.
- Page and form modules: real records, calendar views, history, repairs, inventory, reports, CSV/ICS exports, browser PDF printing, documentation and email feedback.
- `legal.ts`: replaceable disclaimer text and version. A material update requires a new version and renewed acknowledgment. This is the supplied draft, not legal advice or a claim that it has been reviewed by counsel.
- Vite offline plugin: generates a versioned service worker from the exact build assets. Headers in `public/_headers` are compatible with Cloudflare Pages; another host may configure its own equivalent headers.

## Verified profile scope

The bundled **FlashForge Creator 5**, profile `1.0.0`, includes one procedure verified on 2026-10-26: positioning-ball and needle-roller maintenance at **500 operating hours**. Summary and materials are drawn from the official source below; the original procedure remains authoritative. No additional model-specific intervals have been invented. Creator 5 Pro is a distinct, pending-verification catalogue entry.

Official source: https://wiki.flashforge.com/en/creator-series/creator-5-series/maintenance/extruder-mount-positioning-balls

Other listed manufacturers/models support registration and user-defined rules. Installed profiles extend the manufacturer/model selectors. Imported profiles are strict JSON data, never executable code. Their verification claims remain **Pending Verification** unless they match an application-reviewed definition for the exact model, technology, version and procedure. A source URL or acknowledgment alone does not establish verification. The bundled procedure is the only reviewed allowlist entry; this phase adds no manufacturer intervals.

Installation never overwrites history or existing task customizations. Earlier profile definitions remain stored under reserved version keys in the existing profiles store, and applied documentation resolves the exact retained version. Same-version redefinitions are rejected. A stable `templateId` identifies a template across updates; legacy packages without it fall back to their existing title and cannot reliably identify renames. Applying new defaults is explicit; pending procedures remain pending. Changed existing tasks require an explicit edit. Preview displays current/incoming definitions and intervals; comprehensive field-level diff and coverage research remain outstanding.

Generic printer illustrations are original code-native assets, clearly identified as generic. The supplied original logo is used without redesign. Custom photographs are resized locally and included in backups.

## Recurrence and metrics

Recurring rules have no end date. Completions preserve immutable historical snapshots and advance the relevant baseline. Calendar rules can use actual completion or the original scheduled cadence. Explicit skips advance the cycle and remain in history. Fixed-cadence late completions retain a count of intervening unrecorded cycles. Postponements and dragging the next calendar occurrence move it and produce an audit record without changing the interval. Projected recurrences cannot be dragged; the date field in task details provides a keyboard alternative. Archived printers pause scheduling and retain all data. Usage-only rules never acquire an invented calendar due date.

On-time compliance = on-time completed records / (completed + explicitly skipped records). Postponements are excluded. Unrecorded missed cycles are audited but excluded from this occurrence-based metric. It is not a measurement of mechanical health. Dashboard activity and report totals use only real local records.

## Data protection

Backups use schema 1 and include all tables, embedded custom images, retained profile versions and preferences. The updated reader accepts the original schema-1 exports; newer optional attribution/profile fields require this updated reader and may be rejected by the original strict application. The IndexedDB store layout/version remains unchanged; existing records are not migrated or rewritten on startup.

Unsupported future schemas, invalid types, unsafe image data, duplicate identifiers/activity, orphaned references, cross-printer ownership and contradictory usage/date relationships are rejected. Preview identifies retained rows and conflicts per record. Merge keeps existing mutable rows and rejects conflicting identities or historical values, then validates the complete destination graph again inside the write transaction. It does not remap IDs or silently choose an owner. Valid disjoint imports and identical repeated imports remain supported. Replacement requires explicit acknowledgment and runs in one transaction; failure rolls back clearing and all writes. Imported legal acknowledgment is never treated as consent on another device; replacement deliberately renews acknowledgment.

Rules with history cannot be reassigned. Reassignment without history becomes user defined and clears the active verification/version claim while retaining the documentation URL. Editing intervals preserves the original recommendation and rebases fixed cadence on the last processed scheduled boundary, with a next-due preview. Completion rejects dates before latest recorded work/usage and decreasing or fractional print readings. New completion, skip and postponement records snapshot category, priority, model, source version and currency. Legacy history is preserved as recorded; unknown fields are not inferred from current rules. Consumed inventory cannot be deleted or reassigned while referenced by history. Imported text is rendered through React escaping. Destructive printer deletion remains confirmed and explains cascading record deletion; inventory is retained and unassigned.

If an older database already contains contradictions, export it intact and investigate separately. These guards reject unsafe imports/operations; they do not automatically repair, delete or reassign existing records. There is no ordinary history correction/overwrite workflow.

## Phase 1 verification

Local remediation is on `remediation/phase1-integrity-safety`; no deployment, access change or production-data operation is part of this phase. See `remediation-phase1/READINESS.md`, the updated 86-row matrix and raw test reports. The original acceptance evidence remains in `acceptance-review/`.

```sh
npm test
node node_modules/vitest/vitest.mjs run --config remediation-phase1/vitest.review.config.mts
npm run build
```

The acceptance command intentionally remains nonzero while out-of-phase calendar/reporting contracts fail. Those failures are not skipped or converted to expected success. Tests use isolated fake IndexedDB and labelled fixtures. Native file-chooser restoration could not be reverified in this phase; the prior native evidence is retained separately. **The application is not Release 1 ready. Phase 2 requires separate authorization.**

## Release scope and limits

This implements the Release 1 local maintenance workflow and some enhanced management: repairs, parts consumption, costs and local photos. Additional verified profiles require source research. Guided procedures link to original instructions and require safety acknowledgment before recording work; there is no invented step-by-step guide. Advanced forecasting, standalone PDF composition, PNG schedule exports, every requested historical trend chart, and profile-by-profile field-diff merging are not implemented. Browser print-to-PDF is supported. Reliable closed-app push notifications, printer connectivity and cloud sync are outside the core release. No claim of WCAG certification or exhaustive Safari/Firefox/device testing is made. Seek legal review before a public launch.

Contact: design@roseandpaw.ca

## GitHub review workflow

Official source: [jsnwilmot/PrintGuard3D](https://github.com/jsnwilmot/PrintGuard3D). See [development rules](docs/DEVELOPMENT.md) and [GitHub integration status](docs/GITHUB-INTEGRATION.md). The original `main` baseline is retained; Phase 1 belongs in a draft PR and must not be self-approved or merged by Codex. The CI quality job and full acceptance job report independently; known acceptance failures stay red. No CI deployment exists. Raw local backups, browser captures and generated test reports are excluded from source control; only reviewed synthetic test fixtures are included.
