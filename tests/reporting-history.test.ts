import 'fake-indexeddb/auto';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import Dexie from 'dexie';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {z} from 'zod';
import {printer,task,log,empty,seed} from '../acceptance-review/fixtures';
import {db,PrintGuardDB,makeBackup,restoreBackup,validateBackup,previewBackup} from '../src/db';
import {defaults} from '../src/domain';
import {disclaimerVersion} from '../src/legal';
import {collectObservations,pauseObservations} from '../src/observationStore';
import {observationFacts,observationSchema,observationIssues,observationLimits,type Observation} from '../src/observations';
import {defaultReportFilters,selectReport,selectCharts,unclassifiedReport,reportTypes,reportRequest,encodeReportQuery,type ReportData} from '../src/reportModel';
import {reportJSON,reportHTML,serializeReportCSV,localReportImage} from '../src/reportExports';
import {occurrences,due,status} from '../src/engine';

const now='2026-10-28T12:00:00.000Z';
const filters=()=>({...defaultReportFilters(),start:'2026-01-01',end:'2026-12-31'});
const consent={...defaults,acknowledgment:{version:disclaimerVersion,date:'2026-10-28'}};
const data=():ReportData=>({printers:[printer('p1',{hours:700}),printer('p2')],tasks:[task()],logs:[log('cad',{category:'Lubrication',priority:'High',currency:'CAD'}),log('usd',{category:'Lubrication',priority:'High',currency:'USD',cost:20}),log('unknown',{date:'2026-03-01',outcome:'Skipped',cost:7}),log('post',{date:'2026-02-02',outcome:'Postponed',category:'Lubrication',priority:'High',currency:'CAD',cost:0})],readings:[],repairs:[],prefs:consent,observations:[]});
function frozen(p=printer(),ts=[task()],instant=now,offset=0,batch='batch'):Observation{return observationSchema.parse({version:1,id:batch+':'+encodeURIComponent(p.id),batchId:batch,printerId:p.id,observedAt:instant,timezone:'UTC',utcOffsetMinutes:offset,source:'manual observation',...observationFacts(p,ts,new Date(Date.parse(instant)+offset*60000).toISOString().slice(0,10),7)});}
beforeEach(async()=>{await empty();vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(now);});
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();});

it('R01 additive real Dexie v1 upgrade leaves every original row and photo byte unchanged',async()=>{
 const name='R01-'+crypto.randomUUID(),old=new Dexie(name);old.version(1).stores({printers:'id,manufacturer,archived',tasks:'id,printerId',logs:'id,printerId,taskId,date',readings:'id,printerId,date',inventory:'id,printerId',repairs:'id,printerId,status',profiles:'id',preferences:'id'});
 await old.open();await seed();const backup=await makeBackup();for(const table of old.tables)await table.bulkAdd(table.name==='preferences'?[consent]:backup[table.name as 'printers']);const before=Object.fromEntries(await Promise.all(old.tables.map(async table=>[table.name,await table.toArray()])));old.close();
 const upgraded=new PrintGuardDB(name);try{await upgraded.open();expect(upgraded.verno).toBe(2);expect(await upgraded.observations.count()).toBe(0);for(const [key,rows]of Object.entries(before))expect(await upgraded.table(key).toArray()).toEqual(rows);upgraded.close();await expect(new Promise((resolve,reject)=>{const request=indexedDB.open(name,10);request.onsuccess=()=>{request.result.close();resolve(true);};request.onerror=()=>reject(request.error);})).rejects.toThrow(/version/i);const rollback=new Dexie(name+'-fresh');rollback.version(1).stores(Object.fromEntries(old.tables.map(table=>[table.name,table.schema.primKey.src])));try{for(const [key,rows]of Object.entries(before))await rollback.table(key).bulkAdd(rows);for(const [key,rows]of Object.entries(before))expect(await rollback.table(key).toArray()).toEqual(rows);}finally{rollback.close();await Dexie.delete(name+'-fresh');}}finally{old.close();upgraded.close();await Dexie.delete(name);}
});
it('R02 aborted additive upgrade preserves old version and rows; fresh old-reader rollback preserves pre-upgrade backup',async()=>{
 const name='R02-'+crypto.randomUUID(),old=new Dexie(name);old.version(1).stores({printers:'id'});await old.table('printers').add(printer());old.close();const fail=new Dexie(name);fail.version(1).stores({printers:'id'});fail.version(2).stores({observations:'id'}).upgrade(()=>{throw Error('Synthetic upgrade interruption');});await expect(fail.open()).rejects.toThrow('Synthetic');fail.close();await old.open();expect(old.verno).toBe(1);expect(await old.table('printers').toArray()).toEqual([printer()]);const fresh=new Dexie(name+'-rollback');fresh.version(1).stores({printers:'id'});await fresh.table('printers').bulkAdd(await old.table('printers').toArray());expect(await fresh.table('printers').toArray()).toEqual([printer()]);old.close();fresh.close();await Dexie.delete(name);await Dexie.delete(name+'-rollback');
});
it('R03 acknowledgment and explicit recording are required; zero printers creates no fabricated points',async()=>{
 await expect(collectObservations('app open after consent')).rejects.toThrow(/acknowledgment/);await db.preferences.put(consent);expect(await collectObservations('app open after consent')).toEqual({added:0,warning:''});expect(await db.observations.count()).toBe(0);expect((await collectObservations('recording started',true)).added).toBe(0);expect((await db.preferences.get('preferences'))?.observationRecording).toBe(true);
});
it.each([1,12])('R04 actual capture, identical reload dedupe and independent state changes for %i printers',async count=>{
 await db.preferences.put(consent);await db.printers.bulkAdd(Array.from({length:count},(_,i)=>printer('p'+i)));await db.tasks.add(task('t','p0'));expect((await collectObservations('recording started',true)).added).toBe(count);const before=await db.observations.toArray();expect((await collectObservations('app open after consent')).added).toBe(0);vi.setSystemTime('2026-10-28T12:01:00Z');await db.printers.update('p0',{hours:900});expect((await collectObservations('persisted state or date change')).added).toBe(1);expect((await db.observations.toArray()).filter(row=>before.some(old=>old.id===row.id))).toEqual(before);await expect(db.observations.update(before[0].id,{overdueCount:90})).rejects.toThrow(/immutable/);await pauseObservations();vi.setSystemTime('2026-10-29T12:00:00Z');expect((await collectObservations('app open after consent')).added).toBe(0);
});
it('R05 A→B→A records actual transitions, never fills a closed-app gap or rewrites archived/disabled history',async()=>{
 await db.preferences.put(consent);await db.printers.add(printer('p1',{hours:700}));await db.tasks.add(task());await collectObservations('recording started',true);const first=(await db.observations.toArray())[0];expect(first.overdueCount).toBe(1);vi.setSystemTime('2026-10-28T13:00:00Z');await db.tasks.update('t1',{enabled:false});await collectObservations('persisted state or date change');vi.setSystemTime('2026-10-28T14:00:00Z');await db.tasks.update('t1',{enabled:true});await collectObservations('persisted state or date change');vi.setSystemTime('2026-11-08T12:00:00Z');await db.printers.update('p1',{archived:true});await collectObservations('app open after consent');const rows=(await db.observations.toArray()).sort((a,b)=>a.observedAt.localeCompare(b.observedAt));expect(rows.map(row=>row.overdueCount)).toEqual([1,0,1,0]);expect(rows.map(row=>row.localDate)).toEqual(['2026-10-28','2026-10-28','2026-10-28','2026-11-08']);expect(await db.observations.get(first.id)).toEqual(first);
});
it('R06 leap/timezone and year 2500 observations use captured local dates without expiring schedules',()=>{
 const ts=[task('leap','p1',{interval:{mode:'calendar',months:1}})],row=frozen(printer(),ts,'2400-02-29T23:30:00.000Z',120);expect(row.localDate).toBe('2400-03-01');expect(occurrences(ts[0],'2500-01-01','2500-12-31')).toHaveLength(12);expect(frozen(printer(),ts,'2500-03-01T01:00:00.000Z',-300).localDate).toBe('2500-02-28');
});
it('R07 malformed counts/status/ownership/local dates and duplicate observations fail closed',()=>{
 const row=frozen();for(const changed of [{overdueCount:99},{printerId:'other'},{localDate:'2026-10-27'},{tasks:[{...row.tasks[0],printerId:'other'}]},{tasks:[{...row.tasks[0],status:'Completed'}]}])expect(observationSchema.safeParse({...row,...changed}).success).toBe(false);expect(observationIssues([row,row]).join()).toMatch(/duplicate/);
});
it('R08 daily/total storage bounds retain all prior points and do not prune or change schedules',async()=>{
 await db.preferences.put({...consent,observationRecording:true});await db.printers.add(printer());await db.tasks.add(task());const rows=Array.from({length:observationLimits.perPrinterDay},(_,i)=>frozen(printer(),[task()],`2026-10-28T00:${String(Math.floor(i/60)).padStart(2,'0')}:${String(i%60).padStart(2,'0')}.000Z`,0,'b'+i));await db.observations.bulkAdd(rows);await db.printers.update('p1',{hours:900});const before=await db.tasks.toArray();expect((await collectObservations('manual observation')).warning).toMatch(/limit/);expect((await db.observations.toArray()).sort((a,b)=>a.observedAt.localeCompare(b.observedAt))).toEqual(rows);expect(await db.tasks.toArray()).toEqual(before);expect(observationIssues([...rows,frozen(printer(),[task()],now,0,'extra')]).join()).toMatch(/daily capacity/);
});
it('R09 full and single-printer backups round-trip immutable history; legacy replacement retains it and renews acknowledgment',async()=>{
 await seed();await db.preferences.put(consent);await collectObservations('recording started',true);const before=await makeBackup();expect(before.overdueHistory?.records).toHaveLength(3);expect((await makeBackup('p2')).overdueHistory?.records.every(row=>row.printerId==='p2')).toBe(true);await empty();await restoreBackup(validateBackup(JSON.parse(JSON.stringify(before))),true);expect((await makeBackup()).overdueHistory).toEqual(before.overdueHistory);const legacy={...before};delete legacy.overdueHistory;await restoreBackup(legacy,true);expect((await makeBackup()).overdueHistory).toEqual(before.overdueHistory);expect((await db.preferences.get('preferences'))?.acknowledgment).toBeNull();
});
it('R10 immutable conflict, future extension, duplicate instant and future time reject even replacement without writes',async()=>{
 await seed();await db.preferences.put(consent);await collectObservations('recording started',true);const before=await makeBackup(),conflict=structuredClone(before);conflict.overdueHistory!.records[0].printer.name='Changed captured identity';expect((await previewBackup(conflict,true)).conflicts.join()).toMatch(/immutable/);await expect(restoreBackup(conflict,true)).rejects.toThrow(/immutable/);expect(()=>validateBackup({...before,overdueHistory:{version:2,records:[]}})).toThrow();const future=structuredClone(before);future.exportedAt='2020-01-01T00:00:00.000Z';expect(()=>validateBackup(future)).toThrow(/Observation time/);expect((await makeBackup()).overdueHistory).toEqual(before.overdueHistory);
});
it('R11 failure after core clears/writes and observation additions rolls back every original store and history',async()=>{
 await seed();await db.preferences.put(consent);await collectObservations('recording started',true);const before=await makeBackup();const incoming=structuredClone(before);incoming.printers[0].name='Must roll back';incoming.overdueHistory!.records.push(frozen(printer('deleted'),[],now,0,'incoming'));vi.spyOn(db.preferences,'put').mockRejectedValueOnce(new DOMException('Synthetic final write fault','QuotaExceededError'));await expect(restoreBackup(incoming,true)).rejects.toThrow();const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles','preferences','overdueHistory'] as const)expect(after[key]).toEqual(before[key]);
});
it('R12 frozen reports retain captured names/status/owners after current printer/task deletion',()=>{
 const snapshot=frozen(printer('p1',{name:'Captured original',hours:700}));const d={...data(),printers:[],tasks:[],observations:[snapshot]};const report=selectReport(d,'Observed Overdue History',filters());expect(report.rows[0].values[2]).toBe('Captured original');expect(report.rows[0].values[4]).toBe(1);const query=selectCharts(d,filters(),30).overdue[0].query;const detail=selectReport(d,query.type,{...filters(),...query.filters});expect(detail.rows[0].values[1]).toBe('Captured original');expect(detail.rows[0].values[3]).toBe('Overdue');expect(detail.printers).toEqual([]);expect(reportHTML(detail)).not.toContain('Missing printer');
});
it('R13 archived/disabled captured rules do not appear as overdue chart drilldown records',()=>{
 const d={...data(),observations:[frozen(printer('p1',{archived:true,hours:900}))]};const chart=selectCharts(d,filters(),30).overdue[0];expect(chart.value).toBe(0);expect(selectReport(d,chart.query.type,{...filters(),...chart.query.filters}).rows).toEqual([]);
});
it('R14 completion and compliance monthly subjects drill to exact eligible records with explicit unknown months',()=>{
 const d=data(),charts=selectCharts(d,filters(),30),feb=charts.completions.find(point=>point.id==='2026-02')!;expect(feb.value).toBe(2);expect(selectReport(d,feb.query.type,{...filters(),...feb.query.filters}).rows.map(row=>row.id)).toEqual(['log:cad','log:usd']);const compliance=charts.complianceTrend.find(point=>point.id==='2026-02')!;expect(compliance.value).toBe(100);expect(compliance.note).toContain('2 on time / 2');expect(charts.complianceTrend.find(point=>point.id==='2026-03')!.value).toBe(0);expect(charts.complianceTrend[0].value).toBeNull();
});
it('R15 chart category/priority/printer/date/currency restrictions retain correct captured records and separate unknowns',()=>{
 const d=data(),f={...filters(),category:'Lubrication',priority:'High',printer:'p1',start:'2026-02-01',end:'2026-02-28'};const charts=selectCharts(d,f,30);expect(charts.completions[0].value).toBe(2);expect(charts.expenses.map(group=>group.currency).sort()).toEqual(['CAD','USD']);for(const group of charts.expenses){const point=group.points[0],rows=selectReport(d,point.query.type,{...f,...point.query.filters}).rows;expect(rows.every(row=>row.provenance.currency===group.currency)).toBe(true);}expect(selectReport(d,'Complete Maintenance History',f).rows.map(row=>row.id)).not.toContain('log:unknown');expect(unclassifiedReport(d,{...f,start:'2026-01-01',end:'2026-12-31'}).rows.map(row=>row.id)).toEqual(['log:unknown']);
});
it('R16 activity distinguishes identical printer names and includes honest zero-printer records',()=>{
 const d=data();d.printers=d.printers.map(p=>({...p,name:'Same name'}));const points=selectCharts(d,filters(),30).activity;expect(points.map(point=>point.label)).toEqual(['Same name [p1]','Same name [p2]']);expect(points.map(point=>point.value)).toEqual([4,0]);expect(points[1].query.filters.recordKeys).toEqual([]);
});
it('R17 unknown, CAD and USD expenses never acquire preference currency or mixed sums',()=>{
 const charts=selectCharts(data(),filters(),30);expect(charts.expenses.map(group=>group.currency).sort()).toEqual(['CAD','USD','Unclassified currency']);expect(charts.expenses.find(group=>group.currency==='CAD')!.points[1].value).toBe(12.5);expect(charts.expenses.find(group=>group.currency==='Unclassified currency')!.points[2].value).toBe(7);
});
it('R18 workload uses one next occurrence, undated usage separately, and never invents actual dates from estimates',()=>{
 const d=data();d.tasks=[task('calendar','p1',{interval:{mode:'calendar',days:1},anchorDate:'2026-10-28'}),task('usage','p1'),task('paused','p1',{enabled:false})];const before=structuredClone(d.tasks);const points=selectCharts(d,filters(),30).workload;expect(points.find(point=>point.id==='usage-due')?.value).toBe(1);const usage=points.find(point=>point.id==='usage-due')!;expect(selectReport(d,usage.query.type,{...filters(),...usage.query.filters}).rows[0].values[2]).toBe('');expect(points.filter(point=>/^2026/.test(point.id)).reduce((sum,p)=>sum+(p.value||0),0)).toBe(1);expect(d.tasks).toEqual(before);expect(due(d.tasks[1]).date).toBe('');expect(status(d.tasks[1],d.printers[0],'2026-10-28')).toBe('Overdue');
});
it('R19 report drilldown encoding retains exact query context including empty sets',()=>{
 const query={type:'Complete Maintenance History' as const,filters:{...filters(),printer:'p1',currency:'CAD',recordKeys:[]}};expect(reportRequest(encodeReportQuery(query),data())).toEqual(query);expect(selectReport(data(),query.type,query.filters).rows).toEqual([]);
});
it.each(reportTypes)('R20 %s JSON/CSV/HTML serialize only its exact selected tabular rows',type=>{
 const d=data(),report=selectReport(d,type,{...filters(),printer:'p1'}),json=JSON.parse(reportJSON(report));expect(json.kind).toBe('tabular-report');expect(json.reportSchemaVersion).toBe(1);expect(json.rows.map((row:{id:string})=>row.id)).toEqual(report.rows.map(row=>row.id));for(const [index,row]of report.rows.entries())expect(Object.values(json.rows[index].values)).toEqual(row.values);expect(json).not.toHaveProperty('tasks');expect(reportHTML(report)).not.toContain('Review printer p2');expect(serializeReportCSV(report)).toContain('Safety notice:');expect(reportHTML(report)).toContain('Content-Security-Policy');
});
it('R21 primary JSON/HTML do not leak unselected ids, unclassified history, hidden notes or private printer fields',()=>{
 const d=data();d.logs[2].notes='UNCLASSIFIED_SECRET';d.printers[0].serial='PRIVATE_SERIAL';d.printers[1].name='OTHER_PRINTER_SECRET';const report=selectReport(d,'Complete Maintenance History',{...filters(),category:'Lubrication',recordKeys:['log:cad','log:unknown','log:missing']});for(const output of [reportJSON(report),reportHTML(report),serializeReportCSV(report)]){expect(output).not.toContain('UNCLASSIFIED_SECRET');expect(output).not.toContain('PRIVATE_SERIAL');expect(output).not.toContain('OTHER_PRINTER_SECRET');expect(output).not.toContain('log:missing');expect(output).not.toContain('log:unknown');}
});
it('R22 hostile text/URL/SVG/CSS/image content remains inert and long input is preserved as text',()=>{
 const d=data(),attack='<script>globalThis.PWNED=1</script><img src=https://evil.invalid/x onerror=alert(1)><style>body{background:url(https://evil.invalid)}</style>';d.logs=[log('evil',{title:attack,notes:'x'.repeat(15000)+attack,sourceUrl:'javascript:alert(1)'})];d.printers[0].image='data:image/svg+xml;base64,'+btoa('<svg onload="alert(1)"/>');const report=selectReport(d,'Complete Maintenance History',filters()),html=reportHTML(report);expect(html).not.toMatch(/<script|<svg|<img[^>]+onerror=|<a href="javascript:/);expect(html).toContain('&lt;script&gt;');expect(html).not.toContain('<img src=');expect(html).toContain('x'.repeat(15000));expect(localReportImage('data:image/png;base64,'+btoa('<html>bad</html>'))).toBe('');expect(localReportImage(printer().image)).toBe(printer().image);
});
it('R23 standalone HTML and JSON retain generated instant, safety, typed currency and null unknown metadata',()=>{
 const report=selectReport(data(),'Complete Maintenance History',filters(),'2026-10-28',now),json=JSON.parse(reportJSON(report));expect(json.generatedAt).toBe(now);expect(json.rows[0].values.c5).toEqual({amount:12.5,currency:'CAD'});expect(json.rows[2].values.c5.currency).toBeNull();expect(json.rows[2].provenance.category).toBeNull();expect(json.safetyNotice).toContain('manufacturer');expect(reportHTML(report)).toContain(now);expect(reportHTML(report)).not.toMatch(/<script|<iframe|<object|<form|<link/);
});

it('R26 frozen legacy readers reject the observation extension and recording preference independently, without field stripping',()=>{
 const legacy=JSON.parse(readFileSync('tests/fixtures/legacy-schema1.synthetic.json','utf8'));
 const readers=JSON.parse(readFileSync('tests/fixtures/historical-backup-readers.json','utf8'));
 const history={version:1,records:[frozen()]};
 for(const reader of readers){
  // Execute the same pinned legacy schemas already hash-checked by original Q14.
  const exports:Record<string,unknown>={};
  const compiled=ts.transpileModule(reader.domainSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','exports',compiled)(createRequire(import.meta.url),exports);
  const schema=new Function('z',...Object.keys(exports),reader.backupSchemaSource.replace('export const backupSchema=','return '))(z,...Object.values(exports));
  expect(schema.safeParse(legacy).success,reader.ref+' unchanged legacy').toBe(true);
  expect(schema.safeParse({...legacy,overdueHistory:history}).success,reader.ref+' history only').toBe(false);
  expect(schema.safeParse({...legacy,preferences:{...legacy.preferences,observationRecording:true}}).success,reader.ref+' recording flag only').toBe(false);
 }
 expect(validateBackup({...legacy,overdueHistory:history,exportedAt:now}).overdueHistory).toEqual(history);
});
