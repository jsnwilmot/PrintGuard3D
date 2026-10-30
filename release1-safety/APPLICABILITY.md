# Exact-model safety applicability and source decisions

Policy 1.0.0, reviewed 2026-10-30. Sources and full response digests: [SOURCE-REGISTER.csv](SOURCE-REGISTER.csv). Existing exact-definition verifier is mandatory. These are hazard references, not safe/unsafe certification or complete procedure instructions.

| Exact model/version/procedure | Hazard references | Decision basis / unresolved scope |
| --- | --- | --- |
| Creator 5 1.0.0 / 1.1.0 / extruder-mount-positioning-balls | materials | The procedure lists WD-40 and grease; product-specific exposure controls are not independently assessed. |
| Creator 5 1.1.0 / nozzle-cold-pull-cleaning | thermal | The article describes intentional controlled heating. No temperature, sequence or universal power-off instruction is supplied by this application. |
| Creator 5 1.1.0 / feed-motor-gear-debris-cleaning | moving, dust | The article describes gear debris and brushing; moving-part hazards come from the general model notice, not a fully reviewed video sequence. |
| Creator 5 1.1.0 / cooling-fan-dust-cleaning | moving, dust | Dust and cleaning tools are described; moving-part context is from the model notice. Full video precautions remain unreviewed. |
| Creator 5 1.1.0 / heatsink-fan-dust-cleaning | moving, dust | Dust and cleaning tools are described; moving-part context is from the model notice. Full video precautions remain unreviewed. |
| Creator 5 1.1.0 / mainboard-cooling-fan-dust-cleaning | electrical, moving, dust | Dust/tools are documented; electrical and moving-part cautions are model-level references. No PCB repair, power-state sequence or technician-only requirement is verified. |
| Creator 5 1.1.0 / clean-and-lubricate-the-x-axis-linear-shaft | moving, materials | The article lists silicone lubricant; moving-part context is from the model notice. Powered-service sequence is not assessed. |
| Creator 5 1.1.0 / clean-and-lubricate-the-y-axis-linear-guide-rail | moving, materials | The article lists grease; moving-part context is from the model notice. Powered-service sequence is not assessed. |
| Creator 5 1.1.0 / xy-axis-belt-tension-adjustment | moving | The article concerns belt tension; model notice identifies entanglement/mechanical hazards. The linked adjustment video is not fully assessed. |
| Creator 5 1.1.0 / z-axis-belt-tension-adjustment | moving | The article concerns belt tension; model notice identifies entanglement/mechanical hazards. The linked adjustment video is not fully assessed. |
| Creator 5 1.1.0 / xy-axis-pulley-cleaning-and-lubrication | moving, materials | The article lists silicone lubricant; moving-part context is from the model notice. Full video sequence is unassessed. |
| Creator 5 1.1.0 / z-axis-pulley-cleaning-and-lubrication | moving, materials | The article lists silicone lubricant; moving-part context is from the model notice. Full video sequence is unassessed. |
| Creator 5 1.1.0 / z-axis-lead-screw-cleaning-and-lubrication | moving, materials | The article lists grease; moving-part context is from the model notice. Full video sequence is unassessed. |
| Creator 5 1.1.0 / z-axis-lead-screw-bearing-cleaning-and-lubrication | moving, materials | The article lists lubricant/grease; moving-part context is from the model notice. Full video sequence is unassessed. |
| Creator 5 1.1.0 / z-axis-linear-bearing-cleaning-and-lubrication | moving, materials | The article lists silicone lubricant; moving-part context is from the model notice. Full video sequence is unassessed. |
| Creator 5 v1.1.0 general-linear-shaft-cleaning | UNASSESSED | Exact guide interval retained; this limited article policy does not establish a procedure-specific hazard sequence. |
| Creator 5 Pro v1.0.0 general-linear-shaft-cleaning | UNASSESSED | Independent exact-model 1,000-hour fact retained. No C5 hazard/procedure transfer or filtration cadence. |
| Any other model, custom/resin/imported/modified rule, unsupported version or unmatched reference | UNASSESSED | No title/priority/keyword inference. Unknown does not mean safe; seek appropriate current instructions/assistance. |
| Approved PrintGuard review reminder metadata | REVIEW ONLY | No physical action instructed; actual servicing remains independently unassessed. Provenance guards remain separate and unchanged. |
| Nozzle residue, exhaust/filter articles and PCB/wiring/video-only references | NOT AN ACTIVE REVIEWED DEFAULT PROCEDURE | Remain condition/corrective/uncertain references. No new routine, powered sequence or technician-only classification. |

General model notice identifies thermal, electrical and entanglement contexts and ventilation/work-environment cautions. Where used above it is explicitly model-level, not evidence of a particular service power state or complete video review. Article lists of cleaners/grease/air tools establish handling context only; product-specific exposure/pressure/PPE details are unassessed. Resin work receives the generic unassessed state, not an inferred FDM-material instruction.

Qualified technical assistance is a PrintGuard recommendation consistent with the unchanged application disclaimer. No exclusive manufacturer technician designation was verified. No blanket unplug/power-on/temperature step is added. Retrospective/skip controls do not certify pre-service conduct. See [design](DESIGN.md), [report](REPORT.md), [manual follow-up](MANUAL-FOLLOW-UP.md).
