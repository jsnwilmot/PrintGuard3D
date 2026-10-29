import {z} from 'zod';
import {printerSchema,taskSchema,dateSchema,type Task,type Printer} from './domain';
import {status} from './engine';
import {sameRecord} from './comparison';
import {reviewTask} from './profiles';

export const observationLimits={records:20000,perPrinterDay:96,printers:1000,tasks:10000} as const;
const printerFacts=printerSchema.pick({id:true,name:true,manufacturer:true,model:true,technology:true,hours:true,prints:true,archived:true,profileId:true,profileVersion:true});
const taskFacts=taskSchema.pick({id:true,printerId:true,title:true,category:true,priority:true,interval:true,anchorDate:true,anchorHours:true,anchorPrints:true,base:true,cycleOffset:true,enabled:true,postponedUntil:true,condition:true,source:true,sourceUrl:true,profileId:true,profileVersion:true,templateId:true});
const states=['Overdue','Due Today','Due Soon','Upcoming','Postponed','Not Yet Due','Completed','Paused'] as const;
const instant=z.string().refine(value=>{try{return new Date(value).toISOString()===value;}catch{return false;}},'Use an exact UTC observation instant.');
export const observationSchema=z.object({
 version:z.literal(1),id:z.string().min(1).max(15300),batchId:z.string().min(1).max(100),printerId:z.string().min(1).max(15000),
 observedAt:instant,localDate:dateSchema,timezone:z.string().min(1).max(100),utcOffsetMinutes:z.number().int().min(-840).max(840),
 source:z.enum(['recording started','app open after consent','persisted state or date change','manual observation']),
 reminderDays:z.number().int().min(0).max(90),printer:printerFacts,
 tasks:z.array(taskFacts.extend({status:z.enum(states),eligible:z.boolean()}).strict()).max(observationLimits.tasks),
 eligibleTaskCount:z.number().int().nonnegative(),overdueCount:z.number().int().nonnegative(),
}).strict().superRefine((value,ctx)=>{
 const issue=(message:string)=>ctx.addIssue({code:'custom',message});
 if(value.printerId!==value.printer.id||value.id!==`${value.batchId}:${encodeURIComponent(value.printerId)}`)issue('Observation printer identity is inconsistent.');
 if(Number.isFinite(Date.parse(value.observedAt))&&new Date(Date.parse(value.observedAt)+value.utcOffsetMinutes*60000).toISOString().slice(0,10)!==value.localDate)issue('Observation UTC/local date is inconsistent with its captured offset.');
 const seen=new Set<string>();
 for(const task of value.tasks){
  if(seen.has(task.id)||task.printerId!==value.printerId)issue('Observation contains duplicate tasks or conflicting printer ownership.');seen.add(task.id);
  if(task.eligible!==(!value.printer.archived&&task.enabled))issue('Observation eligibility contradicts its captured archive/enabled facts.');
  // Every field consumed by status/due is captured. Never merge in present-day entities.
  if(status(task as unknown as Task,value.printer as Printer,value.localDate,value.reminderDays)!==task.status)issue('Observation status contradicts its captured scheduling/usage facts.');
 }
 if(value.eligibleTaskCount!==value.tasks.filter(t=>t.eligible).length||value.overdueCount!==value.tasks.filter(t=>t.eligible&&t.status==='Overdue').length)issue('Observation counts do not match its captured task facts.');
});
export type Observation=z.infer<typeof observationSchema>;
export const overdueHistorySchema=z.object({version:z.literal(1),records:z.array(observationSchema).max(observationLimits.records)}).strict();

export function observationFacts(printer:Printer,tasks:Task[],localDate:string,reminderDays:number){
 const captured=tasks.filter(t=>t.printerId===printer.id).sort((a,b)=>a.id.localeCompare(b.id)).map(task=>({
  ...taskFacts.strip().parse(reviewTask(task,printer)),status:status(task,printer,localDate,reminderDays),eligible:!printer.archived&&task.enabled,
 }));
 return {localDate,reminderDays,printer:printerFacts.strip().parse(printer),tasks:captured,
  eligibleTaskCount:captured.filter(t=>t.eligible).length,overdueCount:captured.filter(t=>t.eligible&&t.status==='Overdue').length};
}
export function unchangedObservation(previous:Observation,current:ReturnType<typeof observationFacts>,timezone:string,offset:number){
 return previous.timezone===timezone&&previous.utcOffsetMinutes===offset&&sameRecord({localDate:previous.localDate,reminderDays:previous.reminderDays,printer:previous.printer,tasks:previous.tasks,eligibleTaskCount:previous.eligibleTaskCount,overdueCount:previous.overdueCount},current);
}
export function observationIssues(records:Observation[]){
 const issues:string[]=[],ids=new Set<string>(),instants=new Set<string>(),days=new Map<string,number>();
 for(const record of records){
  if(ids.has(record.id))issues.push(`Observation ${record.id}: duplicate identifier.`);ids.add(record.id);
  const key=record.printerId+'|'+record.observedAt;
  const day=record.printerId+'|'+record.observedAt.slice(0,10);days.set(day,(days.get(day)||0)+1);
  if(days.get(day)!>observationLimits.perPrinterDay)issues.push(`Observation ${record.id}: daily capacity exceeded.`);
  if(instants.has(key))issues.push(`Observation ${record.id}: duplicate printer/observation instant.`);instants.add(key);
 }
 if(records.length>observationLimits.records)issues.push('Observation capacity exceeded. No history was discarded.');
 return issues;
}
