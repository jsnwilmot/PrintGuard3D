# Manufacturer documentation register

Reviewed 2026-10-27 UTC by Codex; Architect acceptance pending. The [225-row register](documentation-register.csv) records exact-model entries, official source URLs, verification scope, date, source revision where available, snapshot SHA-256, materials, trigger and precautions. Repeated URLs represent separate model applicability or condition references, not additional independently verified procedures. Raw manufacturer HTML, PDFs and rendered pages remain local and ignored; copyrighted manuals are not republished.

## Official sources and method

- [Creator 5 series maintenance index](https://wiki.flashforge.com/en/creator-series/creator-5-series/maintenance): all 18 linked text articles fetched successfully and read. Each direct article link and content digest appears in the CSV. Accessible wiki text does not state a reliable revision identifier; the checked date and digest identify the inspected snapshot.
- [Creator 5 series index](https://wiki.flashforge.com/en/creator-series/creator-5-series): 63 linked setup/corrective videos inventoried, including Pro-specific entries. Titles and links were checked against the official index. **Video contents and individual video availability are NOT VERIFIED.** Their digests identify the index, not video media. No recurring schedules are derived from these links.
- [Creator 5 guide landing page](https://wiki.flashforge.com/en/creator-series/creator-5-series/c5-user-guide) and [EN/CN-A04 PDF](https://wiki.flashforge.com/resource/pictures/creator5_en/quick_start_guide/260819-user_guide_for_c5-standard_version-fx.pdf): complete text extracted; maintenance page visually inspected, PDF page 30 / printed page 28.
- [Creator 5 Pro guide landing page](https://wiki.flashforge.com/en/creator-series/creator-5-series/c5p-user-guide) and [EN/CN-A05 PDF](https://wiki.flashforge.com/resource/pictures/creator5_en/quick_start_guide/260819-user_guide_for_c5p-standard_version-fx.pdf): complete text extracted; maintenance page visually inspected, PDF page 32 / printed page 30.
- [Exact-model hardware overview](https://wiki.flashforge.com/en/creator-series/creator-5-series/manual/intro-creator-5), [safety notice](https://wiki.flashforge.com/en/creator-series/creator-5-series/manual/notice), [manual index](https://wiki.flashforge.com/en/creator-series/creator-5-series/manual), [optional enclosure](https://wiki.flashforge.com/en/creator-series/creator-5-series/enclosure) and [firmware instructions](https://wiki.flashforge.com/en/creator-series/creator-5-series/manual/firmware-upgrade) reviewed as context. All official HTML/PDF requests succeeded with HTTP 200. Browser text extraction was incomplete for the wiki; direct official HTTP retrieval and local PDF extraction/rendering supplied the inspected evidence.

## Creator 5 recurring procedure inventory

| Procedure | Manufacturer trigger | Activation policy |
|---|---|---|
| Nozzle cold pull | 400 cumulative printing hours; also documented restricted-extrusion condition | Fixed 400-hour rule; condition stays in source reference. Diameter example is nozzle-specific, not universal. |
| Feed motor gear debris | 3,000 hours | Fixed rule |
| Extruder positioning balls / needle rollers | 500 hours | Fixed rule; remove PEI before work, avoid contamination/excess grease |
| X/Y pulley cleaning/lubrication | 1,500 hours | Fixed rule |
| X/Y belt adjustment | 3,000 hours | Fixed rule |
| Z pulley cleaning/lubrication | 3,000 hours | Fixed rule |
| Z belt adjustment | 3,000 hours | Fixed rule |
| X/Y/Z linear-shaft wiping | 1,000 printing hours, exact-model guide | Separate fixed cleaning rule; does not replace lubrication rules |
| Cooling fan, heatsink fan, mainboard fan dust cleaning (three procedures) | Daily use T < 5: 9 months; 5 < T < 10: 6 months; T > 10: 3 months | Owner selects a documented band; no automatic choice |
| Y guide rail and X shaft cleaning/lubrication (two procedures) | T >= 5: 1 month; 1–5: 2 months; T < 1: 3 months | Owner selects a documented band |
| Z linear bearing, Z lead screw, Z lead-screw bearing (three procedures) | T >= 5: 3 months; 1–5: 4 months; T < 1: 5 months | Owner selects a documented band |

The eight fixed rules and eight usage-dependent procedures are in Creator 5 v1.1.0. The usage-dependent base templates have a condition trigger and do not activate automatically. Each published band retains its exact calendar interval. No lifetime-average usage is substituted for the manufacturer's daily-use bands. **Fan boundaries exclude exactly 5 and 10; axis bands overlap at 5.** The UI warns about these unresolved source boundaries. Obtain manufacturer clarification before selecting an ambiguous band. The application's manually entered hour readings must represent the documented cumulative printing usage; powered-on time is not a verified substitute.

The index's exhaust-fan and filter-cartridge procedures are retained as unresolved/excluded stock-Creator-5 references. The hardware overview establishes Pro filtration, and the optional standard enclosure does not prove stock filtration. Filter replacement also includes a discoloured-filter condition. No standard-printer filtration rule is fabricated.

## Conditions, corrective work and variants

The nozzle-residue article is condition-based, including residue affecting calibration/levelling; it has no invented recurrence. Both exact-model guides supply additional condition references: build-plate washing/replacement, nozzle/clog/material-change care, calibration after nozzle replacement, sealed filament storage after more than two idle days, and prompt removal of lead-screw debris. The separate Z lead-screw lubrication paragraph has no independent fixed cadence; wiki lubrication bands remain separately attributed. Materials and procedure-specific warnings are in the data definitions and register. These summaries link to authoritative steps rather than reconstructing servicing instructions.

Creator 5 Pro v1.0.0 activates only the separately verified **1,000-hour cleaning rule from its own guide**. All 18 series wiki procedures remain pending for Pro-specific applicability; all 63 videos remain pending content review. The standard 500-hour procedure cannot gain verified status on Pro. Pro filtration/Hall sensor differences remain explicit. Model/technology equality is enforced in registration, installation and verification checks. A source can be valid for one model and still be unverified for another.

## Coverage limits and follow-up

F07 remains **PARTIAL**, not closed. All 18 text articles have been inventoried and reviewed, but overall manufacturer coverage is incomplete: video content, broader Pro transfer, unresolved usage boundaries, optional equipment, future source revisions and other manufacturers. No inaccessible text article was silently marked verified. Sources found unavailable later can be flagged locally in profile documentation; tasks, completion and complete-schedule reports expose those flags, and backups retain them. Flags do not rewrite history or claim continuous link monitoring. External instructions require internet access and are not mirrored for offline servicing.

Recommended next source work, subject to Architect authorization: obtain manufacturer clarification for band boundaries and exact variants; audit linked video contents and precautions; publish new immutable profile versions for newly confirmed requirements; preserve prior evidence and have owners review every update.
