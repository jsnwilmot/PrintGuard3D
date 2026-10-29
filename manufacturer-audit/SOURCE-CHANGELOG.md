# Additive source comparison and provenance changelog

Review date: 2026-10-29 UTC. Historical [225-row register](../remediation-phase3/documentation-register.csv), [Phase 3 summary](../remediation-phase3/DOCUMENTATION-REGISTER.md) and [all 86 acceptance rows](../release1-reporting/MATRIX.md) are preserved unchanged. New decisions live only in this audit; none revises a historical claim or live profile.

## Baseline reconciliation

- B001-B225 map one-to-one by original row, ID, model claim, title and URL; duplicates are retained as evidence references, not counted as additional source reviews. The original 225 rows represent 92 distinct URLs.
- The additive register has 244 rows / 111 distinct URLs: 36 official HTML/PDF sources and 75 media sources (73 YouTube, two MP4). N001-N019 add 19 distinct sources: two support directories, four directory PDFs, ten YouTube, two MP4 and one enclosure PDF.
- All 18 article response hashes and both wiki PDF hashes match the accepted register. Of the 29 distinct baseline non-video URLs, **28 match**; 49 of the 50 non-video reference rows match. The remaining series-root comparison is described below.
- All 63 old video links resolve and return player metadata status OK, but their prior hashes describe index evidence, not video bytes. Direct watch HTML hashes are **NOT COMPARABLE** to those old index hashes. They are not evidence of a media revision.
- Five old index-title strings differ from current player titles if whitespace is retained (four after trimming). B076 has cold-pull wording, B078/B079/B081 replacement wording; another is whitespace only. This does not establish any footage change.

### Series-root digest discrepancy — not proof of a content revision

B224 [official series landing page](https://wiki.flashforge.com/en/creator-series/creator-5-series) has prior recorded hash `61a11ef0c439cd93e7a64725cd99afbf8123ace1008ff8f5dd741c8ca587dcd5` and current response hash `dadf6eca4ce9abb4ff6352bbf1a4ad7672c067747dd82b55365a1210ff0e7b5a`. The old series-root hash equals the old maintenance-index hash. No old series-root response body is retained in the accepted repository; the difference may reflect prior evidence scope or a response/content change. **Do not assert a dated manufacturer revision from this discrepancy.** Current page content was read independently. Its conditional USB-firmware warning covers specified extruder-mount/dock/calibration PCB replacements for C5 and Pro; no periodic replacement or exact firmware files are supplied.

Official wiki pages expose created/updated timestamps in page metadata; `wiki_updated_at` preserves the retrieved values. Those timestamps are not numbered maintenance revisions and do not resolve source precedence. An unchanged response hash corroborates response identity only, not safety, current hardware fit or manufacturer endorsement of this application.

## Current exact-model support listings

Both [C5 support directory](https://support.flashforge.com/documentation/creator-5) and [Pro support directory](https://support.flashforge.com/documentation/creator-5-pro) were inspected in the browser, including expanding the full-manual accordion. Both the quick guide and full manual are listed as Standard Edition, **2026/10/08**. That is a directory listing date. Embedded PDF creation metadata and printed revisions differ and must not be substituted for an independently verified publication date. The resource host below is treated as manufacturer-linked because the exact official directory links to it; its cloud hostname alone would not establish provenance.

## PDF identity and reviewed locations

Page numbers below are one-based PDF pages; printed page numbers differ. Full PDF bytes were hashed. Whole text was extracted/searchable; covers and selected relevant pages were rendered and actually viewed. This is relevant-English-section review, not a page-by-page visual/bilingual audit.

| ID / official download | Printed revision / PDF pages | Embedded creation metadata (not publication date) | Reviewed locator / purpose | SHA-256 |
| --- | --- | --- | --- | --- |
| B019 [Wiki C5 full](https://wiki.flashforge.com/resource/pictures/creator5_en/quick_start_guide/260819-user_guide_for_c5-standard_version-fx.pdf) | EN/CN-A04 / 62 | `D:20260819110116+08'00'` | Cover 1; maintenance 30 / printed 28; calibration 15; help 32 | `4f10536f0cb44f269b62e17ed42baaacda84e7a592f127f88f0772ec4b4e278a` |
| B020 [Wiki Pro full](https://wiki.flashforge.com/resource/pictures/creator5_en/quick_start_guide/260819-user_guide_for_c5p-standard_version-fx.pdf) | EN/CN-A05 / 65 | `D:20260820111157+08'00'` | Cover 1; maintenance 32 / printed 30; calibration 17; help 34 | `c976905647357c035d38b375f88d8c0606e6f9c02200f0a601348b87a3d78e16` |
| N003 [Support C5 quick](https://flashforge-resource.oss-us-east-1.aliyuncs.com/C5%E5%BF%AB%E5%90%AF/Creator%205%20Quick%20Guide-fx.pdf) | EN/CN - A01 / 32 | `D:20260617153646+08'00'` | Cover 1; specifications 14 / printed 12; setup/safety | `550b72a48fc215eb7f65f66ae805c464e25e88f30146cdb50d31b2e744ab7c58` |
| N004 [Support Pro quick](https://flashforge-resource.oss-us-east-1.aliyuncs.com/C5P%E5%BF%AB%E5%90%AF/Creator%205%20Pro%20Quick%20Guide-fx.pdf) | EN/CN - A01 / 40 | `D:20260617153151+08'00'` | Cover 1; specifications 17 / printed 15; setup/safety | `9b0485260e91931d4be68bddc850f822d9ed61b67e9e82c72c33c4af098e2eda` |
| N005 [Support C5 full](https://flashforge-resource.oss-us-east-1.aliyuncs.com/C5%E8%AF%B4%E6%98%8E%E4%B9%A6/260710-C5-user-guide-lm-cqy.pdf) | EN/CN-A03 / 62 | `D:20260710144207+08'00'` | Cover 1; maintenance 30 / printed 28; calibration 15; help 32 | `05f4a8b6861e59601b1beb0de2d93f23dcc3543746a310aacb549183e0ede95c` |
| N006 [Support Pro full](https://flashforge-resource.oss-us-east-1.aliyuncs.com/C5P%E8%AF%B4%E6%98%8E%E4%B9%A6/260710-C5Pro-user-guide-lm-cqy.pdf) | EN/CN-A04 / 65 | `D:20260710145055+08'00'` | Cover 1; maintenance 32 / printed 30; calibration 17; help 34 | `b713a0aab490593fc2fd24de8908ad1b9c34408e163d49a184e86331cead3e37` |
| N019 [C5 enclosed-version installation](https://wiki.flashforge.com/resource/pictures/enclosure/c5%E5%B0%81%E7%AE%B1%E5%AE%89%E8%A3%85%E8%AF%B4%E6%98%8E%E4%B9%A6-260920-hy-%E4%B8%AD%E8%8B%B1.pdf) | EN/CN-A01 / 32 | Not used as publication date; filename includes 260920 | Cover 1 and English BOM 4 visually viewed; English parts/assembly text 4-17 reviewed; Chinese equivalence not audited | `e6fd0f0a810e32ae68eb0f369b01d52ca3709e5f49336cb4977dae5fd2415444` |

The seven PDFs remain outside the checkout; only identities, short factual decisions and links are committed. A partial initial enclosure response was discarded and replaced by a complete 39,606,620-byte PDF before hashing/review. Its final hash above is the only enclosure digest used in the register.

### Manual and quick-guide comparison

| Comparison | Observed result | Interpretation |
| --- | --- | --- |
| C5 wiki A04 (August filename) versus support A03 (July filename) | English PDF pages 1-32 differ only at cover 1 and calibration 15 after whitespace normalization; maintenance page 30 text matches | Wiki is later-numbered, but support listing is later-dated; supersession/region/firmware applicability unconfirmed. |
| Pro wiki A05 versus support A04 | English pages 1-34 differ only at cover 1 and calibration 17 after whitespace normalization; maintenance page 32 matches | Separate exact Pro evidence, not C5 transfer. |
| All four full-manual maintenance sections | 1,000 printing hours for X/Y/Z shaft wiping; separate lead-screw lubrication after cleaning and condition/unspecified care | Two independently supported exact-model recurring claims; no invented lubrication/calibration period. |
| Wiki calibration additions | VFA first-use and after movement/transmission-component replacement, plus regular calibration without a number | Setup/condition advice; no recurring cadence inferred. |
| Quick guides A01 (June embedded metadata; October 8 directory listing) | Shorter setup/specification documents, no fixed maintenance cadence found | They are not substitute maintenance manuals; neither the listing nor file age proves supersession. |
| Pro quick specifications PDF 17 / printed 15 and Pro full guide | HEPA13/carbon, active chamber heating and door/top-cover detection | Hardware confirmation only; filter action/life/trigger remains disputed. |
| C5 enclosure A01 | Mechanical enclosure parts/assembly, no HEPA/carbon/heater/Hall maintenance established in reviewed English sections | Does not turn stock C5 into Pro or authorize Pro intervals. |

Additional full-guide condition/corrective references include prompt contamination removal, filament unloading/sealing for idle periods exceeding two days, build-plate cleaning or condition-based replacement, and recalibration after nozzle changes. These are distinct from preventive recurring maintenance. They do not establish periodic part replacements. Chinese translation equivalence and every hardware/firmware revision remain unverified.

### Contact attribution correction

The official contact `support@flashforge.com` is present in the **full** C5 English help page PDF 32 and Pro PDF 34. It was not found by text search in either quick PDF. Earlier issue commentary attributing the address to a quick guide is not repeated as evidence here; historical comments/files remain unchanged. No inquiry has been sent.

## Article and media changes

All 18 article bodies were read and the original hashes matched. Seven fixed article procedures, eight usage-band procedures, two equipment-dependent references and one condition-based residue reference remain separately classified. Existing C5 v1.1.0 templates corroborate eight fixed entries (seven articles plus guide) and eight usage-dependent entries/24 options. Pro retains only its independent guide rule. See [exact-model matrix](VARIANT-MATRIX.md).

Article-linked media add twelve previously uninventoried items. N008 covers links in two fan pages; N012 occurs in three Z pages. Those shared links do not prove identical component coverage. See [75-item media review/backlog](VIDEO-REVIEW.md). All are reachable at retrieval; no fully verified footage is claimed. Availability failures while parsing the Pro quick guide in one web tool were resolved by full direct PDF retrieval/rendering, not recorded as a deleted source. Direct first-MP4 navigation was blocked, but its embedded player worked. No security restriction was bypassed.

## Register semantics and reproducibility

| Field group / status | Meaning and limits |
| --- | --- |
| `audit_id`, `baseline_*` | B001-B225 retain every original reference including repeated sources; N001-N019 are additive. Baseline model/title claims are historical labels, not new verified applicability. |
| `source_url`, `final_url`, `canonical_media_url` | Exact vendor-linked input, observed redirect destination, and canonical player/media link. Distinct-source counts strip PDF fragments but retain the underlying original URL. |
| `official_origin_evidence` | Official manufacturer host or explicit directory/article link, plus public player channel metadata where applicable. Not independent channel certification. |
| `source_version`, `listing_date`, `wiki_updated_at`, `retrieved_utc` | Printed/version and observed metadata kept separate. ISO retrieval UTC dates are evidence dates, not publication certification. |
| `http_status`, `retrieval_method`, `bytes`, `response_sha256` | GET bytes/hash are entire downloaded HTML/PDF responses. MP4 uses HEAD: size is advertised size; response/media hash uncollected. YouTube hash is dynamic watch HTML, not footage. |
| `baseline_sha256`, `digest_comparison` | Byte comparison where evidence type matches; video index hashes remain NOT COMPARABLE, root discrepancy remains unresolved. |
| `review_method`, `review_status` | TEXT_READ means article body reviewed; CONTEXT_READ_OR_RECONCILED is context/source linkage; PDF_SELECTED_SECTIONS_REVIEWED does not mean every page visually audited; METADATA_ONLY_NOT_VERIFIED and PARTIAL_ACTUAL_FRAMES_NOT_FULLY_VERIFIED are never full video verification. |
| applicability / equipment / purpose / interval / safety | Narrow exact-model decisions and documented uncertainty. Classification of unviewed video topics is explicitly provisional. This register is not a servicing manual or replacement for the linked manufacturer procedure. |
| duration / frame timestamps / `media_sha256` | Metadata duration versus actual player duration is labelled. Listed instants are sampled frames, not watched continuous ranges. No video-file checksum was collected. |
| reviewer / related_sources / decision_notes | Automated reviewer limits, source relationships and unresolved decisions. All dates/observations belong to this review, not a manufacturer approval. |

For reproduction, follow official directories/links, fetch public responses without authenticated cookies, preserve UTC timestamp and SHA-256, compare exact evidence types, inspect relevant PDF layouts and separately complete full media review. Dynamic YouTube HTML hashes will normally vary; do not treat that as a changed video. Do not commit complete copyrighted sources.

## Preservation checks

Protected pre-audit SHA-256 values below are for current workspace bytes (line-ending sensitive). Validation also checks the Git diff against approved main so platform line endings cannot conceal a runtime change.

| Preserved file | SHA-256 |
| --- | --- |
| `src/profile-library/flashforge/creator-5-1.0.0.json` | `18c300a2ad514b885291dcd5b36f9481b2d0bc5e2ea304670d452294044be9c1` |
| `src/profile-library/flashforge/creator-5-1.1.0.json` | `5abfb0fcebb36652829cd0759d22995410e9a9f7b13ba51281abd62d7edb4d17` |
| `src/profile-library/flashforge/creator-5-pro-1.0.0.json` | `2f2829e406183b9f7a1a52b26a3d882dbeed4b2df889b695dbf51a0b3c950885` |
| Historical 225-row CSV | `02bb24083df34f9c09b28495c2a569df12c85ca068e69a48f4a9094112dd6024` |
| Original 86-row reporting matrix | `d9a940269b9bbb680888a9d68db73480078d64b87dde4c31bdc9269e07148a8c` |

Only seven new text/CSV audit files are proposed. No source/profile/schema/config/dependency/CI changes, production access, external communication, merge, deployment or release approval is included. The prior acceptance evidence remains intact and F07 remains PARTIAL.
