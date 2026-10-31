import {createReviewReminder,taskDecisionIssue,type ReviewChoice} from './recommendations';
import {disclaimerVersion} from './legal';
import Dexie,{type Table,type Transaction} from 'dexie';
import {installWriterFence,writerStore,writerContract,mixedBuild,recordAcknowledgment} from './writerSafety';
import {guardedFactory,supportedLayout} from './storageLayout';
import { z } from 'zod';
import {overdueHistorySchema,observationIssues,type Observation} from './observations';
import {printerSchema,taskSchema,logSchema,readingSchema,inventorySchema,repairSchema,profileSchema,preferencesSchema,dateSchema,type Printer,type Task,type Log,type Reading,type Inventory,type Repair,type Profile,type Preferences,defaults,today,uid,safeUrl} from './domain';
import {advance,status,due,rebaseTaskEdit} from './engine';
import {assertGraph,graphIssues,recordTables,sameRecord,activityIdentity,type RecordGraph} from './integrity';
import {matchingTask} from './profileChanges';
import {reviewTask,reviewProfile,assessProfile,profileArchiveId,bundled,isVerifiedTask,reviewedProfiles,defaultProfiles,automaticTemplate,compareVersions,selectTemplate} from './profiles';
export class PrintGuardDB extends Dexie{
 printers!:Table<Printer,string>;tasks!:Table<Task,string>;logs!:Table<Log,string>;readings!:Table<Reading,string>;inventory!:Table<Inventory,string>;repairs!:Table<Repair,string>;profiles!:Table<Profile,string>;preferences!:Table<Preferences,string>;observations!:Table<Observation,string>;
 constructor(name='PrintGuard3D'){
  super(name,{indexedDB:guardedFactory(Dexie.dependencies.indexedDB)});
  this.version(1).stores({printers:'id,manufacturer,archived',tasks:'id,printerId',logs:'id,printerId,taskId,date',readings:'id,printerId,date',inventory:'id,printerId',repairs:'id,printerId,status',profiles:'id',preferences:'id'});
  const initialize=(tx:Transaction)=>{if(mixedBuild())throw Error('Mixed application assets detected; database initialization refused.');tx.idbtrans.objectStore(writerStore).add(writerContract);};
  this.version(2).stores({observations:'id,printerId,observedAt,[printerId+observedAt]',writerControl:'id'}).upgrade(initialize);
  this.on('populate',initialize);
  installWriterFence(this);
  this.on('ready',()=>{if(!supportedLayout(this,this.backendDB()))throw Error('Unsupported database layout changed while opening. No workshop writes are permitted.');},true);
  this.observations.hook('updating',()=>{throw Error('Recorded observations are immutable. Import conflicts require review.');});
 }
 // Dexie can otherwise auto-patch missing stores at the same declared version.
 // Inspect with an unspecified native version and abort creation before Dexie.
 override open(){
  if(this.isOpen())return super.open();
  return Dexie.Promise.resolve(new Promise<void>((resolve,reject)=>{
   const request=Dexie.dependencies.indexedDB!.open(this.name);let absent=false;
   request.onupgradeneeded=()=>{absent=true;request.transaction!.abort();};
   request.onerror=()=>absent?resolve():reject(request.error);
   request.onsuccess=()=>{
    const native=request.result,unsupported=!supportedLayout(this,native,true);
    native.close();if(unsupported)reject(Error('Unsupported pre-public or future database layout. No records changed. Use a compatible application and keep a validated full backup; do not clear site data.'));else resolve();
   };
  })).then(()=>super.open());
 }
}
export const db=new PrintGuardDB();
export const acknowledgeDisclaimer=()=>recordAcknowledgment(db);
export async function completeTask(id:string,input:Pick<Log,'date'|'hours'|'prints'|'notes'|'cost'|'minutes'|'materials'|'image'|'inventoryId'|'quantity'>,outcome:'Completed'|'Skipped'='Completed'){
 input=logSchema.pick({date:true,hours:true,prints:true,notes:true,cost:true,minutes:true,materials:true,image:true,inventoryId:true,quantity:true}).parse(input);
 await db.transaction('rw',[db.tasks,db.printers,db.logs,db.readings,db.inventory,db.preferences],async()=>{
 const t=await db.tasks.get(id);if(!t||!t.enabled)throw Error('This task has already been completed or removed.');
 const p=await db.printers.get(t.printerId);if(!p||p.archived)throw Error('Restore the printer before recording maintenance.');
 if(input.date>today())throw Error('A completion cannot be dated in the future.');
 if(input.date<p.installed||(t.interval.mode!=='once'&&input.date<t.anchorDate))throw Error('Completion cannot precede the current maintenance baseline.');
 const history=await db.logs.where('printerId').equals(p.id).toArray();const readings=await db.readings.where('printerId').equals(p.id).toArray();
 if([...history,...readings].some(r=>r.date>input.date))throw Error('Completion cannot precede the latest recorded maintenance or usage date.');
 const taskHistory=await db.logs.where('taskId').equals(t.id).toArray();
 if(taskHistory.some(l=>l.printerId!==p.id)||t.anchorHours>p.hours||t.anchorPrints>p.prints)throw Error('The maintenance baseline is inconsistent with this printer. Review the records before continuing.');
 if(input.hours<p.hours||input.prints<p.prints)throw Error('Usage readings cannot decrease. Use current cumulative readings.');
 if(input.inventoryId){const item=await db.inventory.get(input.inventoryId);if(!item||(item.printerId&&item.printerId!==p.id)||input.quantity<=0||item.quantity<input.quantity)throw Error('Check the compatible inventory and quantity consumed.');await db.inventory.update(item.id,{quantity:item.quantity-input.quantity});}else if(input.quantity!==0)throw Error('Inventory consumption requires an inventory item.');
 const reviewed=reviewTask(t,p);const next=advance(reviewed,input.date,input.hours,input.prints);const s=status(t,{...p,hours:input.hours,prints:input.prints},input.date,0);
 const prefs=await db.preferences.get('preferences');
 const record=logSchema.parse({id:uid(),printerId:p.id,taskId:t.id,title:t.title,...input,...historySnapshot(reviewed,p,prefs?.currency||defaults.currency),outcome,onTime:s!=='Overdue',dueDate:due(t).date,sourceUrl:t.sourceUrl,source:reviewed.source,skippedCycles:next.skippedCycles});
 if(taskHistory.some(l=>activityIdentity(l)===activityIdentity(record)))throw Error('An identical maintenance record already exists. Review history before recording separate work.');
 await db.logs.add(record);
 await db.tasks.put(next.task);await db.printers.update(p.id,{hours:input.hours,prints:input.prints});await db.readings.add({id:uid(),printerId:p.id,date:input.date,hours:input.hours,prints:input.prints});
 });
}
export const backupSchema=z.object({application:z.literal('PrintGuard3D'),schemaVersion:z.literal(1),exportedAt:z.string(),scope:z.enum(['full','printer']),printers:z.array(printerSchema),tasks:z.array(taskSchema),logs:z.array(logSchema),readings:z.array(readingSchema),inventory:z.array(inventorySchema),repairs:z.array(repairSchema),profiles:z.array(profileSchema),preferences:preferencesSchema.optional(),overdueHistory:overdueHistorySchema.optional(),recommendationPolicy:z.object({version:z.literal(1)}).strict().optional()}).strict();
export type Backup=z.infer<typeof backupSchema>;
export async function makeBackup(printerId?:string):Promise<Backup>{
 const byPrinter=<T extends {printerId:string}>(rows:T[])=>printerId?rows.filter(x=>x.printerId===printerId):rows;
 return db.transaction('r',db.tables,async()=>{const backup:Backup={application:'PrintGuard3D',schemaVersion:1,exportedAt:new Date().toISOString(),scope:printerId?'printer':'full',printers:(await db.printers.toArray()).filter(x=>!printerId||x.id===printerId),tasks:byPrinter(await db.tasks.toArray()),logs:byPrinter(await db.logs.toArray()),readings:byPrinter(await db.readings.toArray()),inventory:(await db.inventory.toArray()).filter(x=>!printerId||!x.printerId||x.printerId===printerId),repairs:byPrinter(await db.repairs.toArray()),profiles:await db.profiles.toArray(),preferences:await db.preferences.get('preferences')??defaults,...await observationBackup(printerId)};
 if([...backup.tasks,...backup.logs,...(backup.overdueHistory?.records||[]).flatMap(o=>o.tasks)].some(t=>t.recommendation))backup.recommendationPolicy={version:1};
 // The readonly native transaction may wait behind a writer. Stamp only after
 // its consistent snapshot has been read, including observations committed
 // while it was waiting; otherwise our own strict reader can reject the file.
 backup.exportedAt=new Date().toISOString();
 return backup;});
}
async function observationBackup(printerId?:string){const records=(await db.observations.toArray()).filter(row=>!printerId||row.printerId===printerId);return records.length?{overdueHistory:{version:1 as const,records}}:{};}
export function validateBackup(value:unknown):Backup{
 if(value&&typeof value==='object'&&'schemaVersion' in value&&value.schemaVersion!==1)throw Error('This backup uses an unsupported schema. Version 1 is supported; newer versions require an application update.');
 const b=backupSchema.parse(value);
 if([...b.tasks,...b.logs,...(b.overdueHistory?.records||[]).flatMap(o=>o.tasks)].some(t=>t.recommendation)&&!b.recommendationPolicy)throw Error('Recommendation metadata requires its supported policy marker; no records imported.');
 assertGraph(b);
 if(b.overdueHistory&&(!Number.isFinite(Date.parse(b.exportedAt))||new Date(b.exportedAt).toISOString()!==b.exportedAt))throw Error('Observation exports require an exact UTC export instant.');
 if(b.overdueHistory?.records.some(row=>row.observedAt>b.exportedAt||Date.parse(row.observedAt)>Date.now()+300000))throw Error('Observation time cannot follow its export or be in the future. Check the device clock before importing.');
 const observationProblems=observationIssues(b.overdueHistory?.records||[]);if(observationProblems.length)throw Error(observationProblems.join('\n'));
 b.tasks=b.tasks.map(t=>reviewTask(t,b.printers.find(p=>p.id===t.printerId)!));
 b.profiles=b.profiles.map(reviewProfile);
 return b;
}
export interface ImportPreview {duplicates:number;retained:string[];conflicts:string[];quarantined:string[];}
async function readGraph():Promise<RecordGraph>{return {printers:await db.printers.toArray(),tasks:await db.tasks.toArray(),logs:await db.logs.toArray(),readings:await db.readings.toArray(),inventory:await db.inventory.toArray(),repairs:await db.repairs.toArray(),profiles:await db.profiles.toArray()};}
function importPlan(b:Backup,current:RecordGraph,replace:boolean){
 const preview:ImportPreview={duplicates:0,retained:[],conflicts:[],quarantined:b.tasks.filter(t=>t.source==='Pending Verification').map(t=>`Task ${t.id}: pending verification`)};
 const merged:RecordGraph={printers:[],tasks:[],logs:[],readings:[],inventory:[],repairs:[],profiles:[]};
 for(const key of recordTables){
  const existing=new Map(current[key].map(r=>[r.id,r]));const rows=replace?[]:[...current[key]];
  for(const row of b[key]){const old=existing.get(row.id);
   if(old){preview.duplicates++;
    if((key==='tasks'||key==='logs')&&('recommendation' in old||'recommendation' in row)&&!sameRecord((old as Task).recommendation,(row as Task).recommendation))preview.conflicts.push(`${key} ${row.id}: immutable recommendation decision conflicts; import blocked.`);
    if(!sameRecord(old,row)){
    preview.retained.push(`${key} ${row.id}: ${replace?'will replace local record':'local record retained; incoming values differ'}`);
    const a=old as unknown as Record<string,unknown>,v=row as unknown as Record<string,unknown>;
    const immutable=key==='printers'?['manufacturer','model','technology','serial','installed']:key==='tasks'||key==='inventory'||key==='repairs'?['printerId']:key==='logs'||key==='readings'?Object.keys({...a,...v}):['version','manufacturer','model','technology'];
    if(!replace&&(immutable.some(k=>!sameRecord(a[k],v[k]))||(key==='profiles'&&!sameRecord(a,v))))preview.conflicts.push(`${key} ${row.id}: conflicting identity, ownership or historical values. Merge blocked.`);
   }}
   if(replace||!old)rows.push(row as never);
  }
  (merged[key] as unknown[])=rows;
 }
 preview.conflicts.push(...graphIssues(merged));
 return {preview,merged};
}
async function observationPlan(b:Backup){
 const incoming=b.overdueHistory?.records||[],existing=await db.observations.toArray(),conflicts:string[]=[],additions:Observation[]=[];
 for(const row of incoming){const old=existing.find(value=>value.id===row.id);if(old){if(!sameRecord(old,row))conflicts.push(`Observation ${row.id}: immutable history conflicts; import blocked.`);}else additions.push(row);}
 conflicts.push(...observationIssues([...existing,...additions]));return {additions,conflicts};
}
export async function previewBackup(value:unknown,replace=false):Promise<ImportPreview>{const b=validateBackup(value);return db.transaction('r',db.tables,async()=>{const preview=importPlan(b,await readGraph(),replace).preview;preview.conflicts.push(...(await observationPlan(b)).conflicts);return preview;});}
export async function restoreBackup(value:Backup,replace:boolean){
 const b=validateBackup(value);await db.transaction('rw',db.tables,async()=>{
 const {preview}=importPlan(b,await readGraph(),replace);
 const observations=await observationPlan(b);preview.conflicts.push(...observations.conflicts);
 if(preview.conflicts.length)throw Error(`Import rejected. No records changed.\n${preview.conflicts.join('\n')}`);
 if(replace)for(const t of db.tables)if(t.name!=='observations'&&t.name!==writerStore)await t.clear();
 for(const key of recordTables){const table=db.table(key);for(const row of b[key])if(replace||!await table.get(row.id))await table.add(row);}
 await db.observations.bulkAdd(observations.additions);
 // Imported legal acknowledgments never replace acknowledgment on this device.
 const current=await db.preferences.get('preferences');await db.preferences.put({...defaults,...(replace?b.preferences:current),acknowledgment:current?.acknowledgment??null,id:'preferences'});
 });
}
export function historySnapshot(t:Task,p:Printer,currency:string){
 const profileId=t.profileId||(t.profileVersion===p.profileVersion?p.profileId:bundled.find(b=>b.manufacturer===p.manufacturer&&b.model===p.model&&b.technology===p.technology&&b.version===t.profileVersion)?.id)||'';
 return {category:t.category,priority:t.priority,profileId,profileVersion:t.profileVersion,templateId:t.templateId,manufacturer:p.manufacturer,model:p.model,technology:p.technology,currency,...(t.recommendation?{recommendation:structuredClone(t.recommendation)}:{})};
}
export async function postponeTask(id:string,date:string,notes:string){
 dateSchema.parse(date);if(date<today())throw Error('Choose today or a future date.');
 return db.transaction('rw',[db.tasks,db.printers,db.logs,db.preferences],async()=>{
  const t=await db.tasks.get(id);const p=t?await db.printers.get(t.printerId):undefined;
  if(!t||!p||!t.enabled||p.archived)throw Error('Select an active maintenance rule and printer.');
  if(t.postponedUntil===date)return;
  const prefs=await db.preferences.get('preferences');const reviewed=reviewTask(t,p);
  await db.logs.add(logSchema.parse({id:uid(),printerId:p.id,taskId:t.id,title:t.title,date:today(),hours:p.hours,prints:p.prints,outcome:'Postponed',notes:`Next occurrence moved to ${date}. ${notes}`,cost:0,minutes:0,materials:'',image:'',onTime:false,dueDate:due(t).date,sourceUrl:t.sourceUrl,source:reviewed.source,skippedCycles:0,inventoryId:'',quantity:0,...historySnapshot(reviewed,p,prefs?.currency||defaults.currency)}));
  await db.tasks.update(id,{postponedUntil:date});
 });
}
export async function savePrinter(value:Printer,expected?:Printer,templates:Task[]=[]){
 const p=printerSchema.parse(value);
 return db.transaction('rw',db.tables,async()=>{
  const old=await db.printers.get(p.id);
  if(expected&&(!old||!sameRecord(old,expected)))throw Error('Printer records changed. Reopen the form to refresh current usage.');
  if(!expected&&old)throw Error('A printer already uses this identifier.');
  if(old&&(old.manufacturer!==p.manufacturer||old.model!==p.model||old.technology!==p.technology))throw Error('Registered model and technology cannot be changed. Register a separate printer.');
  if(old&&(p.hours<old.hours||p.prints<old.prints))throw Error('Cumulative usage cannot decrease.');
  if(old&&templates.length)throw Error('Existing schedules must be updated explicitly.');
  const additions=templates.map(t=>taskSchema.parse(t));
  if(additions.some(t=>t.printerId!==p.id||!automaticTemplate(t,p)))throw Error('Automatic schedules require reviewed procedures for this exact printer.');
  const reading=readingSchema.parse({id:uid(),printerId:p.id,date:today(),hours:p.hours,prints:p.prints});
  const g=await readGraph();g.printers=[...g.printers.filter(x=>x.id!==p.id),p];g.tasks.push(...additions);g.readings.push(reading);assertGraph(g);
  const definition=reviewedProfiles.find(d=>d.id===p.profileId&&d.version===p.profileVersion);
  if(definition){const id=profileArchiveId(definition.id,definition.version);const oldDefinition=await db.profiles.get(id);if(oldDefinition&&!sameRecord({...oldDefinition,id:definition.id,profileId:undefined},definition))throw Error('Conflicting immutable profile definition.');if(!oldDefinition)await db.profiles.add({...definition,id,profileId:definition.id});}
  await db.printers.put(p);await db.tasks.bulkAdd(additions);await db.readings.add(reading);
 });
}
export async function saveInventory(value:Inventory){
 const item=inventorySchema.parse(value);
 return db.transaction('rw',[db.inventory,db.printers,db.logs],async()=>{
  if(item.printerId&&!await db.printers.get(item.printerId))throw Error('Inventory references a missing printer.');
  const old=await db.inventory.get(item.id);
  if(old&&old.printerId!==item.printerId&&await db.logs.filter(l=>l.inventoryId===item.id).count())throw Error('Consumed inventory must retain its historical printer compatibility. Create a separate item.');
  await db.inventory.put(item);
 });
}
export async function saveRepair(value:Repair){
 const r=repairSchema.parse(value);
 return db.transaction('rw',[db.repairs,db.printers,db.preferences],async()=>{
  if(!await db.printers.get(r.printerId))throw Error('Repair references a missing printer.');
  const old=await db.repairs.get(r.id);if(old&&old.printerId!==r.printerId)throw Error('An existing repair must retain its printer. Create a separate repair record.');
  const currency=old?old.currency:(await db.preferences.get('preferences'))?.currency||defaults.currency;
  const record={...r};delete record.currency;if(currency)record.currency=currency;await db.repairs.put(record);
 });
}
export async function acceptReviewReminder(printerId:string,choice:ReviewChoice){
 return db.transaction('rw',[db.tasks,db.printers,db.readings,db.preferences],async()=>{
  const prefs=await db.preferences.get('preferences');if(prefs?.acknowledgment?.version!==disclaimerVersion||!prefs.acknowledgment.date)throw Error('Required disclaimer acknowledgment is missing on this device.');
  const p=await db.printers.get(printerId);if(!p)throw Error('Printer no longer exists. Reopen review.');
  const t=createReviewReminder(p,choice,await db.readings.where('printerId').equals(p.id).toArray());
  await db.tasks.add(t);return t;
 });
}
export async function saveTask(value:Task,expected?:Task){
 const parsed=taskSchema.parse(value);
 return db.transaction('rw',[db.tasks,db.printers,db.logs,db.inventory,db.profiles],async()=>{
  const old=await db.tasks.get(parsed.id);const p=await db.printers.get(parsed.printerId);
  if(!p||p.archived)throw Error('Select an active registered printer.');
  if(expected&&(!old||!sameRecord(expected,old)))throw Error('This rule changed while you were editing. Reopen it before saving.');
  if(!expected&&old)throw Error('A maintenance rule already uses this identifier.');
  const logs=old?await db.logs.where('taskId').equals(old.id).toArray():[];
  if(old&&old.printerId!==parsed.printerId&&logs.length)throw Error('A rule with maintenance history cannot be reassigned. Create a new user-defined rule for the other printer.');
  if(parsed.recommendation&&!old)throw Error('New suggestions require the dedicated acknowledged review.');
  if(old?.recommendation&&(!sameRecord(old.recommendation,parsed.recommendation)||old.printerId!==parsed.printerId))throw Error('Initial recommendation provenance and ownership are immutable. Create a separately reviewed reminder.');
  let t=rebaseTaskEdit(parsed,old);
  if(t.recommendation&&old&&!sameRecord(t,old))t={...t,source:'User Defined'};
  const decisionProblem=taskDecisionIssue(t,p);if(decisionProblem)throw Error(decisionProblem);
  if(old&&old.printerId!==t.printerId)t={...t,source:'User Defined',profileId:'',profileVersion:'',templateId:'',verified:''};
  else if(t.source==='Manufacturer Verified'&&!isVerifiedTask(t,p))t={...t,source:old?'User Defined':'Pending Verification'};
  assertGraph({printers:await db.printers.toArray(),tasks:[t],logs,readings:[],inventory:await db.inventory.toArray(),repairs:[],profiles:await db.profiles.toArray()});
  // Stock references in old history are validated by imports/completion; editing never rewrites those rows.
  await db.tasks.put(t);return t;
 });
}
export interface ProfileInstallOptions {templates?:string[];selections?:Record<string,string>;expected?:Profile;}
export async function installProfile(value:Profile,printerId='',options:ProfileInstallOptions={}){
 const incoming=reviewProfile(value);
 if(incoming.profileId||incoming.id.startsWith('version:'))throw Error('Install a profile package, not an archived or reserved definition.');
 compareVersions(incoming.version,incoming.version);
 const released=reviewedProfiles.find(p=>p.id===incoming.id&&p.version===incoming.version);
 if(released&&!sameRecord(released,incoming))throw Error('This reviewed profile version has a different immutable definition. Use a new version.');
 return db.transaction('rw',[db.profiles,db.printers,db.tasks,db.logs],async()=>{
  const current=await db.profiles.get(incoming.id)||defaultProfiles.find(p=>p.id===incoming.id);
  if(options.expected&&(!current||!sameRecord(assessProfile(current),options.expected)))throw Error('Profile changed after preview. Review the update again.');
  if(current&&(current.manufacturer!==incoming.manufacturer||current.model!==incoming.model||current.technology!==incoming.technology))throw Error('A stable profile identity cannot change model or technology. Use a separate profile.');
  if(current&&incoming.version!==current.version&&compareVersions(incoming.version,current.version)<=0)throw Error('Profile downgrade or equal-precedence version rejected.');
  const retain=async(definition:Profile)=>{const id=profileArchiveId(incoming.id,definition.version);const old=await db.profiles.get(id);const normalized={...definition,id:incoming.id,profileId:undefined};if(old&&!sameRecord({...old,id:incoming.id,profileId:undefined},normalized))throw Error('This profile version already has a different immutable definition. Use a new version.');if(!old)await db.profiles.add({...definition,id,profileId:incoming.id});};
  const archived=await db.profiles.get(profileArchiveId(incoming.id,incoming.version));
  if(archived&&!sameRecord({...archived,id:incoming.id,profileId:undefined},incoming))throw Error('This profile version already has a different immutable definition. Use a new version.');
  if(current&&current.version===incoming.version&&!sameRecord(assessProfile(current),incoming))throw Error('A profile version cannot be overwritten with different content. Use a new version.');
  if(current)await retain(current);
  // Keep every app-reviewed applied definition with backups, even after a registry-only update.
  const used=[...await db.printers.toArray(),...await db.tasks.toArray(),...await db.logs.toArray()];
  for(const definition of reviewedProfiles.filter(d=>d.id===incoming.id&&used.some(row=>row.profileId===d.id&&row.profileVersion===d.version)))await retain(definition);
  if(printerId){
   const p=await db.printers.get(printerId);
   if(!p||p.archived||p.manufacturer!==incoming.manufacturer||p.model!==incoming.model||p.technology!==incoming.technology)throw Error('This profile does not support the selected printer model and technology.');
   const existing=await db.tasks.where('printerId').equals(p.id).toArray();
   const ids=new Set(incoming.templates.map(t=>t.templateId||t.title));
   if(options.templates?.some(id=>!ids.has(id))||Object.keys(options.selections||{}).some(id=>!ids.has(id)))throw Error('Unknown template selection.');
   for(const template of incoming.templates){
    const templateId=template.templateId||template.title;
    if(options.templates&&!options.templates.includes(templateId))continue;
    if(matchingTask(template,existing,incoming.id))continue;
    const selection=options.selections?.[templateId]||'';
    if(template.scheduleKind==='usage-dependent'&&!selection)continue;
    const selected=selectTemplate(template,selection);
    const addition=taskSchema.parse({...selected,id:uid(),printerId:p.id,profileId:incoming.id,profileVersion:incoming.version,templateId,anchorDate:today(),anchorHours:p.hours,anchorPrints:p.prints});
    if(addition.source==='Manufacturer Verified'&&!automaticTemplate(addition,p))throw Error('Only reviewed compatible intervals can be activated.');
    await db.tasks.add(addition);existing.push(addition);
   }
   await db.printers.update(p.id,{profileId:incoming.id,profileVersion:incoming.version});
  }
  await retain(incoming);
  await db.profiles.put(incoming);
 });
}
export async function deleteInventory(id:string){return db.transaction('rw',[db.inventory,db.logs],async()=>{if(await db.logs.filter(l=>l.inventoryId===id).count())throw Error('This item is referenced by maintenance history and must be retained. Set available quantity to zero instead.');await db.inventory.delete(id);});}
export function download(name:string,content:string,type='application/json'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(rows:(string|number)[][]){return '\ufeff'+rows.map(r=>r.map(x=>'"'+String(x).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');}

export async function flagSource(url:string){
 if(!safeUrl(url))throw Error('Source must use HTTP or HTTPS.');
 return db.transaction('rw',db.preferences,async()=>{const prefs=await db.preferences.get('preferences')??defaults;const flags=prefs.sourceFlags||[];if(!flags.some(f=>f.url===url))await db.preferences.put({...prefs,sourceFlags:[...flags,{url,date:today(),reason:'Owner reports unavailable or changed source; review required.'}]});});
}
