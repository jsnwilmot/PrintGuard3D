# Owner and qualified tester release pack

All checks in this pack start **NOT VERIFIED** until actual observations are recorded. Automated events, viewport emulation and Playwright WebKit do not constitute human assistive-technology, physical-device or Safari acceptance. No test authorizes a merge, deployment, production-data edit, access change or email send.

Use an explicitly authorized local/preview environment with a disposable browser profile and the labelled synthetic fixtures only. Export a baseline backup before tests. Never import into a production workshop. For each case record date, tester/qualification, commit SHA, actual browser/OS/device/client versions, configuration, steps, expected/observed result, PASS/FAIL/NOT VERIFIED, evidence path and issue/owner. A generic statement that a page “looks fine” is insufficient.

## Keyboard and screen readers

Run with NVDA + Firefox/Chromium on Windows, JAWS + the supported Windows browser where licensed/available, and VoiceOver + actual Safari on macOS/iOS. Record combinations that are unavailable; do not infer support from another pairing.

1. Start empty. Navigate using Tab/Shift+Tab, arrows, Enter, Space and Escape only. Confirm skip link, visible/unobscured focus, route heading/landmark announcements, navigation state and no keyboard traps.
2. Explore without acknowledgment, then deep-link/search/print/export/notification routes with stored synthetic workshop data and an old acknowledgment. Confirm private records cannot be disclosed. Review and accept the full unchanged disclaimer with an initially unchecked checkbox. Confirm all paragraphs can be read/scrolled and the consent control/error states are announced.
3. Register Creator 5 and Pro separately. Navigate all labels/help/validation, file upload and model/profile selectors. Confirm exact model applicability and pending/verified distinctions are announced without colour alone.
4. Review/defer a profile package. Open nested legal/source details; close with Escape. Verify one active dialog, inert lower layers, unique title, logical focus order and return to the exact invoking control. Apply an update and verify history/other-printer rules remain intact.
5. Record usage; try a decreasing reading and invalid completion chronology. Verify errors identify the field/problem, can be reached and corrected, and no data changed. Record a valid completion only after safety acknowledgment. Verify status/source/warnings.
6. Navigate all calendar views/filters, type a segmented date/year, visit 2035, 2400-02-29 and 2500, open a completed event and read immutable details. Move a current occurrence using the keyboard date alternative; confirm projected events cannot be moved and focus returns correctly.
7. Use every dashboard KPI/drilldown and report selector. Verify grouped currencies and separate unclassified history are understandable. Confirm estimated dates are announced as estimates, never actual due dates. Verify table headers/scroll regions and chart-equivalent record controls.
8. Export, preview, cancel, merge and confirmed replace on synthetic data. Confirm confirmation/error/status announcements, disabled actions, explicit replacement warning and renewed acknowledgment. Compare all seven stores against the baseline.

Map results to all [55 preserved WCAG criteria](accessibility-register.csv). Inapplicable criteria need an explicit reason, not an assumed pass. Resolve every remaining incomplete axe evaluation using [the investigation register](ACCESSIBILITY.md).

## Actual zoom, resizing, devices and contrast

1. Set actual desktop browser zoom to 200% then 400% using browser UI. At a 1280px-wide window verify reflow without page-wide horizontal scrolling, lost controls, overlapping focus/content or clipped error messages; tables/calendar may retain intentional two-dimensional regions. Record actual browser zoom, not a smaller Playwright viewport as a substitute.
2. Use browser text-only resizing to 200% where supported. Test long printer names, full links, warnings, fields, dialogs and all report controls. Apply WCAG text spacing separately and verify no loss of content/function.
3. Enable actual Windows forced-colour/high-contrast mode, not only CSS emulation. Check focus, selected states, statuses, controls, charts and icons. Measure remaining light/dark text/control/graph contrasts against their actual backgrounds.
4. Use physical iOS/Safari and Android target devices in portrait/landscape with real touch/onscreen keyboard. Test navigation/dialog dismissal, target sizes, date controls, upload/download, consent, offline reopening and readable reports.
5. Verify focus is not hidden by sticky headers, dialogs or scrolling containers. Check that motion preferences are respected. Record failures with exact selector/screenshot and accessibility criterion.

## Printing and external clients

1. Use the [12 digital print cases](PRINT-QA.md) on actual A4/Letter printer drivers. Test 100% scale and the browser's print-safe/fitted setting; record margins, header/footer choice, paper and driver. Inspect first/middle/last pages of long schedules for every task, continuation, source link, image, warning, no clipped glyphs, no blank pages and readable body size. Inspect light/dark inputs produce a light readable print.
2. Save PDFs from actual supported Firefox and Safari print dialogs. Verify the same content/links/images and printed page geometry. Automated WebKit screen workflows do not verify Safari/PDF drivers.
3. Import the synthetic ICS into a real supported calendar client. Check dates, all-day duration, recurrence projection labels, stable event IDs, no invented usage dates and safety/source descriptions. Do not send invitations or sync private workshop data.
4. Open the synthetic CSV in an actual spreadsheet client using UTF-8. Check leading columns, materials/cost alignment, embedded commas/newlines/quotes, currency labels, source/safety fields and unknown-history export. Do not enable macros or external data access.
5. In an actual configured default mail client, invoke each feedback/request handoff. Inspect recipient `design@roseandpaw.ca`, selected subject/category and populated body/model/documentation fields. Cancel/discard without sending. Record unavailable/unconfigured clients as NOT VERIFIED; URI-generation tests alone are not delivery evidence.

## Notifications, offline, capacity and hosting

1. On a disposable origin test actual OS/browser notification permission grant, denial, default/dismissal and unavailable API. Verify preference state, no errors, app-open reminders and successful delivery where granted. Reopen/close tests must retain the explicit statement that closed-app scheduled/background push is not guaranteed. API simulations are not OS-delivery evidence.
2. After a successful online install/cache, physically disconnect the test device/network or use the real browser Work Offline setting. Close/reopen the app tab, then the full browser process. Verify all local records, calendar through 2400+, reports, images, file export/restore and disconnected-source notices. Do not claim live manufacturer documents are available offline. Distinguish cold install from previously cached reopen.
3. On a disposable storage origin/device, measure realistic large workshops and image backups. Test near-quota/low-memory behavior and interruption during replacement without losing the prior committed database. Compare all seven stores and consent. Record physical storage limits rather than extrapolating from injected exceptions or a desktop heap sample.
4. Hosting owner: use the [local header/offline findings](SECURITY-OFFLINE.md) to check actual authorized preview headers, CSP, MIME, HTTPS/HSTS policy, frame controls, worker cache scope/update and fallback. Production access/hosting changes require separate authorization; this phase performs none.

## Independent legal and final decision

Qualified Canadian counsel reviews the original disclaimer and safety/acknowledgment flow under Issue #10; preserve its exact reviewed version/hash and written advice. Engineering does not determine enforceability, statutory rights or liability. Manufacturer coverage remains separately reviewed under F07.

The Architect/product owner records an explicit decision for every remaining R1 requirement/scope gate in [REMAINING-BLOCKERS.md](REMAINING-BLOCKERS.md), reviews the immutable PR head and actual CI results, then decides acceptance. This pack does not itself approve Release 1 or authorize release operations.
