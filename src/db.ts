import Dexie,{type Table} from 'dexie';
import { z } from 'zod';
import {printerSchema,taskSchema,logSchema,readingSchema,inventorySchema,repairSchema,profileSchema,preferencesSchema,dateSchema,type Printer,type Task,type Log,type Reading,type Inventory,type Repair,type Profile,type Preferences,defaults,today,uid} from './domain';
import {advance,status,due,rebaseTaskEdit} from './engine';
import {assertGraph,graphIssues,recordTables,sameRecord,activityIdentity,type RecordGraph} from './integrity';
import {reviewTask,reviewProfile,assessProfile,profileArchiveId,bundled,isVerifiedTask} from './profiles';
export class PrintGuardDB extends Dexie{
 printers!:Table<Printer,string>;tasks!:Table<Task,string>;logs!:Table<Log,string>;readings!:Table<Reading,string>;inventory!:Table<Inventory,string>;repairs!:Table<Repair,string>;profiles!:Table<Profile,string>;preferences!:Table<Preferences,string>;
 constructor(name='PrintGuard3D'){super(name);this.version(1).stores({printers:'id,manufacturer,archived',tasks:'id,printerId',logs:'id,printerId,taskId,date',readings:'id,printerId,date',inventory:'id,printerId',repairs:'id,printerId,status',profiles:'id',preferences:'id'});}
}
export const db=new PrintGuardDB();
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
export const backupSchema=z.object({application:z.literal('PrintGuard3D'),schemaVersion:z.literal(1),exportedAt:z.string(),scope:z.enum(['full','printer']),printers:z.array(printerSchema),tasks:z.array(taskSchema),logs:z.array(logSchema),readings:z.array(readingSchema),inventory:z.array(inventorySchema),repairs:z.array(repairSchema),profiles:z.array(profileSchema),preferences:preferencesSchema.optional()}).strict();
export type Backup=z.infer<typeof backupSchema>;
export async function makeBackup(printerId?:string):Promise<Backup>{
 const byPrinter=<T extends {printerId:string}>(rows:T[])=>printerId?rows.filter(x=>x.printerId===printerId):rows;
 return db.transaction('r',db.tables,async()=>({application:'PrintGuard3D',schemaVersion:1,exportedAt:new Date().toISOString(),scope:printerId?'printer':'full',printers:(await db.printers.toArray()).filter(x=>!printerId||x.id===printerId),tasks:byPrinter(await db.tasks.toArray()),logs:byPrinter(await db.logs.toArray()),readings:byPrinter(await db.readings.toArray()),inventory:(await db.inventory.toArray()).filter(x=>!printerId||!x.printerId||x.printerId===printerId),repairs:byPrinter(await db.repairs.toArray()),profiles:await db.profiles.toArray(),preferences:await db.preferences.get('preferences')??defaults}));
}
export function validateBackup(value:unknown):Backup{
 if(value&&typeof value==='object'&&'schemaVersion' in value&&value.schemaVersion!==1)throw Error('This backup uses an unsupported schema. Version 1 is supported; newer versions require an application update.');
 const b=backupSchema.parse(value);
 assertGraph(b);
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
   if(old){preview.duplicates++;if(!sameRecord(old,row)){
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
export async function previewBackup(value:unknown,replace=false):Promise<ImportPreview>{const b=validateBackup(value);return db.transaction('r',db.tables,async()=>importPlan(b,await readGraph(),replace).preview);}
export async function restoreBackup(value:Backup,replace:boolean){
 const b=validateBackup(value);await db.transaction('rw',db.tables,async()=>{
 const {preview}=importPlan(b,await readGraph(),replace);
 if(preview.conflicts.length)throw Error(`Import rejected. No records changed.\n${preview.conflicts.join('\n')}`);
 if(replace)for(const t of db.tables)await t.clear();
 for(const key of recordTables){const table=db.table(key);for(const row of b[key])if(replace||!await table.get(row.id))await table.add(row);}
 // Imported legal acknowledgments never replace acknowledgment on this device.
 const current=await db.preferences.get('preferences');await db.preferences.put({...defaults,...(replace?b.preferences:current),acknowledgment:current?.acknowledgment??null,id:'preferences'});
 });
}
export function historySnapshot(t:Task,p:Printer,currency:string){
 const profileId=t.profileId||(t.profileVersion===p.profileVersion?p.profileId:bundled.find(b=>b.manufacturer===p.manufacturer&&b.model===p.model&&b.technology===p.technology&&b.version===t.profileVersion)?.id)||'';
 return {category:t.category,priority:t.priority,profileId,profileVersion:t.profileVersion,templateId:t.templateId,manufacturer:p.manufacturer,model:p.model,technology:p.technology,currency};
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
  if(additions.some(t=>t.printerId!==p.id||!isVerifiedTask(t,p)))throw Error('Automatic schedules require reviewed procedures for this exact printer.');
  const reading=readingSchema.parse({id:uid(),printerId:p.id,date:today(),hours:p.hours,prints:p.prints});
  const g=await readGraph();g.printers=[...g.printers.filter(x=>x.id!==p.id),p];g.tasks.push(...additions);g.readings.push(reading);assertGraph(g);
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
 return db.transaction('rw',[db.repairs,db.printers],async()=>{
  if(!await db.printers.get(r.printerId))throw Error('Repair references a missing printer.');
  const old=await db.repairs.get(r.id);if(old&&old.printerId!==r.printerId)throw Error('An existing repair must retain its printer. Create a separate repair record.');
  await db.repairs.put(r);
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
  let t=rebaseTaskEdit(parsed,old);
  if(old&&old.printerId!==t.printerId)t={...t,source:'User Defined',profileId:'',profileVersion:'',templateId:'',verified:''};
  else if(t.source==='Manufacturer Verified'&&!isVerifiedTask(t,p))t={...t,source:old?'User Defined':'Pending Verification'};
  assertGraph({printers:await db.printers.toArray(),tasks:[t],logs,readings:[],inventory:await db.inventory.toArray(),repairs:[],profiles:await db.profiles.toArray()});
  // Stock references in old history are validated by imports/completion; editing never rewrites those rows.
  await db.tasks.put(t);return t;
 });
}
export async function installProfile(value:Profile,printerId=''){
 const incoming=reviewProfile(value);if(incoming.profileId||incoming.id.startsWith('version:'))throw Error('Install a profile package, not an archived or reserved definition.');
 return db.transaction('rw',[db.profiles,db.printers,db.tasks],async()=>{
  const current=await db.profiles.get(incoming.id)||bundled.find(p=>p.id===incoming.id);
  const archiveId=profileArchiveId(incoming.id,incoming.version);const archived=await db.profiles.get(archiveId);
  if(archived&&!sameRecord({...archived,id:incoming.id,profileId:undefined},incoming))throw Error('This profile version already has a different immutable definition. Use a new version.');
  if(current&&current.version===incoming.version&&!sameRecord(assessProfile(current),incoming))throw Error('A profile version cannot be overwritten with different content. Use a new version.');
  if(current&&current.version!==incoming.version){const id=profileArchiveId(incoming.id,current.version);if(!await db.profiles.get(id))await db.profiles.add({...current,id,profileId:incoming.id});}
  if(printerId){
   const p=await db.printers.get(printerId);if(!p||p.archived||p.manufacturer!==incoming.manufacturer||p.model!==incoming.model||p.technology!==incoming.technology)throw Error('This profile does not support the selected printer model and technology.');
   const existing=await db.tasks.where('printerId').equals(p.id).toArray();
   for(const template of incoming.templates){const templateId=template.templateId||template.title;
    if(!existing.some(t=>t.templateId===templateId||(!t.templateId&&t.title===template.title)))await db.tasks.add({...template,id:uid(),printerId:p.id,profileId:incoming.id,profileVersion:incoming.version,templateId,anchorDate:today(),anchorHours:p.hours,anchorPrints:p.prints});
   }
   await db.printers.update(p.id,{profileId:incoming.id,profileVersion:incoming.version});
  }
  await db.profiles.put(incoming);
 });
}
export async function deleteInventory(id:string){return db.transaction('rw',[db.inventory,db.logs],async()=>{if(await db.logs.filter(l=>l.inventoryId===id).count())throw Error('This item is referenced by maintenance history and must be retained. Set available quantity to zero instead.');await db.inventory.delete(id);});}
export function download(name:string,content:string,type='application/json'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(rows:(string|number)[][]){return '\ufeff'+rows.map(r=>r.map(x=>'"'+String(x).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');}
