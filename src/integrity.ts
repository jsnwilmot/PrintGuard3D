import {today,type Printer,type Task,type Log,type Reading,type Inventory,type Repair,type Profile} from './domain';
import {profileArchiveId,profileIdentity,bundled} from './profiles';

export const recordTables=['printers','tasks','logs','readings','inventory','repairs','profiles'] as const;
export type RecordTable=typeof recordTables[number];
export interface RecordGraph {printers:Printer[];tasks:Task[];logs:Log[];readings:Reading[];inventory:Inventory[];repairs:Repair[];profiles:Profile[];}
export const sameRecord=(a:unknown,b:unknown):boolean=>{
 if(a===b)return true;
 if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
 const left=a as Record<string,unknown>,right=b as Record<string,unknown>;
 const keys=Object.keys(left).filter(k=>left[k]!==undefined).sort();
 return keys.join('\0')===Object.keys(right).filter(k=>right[k]!==undefined).sort().join('\0')&&keys.every(k=>sameRecord(left[k],right[k]));
};
function stableJson(value:unknown):string{
 if(Array.isArray(value))return '['+value.map(stableJson).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stableJson(v)).join(',')+'}';
 return JSON.stringify(value);
}
export function activityIdentity(value:Omit<Log,'id'>|Log){const {id,...body}=value as Log;return stableJson(body);}
function grouped<T extends {printerId:string}>(rows:T[]){const groups=new Map<string,T[]>();for(const row of rows){const group=groups.get(row.printerId)||[];group.push(row);groups.set(row.printerId,group);}return groups;}
export function graphIssues(g:RecordGraph):string[]{
 const issues:string[]=[];const ps=new Map(g.printers.map(p=>[p.id,p]));const ts=new Map(g.tasks.map(t=>[t.id,t]));const stock=new Map(g.inventory.map(i=>[i.id,i]));
 const issue=(table:string,id:string,message:string)=>issues.push(`${table} ${id}: ${message}`);
 for(const key of recordTables){const seen=new Set<string>();for(const row of g[key]){if(!row.id.trim())issue(key,row.id,'An identifier cannot be empty.');if(seen.has(row.id))issue(key,row.id,`Duplicate identifiers in ${key}.`);seen.add(row.id);}}
 for(const row of [...g.tasks,...g.logs,...g.readings,...g.repairs])if(!ps.has(row.printerId))issue('Record',row.id,'References a printer that is missing.');
 for(const i of g.inventory)if(i.printerId&&!ps.has(i.printerId))issue('Inventory',i.id,'References a printer that is missing.');
 for(const l of g.logs){
  const t=ts.get(l.taskId);if(!t)issue('History',l.id,'References a maintenance rule that is missing.');else if(t.printerId!==l.printerId)issue('History',l.id,'Maintenance rule belongs to a different printer.');
  if(l.inventoryId){const i=stock.get(l.inventoryId);if(!i)issue('History',l.id,'References inventory that is missing.');else if(i.printerId&&i.printerId!==l.printerId)issue('History',l.id,'Inventory belongs to a different printer.');if(l.quantity<=0)issue('History',l.id,'Inventory consumption must be positive.');}
  else if(l.quantity!==0)issue('History',l.id,'Consumption requires an inventory reference.');
 }
 const taskLogs=new Map<string,Log[]>();for(const l of g.logs){const logs=taskLogs.get(l.taskId)||[];logs.push(l);taskLogs.set(l.taskId,logs);}
 const definitionsAvailable=new Set([...g.profiles,...bundled].map(p=>profileArchiveId(profileIdentity(p),p.version)));
 for(const l of g.logs)if(l.profileId&&!definitionsAvailable.has(profileArchiveId(l.profileId,l.profileVersion||'')))issue('History',l.id,'References a profile version that is missing.');
 for(const p of g.printers)if(p.profileId&&!definitionsAvailable.has(profileArchiveId(p.profileId,p.profileVersion)))issue('Printer',p.id,'References a profile version that is missing.');
 for(const t of g.tasks){const p=ps.get(t.printerId);if(!p)continue;
  if(t.profileId&&!definitionsAvailable.has(profileArchiveId(t.profileId,t.profileVersion)))issue('Task',t.id,'References a profile version that is missing.');
  if(t.anchorHours>p.hours||t.anchorPrints>p.prints)issue('Task',t.id,'Baseline exceeds current recorded printer usage.');
  if(t.interval.mode!=='once'&&t.base==='completion'&&t.anchorDate>today())issue('Task',t.id,'A service baseline cannot be in the future.');
  for(const l of (taskLogs.get(t.id)||[]).filter(l=>l.outcome!=='Postponed')){
   if(t.anchorHours<l.hours||t.anchorPrints<l.prints)issue('Task',t.id,`Baseline precedes completed usage in history ${l.id}.`);
   if(t.base==='completion'&&t.interval.mode!=='once'&&t.anchorDate<l.date)issue('Task',t.id,`Baseline precedes completed history ${l.id}.`);
  }
 }
 const usage=grouped<Reading|Log>([...g.readings,...g.logs]);
 for(const p of g.printers){
  const events=(usage.get(p.id)||[]).sort((a,b)=>a.date.localeCompare(b.date));
  let earlierHours=0,earlierPrints=0,day='',dayHours=0,dayPrints=0;
  for(const e of events){
   if(e.date!==day){earlierHours=dayHours;earlierPrints=dayPrints;day=e.date;}
   if(e.date>today()||e.date<p.installed)issue('Usage/history',e.id,'Date is outside the recorded operating period.');
   if(e.hours>p.hours||e.prints>p.prints)issue('Usage/history',e.id,'Reading exceeds current recorded printer usage.');
   if(e.hours<earlierHours||e.prints<earlierPrints)issue('Usage/history',e.id,'Cumulative readings cannot decrease across dates.');
   dayHours=Math.max(dayHours,e.hours);dayPrints=Math.max(dayPrints,e.prints);
  }
 }
 const seenLogs=new Set<string>();
 for(const l of g.logs){const fingerprint=activityIdentity(l);if(seenLogs.has(fingerprint))issue('History',l.id,'Duplicate maintenance activity with another identifier.');seenLogs.add(fingerprint);}
 const definitions=new Map<string,Profile>();
 for(const p of g.profiles){
  const key=profileArchiveId(profileIdentity(p),p.version);
  if((p.profileId&&p.id!==key)||(!p.profileId&&p.id.startsWith('version:')))issue('Profile',p.id,'Invalid archived definition identity.');
  const normalized={...p,id:profileIdentity(p),profileId:undefined};const old=definitions.get(key);
  if(old&&!sameRecord(old,normalized))issue('Profile',p.id,'Conflicting definitions for the same profile version.');definitions.set(key,normalized);
 }
 return issues;
}
export function assertGraph(g:RecordGraph){const issues=graphIssues(g);if(issues.length)throw Error(issues.join('\n'));}
