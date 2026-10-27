import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {empty,seed,printer,task,input,log} from '../acceptance-review/fixtures';
import {db,makeBackup,validateBackup,previewBackup,restoreBackup,completeTask,saveTask,savePrinter,saveInventory,saveRepair,installProfile,postponeTask,deleteInventory} from '../src/db';
import {bundled,reviewProfile,reviewTask,findProfile,profileArchiveId} from '../src/profiles';
import {due,advance,occurrences} from '../src/engine';
import {readFileSync} from 'node:fs';

beforeEach(empty);afterEach(()=>vi.restoreAllMocks());
async function unchanged(before:Awaited<ReturnType<typeof makeBackup>>){const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles','preferences'] as const)expect(after[key]).toEqual(before[key]);}
async function completed(){await seed();await completeTask('t1',input({inventoryId:'common',quantity:1}));return makeBackup();}

it('P01: rejects mismatched log/task ownership for identical models before replacement',async()=>{
 const before=await completed();const bad=structuredClone(before);bad.logs[0].printerId='p2';
 await expect(restoreBackup(bad,true)).rejects.toThrow('different printer');await unchanged(before);
});
it('P02: destination task identity conflict blocks preview and atomic merge',async()=>{
 await db.printers.add(printer('p1'));await db.tasks.add(task('collision','p1'));const before=await makeBackup();
 const incoming={...before,printers:[printer('p2')],tasks:[task('collision','p2')],logs:[]};
 const preview=await previewBackup(incoming);expect(preview.conflicts.join(' ')).toContain('ownership');
 await expect(restoreBackup(incoming,false)).rejects.toThrow('No records changed');await unchanged(before);
});
it('P03: printer model/technology collisions cannot change retained identities',async()=>{
 await seed();const before=await makeBackup();const incoming=structuredClone(before);incoming.printers[0].technology='Resin';
 expect((await previewBackup(incoming)).conflicts.join(' ')).toContain('identity');
 await expect(restoreBackup(incoming,false)).rejects.toThrow();await unchanged(before);
});
it('P04: conflicting history identifiers never overwrite existing completion snapshots',async()=>{
 const before=await completed();const incoming=structuredClone(before);incoming.logs[0].sourceUrl='https://example.com/changed';incoming.logs[0].notes='Changed history';
 await expect(restoreBackup(incoming,false)).rejects.toThrow('historical');await unchanged(before);
});
it('P05: same-file repeated merge is idempotent across every store',async()=>{
 const before=await completed();await restoreBackup(before,false);await restoreBackup(before,false);await unchanged(before);
});
it('P06: matching mutable printer values are disclosed and deliberately retained',async()=>{
 await seed();const before=await makeBackup();const incoming=structuredClone(before);incoming.printers[0].name='Incoming name';
 const preview=await previewBackup(incoming);expect(preview.conflicts).toEqual([]);expect(preview.retained.join(' ')).toContain('printers p1');
 await restoreBackup(incoming,false);await unchanged(before);
});
it('P07: resulting merge graph rejects new history above retained usage',async()=>{
 await seed();const before=await makeBackup();await completeTask('t1',input());const incoming=await makeBackup();await restoreBackup(before,true);
 await expect(restoreBackup(incoming,false)).rejects.toThrow('exceeds current');await unchanged({...before,preferences:{...before.preferences!,acknowledgment:null}});
});
it('P08: malformed, duplicate, empty-ID and missing-printer records leave all data intact',async()=>{
 const before=await completed();const cases=[{...before,schemaVersion:99},{...before,printers:[]},{...before,tasks:[...before.tasks,before.tasks[0]]},{...before,repairs:[{...before.repairs[0],printerId:'missing'}]},{...before,tasks:[{...before.tasks[0],id:''}]}];
 for(const bad of cases){await expect(restoreBackup(bad as typeof before,true)).rejects.toThrow();await unchanged(before);}
});
it('P09: missing or incompatible consumed inventory is rejected',async()=>{
 const before=await completed();for(const id of ['missing','part']){const bad=structuredClone(before);bad.logs[0].inventoryId=id;expect(()=>validateBackup(bad)).toThrow();}await unchanged(before);
});
it('P10: imported readings cannot decrease chronologically or exceed current usage',async()=>{
 await seed();const before=await makeBackup();for(const readings of [[{id:'a',printerId:'p1',date:'2026-01-03',hours:101,prints:10}],[{id:'a',printerId:'p1',date:'2026-01-03',hours:90,prints:9},{id:'b',printerId:'p1',date:'2026-01-04',hours:80,prints:9}]])expect(()=>validateBackup({...before,readings})).toThrow();await unchanged(before);
});
it('P11: impossible baselines and completion dates are rejected',async()=>{
 const before=await completed();for(const change of [{anchorHours:601},{anchorHours:0},{anchorPrints:21},{anchorDate:'2099-01-01'}])expect(()=>validateBackup({...before,tasks:before.tasks.map(t=>t.id==='t1'?{...t,...change}:t)})).toThrow();
 const bad=structuredClone(before);bad.logs[0].date='2025-01-01';expect(()=>validateBackup(bad)).toThrow('operating period');await unchanged(before);
});
it('P12: duplicate maintenance content under a new ID is rejected without doubling costs',async()=>{
 const before=await completed();expect(()=>validateBackup({...before,logs:[...before.logs,{...before.logs[0],id:'duplicate'}]})).toThrow('Duplicate maintenance');await unchanged(before);
});
it('P13: interrupted replacement rolls back table clearing and partial writes',async()=>{
 const before=await completed();const incoming=structuredClone(before);incoming.printers[0].name='Must roll back';
 const fail=()=>{throw Error('Injected transaction interruption');};db.logs.hook('creating',fail);
 try{await expect(restoreBackup(incoming,true)).rejects.toThrow('Injected');}finally{db.logs.hook('creating').unsubscribe(fail);}await unchanged(before);
});
it('P14: interrupted merge rolls back earlier newly inserted rows',async()=>{
 await seed();const before=await makeBackup();const incoming={...before,printers:[printer('p4')],tasks:[task('t4','p4')],logs:[],readings:[],inventory:[],repairs:[]};
 const fail=()=>{throw Error('Injected merge interruption');};db.tasks.hook('creating',fail);
 try{await expect(restoreBackup(incoming,false)).rejects.toThrow('Injected');}finally{db.tasks.hook('creating').unsubscribe(fail);}await unchanged(before);
});
it('P15: stale preview cannot bypass commit-time graph validation',async()=>{
 await seed();const incoming=await makeBackup();expect((await previewBackup(incoming)).conflicts).toEqual([]);
 await db.tasks.update('t1',{printerId:'p2'});const before=await makeBackup();await expect(restoreBackup(incoming,false)).rejects.toThrow('ownership');await unchanged(before);
});
it('P16: full and printer-only roundtrips preserve three printers, custom schedules, repairs, stock, photos and history',async()=>{
 await completed();await completeTask('t2',input({hours:650,prints:22,date:'2026-03-01'}));await completeTask('weekly',input({date:'2026-03-02'}));
 for(const id of [undefined,'p2']){const before=validateBackup(JSON.parse(JSON.stringify(await makeBackup(id))));await empty();await restoreBackup(before,true);const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles'] as const)expect(after[key]).toEqual(before[key]);expect(after.preferences).toEqual({...before.preferences,acknowledgment:null});if(!id)expect(occurrences(after.tasks.find(t=>t.id==='weekly')!,'2035-01-01','2200-01-31').length).toBeGreaterThan(8000);}
});
it('P17: verified FDM task reassignment to resin explicitly becomes user defined',async()=>{
 await seed();const old=(await db.tasks.get('t1'))!;const saved=await saveTask({...old,printerId:'p3',anchorHours:5,anchorPrints:3},old);
 expect(saved.source).toBe('User Defined');expect(saved.profileVersion).toBe('');expect(saved.verified).toBe('');expect(saved.sourceUrl).toBe(old.sourceUrl);
});
it('P18: any task with permanent history cannot move, even to an identical model',async()=>{
 const before=await completed();const old=(await db.tasks.get('t1'))!;await expect(saveTask({...old,printerId:'p2'},old)).rejects.toThrow('cannot be reassigned');await unchanged(before);
});
it('P19: untrusted tasks cannot acquire verified status when created or copied to resin',async()=>{
 await seed();const result=await saveTask(task('new','p3',{anchorHours:5,anchorPrints:3}));expect(result.source).toBe('Pending Verification');
 const b=await makeBackup();b.tasks.find(t=>t.id==='new')!.source='Manufacturer Verified';expect(validateBackup(b).tasks.find(t=>t.id==='new')!.source).toBe('Pending Verification');
});
it('P20: exact model variants and technology are required, including same-family variants',()=>{
 expect(reviewTask(task(),printer()).source).toBe('Manufacturer Verified');
 for(const change of [{model:'Creator 5 Pro'},{manufacturer:'Custom'},{technology:'Resin' as const}])expect(reviewTask(task(),printer('p1',change)).source).toBe('Pending Verification');
});
it('P21: altered interval, description, materials, safety, source and version lose verification',()=>{
 for(const change of [{interval:{mode:'hours' as const,hours:1}},{description:'Invented'},{materials:'Wrong solvent'},{safety:'Ignore precautions'},{sourceUrl:'https://example.com'},{profileVersion:'99'},{profileId:'other'}])expect(reviewTask(task('t1','p1',change),printer()).source).toBe('Pending Verification');
});
it('P22: self-asserted profile versions remain pending even with apparently official URLs',()=>{
 const p=structuredClone(bundled[0]);p.version='99';p.templates[0].interval.hours=1;
 const result=reviewProfile(p);expect(result.status).toBe('Pending Verification');expect(result.templates[0].source).toBe('Pending Verification');
 expect(()=>reviewProfile({...p,verified:'',documentation:''})).toThrow();
});
it('P23: edited rules preserve historical source, category, model, currency and version snapshots',async()=>{
 const before=await completed();const old=(await db.tasks.get('t1'))!;
 await saveTask({...old,category:'Cleaning',priority:'Critical',description:'User procedure'},old);
 const l=(await db.logs.toArray())[0];expect(l.category).toBe('Lubrication');expect(l.priority).toBe('Normal');expect(l.currency).toBe('USD');expect(l.model).toBe('Creator 5');expect(l.profileVersion).toBe('1.0.0');expect(l.sourceUrl).toBe(old.sourceUrl);expect(l.source).toBe('Manufacturer Verified');expect(await db.logs.toArray()).toEqual(before.logs);
});
it('P24: fixed-cadence interval edits advance from the last processed boundary',async()=>{
 await db.printers.add(printer('p1',{hours:600,prints:20}));const old=advance(task('t1','p1',{anchorDate:'2026-01-31',interval:{mode:'calendar',months:1},base:'scheduled'}),'2026-06-30',600,20).task;await db.tasks.add(old);
 const saved=await saveTask({...old,interval:{mode:'calendar',months:2}},old);expect(saved.anchorDate).toBe('2026-06-30');expect(due(saved).date).toBe('2026-08-30');expect(saved.originalInterval).toEqual(old.originalInterval);expect(occurrences(saved,'2035-01-01','2035-12-31')).toHaveLength(6);
});
it('P25: scheduled completions and skips cannot predate latest work or usage',async()=>{
 await seed();await completeTask('t1',input({date:'2026-06-01'}));const before=await makeBackup();
 for(const outcome of ['Completed','Skipped'] as const)await expect(completeTask('weekly',input({date:'2026-02-01'}),outcome)).rejects.toThrow('latest');await unchanged(before);
});
it('P26: completion validates malformed numbers, inventory compatibility and quantity atomically',async()=>{
 await seed();const before=await makeBackup();for(const extra of [{hours:-1},{prints:NaN},{date:'2026-02-31'},{inventoryId:'part',quantity:1},{quantity:1}])await expect(completeTask('t1',input(extra))).rejects.toThrow();await unchanged(before);
});
it('P27: stale task edits cannot overwrite a concurrent completion',async()=>{
 await seed();const old=(await db.tasks.get('t1'))!;await completeTask('t1',input());const before=await makeBackup();await expect(saveTask({...old,title:'Stale'},old)).rejects.toThrow('changed');await unchanged(before);
});
it('P28: stale printer edit cannot decrease newly recorded cumulative usage',async()=>{
 await seed();const old=(await db.printers.get('p1'))!;await completeTask('t1',input());const before=await makeBackup();await expect(savePrinter({...old,name:'Stale edit'},old)).rejects.toThrow('changed');await unchanged(before);
});
it('P29: consumed stock cannot be removed or reassigned while history refers to it',async()=>{
 const before=await completed();const item=(await db.inventory.get('common'))!;
 await expect(deleteInventory(item.id)).rejects.toThrow('history');await expect(saveInventory({...item,printerId:'p2'})).rejects.toThrow('historical');await unchanged(before);
});
it('P30: missing printer references are rejected on inventory and repair writes',async()=>{
 await seed();const before=await makeBackup();await expect(saveInventory({...before.inventory[0],id:'new',printerId:'missing'})).rejects.toThrow('missing');await expect(saveRepair({...before.repairs[0],printerId:'missing'})).rejects.toThrow('missing');await unchanged(before);
});
it('P31: profile updates retain immutable versions and active task/history identities',async()=>{
 const before=await completed();const incoming=structuredClone(bundled[0]);incoming.version='2.0.0';incoming.templates.push({...incoming.templates[0],templateId:'new-step',title:'New pending step'});
 await installProfile(incoming,'p1');expect(await db.tasks.get('t1')).toEqual(before.tasks.find(t=>t.id==='t1'));expect(await db.logs.toArray()).toEqual(before.logs);expect((await db.tasks.toArray()).find(t=>t.templateId==='new-step')!.source).toBe('Pending Verification');
 expect((await db.profiles.get(profileArchiveId(incoming.id,'1.0.0')))!.version).toBe('1.0.0');expect(findProfile('FlashForge','Creator 5',await db.profiles.toArray(),{profileId:incoming.id,profileVersion:'1.0.0'})!.version).toBe('1.0.0');
 const b=validateBackup(await makeBackup());await restoreBackup(b,true);expect(findProfile('FlashForge','Creator 5',await db.profiles.toArray(),{profileId:incoming.id,profileVersion:'1.0.0'})!.version).toBe('1.0.0');
});
it('P32: same-version redefinitions and incompatible profile targets are rejected atomically',async()=>{
 await seed();const before=await makeBackup();const incoming=structuredClone(bundled[0]);incoming.templates[0].materials='Changed';await expect(installProfile(incoming)).rejects.toThrow('version');await unchanged(before);
 incoming.version='2.0.0';await expect(installProfile(incoming,'p3')).rejects.toThrow('technology');await unchanged(before);
});
it('P33: stable template IDs survive titles changing without duplicating active tasks',async()=>{
 await seed();await db.tasks.update('t1',{templateId:'stable',profileId:bundled[0].id});const before=await makeBackup();const incoming=structuredClone(bundled[0]);incoming.version='2.0.0';incoming.templates[0].templateId='stable';incoming.templates[0].title='Renamed incoming template';await installProfile(incoming,'p1');expect(await db.tasks.count()).toBe(before.tasks.length);expect(await db.tasks.get('t1')).toEqual(before.tasks.find(t=>t.id==='t1'));
});
it('P34: postponement captures immutable attribution from current records',async()=>{
 await seed();await postponeTask('t1','2035-01-01','Fixture reschedule');const before=await makeBackup();const l=before.logs[0];expect(l.outcome).toBe('Postponed');expect(l.category).toBe('Lubrication');expect(l.currency).toBe('USD');expect(l.source).toBe('Manufacturer Verified');expect((await db.tasks.get('t1'))!.interval).toEqual(task().interval);expect(()=>validateBackup(before)).not.toThrow();
});
it('P41: missing and conflicting profile-version references cannot enter a backup',async()=>{
 await seed();const before=await makeBackup();const bad=structuredClone(before);bad.printers[0].profileVersion='missing';expect(()=>validateBackup(bad)).toThrow('profile version');
 const archived={...before.profiles[0],id:profileArchiveId(before.profiles[0].id,before.profiles[0].version),profileId:before.profiles[0].id,documentation:'https://example.com/changed'};
 expect(()=>validateBackup({...before,profiles:[...before.profiles,archived]})).toThrow('Conflicting definitions');await unchanged(before);
});
it('P42: reserved archive keys cannot be used to overwrite a retained definition',async()=>{
 await seed();const before=await makeBackup();await expect(installProfile({...bundled[0],id:profileArchiveId(bundled[0].id,'1.0.0')})).rejects.toThrow('reserved');await unchanged(before);
});
it('P43: changing a profile documentation URL cannot retain verified profile status',()=>{
 const p=reviewProfile({...bundled[0],documentation:'https://example.com/not-official'});expect(p.status).toBe('Pending Verification');expect(p.templates[0].source).toBe('Pending Verification');
});
it('P44: completion rejects fractional print counts before any transaction changes',async()=>{
 await seed();const before=await makeBackup();await expect(completeTask('t1',input({prints:20.5}))).rejects.toThrow();await unchanged(before);
});
it('P45: the original native-browser schema-1 backup restores without rewriting legacy records',async()=>{
 const original=JSON.parse(readFileSync(new URL('./fixtures/legacy-schema1.synthetic.json',import.meta.url),'utf-8'));
 await restoreBackup(original,true);const after=await makeBackup();
 for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles'] as const)expect(after[key]).toEqual(original[key]);
 expect(after.preferences).toEqual({...original.preferences,acknowledgment:null});expect(after.logs.every(l=>l.category===undefined)).toBe(true);
});
it('P46: failure after stock deduction rolls back completion and every affected store',async()=>{
 await seed();const before=await makeBackup();const fail=()=>{throw Error('Injected history write failure');};db.logs.hook('creating',fail);
 try{await expect(completeTask('t1',input({inventoryId:'common',quantity:2}))).rejects.toThrow('Injected');}finally{db.logs.hook('creating').unsubscribe(fail);}await unchanged(before);
});
it('P48: identical completion saves cannot create a backup rejected by duplicate validation',async()=>{
 await seed();await completeTask('t1',input());const before=await makeBackup();await expect(completeTask('t1',input())).rejects.toThrow('identical');await unchanged(before);expect(()=>validateBackup(before)).not.toThrow();
});
it('P49: an unchanged repeated postponement does not duplicate audit history',async()=>{
 await seed();await postponeTask('t1','2035-01-01','Same action');const before=await makeBackup();await postponeTask('t1','2035-01-01','Same action');await unchanged(before);expect(()=>validateBackup(before)).not.toThrow();
});
