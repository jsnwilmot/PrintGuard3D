import {type Task,type Printer,recommendationSchema} from './domain';
import {isVerifiedTask} from './profiles';
import definition from './safety-reference-policy.json';
import {z} from 'zod';
const policy=z.object({version:z.literal('1.0.0'),reviewed:z.literal('2026-10-30'),manufacturer:z.literal('FlashForge'),model:z.literal('Creator 5'),technology:z.literal('FDM/FFF'),versions:z.array(z.enum(['1.0.0','1.1.0'])),notice:z.literal('https://wiki.flashforge.com/en/creator-series/creator-5-series/manual/notice'),procedures:z.array(z.object({id:z.string().regex(/^[a-z0-9-]+$/),hazards:z.array(z.enum(['thermal','electrical','moving','dust','materials'])).min(1),scope:z.string().min(1)}).strict())}).strict().parse(definition);
if(new Set(policy.procedures.map(p=>p.id)).size!==policy.procedures.length)throw Error('Duplicate safety reference identity.');

export const manufacturerIndependence='PrintGuard 3D is independent and unofficial; no printer manufacturer sponsors, endorses or supports this application. Manufacturer and model names identify equipment only. Brand names belong to their respective owners.';
export const sourceSafetyCaution='Source labels describe provenance, not safety approval. PrintGuard Suggested reminders authorize no physical servicing.';
export const unassessedSafety='Safety not independently assessed for this exact procedure. Unknown hazards do not mean safe. Thermal, electrical, moving-part and material/resin hazards may remain unidentified. Consult current manufacturer instructions or qualified technical assistance; this app does not control hardware.';
export const technicianCaution='If instructions, equipment state or your competence are uncertain, seek qualified technical assistance before further work. No manufacturer technician-only designation has been verified here.';
export const hazardLabels={thermal:'Heated/hot-end exposure',electrical:'Electrical equipment context',moving:'Moving parts / entanglement context',dust:'Dust/debris handling',materials:'Cleaner / lubricant exposure'} as const;
export type Hazard=keyof typeof hazardLabels;
export interface SafetyContext {state:'identified'|'unassessed'|'review-only';hazards:Hazard[];scope:string;references:string[];version:string;}
export function maintenanceSafety(task:Task,printer:Pick<Printer,'manufacturer'|'model'|'technology'>):SafetyContext{
 const base={version:policy.version,hazards:[] as Hazard[],references:[] as string[]};
 if(task.source==='General Recommendation'&&task.recommendation&&recommendationSchema.safeParse(task.recommendation).success&&task.recommendation.decision==='accepted'&&printer.manufacturer==='FlashForge'&&printer.model==='Creator 5'&&printer.technology==='FDM/FFF'&&task.recommendation.model===printer.model)return {...base,state:'review-only',scope:'Review reminder only; no physical servicing is instructed. Any actual servicing remains independently unassessed.'};
 const compatible=printer.manufacturer===policy.manufacturer&&printer.model===policy.model&&printer.technology===policy.technology&&policy.versions.some(version=>version===task.profileVersion)&&isVerifiedTask(task,printer);
 const reference=compatible?policy.procedures.find(p=>task.sourceUrl===`https://wiki.flashforge.com/en/creator-series/creator-5-series/maintenance/${p.id}`&&(!task.templateId||task.templateId===p.id)):undefined;
 return reference?{...base,state:'identified',hazards:[...reference.hazards] as Hazard[],scope:reference.scope,references:[task.sourceUrl,policy.notice]}:{...base,state:'unassessed',scope:unassessedSafety};
}
export function maintenanceSafetyText(task:Task,printer:Pick<Printer,'manufacturer'|'model'|'technology'>){const context=maintenanceSafety(task,printer);return `Safety reference policy ${context.version}: ${context.state==='identified'?'identified references, not complete procedural safety review':context.state}. ${context.hazards.map(id=>hazardLabels[id]).join('; ')}. ${context.scope} ${context.references.join(' ')} ${sourceSafetyCaution}`;}
export const completionNeedsContextReview=(task:Task,printer:Printer,outcome:string)=>outcome==='Completed'&&maintenanceSafety(task,printer).state!=='review-only';
