import Dexie,{type Table} from 'dexie';
import { z } from 'zod';
import {printerSchema,taskSchema,logSchema,readingSchema,inventorySchema,repairSchema,profileSchema,preferencesSchema,type Printer,type Task,type Log,type Reading,type Inventory,type Repair,type Profile,type Preferences,defaults,today,uid} from './domain';
import {advance,status,due} from './engine';
export class PrintGuardDB extends Dexie{
 printers!:Table<Printer,string>;tasks!:Table<Task,string>;logs!:Table<Log,string>;readings!:Table<Reading,string>;inventory!:Table<Inventory,string>;repairs!:Table<Repair,string>;profiles!:Table<Profile,string>;preferences!:Table<Preferences,string>;
 constructor(name='PrintGuard3D'){super(name);this.version(1).stores({printers:'id,manufacturer,archived',tasks:'id,printerId',logs:'id,printerId,taskId,date',readings:'id,printerId,date',inventory:'id,printerId',repairs:'id,printerId,status',profiles:'id',preferences:'id'});}
}
export const db=new PrintGuardDB();
export async function completeTask(id:string,input:Pick<Log,'date'|'hours'|'prints'|'notes'|'cost'|'minutes'|'materials'|'image'|'inventoryId'|'quantity'>,outcome:'Completed'|'Skipped'='Completed'){
 await db.transaction('rw',[db.tasks,db.printers,db.logs,db.readings,db.inventory],async()=>{
 const t=await db.tasks.get(id);if(!t||!t.enabled)throw Error('This task has already been completed or removed.');
 const p=await db.printers.get(t.printerId);if(!p||p.archived)throw Error('Restore the printer before recording maintenance.');
 if(input.date>today())throw Error('A completion cannot be dated in the future.');
 if(input.date<t.anchorDate)throw Error('Completion cannot precede the current maintenance baseline.');
 if(input.hours<p.hours||input.prints<p.prints)throw Error('Usage readings cannot decrease. Use current cumulative readings.');
 if(input.inventoryId){const item=await db.inventory.get(input.inventoryId);if(!item||input.quantity<=0||item.quantity<input.quantity)throw Error('Check the available inventory and quantity consumed.');await db.inventory.update(item.id,{quantity:item.quantity-input.quantity});}
 const next=advance(t,input.date,input.hours,input.prints);const s=status(t,{...p,hours:input.hours,prints:input.prints},input.date,0);
 await db.logs.add({id:uid(),printerId:p.id,taskId:t.id,title:t.title,...input,outcome,onTime:s!=='Overdue',dueDate:due(t).date,sourceUrl:t.sourceUrl,source:t.source,skippedCycles:next.skippedCycles});
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
 for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles'] as const){const ids=b[key].map(x=>x.id);if(new Set(ids).size!==ids.length)throw Error(`Duplicate identifiers in ${key}.`);}
 const printers=new Set(b.printers.map(p=>p.id));const tasks=new Set(b.tasks.map(t=>t.id));
 for(const row of [...b.tasks,...b.logs,...b.readings,...b.repairs])if(!printers.has(row.printerId))throw Error('Backup references a printer that is missing.');
 for(const log of b.logs)if(!tasks.has(log.taskId))throw Error('Backup references a maintenance rule that is missing.');
 for(const item of b.inventory)if(item.printerId&&!printers.has(item.printerId))throw Error('An inventory item references a missing printer.');
 return b;
}
export async function restoreBackup(b:Backup,replace:boolean){
 validateBackup(b);await db.transaction('rw',db.tables,async()=>{
 if(replace)for(const t of db.tables)await t.clear();
 for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles'] as const){const table=db.table(key);for(const row of b[key])if(replace||!await table.get(row.id))await table.put(row);}
 // Imported legal acknowledgments never replace acknowledgment on this device.
 const current=await db.preferences.get('preferences');await db.preferences.put({...defaults,...(replace?b.preferences:current),acknowledgment:current?.acknowledgment??null,id:'preferences'});
 });
}
export function download(name:string,content:string,type='application/json'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(rows:(string|number)[][]){return '\ufeff'+rows.map(r=>r.map(x=>'"'+String(x).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n');}
