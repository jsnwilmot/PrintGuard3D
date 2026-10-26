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

- `domain.ts`: strict schemas, versioned domain types, preferences and validation.
- `profiles.ts`: independently versioned, model-specific data definitions and manufacturer catalogue.
- `engine.ts`: perpetual daily/monthly, operating-hour, print-count, every-print, combined, condition and one-time rules. Fixed cadence retains the original month-end anchor using a cycle offset. Future occurrences are generated per viewport; outstanding rules are never duplicated into an infinite overdue backlog.
- `db.ts`: versioned database, atomic completion/inventory transactions, full/printer backup, import validation, safe merge and confirmed replacement.
- Page and form modules: real records, calendar views, history, repairs, inventory, reports, CSV/ICS exports, browser PDF printing, documentation and email feedback.
- `legal.ts`: replaceable disclaimer text and version. A material update requires a new version and renewed acknowledgment. This is the supplied draft, not legal advice or a claim that it has been reviewed by counsel.
- Vite offline plugin: generates a versioned service worker from the exact build assets. Headers in `public/_headers` are compatible with Cloudflare Pages; another host may configure its own equivalent headers.

## Verified profile scope

The bundled **FlashForge Creator 5**, profile `1.0.0`, includes one procedure verified on 2026-10-26: positioning-ball and needle-roller maintenance at **500 operating hours**. Summary and materials are drawn from the official source below; the original procedure remains authoritative. No additional model-specific intervals have been invented. Creator 5 Pro is a distinct, pending-verification catalogue entry.

Official source: https://wiki.flashforge.com/en/creator-series/creator-5-series/maintenance/extruder-mount-positioning-balls

Other listed manufacturers/models support registration and user-defined rules. Imported profiles are strict JSON data, never executable code. Their source classifications are assertions by the profile author, presented for review before acceptance. Installation never overwrites history or existing task customizations; applying to a printer adds only missing template titles. For a changed existing template, review the source and explicitly edit its rule.

Generic printer illustrations are original code-native assets, clearly identified as generic. The supplied original logo is used without redesign. Custom photographs are resized locally and included in backups.

## Recurrence and metrics

Recurring rules have no end date. Completions preserve immutable historical snapshots and advance the relevant baseline. Calendar rules can use actual completion or the original scheduled cadence. Explicit skips advance the cycle and remain in history. Fixed-cadence late completions retain a count of intervening unrecorded cycles. Postponements and dragging the next calendar occurrence move it and produce an audit record without changing the interval. Projected recurrences cannot be dragged; the date field in task details provides a keyboard alternative. Archived printers pause scheduling and retain all data. Usage-only rules never acquire an invented calendar due date.

On-time compliance = on-time completed records / (completed + explicitly skipped records). Postponements are excluded. Unrecorded missed cycles are audited but excluded from this occurrence-based metric. It is not a measurement of mechanical health. Dashboard activity and report totals use only real local records.

## Data protection

Backups use schema 1 and include all tables, embedded custom images, profile references and preferences. Unsupported future schemas, invalid types, unsafe image data, duplicate IDs and orphaned references are rejected. Merge keeps current rows on an ID conflict; replacement requires explicit acknowledgment and runs in one transaction. Imported legal acknowledgment is never treated as consent on another device. Imported text is rendered through React escaping. Destructive printer deletion is confirmed and explains cascading record deletion; inventory is retained and unassigned.

## Release scope and limits

This implements the Release 1 local maintenance workflow and some enhanced management: repairs, parts consumption, costs and local photos. Additional verified profiles require source research. Guided procedures link to original instructions and require safety acknowledgment before recording work; there is no invented step-by-step guide. Advanced forecasting, standalone PDF composition, PNG schedule exports, every requested historical trend chart, and profile-by-profile field-diff merging are not implemented. Browser print-to-PDF is supported. Reliable closed-app push notifications, printer connectivity and cloud sync are outside the core release. No claim of WCAG certification or exhaustive Safari/Firefox/device testing is made. Seek legal review before a public launch.

Contact: design@roseandpaw.ca
