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

The accepted Creator 5 v1.0.0 definition remains unchanged and is still the initial registration default. Owners can explicitly select **Creator 5 v1.1.0** or review it in Settings: eight confirmed fixed-interval procedures and eight procedures requiring an explicit published daily-use band. Condition and corrective references are retained without invented recurrence. **Creator 5 Pro v1.0.0** is separate and includes only the 1,000-hour cleaning interval verified in its own guide. Broader Pro applicability is pending.

All 18 official maintenance text articles, both exact-model guides, hardware/safety context and 63 indexed video links are inventoried in the [manufacturer documentation register](remediation-phase3/DOCUMENTATION-REGISTER.md). Video contents and ambiguous band boundaries remain unresolved. Coverage is partial; Manufacturer Verified identifies reviewed procedure evidence, not endorsement or complete-model certification. External instructions are authoritative and require internet access. Links can be flagged locally when unavailable/changed; tasks and complete-schedule reports show the flags. No continuous remote checking is claimed.

Additional manufacturers/models support registration and user-defined rules. New reviewed JSON definitions and manifest entries extend the library without changing the scheduling engine. Imported verification labels stay pending unless the complete profile/task definition matches the application-reviewed exact model, technology and version. Source URLs and acknowledgment alone do not establish verification.

The review modal exposes every changed field, additions/removals, applicability and ordering. Acceptance is explicit; deferring writes nothing. Updates reject downgrades, redefinitions, stale registry previews and ambiguous task identities. Selected new procedures append using current readings. Existing rules, custom intervals, baselines, history and other printers remain unchanged and pinned to immutable historical definitions. Removed templates do not delete active rules. Changed existing rules require separate owner edits, not automatic merging. See [profile authoring and update policy](docs/PROFILE-AUTHORING.md).

Generic printer illustrations are original code-native assets, clearly identified as generic. The supplied original logo is used without redesign. Custom photographs are resized locally and included in backups.

## Recurrence and metrics

Recurring rules have no end date. Completions preserve immutable historical snapshots and advance the relevant baseline. Calendar rules can use actual completion or the original scheduled cadence. Explicit skips advance the cycle and remain in history. Fixed-cadence late completions retain a count of intervening unrecorded cycles. Postponements and dragging the next calendar occurrence move it and produce an audit record without changing the interval. Projected recurrences cannot be dragged; the date field in task details provides a keyboard alternative. Archived printers pause scheduling and retain all data. Usage-only rules never acquire an invented calendar due date.

On-time compliance = on-time completed records / (completed + explicitly skipped records). Postponements are excluded. Unrecorded missed cycles are audited but excluded from this occurrence-based metric. It is not a measurement of mechanical health. Dashboard activity and report totals use only real local records.

## Data protection

Backups use schema 1 and include all tables, embedded custom images, retained profile versions and preferences. The updated reader accepts the original schema-1 exports; newer optional attribution/profile fields require this updated reader and may be rejected by the original strict application. The IndexedDB store layout/version remains unchanged; existing records are not migrated or rewritten on startup.

Unsupported future schemas, invalid types, unsafe image data, duplicate identifiers/activity, orphaned references, cross-printer ownership and contradictory usage/date relationships are rejected. Preview identifies retained rows and conflicts per record. Merge keeps existing mutable rows and rejects conflicting identities or historical values, then validates the complete destination graph again inside the write transaction. It does not remap IDs or silently choose an owner. Valid disjoint imports and identical repeated imports remain supported. Replacement requires explicit acknowledgment and runs in one transaction; failure rolls back clearing and all writes. Imported legal acknowledgment is never treated as consent on another device; replacement deliberately renews acknowledgment.

Rules with history cannot be reassigned. Reassignment without history becomes user defined and clears the active verification/version claim while retaining the documentation URL. Editing intervals preserves the original recommendation and rebases fixed cadence on the last processed scheduled boundary, with a next-due preview. Completion rejects dates before latest recorded work/usage and decreasing or fractional print readings. New completion, skip and postponement records snapshot category, priority, model, source version and currency. Legacy history is preserved as recorded; unknown fields are not inferred from current rules. Consumed inventory cannot be deleted or reassigned while referenced by history. Imported text is rendered through React escaping. Destructive printer deletion remains confirmed and explains cascading record deletion; inventory is retained and unassigned.

If an older database already contains contradictions, export it intact and investigate separately. These guards reject unsafe imports/operations; they do not automatically repair, delete or reassign existing records. There is no ordinary history correction/overwrite workflow.

## Verification

Phases 1, 2 and 3 are accepted and merged. Approved Phase 3 main is `e8cd43314d158229e55698b59c0d43f56d1423db`. Phase 4 work is on `remediation/phase4-safety-accessibility` for [Issue #8](https://github.com/jsnwilmot/PrintGuard3D/issues/8), submitted for Architect review only. See the [Phase 4 report](remediation-phase4/REPORT.md), [current 86-row matrix](remediation-phase4/MATRIX.md), [legal/accessibility evidence and manual plan](remediation-phase4/EVIDENCE.md) and retained [Phase 3 evidence](remediation-phase3/REPORT.md).

The original disclaimer wording/version remains unchanged. Current acknowledgment is required before record tables are read or workshop data/search/notifications/exports are rendered, including after restoration. Blank exploration and public help remain available. Explicit acknowledgment preserves stored preferences and records. This is a local UI disclosure gate, not authentication or encryption; independent Canadian counsel review remains **PENDING / NOT VERIFIED**.

Maintenance/profile views link the full disclaimer and expose exact-model/source, missing/flagged/offline warnings. CSVs append a safety field without changing leading columns; ICS carries notices in calendar metadata and every event description with UTF-8 folding/escaping. Print uses a light scheme and readable safety copy. Shared modal focus/inert layers, mobile navigation, control labels/states, paired theme contrast and reflow are corrected. [Criterion-level evidence](remediation-phase4/accessibility-register.csv) identifies what is tested and what remains manual; no WCAG conformance claim is made.

```sh
node scripts/validate-repository.mjs
npx tsc -p tsconfig.json --noEmit --incremental false
npx vitest run tests
npx vitest run --config remediation-phase1/vitest.review.config.mts
npm run build
npm run test:native
```

Phase 4 local verification: **125/125 standard tests** (114 preserved +11 new), **45/45 unchanged acceptance assertions**, **20/20 native Chromium cases** (13 preserved +seven new), TypeScript, static checks and production build. Twenty-four axe scans detect zero violations; incomplete checks and manual screen-reader/zoom/cross-browser acceptance remain outstanding. The audit dependency is test-only and requires Node 22.12+. Native tests need pinned Playwright Chromium and use isolated localhost contexts. No assertion is bypassed or weakened. **Release 1 remains NOT approved.** No merge, deployment, access change, production-data operation or Phase 5 work is authorized by this phase.

## Release scope and limits

This implements the Release 1 local maintenance workflow and some enhanced management: repairs, parts consumption, costs and local photos. Additional verified profiles require source research. Guided procedures link to original instructions and require safety acknowledgment before recording work; there is no invented step-by-step guide. Advanced forecasting, standalone PDF composition, PNG schedule exports, every requested historical trend chart, and automatic merging of changed existing profile rules are not implemented. Browser print-to-PDF is supported. Reliable closed-app push notifications, printer connectivity and cloud sync are outside the core release. No claim of WCAG certification or exhaustive Safari/Firefox/device testing is made. Seek legal review before a public launch.

Contact: design@roseandpaw.ca

## GitHub review workflow

Official source: [jsnwilmot/PrintGuard3D](https://github.com/jsnwilmot/PrintGuard3D). See [development rules](docs/DEVELOPMENT.md) and [GitHub integration status](docs/GITHUB-INTEGRATION.md). Approved Phase 1/2 history remains on main. Phase 4 belongs in a draft PR and must not be self-approved or merged by Codex. CI reports quality, all acceptance assertions and native Chromium independently; actual failures stay red. No CI deployment exists. Raw local backups, browser captures and generated test reports are excluded from source control; only reviewed synthetic test fixtures are included.
