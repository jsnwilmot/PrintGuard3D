# Schedule printing and PDF QA

The correction replaces the printed twelve-column table with per-printer procedure details. It uses the same selected rules and printer identities, without changing schedules or historical records. The screen table/CSV leading columns remain compatible; CSV now also includes description/model/original interval, and CSV/ICS safety notices remain protected by unchanged tests.

## Observed digital evidence

D08 contains 12 native Chromium cases: A4 and Letter, light/dark, 1/3/12 printers. Each generates two real PDFs at explicit **scale 1.0 and 0.9**: **24 PDFs**. The 12-printer case contains 36 tasks, long names, long URLs, large multi-page descriptions, exact model/serial/ID, active/original intervals, usage/current status, source/version/check date, warnings and an actual embedded 900x600 synthetic uploaded PNG. The other printers exercise the honestly labelled generic fallback. Synthetic URLs are explicitly user-defined test references, not fabricated manufacturer recommendations.

[print-qa.csv](print-qa.csv) records each paper/theme/count/scale, page count, geometry, minimum non-browser-footer font size, embedded-image detection, description-end markers, issue result, file hash and artifact path. **24/24 pass the structural checks.** At scale 1, task body is 10pt, final notice/contact is 9pt; scaling to 0.9 scales those to 9pt/8.1pt respectively. The separate browser-generated test footer is smaller and excluded from that body-font measurement. There are no detected off-page glyphs, missing description ends, missing warning/image, blank/contact-only pages or orphan task headings in the tested files. PDF extraction is a structural check, not visual proof by itself.

Rendered PNG review uses Poppler and actual first/middle/last pages for A4 and Letter long schedules plus both pages of the initial one-printer case. The first visual pass found a contact-only continuation page that text-presence checks missed. The final print disclaimer is compact and kept together; the collector now explicitly rejects near-empty/contact-only pages. The corrected pages were rerendered and reviewed. Long URLs wrap legibly, descriptions remain readable, uploaded imagery appears, backgrounds print light in both themes, and source/safety copy is visible. Some long tasks legitimately span pages; each printer starts with its own identification header rather than squeezing columns. See the final per-case page counts instead of promising a fixed page count for arbitrary content.

## Reproduce the evidence

```sh
npm run build
npx playwright test --config remediation-phase5/playwright.config.mjs
python remediation-phase5/collect-evidence.py
```

The collector requires developer-only `pypdf` and `pdfplumber`; they are not application dependencies. It reads ignored synthetic browser outputs and produces reviewed CSV/JSON summaries. This local run uses the bundled document Python runtime. The optional final print rerun uses `--project print-chromium --reporter=json --output test-results/phase5-print-final`, with stdout saved as `test-results/phase5-print-final.json`; the collector prefers that newer print evidence while preserving the completed full browser report. Render any PDF with `pdftoppm -png -f PAGE -l PAGE` and visually inspect the resulting PNG. Raw PDFs/PNGs/backups are not committed.

## Remaining delivery limits

Digital Chromium PDF evidence is **PASS for the tested configurations**, not proof of physical print quality, every printer driver, user-selected print-dialog scaling, actual Safari or Firefox PDF drivers. A4/Letter hardware, print-safe settings, actual browser PDF drivers and external ICS/CSV client import/display remain **NOT VERIFIED** until the owner executes the [manual release pack](MANUAL-RELEASE-PACK.md). API scale 0.9 is an observed digital setting, not a claim about a particular driver's “Fit to page” implementation. Manufacturer documentation remains external and requires internet; offline printing includes the saved references and source warnings, not a copied manufacturer manual.
