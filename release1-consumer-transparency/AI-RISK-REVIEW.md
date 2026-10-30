# Multi-AI risk review framework — owner working register

Prepared 2026-10-30 UTC for #27. **No multi-model review executed or consensus established by this package.** AI outputs are unverified issue-spotting inputs, not legal opinions, counsel review, enforceability findings or proof of Canadian compliance. Do not upload personal workshop data, secrets, privileged advice or sensitive transcripts. Keep sanitized claims/source references only.

## Protocol

1. Resolve product/host facts in DATA-FLOWS.md and market decisions first; label missing facts rather than let a model invent them. Give each selected model the same sanitized, dated fact packet and original questions.
2. Preserve each exact prompt, execution date, model/tool/version and bounded response summary in the register. Use separate rows for each model. Record cited primary source URL, jurisdiction and source revision/retrieval dates; independently open and verify citations. Generated citations/interpretations remain unverified until checked.
3. Compare claim by claim, recording agreement **and** conflict/missing assumptions. Do not count model votes as truth or independent professional review. Test factual repository assertions against code/current CI; check legal text separately from model interpretation. This Codex engineering audit is not a substitute second legal reviewer.
4. Record owner decisions by exact scope/date, evidence, unresolved questions, follow-up issue and effect on release. No automatic PASS, deemed signature or gate closure. Independently reviewed PRs and separate owner merge/release permissions still apply.

## Prompt/result register

The prompts below are **prepared, not executed**. Question IDs B01–B10 are proposed follow-ups, not invented quotations of earlier Q01–Q10. Replace/add per-model rows after actual execution. Source IDs refer to OWNER-MARKET-DECISIONS.md; a suggested source is not a source an AI actually cited. All owner decisions are PENDING.

| Question | Exact prepared prompt + date | Model/tool | Cited primary source / jurisdiction / date | Proposed action | Cross-model agreement | Conflict/uncertainty | Repository source/CI evidence | Human/owner decision | Follow-up issue | Release impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B01 applicability | 2026-10-30, NOT RUN: Given the attached dated source fact packet and explicitly unknown operator/hosting/market facts, identify possible Canadian privacy and consumer-law applicability questions. Separate statutory text, guidance, inference and facts required. Do not certify compliance or infer an exemption from a free price. | NOT RUN | No AI citation yet; research starting points S1/S2 | Resolve actual business/data scope | NOT ASSESSED | Operator, markets, flows unknown | DATA-FLOWS.md; source vs loopback evidence | PENDING | #10/#27 | Open legal gate |
| B02 classifications | 2026-10-30, NOT RUN: Review the existing Manufacturer Documented, PrintGuard Suggested and User Defined labels and opt-in review-only reminders. Identify any remaining misleading claim with exact source evidence; do not report these controls as absent or treat reminders as servicing instructions. | NOT RUN | No AI citation yet; S4 research | Evaluate actual gaps only | NOT ASSESSED | Labels are not safety/legal certification | recommendations.ts; preserved suggestion tests | PENDING | #14/#23/#27 | Preserve accepted controls |
| B03 hazards | 2026-10-30, NOT RUN: Review Phase A exact-model hazard references, unknown state, retrospective and skipped recording. Separate documented facts from unreviewed service sequences and explain remaining risks without inventing temperatures, blanket power-off or technician-only manufacturer instructions. | NOT RUN | No AI citation yet; Phase A official source register | Keep source gaps explicit | NOT ASSESSED | Partial AV and physical safety unverified | maintenanceSafety.ts; Phase A SA/H tests | PENDING | #14/#15/#26 | Manufacturer/human gates open |
| B04 host privacy | 2026-10-30, NOT RUN: Compare the factual data-handling copy with the source flow inventory. List host/operator/processor/log/cookie/country facts needed for a final notice. Do not infer zero logging, Canadian-only processing or no third parties from absence of React analytics. | NOT RUN | No AI citation yet; S1/S2 research | Obtain dated provider facts | NOT ASSESSED | Live host not audited | DataHandling.tsx; PB04 bounded requests | PENDING | #16/#27 | Final policy pending |
| B05 Quebec/language | 2026-10-30, NOT RUN: Using the unresolved intended-market register, identify Quebec language and consumer-notice questions and official primary sources requiring follow-up. Distinguish guidance from binding text and do not claim an English exclusion or employee threshold is a safe exemption. | NOT RUN | No AI citation yet; S3 research | Owner market/language disposition | NOT ASSESSED | Actual offer/Quebec activity unknown | English UI; no territorial enforcement | PENDING | #10/#27 | Language scope unresolved |
| B06 minors/use | 2026-10-30, NOT RUN: Identify audience, minors, commercial and noncommercial usage questions for this free maintenance tracker. Cite current jurisdiction-specific primary authority for any proposed requirement, distinguish uncertainty and do not invent an age rule or claim free software is exempt. | NOT RUN | No AI citation yet | Determine audience/business facts | NOT ASSESSED | No age workflow; no applicability conclusion | OWNER-MARKET-DECISIONS.md | PENDING | #10/#27 | Audience unresolved |
| B07 backups/rights | 2026-10-30, NOT RUN: Review local storage loss, unencrypted downloads, retained observations, restore/old-reader limits and mailto inquiries. Identify factual notice gaps and questions for an operator-held-data rights process without promising recovery, universal deletion or invented response deadlines. | NOT RUN | No AI citation yet; S1/S2 research | Confirm process and backup facts | NOT ASSESSED | Provider/mail records unknown | db.ts; Settings; PB03; restore suites | PENDING | #16/#27 | Rights/policy pending |
| B08 exports | 2026-10-30, NOT RUN: Inspect actual CSV, ICS, standalone HTML, JSON and print safety notices and notification context. Separate tested exports from actual external-client/physical-print evidence. Do not state these notices are missing when present or that inclusion establishes legal adequacy. | NOT RUN | No AI citation yet | Preserve existing notices, execute manual checks | NOT ASSESSED | Human/OS clients unverified | safety.ts/reportExports.ts; PB03; all retained print tests | PENDING | #15/#25/#27 | Human gate remains |
| B09 consent/version | 2026-10-30, NOT RUN: Review disclaimer v1.0, version/date acknowledgment, protected-query gate and factual information revision. Identify questions about future policy adoption without assuming a new checkbox is necessary or treating existing acknowledgment as encryption, legal approval or consent to all provider processing. | NOT RUN | No AI citation yet | Separate informational revision from consent | NOT ASSESSED | Legal adequacy unverified | legal.ts unchanged; App gate; PB01/PB02 | PENDING | #10/#27 | No terms amendment authorized |
| B10 brand/release | 2026-10-30, NOT RUN: Review non-affiliation, brand identification and the remaining risk register against current primary sources. Identify uncertainty and recommend scoped follow-ups; do not claim trademark clearance, counsel signoff, legal compliance, AI consensus as proof or Release 1 approval. | NOT RUN | No AI citation yet; S4 research | Owner decides particular residual risks | NOT ASSESSED | No independent legal verification | Phase A source copy; current CI engineering only | PENDING | #10/#14/#1/#17 | Release unapproved |

## Earlier simulated Q01–Q10 reconciliation

The complete original simulated question/answer packet, model identity, exact prompts and dated citations are **not supplied in the repository or retrieved #10/#27 bodies/comments**. Do not fabricate their text or claim all ten answers have been reviewed. Issue #27 supplies three specific references:

| Earlier ID | Traceable supplied claim/topic | Repository reconciliation / disposition |
| --- | --- | --- |
| Q01 | Full original unavailable | NOT VERIFIED; owner supplies sanitized exact question/claim/citation before per-claim reconciliation |
| Q02 | Classification labels and review-only opt-in | Already implemented before B: recommendations.ts, Suggestions UI, original tests. Do not reopen as absent. Labels do not establish safe work |
| Q03 | Full original unavailable | NOT VERIFIED; owner evidence required |
| Q04 | Full original unavailable | NOT VERIFIED; owner evidence required |
| Q05 | Full original unavailable | NOT VERIFIED; owner evidence required |
| Q06 | Full original unavailable | NOT VERIFIED; owner evidence required |
| Q07 | Full original unavailable | NOT VERIFIED; owner evidence required |
| Q08 | Export warning coverage | CSV/ICS/HTML/JSON/print already carry exportSafety; task notifications carry source/safety context. PB03 and retained suites audit actual outputs. Human client checks remain open |
| Q09 | Versioned acknowledgment | Disclaimer v1.0 + version/date/device gate already implemented; replacement renews it. Unchanged in B. Not authentication, encryption or legal approval |
| Q10 | Full original unavailable | NOT VERIFIED; owner evidence required |

## Nonprofessional owner risk disposition template — UNSIGNED

- AI-assisted internal review completed: **NOT RECORDED** (framework prepared; multiple AI answers not received).
- External counsel: **NOT OBTAINED per owner-directed review path**; original criterion NOT PERFORMED / NOT VERIFIED.
- Independent legal compliance: **NOT VERIFIED**. Applicable requirements can apply to free services; privacy scope depends on real flows/activities; Quebec language duties depend on actual offer/market; manufacturer references must avoid misleading association.
- Specific risk/fact/source scope: NOT ENTERED. Open uncertainty and obligations: NOT DISPOSITIONED.
- Owner choice per risk: ACCEPT / DEFER / REJECT — **NONE SELECTED**. Rationale, compensating action, follow-up issue, review date: NOT ENTERED.
- Owner name/signature/date: **UNSIGNED**. Architect technical review is separate. No release or gate approval is created by this template or later AI agreement; owner cannot waive an applicable statute by accepting risk.
