# Creator 5 / Creator 5 Pro manufacturer-source audit

**Research package for Architect review, 2026-10-29 UTC. F07 remains PARTIAL; #14 remains OPEN; Release 1 is NOT approved.** Authorized documentation-only work for [#20](https://github.com/jsnwilmot/PrintGuard3D/issues/20), parent [#14](https://github.com/jsnwilmot/PrintGuard3D/issues/14), tracker [#1](https://github.com/jsnwilmot/PrintGuard3D/issues/1). Base approved main: `c07d3bc5cbe48763897ae0247e7637df1957dec8`; branch `release1/manufacturer-source-audit`.

This package neither modifies nor authorizes changes to profiles, verification badges, schedules, firmware, IndexedDB, user data, dependencies, CI or hosting. No external inquiry was sent. Future implementation requires separate owner authorization and Architect review.

## Main findings

1. **The 18 maintenance articles and two wiki full manuals are byte-identical to the accepted October 27 snapshots.** Their current published intervals corroborate the existing source evidence; they do not resolve its usage-band gaps or Pro applicability. Existing profile definitions remain untouched.
2. **October 8 is a support-directory listing date, not proof of a newer manual revision.** Expanding the full-manual accordion on each exact-model support page exposes the same listing date as its quick guide. The downloaded C5 full manual is internally **A03**, and Pro is **A04**, with July 10 filenames. The wiki still offers the later-numbered **C5 A04 / Pro A05**, August filenames. Their English maintenance pages agree. No supersession notice was found in the examined directories/documents; ask the manufacturer which source governs. See [source comparison](SOURCE-CHANGELOG.md).
3. **The exact-model 1,000-print-hour shaft-wiping requirement is independently corroborated for both variants.** Each model's two full manuals state it in section 6.3. Separate lead-screw lubrication, contamination, idle-filament storage and calibration advice must not acquire an invented recurrence.
4. **The old 63-video inventory misses maintenance-page media.** The articles contain 18 link occurrences to 15 distinct media items; three overlap the old list. The 12 additional items are ten YouTube videos and two native MP4 clips. All 73 YouTube watch pages returned HTTP 200/player metadata status OK; both MP4 headers returned 200 and their embedded players worked. This establishes availability at review time, not content verification.
5. **Actual footage is only partially inspected.** Two YouTube items and two short embedded clips were visually sampled. In the cold-pull video, the display at 55 seconds reads **Creator 5 Pro**. This is direct evidence of the demonstrated variant, not confirmation of a 400-hour Pro recurrence or complete servicing safety. No video is classified fully verified. The [video register/checklist](VIDEO-REVIEW.md) records exact sampled times and all remaining work.
6. **Pro filtration is confirmed hardware; its maintenance cadence remains unresolved.** The Pro quick guide's specification table and exact Pro manual identify HEPA13 and activated carbon. The filter article has a replacement heading but cleaning wording in its month bands; the discoloration condition is placed in the high-use clause. Do not silently choose an action, scope or interval. The mechanical C5 enclosure guide does not establish Pro filtration or Pro equivalence.
7. **Newly inspected context includes a conditional PCB/firmware warning.** The current official series landing page requires a USB firmware upgrade when specified extruder-mount, extruder-dock or calibration PCBs are replaced. It supplies no replacement interval. The wiki full manuals also contain additional VFA/regular-calibration advice absent from the older support manuals; no numeric calibration period is supplied. Manufacturer clarification is needed before any new repair/calibration guidance is implemented.

## Coverage and method

Counts are deduplicated by source URL unless explicitly called rows. A model-specific reference row is not another independently read document.

| Evidence measure | Observed result |
| --- | --- |
| Historical register reconciliation | All **225/225** rows preserved and mapped as B001-B225 |
| New additive decision register | **244 rows**, including N001-N019; **111 distinct URLs** |
| Official HTML/PDF URLs checked | **36**: 29 HTML pages and 7 PDFs |
| Maintenance article bodies read | **18/18**; all exact prior response hashes match |
| PDFs inspected | **7**: 4 full manuals, 2 quick guides, 1 C5 enclosure installation guide |
| Historical 63 video links investigated | **63/63** direct public watch-page requests; vendor-index membership reconciled |
| Additional maintenance media | **12** beyond the old list; 15 distinct article-linked items overall |
| YouTube availability metadata | **73/73** HTTP 200 and player status OK; not a footage audit |
| Native MP4 access | **2/2** HEAD 200, embedded playback loaded and reached end |
| Actual frames inspected | **4 distinct media**, including **1 of the historical 63** |
| Complete continuous audiovisual audits / fully verified videos | **0 / 0** |
| Remaining media without frame inspection | **71/75**; all still require full content review, including the 4 sampled items |
| Network-unavailable sources at final retrieval | **0/111**; access is as-of review, not continuous monitoring |
| Exact-model full-guide recurring claims corroborated | **2** model-specific 1,000-hour claims, not two different cadences |
| Current 86-row acceptance matrix | Preserved unchanged; manufacturer rows 3/5 and F07 remain PARTIAL |

Reviewer: Codex automated documentation reviewer with text, PDF rendering and limited browser-frame inspection; **not a FlashForge-authorized technician or independent product-safety laboratory**. English relevant sections were reviewed; Chinese/English translation equivalence, physical printer operation, filter performance and continuous video/audio safety were not validated. All quoted dates/revisions are manufacturer/document metadata, not independently certified publication dates.

PDF text was extracted and searched in full; covers and relevant maintenance/specification/installation pages were rendered and visually inspected. The review does not claim every PDF page was visually audited. Full English manual comparisons cover C5 PDF pages 1-32 and Pro 1-34; differences were limited to covers and calibration pages after whitespace normalization. Quick guides were examined as setup/specification documents, not mistaken for full maintenance manuals.

Public HTTP retrieval used no authenticated session. Browser research used only manufacturer/public media pages; no production PrintGuard application or workshop database was inspected. Downloaded PDFs, watch HTML and temporary renders remained **outside the Git checkout**. No manual, video file, thumbnail, screen capture, full article or copied servicing workflow is committed. Video media bytes were not downloaded as files; `response_sha256` for YouTube is explicitly a landing-HTML hash, **not** a media checksum. See [register semantics](SOURCE-CHANGELOG.md).

## Interval and variant decisions

[VARIANT-MATRIX.md](VARIANT-MATRIX.md) evaluates every article independently for C5 and Pro, materials/safety provenance and equipment constraints. [INTERVAL-QUESTIONS.md](INTERVAL-QUESTIONS.md) contains owner-review questions and an **unsent** inquiry. [PROFILE-RECOMMENDATIONS.md](PROFILE-RECOMMENDATIONS.md) assesses current badge scope and proposes only separately authorized future work.

No new dangerous contradiction was found in the published numeric intervals of currently active fixed tasks. That is **not** a declaration that all procedures are safe or every compatibility claim is complete. Material unresolved risks remain: exactly 5/10 fan boundaries, the axis overlap at 5, counter/averaging definitions, Pro transfer, filter action/trigger scope, repair prerequisites and incomplete audiovisual review. Those issues keep the manufacturer gate open; no live rule or badge was reclassified.

## Deliverables and validation

Only these seven additive files change: `REPORT.md`, `SOURCE-REGISTER.csv`, `VARIANT-MATRIX.md`, `VIDEO-REVIEW.md`, `INTERVAL-QUESTIONS.md`, `SOURCE-CHANGELOG.md`, `PROFILE-RECOMMENDATIONS.md`, all under `manufacturer-audit/`.

Mechanical validation checks CSV shape, one-to-one mapping of B001-B225, source uniqueness/counts, metadata-versus-footage statuses, local links, preserved profile/register/matrix hashes and a documentation-only Git diff. Observed checks passed: 244 correctly shaped CSV rows, 225 exact baseline mappings, 111 deduplicated URLs, 75 media / four partial samples / zero fully verified, all local Markdown links, five protected-file hashes and an otherwise empty source diff. `node scripts/validate-repository.mjs` passed for 164 tracked/staged files, including three immutable profile digests. `git diff --cached --check` is required clean before commit. Unchanged CI runs against the draft PR; its results are software regression evidence **only**, not proof that manufacturer claims or safety are correct. Exact commit and CI results are recorded in the PR submission.

No runtime environment variables or dependencies are added. No new automated application tests are warranted for an evidence-only change. The existing source register and all earlier phase/reporting evidence remain intact.

## Recommended sequence

1. Architect reviews provenance, document precedence, partial-footage limits and the exact-model matrix.
2. Owner reviews/authorizes any external inquiry; obtain written manufacturer answers, particularly boundaries, counters, Pro applicability and filtration. Silence is not verification.
3. Complete continuous audiovisual/manual review using the per-video checklist, starting with the 15 article-linked items and Pro equipment/PCB repairs.
4. Architect decides the supported R1 boundary and any badge/disclosure implications. Keep F07 PARTIAL while material uncertainty remains.
5. Only after separate implementation authorization, propose immutable exact-model profile versions and opt-in safeguards/tests. No merge, deployment or Release 1 approval is included here.
