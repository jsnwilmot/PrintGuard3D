import {db} from './db';
import {defaults,today,uid} from './domain';
import {hasAcknowledgment} from './safety';
import {observationFacts,observationSchema,observationLimits,unchangedObservation,type Observation} from './observations';

export async function collectObservations(source:Observation['source'],start=false){
 return db.transaction('rw',[db.preferences,db.printers,db.tasks,db.observations],async()=>{
  const prefs=await db.preferences.get('preferences')??defaults;
  if(!hasAcknowledgment(prefs))throw Error('Current disclaimer acknowledgment is required before recording observed history.');
  if(!start&&!prefs.observationRecording)return {added:0,warning:''};
  const printers=await db.printers.toArray(),tasks=await db.tasks.toArray();
  if(printers.length>observationLimits.printers||tasks.length>observationLimits.tasks)return {added:0,warning:'Observation coverage limit reached. No new history was recorded or removed. Export a backup for review.'};
  const instant=new Date(),observedAt=instant.toISOString(),utcDay=observedAt.slice(0,10),localDate=today(),timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',offset=-instant.getTimezoneOffset(),batchId=uid();
  const existing=await db.observations.toArray();const additions:Observation[]=[];
  for(const printer of printers){
   const history=existing.filter(row=>row.printerId===printer.id).sort((a,b)=>a.observedAt.localeCompare(b.observedAt));
   const previous=history.at(-1),facts=observationFacts(printer,tasks,localDate,prefs.reminderDays);
   if(previous&&previous.observedAt.slice(0,10)===utcDay&&unchangedObservation(previous,facts,timezone,offset))continue;
   if(history.some(row=>row.observedAt===observedAt))continue;
   if(history.filter(row=>row.observedAt.startsWith(utcDay)).length>=observationLimits.perPrinterDay||existing.length+additions.length>=observationLimits.records)return {added:0,warning:'Observation storage limit reached. Existing history is retained; new points are not recorded. Export a backup for review.'};
   additions.push(observationSchema.parse({version:1,id:`${batchId}:${encodeURIComponent(printer.id)}`,batchId,printerId:printer.id,observedAt,timezone,utcOffsetMinutes:offset,source,...facts}));
  }
  if(start)await db.preferences.put({...prefs,observationRecording:true});
  await db.observations.bulkAdd(additions);
  return {added:additions.length,warning:''};
 });
}
export async function pauseObservations(){
 return db.transaction('rw',db.preferences,async()=>{const prefs=await db.preferences.get('preferences')??defaults;if(!hasAcknowledgment(prefs))throw Error('Current acknowledgment is required.');await db.preferences.put({...prefs,observationRecording:false});});
}
