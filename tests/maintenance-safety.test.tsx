// @vitest-environment jsdom
import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {printer,task,seed,empty,log} from '../acceptance-review/fixtures';
import {reviewedProfiles} from '../src/profiles';
import {maintenanceSafety,maintenanceSafetyText,completionNeedsContextReview,manufacturerIndependence} from '../src/maintenanceSafety';
import {CompletionForm} from '../src/forms';
import {DataContext,type AppData} from '../src/context';
import {defaults,type Task} from '../src/domain';
import {makeBackup,restoreBackup} from '../src/db';
import {createReviewReminder} from '../src/recommendations';
import {selectReport,defaultReportFilters} from '../src/reportModel';
import {reportJSON,reportHTML,serializeReportCSV} from '../src/reportExports';
import {scheduleICS,exportSafety} from '../src/safety';
beforeEach(async()=>{vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));await empty();});
afterEach(()=>{cleanup();vi.useRealTimers();});
const current=reviewedProfiles.find(p=>p.id==='flashforge-creator-5'&&p.version==='1.1.0')!;
const procedure=(id:string)=>({...current.templates.find(t=>t.templateId===id)!,id,printerId:'p1',anchorDate:'2026-01-01',anchorHours:100,anchorPrints:10} as Task);
const data=(extra:Partial<AppData>={}):AppData=>({printers:[printer()],tasks:[],logs:[],readings:[],repairs:[],inventory:[],profiles:[],prefs:defaults,notify:vi.fn(),run:async work=>{await work();return true;},...extra});
function mount(t=task(),extra:Partial<AppData>={}){return render(<DataContext.Provider value={data(extra)}><CompletionForm task={t} onClose={()=>{}}/></DataContext.Provider>);}

it.each([
 ['nozzle-cold-pull-cleaning',['thermal']],
 ['mainboard-cooling-fan-dust-cleaning',['electrical','moving','dust']],
 ['xy-axis-belt-tension-adjustment',['moving']],
 ['extruder-mount-positioning-balls',['materials']],
 ['feed-motor-gear-debris-cleaning',['moving','dust']],
])('H mapped %s uses reviewed references and permits multiple hazard categories',(id,hazards)=>{
 const assessed=maintenanceSafety(procedure(id as string),printer());expect(assessed.state).toBe('identified');expect(assessed.hazards).toEqual(hazards);expect(assessed.references).toContain(procedure(id as string).sourceUrl);expect(assessed.references[1]).toContain('/manual/notice');
});
it('H06 no title, priority, imported assertions, modified task or adjacent model can self-certify hazards',()=>{
 for(const t of [{...task(),title:'HOT PCB RESIN solvent repair',priority:'Critical' as const,source:'User Defined' as const},{...procedure('nozzle-cold-pull-cleaning'),source:'Pending Verification' as const},{...task(),profileVersion:'99.0.0'}]){expect(maintenanceSafety(t,printer()).state).toBe('unassessed');expect(maintenanceSafety(t,printer()).hazards).toEqual([]);}
 expect(maintenanceSafety(procedure('nozzle-cold-pull-cleaning'),printer('p1',{model:'Creator 5 Pro'})).state).toBe('unassessed');
 const pro=reviewedProfiles.find(p=>p.id==='flashforge-creator-5-pro')!;expect(maintenanceSafety({...pro.templates[0],id:'pro',printerId:'p1',anchorDate:'2026-01-01',anchorHours:100,anchorPrints:10},printer('p1',{model:'Creator 5 Pro'})).state).toBe('unassessed');
});
it('H07 exact legacy rule remains recognized; general guide and resin work remain unassessed, not safe',()=>{
 expect(maintenanceSafety(task(),printer()).hazards).toEqual(['materials']);expect(maintenanceSafety(procedure('general-linear-shaft-cleaning'),printer()).state).toBe('unassessed');
 expect(maintenanceSafety({...task(),source:'User Defined'},printer('p1',{technology:'Resin'})).scope).toContain('resin');
 expect(maintenanceSafetyText(task(),printer())).not.toContain('technician-only required');expect(manufacturerIndependence).not.toContain('®');
});
it('H08 completed work requires contextual and general review before the first-party form calls persistence',async()=>{
 const run=vi.fn();mount(procedure('nozzle-cold-pull-cleaning'),{run});fireEvent.click(screen.getByRole('checkbox',{name:/I have reviewed the applicable/}));
 const submit=screen.getByRole('button',{name:'Save completed record'});expect((submit as HTMLButtonElement).disabled).toBe(true);fireEvent.submit(submit.closest('form')!);expect(run).not.toHaveBeenCalled();expect(screen.getByRole('alert').textContent).toContain('specific safety context');
 fireEvent.click(screen.getByRole('checkbox',{name:/I have now reviewed/}));fireEvent.submit(submit.closest('form')!);await waitFor(()=>expect(run).toHaveBeenCalledTimes(1));
});
it('H09 retrospective wording confirms review now, not fabricated pre-service consent; date edits reset the gate',()=>{
 mount();fireEvent.change(screen.getByLabelText('Date'),{target:{value:'2026-02-01'}});expect(screen.getByRole('checkbox',{name:/I have now reviewed/}).parentElement?.textContent).toContain('retrospective record');
 fireEvent.click(screen.getByRole('checkbox',{name:/I have now reviewed/}));fireEvent.change(screen.getByLabelText('Date'),{target:{value:'2026-02-02'}});expect((screen.getByRole('checkbox',{name:/I have now reviewed/}) as HTMLInputElement).checked).toBe(false);expect(screen.getByText(/does not assert pre-service review/)).toBeTruthy();expect(screen.getByRole('checkbox',{name:/I have reviewed the applicable/}).parentElement?.textContent).toContain('available to me now');
});
it('H10 skip has no hazardous-work acknowledgment and switching outcomes resets review',()=>{
 mount();fireEvent.click(screen.getByRole('checkbox',{name:/I have now reviewed/}));fireEvent.change(screen.getByLabelText('Outcome'),{target:{value:'Skipped'}});
 expect(screen.queryByRole('checkbox',{name:/I have now reviewed/})).toBeNull();expect(screen.getByRole('checkbox',{name:/I confirm this is a skipped/})).toBeTruthy();
 fireEvent.change(screen.getByLabelText('Outcome'),{target:{value:'Completed'}});expect((screen.getByRole('checkbox',{name:/I have now reviewed/}) as HTMLInputElement).checked).toBe(false);
 expect(completionNeedsContextReview(task(),printer(),'Postponed')).toBe(false);
});
it('H11 suggested reviews remain reminders and do not receive physical-procedure classifications',()=>{
 const t=createReviewReminder(printer(),{group:'fan',dailyHours:5,custom:false,basis:'manual',printingCounterConfirmed:false,acknowledged:true},[]);
 expect(maintenanceSafety({...t,source:'User Defined',description:'Owner-chosen physical servicing'},printer()).state).toBe('unassessed');expect(maintenanceSafety(t,printer()).state).toBe('review-only');expect(completionNeedsContextReview(t,printer(),'Completed')).toBe(false);mount(t);expect(screen.queryByRole('checkbox',{name:/I have now reviewed/})).toBeNull();
});
it('H12 unmatched/custom work receives explicit uncertainty rather than a safe or technician-only classification',()=>{
 mount({...task(),source:'User Defined'});expect(screen.getByRole('heading',{name:'Safety not independently assessed'})).toBeTruthy();expect(screen.getByText(/No manufacturer technician-only designation/)).toBeTruthy();expect(screen.getAllByText(/Unknown hazards do not mean safe/).length).toBeGreaterThan(0);
});
it('H13 new schema/attestation claims are rejected and old backup records and historical status stay unchanged',async()=>{
 await seed();const before=await makeBackup();maintenanceSafety(task(),printer());const bad=structuredClone(before) as any;bad.tasks[0].hazardAcknowledgment={safe:true,policy:'1.0.0'};await expect(restoreBackup(bad,true)).rejects.toThrow();const after=await makeBackup();for(const key of ['tasks','printers','logs','profiles','readings','preferences'] as const)expect(after[key]).toEqual(before[key]);
});
it('H14 current export safety is visible without retroactively assigning historical hazard acknowledgments',()=>{
 const t=procedure('nozzle-cold-pull-cleaning'),l=log();const d={printers:[printer()],tasks:[t],logs:[l],readings:[],repairs:[],prefs:defaults};const schedule=selectReport(d,'Complete Maintenance Schedule',defaultReportFilters());
 for(const output of [serializeReportCSV(schedule),reportJSON(schedule),reportHTML(schedule),scheduleICS([{id:t.id,date:'2035-01-01',title:t.title,description:maintenanceSafetyText(t,printer())}],'20261030T120000Z')]){expect(output.replace(/\r\n /g,'')).toContain('not safety approval');expect(output.replace(/\r\n /g,'')).toContain('Heated/hot-end');}
 const history=selectReport(d,'Complete Maintenance History',defaultReportFilters());expect(history.rows[0].provenance.recommendationContext).not.toContain('Safety reference policy');expect(l.source).toBe('Manufacturer Verified');expect(exportSafety).toContain('Unknown hazards');
});
