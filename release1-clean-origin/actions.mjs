export const actions=['acknowledgment','completion','postpone','printer','task','inventory','repair','profile','suggestion','source','delete-inventory','notes','pause-rule','archive','usage','cascade-delete','preferences','export-timestamp','observations','pause-observations','restore-merge','restore-replace'];
// Real production functions/Dexie transactions, transformed into a test-only
// executable probe. No mock completion, restore, writer or observation code.
export async function mutate(page,action,generation=1){return page.evaluate(async({action,generation})=>{
 const {api,observations}=await import('/probe'+generation+'.js');const {db}=api;await db.open();
 const b=await api.makeBackup(),p=b.printers.find(p=>p.id==='p1'),t=b.tasks.find(t=>t.id==='t1');
 const date=new Date().toISOString().slice(0,10);
 const item={id:'guard-new-item',name:'Synthetic guard part',partNumber:'',manufacturer:'',printerId:'',quantity:2,minimum:1,unitCost:2,supplier:'',notes:''};
 const work={acknowledgment:()=>api.acknowledgeDisclaimer(),
 completion:()=>api.completeTask(t.id,{date,hours:p.hours+500,prints:p.prints+10,notes:'Synthetic compatibility completion',cost:12.5,minutes:10,materials:'Synthetic',image:p.image,inventoryId:'',quantity:0}),
 postpone:()=>api.postponeTask(t.id,'2400-01-01','Synthetic postponement'),
 printer:()=>api.savePrinter({...p,id:'guard-new-printer',name:'Synthetic new printer',serial:'guard-unique-serial'}),
 task:()=>api.saveTask({...t,id:'guard-new-task',source:'User Defined',profileId:'',profileVersion:'',templateId:'',recommendation:undefined}),
 inventory:()=>api.saveInventory(item),
 repair:()=>api.saveRepair({id:'guard-new-repair',printerId:p.id,title:'Synthetic repair',date,description:'',component:'',severity:'Low',status:'Open',notes:'',parts:'',cost:1,resolved:'',image:p.image}),
 profile:()=>api.installProfile({...b.profiles.find(p=>!p.profileId),id:'guard-new-profile',status:'Pending Verification',version:'4.0.0'}),
 suggestion:()=>api.acceptReviewReminder(p.id,{group:'fan',dailyHours:5,custom:false,basis:'manual',printingCounterConfirmed:false,acknowledged:true}),
 source:()=>api.flagSource('https://example.com/synthetic-unavailable'),
 'delete-inventory':()=>api.deleteInventory('part'),
 notes:()=>db.tasks.update(t.id,{notes:'Synthetic changed notes'}),
 'pause-rule':()=>db.tasks.update(t.id,{enabled:false}),
 archive:()=>db.printers.update(p.id,{archived:true}),
 usage:()=>db.transaction('rw',[db.printers,db.readings],async()=>{await db.printers.update(p.id,{hours:p.hours+10,prints:p.prints+1});await db.readings.add({id:'guard-new-reading',printerId:p.id,date,hours:p.hours+10,prints:p.prints+1});}),
 'cascade-delete':()=>db.transaction('rw',db.tables,async()=>{await db.printers.delete(p.id);for(const key of ['tasks','logs','readings','repairs'])await db.table(key).where('printerId').equals(p.id).delete();await db.inventory.where('printerId').equals(p.id).modify({printerId:''});}),
 preferences:()=>db.preferences.update('preferences',{target:71}),
 'export-timestamp':()=>db.preferences.update('preferences',{lastBackup:date}),
 observations:()=>observations.collectObservations('manual observation',true),
 'pause-observations':()=>observations.pauseObservations(),
 'restore-merge':()=>api.restoreBackup({...b,inventory:[...b.inventory,item]},false),
 'restore-replace':()=>api.restoreBackup({...b,preferences:{...b.preferences,target:72}},true)
 };
 try{await work[action]();return {accepted:true};}catch(e){return {accepted:false,name:e.name,message:e.message};}
},{action,generation});}
