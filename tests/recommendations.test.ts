import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {z} from 'zod';
import {empty,seed,printer,task,input,log} from '../acceptance-review/fixtures';
import {db,acceptReviewReminder,makeBackup,restoreBackup,validateBackup,saveTask,completeTask,backupSchema,PrintGuardDB} from '../src/db';
import {defaults,taskSchema,profileSchema,type Reading} from '../src/domain';
import {createReviewReminder,suggestedMonths,printingAverage,taskClassification,taskContext,type ReviewChoice} from '../src/recommendations';
import {isVerifiedTask,bundled,reviewedProfiles} from '../src/profiles';
import {addInterval,occurrences} from '../src/engine';
import {observationFacts,observationSchema} from '../src/observations';
import {selectReport,defaultReportFilters} from '../src/reportModel';
import {serializeReportCSV,reportJSON,reportHTML} from '../src/reportExports';
import {scheduleICS} from '../src/safety';
import Dexie from 'dexie';

beforeEach(async()=>{vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date('2026-10-29T12:00:00Z'));await empty();});
afterEach(()=>vi.useRealTimers());
const choice=(extra:Partial<ReviewChoice>={}):ReviewChoice=>({group:'fan',dailyHours:5,custom:false,basis:'manual',printingCounterConfirmed:false,acknowledged:true,...extra});
async function prepare(){await db.printers.add(printer());await db.preferences.put({...defaults,acknowledgment:{version:'1.0',date:'2026-10-29'}});}
const endpoints=(end='2026-10-29',daily=5):Reading[]=>Array.from({length:31},(_,i)=>({id:'r'+i,printerId:'p1',date:addInterval(end,i-30),hours:100+i*daily,prints:10+i}));

for(const group of ['fan','xy','z'] as const)for(const value of [4.999999,5,5.000001,9.999999,10,10.000001]){
 it(`S boundary ${group} at ${value}: exact opt-in only`,()=>{
  const n=suggestedMonths(group,value);const expected=group==='fan'?(value===5?6:value===10?3:null):value===5?(group==='xy'?1:3):null;expect(n).toBe(expected);
  if(expected===null)expect(()=>createReviewReminder(printer(),choice({group,dailyHours:value}),[])).toThrow('No approved');
  else{const t=createReviewReminder(printer(),choice({group,dailyHours:value}),[]);expect(t.interval).toEqual({mode:'calendar',months:expected});expect(t.source).toBe('General Recommendation');expect(t.materials).toBe('');expect(t.category).toBe('Inspection');expect(taskClassification(t,printer())).toBe('PrintGuard Suggested');expect(isVerifiedTask(t,printer())).toBe(false);}
 });
}
it('S19: classifications preserve raw official enums and scope the numeric fact',()=>{
 expect(taskClassification(task(),printer())).toBe('Manufacturer Documented');expect(task().source).toBe('Manufacturer Verified');
 expect(taskContext(task(),printer())).toContain('provisional PrintGuard counter proxy');
 expect(taskClassification({...task(),source:'User Defined'},printer())).toBe('User Defined');expect(taskClassification({...task(),source:'General Recommendation'},printer())).toBe('User Defined');
 expect(taskClassification(task(),printer('p1',{model:'Creator 5 Pro'}))).toBe('Pending Verification');
});
it('S20: mutation requires local legal acknowledgment and dedicated explicit opt-in',async()=>{
 await db.printers.add(printer());await expect(acceptReviewReminder('p1',choice())).rejects.toThrow('disclaimer');
 await db.preferences.put({...defaults,acknowledgment:{version:'1.0',date:'2026-10-29'}});
 await expect(acceptReviewReminder('p1',choice({acknowledged:false}))).rejects.toThrow('acknowledge');
 await expect(saveTask(createReviewReminder(printer(),choice(),[]))).rejects.toThrow('dedicated');expect(await db.tasks.count()).toBe(0);
});
it('S21: accepting/customizing separate reminders preserves existing schedules and all historical definitions',async()=>{
 await seed();const before=await makeBackup();const suggested=await acceptReviewReminder('p1',choice());
 const customized=await acceptReviewReminder('p2',choice({group:'xy',custom:true,months:7}));expect(customized.source).toBe('User Defined');
 const after=await makeBackup();for(const key of ['printers','profiles','logs','readings','inventory','repairs'] as const)expect(after[key]).toEqual(before[key]);
 expect(after.tasks.filter(t=>t.id!==suggested.id&&t.id!==customized.id)).toEqual(before.tasks);expect(bundled[0].templates[0].interval.hours).toBe(500);
});
it('S22: Pro receives only owner condition inspection; no cadence or C5 series transfer',()=>{
 const p=printer('pro',{model:'Creator 5 Pro'});
 expect(()=>createReviewReminder(p,choice(),[])).toThrow('transfer');
 const c=choice({group:'filter',custom:true,basis:'condition',dailyHours:undefined});const t=createReviewReminder(p,c,[]);
 expect(t.interval).toEqual({mode:'condition'});expect(t.condition).toBe(false);expect(t.source).toBe('User Defined');
 expect(()=>createReviewReminder(p,{...c,months:3},[])).toThrow('condition-only');
 expect(()=>createReviewReminder(printer(),c,[])).toThrow('stock C5');
 expect(reviewedProfiles.find(p=>p.id==='flashforge-creator-5-pro')!.templates).toHaveLength(1);
 expect(()=>createReviewReminder({...p,technology:'Resin'},c,[])).toThrow('exact-model');
});
it('S23: complete 30-calendar-day endpoint convention, without idle inference or counter substitution',()=>{
 const rs=endpoints(),p=printer('p1',{hours:250,prints:40});expect(printingAverage(rs,p)).toEqual({hours:5,start:'2026-09-29',end:'2026-10-29',coverage:31});
 for(const bad of [rs.slice(1),rs.filter((_,i)=>i!==15),[...rs,{...rs[2],id:'conflict',hours:111}],rs.map((r,i)=>i===7?{...r,hours:0}:r),rs.map((r,i)=>i===7?{...r,hours:r.hours+25}:r)])expect(printingAverage(bad,p)).toBeNull();
 expect(printingAverage(rs,{...p,hours:251})).toBeNull();expect(printingAverage([],p)).toBeNull();
 expect(()=>createReviewReminder(p,choice({basis:'rolling30'}),rs)).toThrow('actual printing');
 expect(()=>createReviewReminder(p,choice({basis:'rolling30',printingCounterConfirmed:true,dailyHours:10}),rs)).toThrow('changed after review');expect(()=>createReviewReminder(p,choice({reviewedOn:'2026-10-28'}),rs)).toThrow('review date changed');
 const t=createReviewReminder(p,choice({basis:'rolling30',printingCounterConfirmed:true}),rs);expect(t.recommendation?.windowStart).toBe('2026-09-29');expect(t.recommendation?.dailyHours).toBe(5);
});
it('S24: date-only averaging covers midnight, DST and leap centuries without elapsed-hour assumptions',()=>{
 for(const end of ['2026-03-09','2026-11-02','2400-03-01','2500-03-01']){
  const rs=endpoints(end);expect(printingAverage(rs,printer('p1',{hours:250,prints:40}),end)?.hours).toBe(5);
 }
 const rs=endpoints();rs[0]={...rs[0],hours:Number.NaN};expect(printingAverage(rs,printer())).toBeNull();
});
it('S25: backup roundtrip preserves decisions, old backup compatibility and strict unsupported-reader rejection',async()=>{
 await prepare();const old=await makeBackup();expect(old.recommendationPolicy).toBeUndefined();expect(validateBackup(old).tasks).toEqual([]);
 await acceptReviewReminder('p1',choice());const b=await makeBackup();expect(b.recommendationPolicy).toEqual({version:1});expect(validateBackup(b).tasks).toEqual(b.tasks);
 const strictOld=backupSchema.omit({recommendationPolicy:true}).extend({tasks:z.array(taskSchema.omit({recommendation:true}))});expect(()=>strictOld.parse(b)).toThrow();
 const missing=structuredClone(b);delete missing.recommendationPolicy;expect(()=>validateBackup(missing)).toThrow('policy marker');
 for(const mutate of [(b:any)=>b.tasks[0].source='Manufacturer Verified',(b:any)=>b.tasks[0].recommendation.policyVersion='99',(b:any)=>b.tasks[0].recommendation.model='Creator 5 Pro',(b:any)=>b.tasks[0].recommendation.acknowledged=false,(b:any)=>b.tasks[0].sourceUrl='https://example.com',(b:any)=>b.tasks[0].description='Unreviewed heated servicing steps',(b:any)=>b.tasks[0].title='Replace equipment now']){
  const bad=structuredClone(b);mutate(bad);await expect(restoreBackup(bad,true)).rejects.toThrow();expect((await makeBackup()).tasks).toEqual(b.tasks);
 }
 await restoreBackup(old,true);expect(await db.tasks.count()).toBe(0);await restoreBackup(b,true);expect((await makeBackup()).tasks).toEqual(b.tasks);
 const profile=structuredClone(bundled[0]);(profile.templates[0] as any).recommendation=b.tasks[0].recommendation;expect(()=>profileSchema.parse(profile)).toThrow();
});
it('S26: owner edits retain immutable decisions; forged source and model switching are blocked',async()=>{
 await prepare();const t=await acceptReviewReminder('p1',choice());
 const edited=await saveTask({...t,interval:{mode:'calendar',months:8}},t);expect(edited.source).toBe('User Defined');expect(edited.recommendation).toEqual(t.recommendation);expect(edited.originalInterval).toEqual(t.interval);
 await expect(saveTask({...edited,recommendation:undefined},edited)).rejects.toThrow('immutable');
 await db.printers.add(printer('p2',{model:'Creator 5 Pro'}));await expect(saveTask({...edited,printerId:'p2'},edited)).rejects.toThrow('immutable');
 const saved=await makeBackup(),changed=structuredClone(saved);changed.tasks[0].recommendation!.acceptedOn='2026-10-28';await expect(restoreBackup(changed,true)).rejects.toThrow('immutable recommendation');expect((await makeBackup()).tasks).toEqual(saved.tasks);
 const b=await makeBackup();b.tasks[0].source='Manufacturer Verified';expect(()=>validateBackup(b)).toThrow('verification');
});
it('S27: completion, later customization and observation capture retain historical caveats',async()=>{
 await prepare();const t=await acceptReviewReminder('p1',choice());await completeTask(t.id,input({date:'2026-10-29',hours:100,prints:10}));
 const before=await db.logs.toArray();expect(before[0].recommendation).toEqual(t.recommendation);expect(before[0].source).toBe('General Recommendation');
 const current=(await db.tasks.get(t.id))!;await saveTask({...current,interval:{mode:'calendar',months:7}},current);expect(await db.logs.toArray()).toEqual(before);
 const facts=observationFacts(printer(),[current],'2026-10-29',7);expect(facts.tasks[0].recommendation).toEqual(t.recommendation);
 const obs={version:1,id:'batch:p1',batchId:'batch',printerId:'p1',observedAt:'2026-10-29T12:00:00.000Z',timezone:'UTC',utcOffsetMinutes:0,source:'manual observation',...facts};expect(()=>observationSchema.parse(obs)).not.toThrow();
 const alias={...obs,id:'task:p1',batchId:'task'};const displayed=selectReport({printers:[printer()],tasks:[{...current,id:'p1:'+current.id,source:'User Defined'}],logs:[],readings:[],repairs:[],prefs:defaults,observations:[observationSchema.parse(alias)]},'Observed Task Details',defaultReportFilters());expect(displayed.rows[0].provenance.recommendationContext).toContain('PrintGuard Suggested');expect(displayed.rows[0].provenance.recommendationContext).not.toContain('User Defined.');
 const bad=structuredClone(obs);bad.tasks[0].source='Manufacturer Verified';expect(()=>observationSchema.parse(bad)).toThrow('verification');
});
it('S28: classifications and assumptions survive CSV, offline HTML, JSON, ICS and recurrence beyond 2500',()=>{
 const t=createReviewReminder(printer(),choice(),[]),data={printers:[printer()],tasks:[t],logs:[],readings:[],repairs:[],prefs:defaults};const report=selectReport(data,'Complete Maintenance Schedule',defaultReportFilters());
 for(const serialized of [serializeReportCSV(report),reportJSON(report),reportHTML(report),scheduleICS([{id:t.id,title:t.title,date:'2501-01-01',description:taskContext(t,printer())}],'20261029T120000Z')]){
  expect(serialized).toContain('PrintGuard Suggested');expect(serialized.replace(/\r\n /g,'')).toContain('Not a direction to clean');expect(serialized).not.toContain('manufacturer requires');
 }
 const historical=log('suggested-history',{taskId:t.id,title:t.title,source:t.source,sourceUrl:t.sourceUrl,recommendation:t.recommendation,manufacturer:'FlashForge',model:'Creator 5',technology:'FDM/FFF'});
 for(const type of ['Complete Maintenance History','Maintenance Expenses','Parts Replacement History'] as const){const result=selectReport({...data,logs:[historical]},type,defaultReportFilters());expect(serializeReportCSV(result)).toContain(t.sourceUrl);expect(serializeReportCSV(result)).toContain('FlashForge has not confirmed');}
 expect(occurrences(t,'2501-01-01','2501-12-31')).toHaveLength(2);expect(report.rows.every(row=>row.values.length===report.columns.length)).toBe(true);
});
it('S29: existing DB layout stays v20; old Dexie fallback is measured and caveats survive raw task access',async()=>{
 const name='suggestions-'+crypto.randomUUID(),next=new PrintGuardDB(name);const t=createReviewReminder(printer(),choice(),[]);
 try{await next.open();expect(next.verno).toBe(2);await next.printers.add(printer());await next.tasks.add(t);const stores=Object.fromEntries(next.tables.map(t=>[t.name,t.schema.primKey.src]));next.close();const old=new Dexie(name);old.version(2).stores(stores);try{await old.open();const raw=await old.table('tasks').get(t.id);expect(raw.source).toBe('General Recommendation');expect(raw.description).toContain('FlashForge has not confirmed');expect(raw.recommendation).toEqual(t.recommendation);}finally{old.close();}}finally{next.close();await Dexie.delete(name);}
});
