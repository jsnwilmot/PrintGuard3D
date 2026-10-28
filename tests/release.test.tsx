// @vitest-environment jsdom
import React from 'react';
import {it,expect,beforeEach,afterEach,vi} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {z} from 'zod';
import {printer,task,log,seed,empty} from '../acceptance-review/fixtures';
import {db,makeBackup,restoreBackup,validateBackup,saveRepair} from '../src/db';
import {DataContext,type AppData} from '../src/context';
import {defaults,profileSchema,type Reading} from '../src/domain';
import {expenseGroups,expenseSummary,money,missedOccurrences,estimateUsageDate,openRepair} from '../src/reporting';
import {due,status,occurrences} from '../src/engine';
import {historyMatches} from '../src/scheduleView';
import {reviewedProfiles,reviewProfile} from '../src/profiles';
import {Reports} from '../src/Reports';
import {Dashboard} from '../src/Dashboard';
import {Calendar} from '../src/Calendar';
import {Settings} from '../src/Settings';

beforeEach(async()=>{await empty();window.scrollTo=vi.fn();});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
function mount(child:React.ReactNode,data:Partial<AppData>={}){return render(<DataContext.Provider value={{printers:[printer()],tasks:[task()],logs:[],readings:[],inventory:[],repairs:[],profiles:[],prefs:defaults,run:async work=>{await work();return true;},notify:vi.fn(),...data}}>{child}</DataContext.Provider>);}
const readings:Reading[]=[{id:'r1',printerId:'p1',date:'2026-10-01',hours:100,prints:10},{id:'r2',printerId:'p1',date:'2026-10-21',hours:300,prints:50}];
const current=()=>printer('p1',{hours:300,prints:50});

it('Q01 recorded expenses include spent costs on skipped work and group currencies without preference fallback',()=>{
 const logs=[log('a',{currency:'CAD',cost:10}),log('b',{currency:'USD',cost:20}),log('c',{cost:3}),log('s',{currency:'CAD',cost:900,outcome:'Skipped'})];
 expect(expenseGroups(logs)).toEqual([{currency:'CAD',total:910},{currency:'Unclassified currency',total:3},{currency:'USD',total:20}]);expect(expenseSummary(logs)).not.toContain('33.00');expect(money(3)).toBe('3.00 Unclassified currency');
});
it('Q02 new repair currency is captured once; editing legacy or historical repairs never backfills/replaces it',async()=>{
 await seed();const r=(await db.repairs.toArray())[0];await saveRepair({...r,notes:'Legacy edit',currency:'EUR'});expect((await db.repairs.get(r.id))?.currency).toBeUndefined();await saveRepair({...r,id:'new'});expect((await db.repairs.get('new'))?.currency).toBe('USD');await db.preferences.update('preferences',{currency:'CAD'});await saveRepair({...r,id:'new',currency:'EUR'});expect((await db.repairs.get('new'))?.currency).toBe('USD');
});
it('Q03 missing attribution is separate unclassified context in reports and calendar, never reclassified by current rules',()=>{
 const l=log();mount(<Reports/>,{logs:[l],tasks:[task('t1','p1',{category:'Cleaning'})]});fireEvent.change(screen.getByLabelText('Category'),{target:{value:'Cleaning'}});expect(screen.queryByRole('cell',{name:l.title})).toBeNull();expect(screen.getByText(l.title)).toBeTruthy();expect(screen.getByRole('button',{name:'Export unclassified history CSV'})).toBeTruthy();expect(historyMatches(l,{printer:'',category:'Cleaning',priority:'Critical',state:'Completed'})).toBe(true);
});
it('Q04 dashboard cost, repair, compliance, critical and missed KPI buttons open their corresponding record reports',()=>{
 const navigate=vi.fn();mount(<Dashboard onAdd={()=>{}} onPrinter={()=>{}} onTask={()=>{}} navigate={navigate}/>,{logs:[log('l',{currency:'EUR',skippedCycles:2})]});
 for(const [label,report] of [['Maintenance costs','Maintenance Expenses'],['Outstanding repairs','Open Repairs'],['Maintenance compliance','Maintenance Compliance'],['Overdue critical tasks','Overdue Critical Maintenance'],['Recorded missed occurrences','Recorded Missed Maintenance']]){fireEvent.click(screen.getByRole('button',{name:new RegExp(label)}));expect(navigate).toHaveBeenLastCalledWith('Reports',report);}
});
it('Q05 missed occurrence counts distinguish explicit skips, elapsed cycles and postponements',()=>{
 expect(missedOccurrences([log('a',{skippedCycles:4}),log('b',{outcome:'Skipped'}),log('c',{outcome:'Postponed',skippedCycles:99})])).toBe(5);
});
it('Q06 open repairs exclude only resolved/closed states',async()=>{await seed();const r=(await db.repairs.toArray())[0];expect(openRepair(r)).toBe(true);expect(openRepair({...r,status:'Resolved'})).toBe(false);expect(openRepair({...r,status:'Closed'})).toBe(false);});
it('Q07 hour estimates use actual distinct-date positive readings and explain measured span',()=>{
 const estimate=estimateUsageDate(task(),current(),readings,'2026-10-28');expect(estimate?.date).toBe('2026-11-20');expect(estimate?.rate).toBe(10);expect(estimate?.reason).toContain('20 days');
});
it.each(['single','same-day','stale','zero','decreasing','unsynchronized','future','reached'] as const)('Q08 estimate is unknown for %s usage history',kind=>{
 let rs=structuredClone(readings),p=current();if(kind==='single')rs=rs.slice(1);if(kind==='same-day')rs[0].date=rs[1].date;if(kind==='stale')rs=rs.map(r=>({...r,date:r.date.replace('-10-','-08-')}));if(kind==='zero')rs[0].hours=rs[1].hours;if(kind==='decreasing')rs[0].hours=400;if(kind==='unsynchronized')p.hours=301;if(kind==='future')rs[1].date='2027-01-01';if(kind==='reached')p.hours=600;expect(estimateUsageDate(task(),p,rs,'2026-10-28')).toBeNull();
});
it('Q09 print estimates and combined rules never change actual due/status, ICS/calendar dates or stored history',()=>{
 const p=current(),t=task('t1','p1',{interval:{mode:'prints',prints:100},originalInterval:{mode:'prints',prints:100}});const before=structuredClone({p,t,readings}),d=due(t),s=status(t,p,'2026-10-28');expect(estimateUsageDate(t,p,readings,'2026-10-28')?.basis).toBe('prints');expect(due(t)).toEqual(d);expect(status(t,p,'2026-10-28')).toBe(s);expect(occurrences(t,'2035-01-01','2400-01-01')).toEqual([]);expect({p,t,readings}).toEqual(before);
});
it('Q10 completed calendar details are keyboard accessible, read-only and use original source/currency/profile metadata',()=>{
 const l=log();mount(<Calendar onTask={()=>{throw Error('Historical entry must not open a mutable task');}}/>,{logs:[l]});fireEvent.change(screen.getByLabelText('Jump to calendar date'),{target:{value:l.date}});fireEvent.click(screen.getByRole('button',{name:/Historical lubrication/}));expect(screen.getByRole('dialog').textContent).toContain('read only');expect(screen.getByRole('dialog').textContent).toContain('Unclassified currency');expect(screen.queryByRole('button',{name:'Record maintenance'})).toBeNull();
});
it('Q11 current reader preserves unknown JSON profile metadata exactly while blocking any added verification claim',async()=>{
 await seed();const backup=await makeBackup();const p=backup.profiles.find(p=>p.id==='custom-resin')!;const original={vendorMetadata:{legacy:[1,true,null,'kept'],nested:{date:'2020-01-01'}}};Object.assign(p,original);const valid=validateBackup(backup);await restoreBackup(valid,true);expect((await makeBackup()).profiles.find(row=>row.id===p.id)?.vendorMetadata).toEqual(original.vendorMetadata);const changed={...reviewedProfiles[0],vendorMetadata:original.vendorMetadata};expect(reviewProfile(changed).status).toBe('Pending Verification');expect(profileSchema.safeParse({...changed,vendorMetadata:()=>1}).success).toBe(false);
});
it('Q12 malformed extension fields, incompatible schema and immutable conflicts fail before writes',async()=>{
 await seed();const before=await makeBackup();expect(()=>validateBackup({...before,schemaVersion:2})).toThrow(/unsupported schema/);const bad=structuredClone(before);bad.logs.push(log('orphan',{printerId:'missing'}));await expect(restoreBackup(bad,true)).rejects.toThrow();const conflict=structuredClone(before);conflict.printers[0].serial='different';await expect(restoreBackup(conflict,false)).rejects.toThrow();const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles','preferences'] as const)expect(after[key]).toEqual(before[key]);
});
it('Q13 injected quota failure midway through replacement rolls back clears and prior successful writes in all stores',async()=>{
 await seed();const before=await makeBackup();vi.spyOn(db.logs,'add').mockRejectedValueOnce(new DOMException('Synthetic storage quota fault','QuotaExceededError'));const incoming=structuredClone(before);incoming.logs=[log()];incoming.printers[0].hours=600;incoming.printers[0].prints=20;await expect(restoreBackup(incoming,true)).rejects.toThrow();const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles','preferences'] as const)expect(after[key]).toEqual(before[key]);
});
it('Q14 frozen original and Phase 1–4 strict schema readers verify actual directionality without stripping new fields',async()=>{
 const readers=JSON.parse(readFileSync('tests/fixtures/historical-backup-readers.json','utf8'));const legacy=JSON.parse(readFileSync('tests/fixtures/legacy-schema1.synthetic.json','utf8'));expect(validateBackup(legacy).printers).toHaveLength(3);
 const enriched=structuredClone(legacy);enriched.profiles=enriched.profiles.map((p:{id:string})=>p.id==='flashforge-creator-5'?structuredClone(reviewedProfiles.find(p=>p.version==='1.1.0')!):p);enriched.profiles[0]={...enriched.profiles[0],legacyMetadata:{retained:true}};enriched.preferences.criticalTarget=0;enriched.repairs[0].currency='CAD';
 for(const reader of readers){expect(createHash('sha256').update(reader.domainSource).digest('hex')).toBe(reader.domainSHA256);const exports:Record<string,unknown>={};const compiled=ts.transpileModule(reader.domainSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports',compiled)(createRequire(import.meta.url),exports);const names=Object.keys(exports);const schema=new Function('z',...names,reader.backupSchemaSource.replace('export const backupSchema=','return ')) (z,...Object.values(exports));expect(schema.safeParse(legacy).success,reader.ref+' legacy').toBe(true);expect(schema.safeParse(enriched).success,reader.ref+' enriched').toBe(false);}
 expect(validateBackup(enriched).profiles[0].legacyMetadata).toEqual({retained:true});
});

it('Q15 oversized backup is rejected before reading or parsing its contents',async()=>{
 Object.defineProperty(navigator,'storage',{configurable:true,value:{estimate:async()=>({}),persisted:async()=>false}});mount(<Settings onLegal={()=>{}}/>);const file=new File(['{}'],'synthetic-oversize.json',{type:'application/json'}),text=vi.fn();Object.defineProperty(file,'size',{value:100000001});Object.defineProperty(file,'text',{value:text});fireEvent.change(screen.getByLabelText('Choose JSON file'),{target:{files:[file]}});expect(await screen.findByRole('alert')).toBeTruthy();expect(screen.getByRole('alert').textContent).toContain('100 MB');expect(text).not.toHaveBeenCalled();
});
it('Q16 repair expenses respect captured severity/status and never acquire a guessed maintenance category',async()=>{
 await seed();const repairs=await db.repairs.toArray();mount(<Reports initialType="Maintenance Expenses"/>,{printers:await db.printers.toArray(),repairs,tasks:[task()]});expect(screen.getByRole('cell',{name:'Test repair'})).toBeTruthy();fireEvent.change(screen.getByLabelText('Priority'),{target:{value:'Low'}});expect(screen.queryByRole('cell',{name:'Test repair'})).toBeNull();fireEvent.change(screen.getByLabelText('Priority'),{target:{value:'High'}});expect(screen.getByRole('cell',{name:'Test repair'})).toBeTruthy();fireEvent.change(screen.getByLabelText('Category'),{target:{value:'Lubrication'}});expect(screen.queryByRole('cell',{name:'Test repair'})).toBeNull();
});
it('Q17 a monthly activity drilldown selects the exact date range instead of displaying a misleading year preset',()=>{
 mount(<Reports initialType="Complete Maintenance History|2026-02"/>);expect((screen.getByLabelText('From') as HTMLInputElement).value).toBe('2026-02-01');expect((screen.getByLabelText('Through') as HTMLInputElement).value).toBe('2026-02-28');expect((screen.getByLabelText('Reporting period') as HTMLSelectElement).value).toBe('custom');
});
it('Q18 usage estimates remain available after 2400 and never expire recurring definitions',()=>{
 const rs=readings.map(r=>({...r,date:r.date.replace('2026','2500')}));expect(estimateUsageDate(task(),current(),rs,'2500-10-28')?.date).toBe('2500-11-20');expect(occurrences(task('calendar','p1',{interval:{mode:'calendar',months:1}}),'2500-01-01','2500-12-31')).toHaveLength(12);
});
it('Q19 reserved or excessively deep profile metadata fails closed instead of being silently omitted by object parsing',()=>{
 const profile=structuredClone(reviewedProfiles[0]);Object.defineProperty(profile,'__proto__',{value:{keep:'must not silently disappear'},enumerable:true});expect(profileSchema.safeParse(profile).success).toBe(false);let nested:unknown='end';for(let i=0;i<35;i++)nested={nested};expect(profileSchema.safeParse({...reviewedProfiles[0],legacyMetadata:nested}).success).toBe(false);
});
