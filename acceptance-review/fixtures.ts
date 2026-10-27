import 'fake-indexeddb/auto';
import {db} from '../src/db';
import {printerSchema,taskSchema,defaults,type Printer,type Task,type Log,type Profile} from '../src/domain';
import {bundled} from '../src/profiles';
export const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=';
export function printer(id='p1',overrides:Partial<Printer>={}):Printer{return printerSchema.parse({id,name:`Review printer ${id}`,manufacturer:'FlashForge',model:'Creator 5',technology:'FDM/FFF',serial:`SN-${id}`,location:'ISOLATED TEST FIXTURE',purchaseDate:'2025-12-01',installed:'2026-01-01',hours:100,prints:10,firmware:'test',notes:'Not a live user record',image:photo,profileId:'flashforge-creator-5',profileVersion:'1.0.0',archived:false,created:'2026-01-01',...overrides});}
export function task(id='t1',printerId='p1',overrides:Partial<Task>={}):Task{return taskSchema.parse({...bundled[0].templates[0],id,printerId,anchorDate:'2026-01-01',anchorHours:100,anchorPrints:10,...overrides});}
export const input=(extra:Record<string,unknown>={})=>({date:'2026-02-01',hours:600,prints:20,notes:'Reviewed isolated completion',cost:12.5,minutes:15,materials:'Grease',image:photo,inventoryId:'',quantity:0,...extra});
export function log(id='l1',extra:Partial<Log>={}):Log{return {id,taskId:'t1',printerId:'p1',title:'Historical lubrication',date:'2026-02-01',hours:600,prints:20,outcome:'Completed',notes:'Historical work',cost:12.5,minutes:15,materials:'Grease',image:photo,onTime:true,dueDate:'',sourceUrl:bundled[0].templates[0].sourceUrl,source:'Manufacturer Verified',skippedCycles:0,inventoryId:'',quantity:0,...extra};}
export async function empty(){await db.transaction('rw',db.tables,async()=>{for(const table of db.tables)await table.clear();});}
export async function seed(){
 const ps=[printer('p1'),printer('p2'),printer('p3',{manufacturer:'Custom',model:'Custom Resin',technology:'Resin',profileId:'custom-resin',profileVersion:'2.0.0',hours:5,prints:3})];
 const ts=[task('t1'),task('t2','p2'),task('weekly','p1',{title:'Custom weekly inspection',interval:{mode:'calendar',days:7},originalInterval:{mode:'calendar',days:7},source:'User Defined'}),task('prints','p3',{title:'Resin user inspection',interval:{mode:'prints',prints:5},originalInterval:{mode:'prints',prints:5},source:'User Defined',sourceUrl:'',anchorHours:5,anchorPrints:3}),task('condition','p3',{title:'Observed condition',interval:{mode:'condition'},originalInterval:{mode:'condition'},source:'User Defined',sourceUrl:'',anchorHours:5,anchorPrints:3})];
 await db.printers.bulkAdd(ps);await db.tasks.bulkAdd(ts);
 await db.inventory.bulkAdd([{id:'common',name:'Common supply',partNumber:'GEN',manufacturer:'Custom',printerId:'',quantity:9,minimum:2,unitCost:1.5,supplier:'Test',notes:'Shared'},{id:'part',name:'Printer-specific part',partNumber:'P2',manufacturer:'Custom',printerId:'p2',quantity:3,minimum:1,unitCost:5,supplier:'Test',notes:'Specific'}]);
 await db.repairs.add({id:'repair',printerId:'p2',title:'Test repair',date:'2026-01-10',description:'Isolated fixture',component:'Test component',severity:'High',status:'Awaiting Parts',notes:'Test diagnosis',parts:'P2',cost:23.4,resolved:'',image:photo});
 const custom:Profile={...bundled[0],id:'custom-resin',manufacturer:'Custom',model:'Custom Resin',technology:'Resin',version:'2.0.0',status:'Pending Verification',templates:[],revisions:['2.0.0 isolated fixture']};
 await db.profiles.bulkAdd([bundled[0],custom]);await db.preferences.put({...defaults,theme:'dark',currency:'USD',acknowledgment:{version:'1.0',date:'2026-01-01'},lastBackup:'2026-01-01'});
 return {ps,ts};
}
