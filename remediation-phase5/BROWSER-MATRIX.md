# Native browser compatibility evidence

Observed on 2026-10-28 with pinned Playwright **1.64.1**, Windows, fresh isolated contexts and synthetic data only. Browser binaries: Chromium **156.0.8078.4**, Firefox **157.0**, WebKit **27.2**. Original 20 Chromium cases remain unchanged and pass. The Phase 5 complete suite passes **45/45**, with zero skipped, unexpected or flaky outcomes and no retries. The final footer-only correction receives an additional 12-case print rerun and the original C02 safety/export rerun; CI runs the complete suites on the committed revision.

| Native case | Chromium | Firefox | WebKit | Evidence boundary |
| --- | --- | --- | --- | --- |
| D01 registration, exact model/version, profile acceptance, guarded completion, independent history | PASS | PASS | PASS | Real forms/transactions, not static DOM fixtures |
| D02 2035/2400/2500 calendar, immutable detail/focus, currency/skip costs, unclassified report context, KPI drilldown | PASS | PASS | PASS | Original B01 separately preserves actual Chromium segmented-year keyboard entry |
| D03 real download/file input, cancel/malformed/conflict rejection, repeat merge, confirmed replacement, renewed consent | PASS | PASS | PASS | All seven stores compared; imported consent never accepted |
| D04 large image-rich backup restore/re-export | PASS | PASS | PASS | 12 printers/600 logs/all stores, exact record hashes; measured desktop limits only |
| D05 disabled-origin transport, cached tab reopen, calendar/reports, all-store preservation, local source headers | PASS | PASS | PASS | Not a certification of OS disconnection, full browser process restart or actual host |
| D06 both-theme axe, keyboard/mobile focus, 320px reflow, forced-colour emulation | PASS | PASS | PASS | Zero detected violations; incomplete results/manual acceptance retained |
| D07 permission granted handler | PASS | PASS | PASS | Explicitly simulated Notification API, not OS prompt/delivery |
| D07 permission denied handler | PASS | PASS | PASS | Explicitly simulated Notification API |
| D07 no Notification API | PASS | PASS | PASS | Explicitly simulated absence; truthful in-app fallback |
| D09 native IDB abort after earlier replacement writes | PASS | PASS | PASS | Actual native transaction abort with injected quota exception; physical quota not exhausted |
| D10 first install/consent, separate Pro profile, actual cumulative usage and reached threshold | PASS | PASS | PASS | Fresh context without seeded registration; exact Pro 1000-hour rule retained |
| D08 12 native paper/theme/printer-count cases, each at scale 1 and 0.9 | PASS | NOT VERIFIED | NOT VERIFIED | Chromium generates real PDFs; Firefox/Safari PDF drivers remain manual |

The final local full run is recorded in [verification-results.json](verification-results.json). [backup-measurements.csv](backup-measurements.csv) reports actual 25.4-26.8 MB inputs, restore/export times and available heap/quota samples. The working set is larger than file size: Chromium reported roughly 521 MB used JS heap in the measured sample; this is not process-wide peak memory and cannot establish low-memory-device acceptance. WebKit gets a 60-second download-preparation window for this workload, without reducing the dataset or fidelity assertions.

One exploratory Firefox `setOffline(true)` new-tab reopening failed with `NS_ERROR_OFFLINE`; the Windows Chromium/WebKit emulation cases passed. That result is not relabelled as a successful emulation test. Final D05 uses actual unavailable-origin transport and verifies direct GET failure before cached reopen. See [SECURITY-OFFLINE.md](SECURITY-OFFLINE.md) for the distinction and upstream limitations. Actual browser Work Offline/full-process cold reopen remains NOT VERIFIED.

No failures are converted to expected failures or suppressed. Early harness mistakes and the final print correction are described in the report. The 45 original acceptance assertions remain unchanged. CI additionally runs these tests on Linux with pinned browser builds; OS-specific results must be reviewed on the exact PR head.

**Not certified:** actual macOS/iOS Safari, physical Android/iOS/touch, qualified screen readers, actual 200/400% zoom/text-only resize, OS notification prompts/delivery, configured mail/calendar/spreadsheet clients, physical printer drivers and production hosting. Passing automated WebKit is not Safari certification. Complete the [manual release pack](MANUAL-RELEASE-PACK.md) before those gates can pass.
