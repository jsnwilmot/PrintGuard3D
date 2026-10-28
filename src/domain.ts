import { z } from 'zod';
export const uid = () => crypto.randomUUID();
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => { const d=new Date(s+'T12:00:00'); return !isNaN(+d) && `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`===s; },'Invalid calendar date');
const text = z.string().max(15000);
const number = z.number().finite().nonnegative();
const image = z.string().max(6000000).refine(s=>s==='' || /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(s),'Use a PNG, JPEG or WebP image');
export const safeUrl = (s: string) => { try { const u=new URL(s); return u.protocol==='https:' || u.protocol==='http:'; } catch { return false; } };
export const intervalSchema = z.object({mode:z.enum(['calendar','hours','prints','afterPrint','combined','condition','once']),days:number.optional(),months:number.optional(),hours:number.optional(),prints:number.optional()}).strict().superRefine((v,c)=>{
  const calendar=(v.days??0)>0 || (v.months??0)>0;
  if(v.days&&v.months)c.addIssue({code:'custom',message:'Choose either days or months for a calendar interval, not both.'});
  if ((v.days!==undefined && (!Number.isInteger(v.days) || v.days<1)) || (v.months!==undefined && (!Number.isInteger(v.months) || v.months<1)) || (v.hours!==undefined && v.hours<=0) || (v.prints!==undefined && (!Number.isInteger(v.prints) || v.prints<1))) c.addIssue({code:'custom',message:'Intervals must be positive (days, months and prints must be whole numbers).'});
  if ((v.mode==='calendar'&&!calendar)||(v.mode==='hours'&&!v.hours)||(v.mode==='prints'&&!v.prints)||(v.mode==='combined'&&(!calendar||!v.hours))) c.addIssue({code:'custom',message:'Enter an interval for the selected trigger.'});
});
export type Interval=z.infer<typeof intervalSchema>;
export const printerSchema=z.object({id:text,name:z.string().min(1).max(150),manufacturer:text,model:text,technology:z.enum(['FDM/FFF','Resin']),serial:text,location:text,purchaseDate:z.union([dateSchema,z.literal('')]),installed:dateSchema,hours:number,prints:number.int(),firmware:text,notes:text,image,profileId:text,profileVersion:text,archived:z.boolean(),created:dateSchema}).strict();
export type Printer=z.infer<typeof printerSchema>;
export const taskSchema=z.object({id:text,printerId:text,title:z.string().min(1).max(200),description:text,category:text,priority:z.enum(['Low','Normal','High','Critical']),interval:intervalSchema,originalInterval:intervalSchema,anchorDate:dateSchema,anchorHours:number,anchorPrints:number.int(),base:z.enum(['completion','scheduled']),source:z.enum(['Manufacturer Verified','User Defined','Pending Verification','General Recommendation']),sourceUrl:z.string().refine(s=>!s||safeUrl(s),'Documentation must use HTTP or HTTPS'),sourceTitle:text,verified:text,materials:text,safety:text,minutes:number,notes:text,enabled:z.boolean(),postponedUntil:z.union([dateSchema,z.literal('')]),condition:z.boolean(),profileVersion:text,profileId:text.optional(),templateId:text.optional(),cycleOffset:z.number().int().nonnegative().optional(),scheduleKind:z.enum(['recurring','usage-dependent']).optional(),intervalOptions:z.array(z.object({id:text,label:text,interval:intervalSchema}).strict()).optional(),selectionId:text.optional(),legacyTitles:z.array(text).optional()}).strict();
export type Task=z.infer<typeof taskSchema>;
export const logSchema=z.object({id:text,printerId:text,taskId:text,title:text,date:dateSchema,hours:number,prints:number.int(),outcome:z.enum(['Completed','Skipped','Postponed']),notes:text,cost:number,minutes:number,materials:text,image,onTime:z.boolean(),dueDate:text,sourceUrl:text,source:text,skippedCycles:number.int(),inventoryId:text,quantity:number,category:text.optional(),priority:text.optional(),profileId:text.optional(),profileVersion:text.optional(),templateId:text.optional(),manufacturer:text.optional(),model:text.optional(),technology:text.optional(),currency:text.optional()}).strict();
export type Log=z.infer<typeof logSchema>;
export const readingSchema=z.object({id:text,printerId:text,date:dateSchema,hours:number,prints:number.int()}).strict();
export type Reading=z.infer<typeof readingSchema>;
export const inventorySchema=z.object({id:text,name:z.string().min(1),partNumber:text,manufacturer:text,printerId:text,quantity:number,minimum:number,unitCost:number,supplier:text,notes:text}).strict();
export type Inventory=z.infer<typeof inventorySchema>;
export const repairSchema=z.object({id:text,printerId:text,title:z.string().min(1),date:dateSchema,description:text,component:text,severity:z.enum(['Low','Normal','High','Critical']),status:z.enum(['Open','Investigating','Awaiting Parts','Resolved','Closed']),notes:text,parts:text,cost:number,resolved:text,image,currency:z.string().regex(/^[A-Z]{3}$/).optional()}).strict();
export type Repair=z.infer<typeof repairSchema>;
export const referenceSchema=z.object({id:text,title:text,url:z.string().refine(safeUrl),kind:z.enum(['condition','corrective','uncertain','not-applicable']),status:z.enum(['Verified Reference','Pending Verification','Not Applicable','Unavailable']),models:z.array(text),checked:dateSchema,intervalText:text,materials:text,safety:text,notes:text,sourceVersion:text}).strict();
// Reject rather than silently dropping reserved metadata keys during object parsing.
function profileMetadataInput(value:unknown,ctx:z.RefinementCtx){
 const pending=[{value,depth:0}];
 while(pending.length){const item=pending.pop()!;if(!item.value||typeof item.value!=='object')continue;
  if(item.depth>32){ctx.addIssue({code:'custom',message:'Profile metadata must be acyclic JSON with at most 32 nested levels.'});return z.NEVER;}
  for(const [key,child] of Object.entries(item.value)){if(key==='__proto__'){ctx.addIssue({code:'custom',message:'Reserved __proto__ profile metadata is unsupported; no data was imported.'});return z.NEVER;}pending.push({value:child,depth:item.depth+1});}
 }
 return value;
}
export const profileSchema=z.preprocess(profileMetadataInput,z.object({id:z.string().min(1).max(200),profileId:text.optional(),manufacturer:z.string().min(1),model:z.string().min(1),family:text,technology:z.enum(['FDM/FFF','Resin']),image:text,imageSource:text,imageRights:text,documentation:z.string().refine(s=>!s||safeUrl(s)),status:z.enum(['Manufacturer Verified','Pending Verification']),version:z.string().min(1).max(100),verified:text,revisions:z.array(text),templates:z.array(taskSchema.omit({id:true,printerId:true,anchorDate:true,anchorHours:true,anchorPrints:true})),references:z.array(referenceSchema).optional(),coverage:z.object({reviewed:z.number().int().nonnegative(),indexTotal:z.number().int().nonnegative(),notes:text}).strict().optional()}).catchall(z.json().optional()).superRefine((p,c)=>{
 if(p.status==='Manufacturer Verified'&&(!p.documentation||!dateSchema.safeParse(p.verified).success))c.addIssue({code:'custom',message:'Verified profiles require documentation and a valid verification date.'});
 for(const t of p.templates)if(t.source==='Manufacturer Verified'&&(!t.sourceUrl||!t.sourceTitle||!dateSchema.safeParse(t.verified).success||!t.profileVersion))c.addIssue({code:'custom',message:'Verified templates require documentation, date and version provenance.'});
 const ids=p.templates.map(t=>t.templateId||t.title);if(new Set(ids).size!==ids.length)c.addIssue({code:'custom',message:'Duplicate template identifiers or legacy titles.'});
 for(const t of p.templates){const options=t.intervalOptions?.map(o=>o.id)||[];if(new Set(options).size!==options.length)c.addIssue({code:'custom',message:'Duplicate usage-band option identifiers.'});}
 const references=p.references?.map(r=>r.id)||[];if(new Set(references).size!==references.length)c.addIssue({code:'custom',message:'Duplicate documentation reference identifiers.'});
}));
export type Profile=z.infer<typeof profileSchema>;
export const preferencesSchema=z.object({id:z.literal('preferences'),theme:z.enum(['light','dark']),reminderDays:z.number().int().min(0).max(90),notifications:z.boolean(),target:z.number().min(0).max(100),achievements:z.boolean(),lastBackup:text,acknowledgment:z.object({version:text,date:text}).nullable(),readNotices:z.array(text),currency:z.string().regex(/^[A-Z]{3}$/),observationRecording:z.boolean().optional(),criticalTarget:z.number().int().nonnegative().optional(),missedTarget:z.number().int().nonnegative().optional(),sourceFlags:z.array(z.object({url:z.string().refine(safeUrl),date:dateSchema,reason:text}).strict()).optional()}).strict();
export type Preferences=z.infer<typeof preferencesSchema>;
export const defaults:Preferences={id:'preferences',theme:'light',reminderDays:7,notifications:false,target:95,achievements:true,lastBackup:'',acknowledgment:null,readNotices:[],currency:'CAD'};
export const formatDate=(s:string)=>s?new Date(s+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—';
export function intervalLabel(i:Interval){switch(i.mode){case 'condition':return 'When condition is observed';case 'once':return 'One time';case 'afterPrint':return 'After every print';default:return [i.days?`Every ${i.days} day${i.days===1?'':'s'}`:'',i.months?`Every ${i.months} month${i.months===1?'':'s'}`:'',i.hours?`${i.hours} operating hours`:'',i.prints?`${i.prints} prints`:''].filter(Boolean).join(' or ');}}
