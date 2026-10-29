// @vitest-environment jsdom
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
import {printer,task,log} from '../acceptance-review/fixtures';
import {DataContext,type AppData} from '../src/context';
import {defaults,type Task} from '../src/domain';
import {Calendar} from '../src/Calendar';
import {Reports} from '../src/Reports';
import {Dashboard} from '../src/Dashboard';
import {addInterval,occurrences} from '../src/engine';
import {validCalendarDate,usageDue,upcomingTask,upcomingOccurrences,calendarOccurrences} from '../src/scheduleView';

afterEach(()=>{cleanup();vi.useRealTimers();});
function mount(child:React.ReactNode,extra:Partial<AppData>={}){
 const value:AppData={printers:[],tasks:[],logs:[],readings:[],inventory:[],repairs:[],profiles:[],prefs:defaults,notify:vi.fn(),run:async work=>{await work();return true;},...extra};
 return render(<DataContext.Provider value={value}>{child}</DataContext.Provider>);
}
function atDate(){vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date('2026-10-27T12:00:00Z'));}
const calendarTask=(id:string,date:string)=>task(id,'p1',{title:id,interval:{mode:'once'},anchorDate:date,source:'User Defined'});

it('S01 U18: segmented years, clearing and invalid input retain 42 valid cells through 2400',()=>{
 const view=mount(<Calendar onTask={()=>{}}/>,{printers:[printer()]});
 const input=screen.getByLabelText('Jump to calendar date');
 for(const value of ['0002-10-26','0020-10-26','0203-10-26','2035-10-26','','2040-02-29','2400-02-29']){
  fireEvent.change(input,{target:{value}});
  const cells=[...view.container.querySelectorAll('.calendar-cell')];
  expect(cells).toHaveLength(42);expect(cells.every(cell=>!cell.textContent?.includes('NaN'))).toBe(true);
 }
 expect(screen.getByRole('heading',{name:'February 2400'})).toBeTruthy();
 expect(validCalendarDate('2035-02-29')).toBe(false);expect(validCalendarDate('2040-02-29')).toBe(true);
 expect(validCalendarDate('2400-02-29')).toBe(true);expect(validCalendarDate('0000-01-01')).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Next period'}));expect(screen.getByRole('heading',{name:'March 2400'})).toBeTruthy();
});
it('S02 U11: usage thresholds are inclusive, independent and exclude paused, archived, postponed and unreached work',()=>{
 const p=printer('p1',{hours:600,prints:15});
 for(const mode of ['hours','prints','afterPrint'] as const){const t=task('t','p1',{interval:mode==='hours'?{mode,hours:500}:mode==='prints'?{mode,prints:5}:{mode},anchorPrints:mode==='afterPrint'?14:10});expect(usageDue(t,p,'2026-10-27')).toBe(true);expect(usageDue({...t,enabled:false},p)).toBe(false);expect(usageDue(t,{...p,archived:true})).toBe(false);expect(usageDue({...t,postponedUntil:'2035-01-01'},p,'2026-10-27')).toBe(false);}
 expect(usageDue(task(),{...p,hours:599})).toBe(false);
 expect(usageDue(task('t','p2'),printer('p2',{hours:100}))).toBe(false);
});
it('S03 U11: undated due work remains actionable in all views and honors printer/status filters',()=>{
 const tasks=[task('hours','p1',{title:'Hour threshold'}),task('prints','p2',{title:'Print threshold',interval:{mode:'prints',prints:5}})];
 const open=vi.fn();mount(<Calendar onTask={open}/>,{printers:[printer('p1',{hours:600}),printer('p2',{prints:15})],tasks});
 for(const view of ['Month','Week','Day','Agenda']){fireEvent.click(screen.getByRole('button',{name:view,exact:true}));const panel=screen.getByRole('region',{name:'Maintenance due from recorded usage'});expect(within(panel).getAllByRole('button')).toHaveLength(2);expect(within(panel).getByText(/No calendar date is forecast/)).toBeTruthy();}
 fireEvent.change(screen.getByLabelText('Calendar printer'),{target:{value:'p2'}});expect(screen.queryByRole('button',{name:/Hour threshold/})).toBeNull();fireEvent.click(screen.getByRole('button',{name:/Print threshold/}));expect(open).toHaveBeenCalledWith(tasks[1]);
 fireEvent.change(screen.getByLabelText('Calendar status'),{target:{value:'Upcoming'}});expect(screen.queryByRole('button',{name:/Print threshold/})).toBeNull();
});
it('S04 U10: completed events use captured printer/category/priority/outcome in every calendar view',()=>{
 const logs=[log('one',{category:'Lubrication',priority:'High'}),log('two',{printerId:'p2',title:'Other history',category:'Cleaning',priority:'Low'})];const original=structuredClone(logs);
 mount(<Calendar onTask={()=>{}}/>,{printers:[printer(),printer('p2')],tasks:[task('t1','p1',{category:'Cleaning'})],logs});
 fireEvent.change(screen.getByLabelText('Jump to calendar date'),{target:{value:'2026-02-01'}});
 for(const view of ['Month','Week','Day','Agenda']){
  fireEvent.click(screen.getByRole('button',{name:view,exact:true}));fireEvent.change(screen.getByLabelText('Calendar category'),{target:{value:'Lubrication'}});
  expect(screen.getByText(/Historical lubrication/)).toBeTruthy();expect(screen.queryByText(/Other history/)).toBeNull();
  fireEvent.change(screen.getByLabelText('Calendar priority'),{target:{value:'Low'}});expect(screen.queryByText(/Historical lubrication/)).toBeNull();
  fireEvent.change(screen.getByLabelText('Calendar priority'),{target:{value:'High'}});fireEvent.change(screen.getByLabelText('Calendar status'),{target:{value:'Completed'}});expect(screen.getByText(/Historical lubrication/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Calendar status'),{target:{value:'Overdue'}});expect(screen.queryByText(/Historical lubrication/)).toBeNull();fireEvent.change(screen.getByLabelText('Calendar status'),{target:{value:''}});
 }
 fireEvent.change(screen.getByLabelText('Calendar printer'),{target:{value:'p2'}});expect(screen.queryByText(/Historical lubrication/)).toBeNull();expect(logs).toEqual(original);
});
it('S05 U10: legacy metadata remains explicitly unclassified rather than inferred or rewritten',()=>{
 const legacy=log();mount(<Calendar onTask={()=>{}}/>,{printers:[printer()],tasks:[task()],logs:[legacy]});
 fireEvent.change(screen.getByLabelText('Jump to calendar date'),{target:{value:'2026-02-01'}});fireEvent.change(screen.getByLabelText('Calendar category'),{target:{value:'Lubrication'}});
 expect(screen.getByText(/Unclassified historical metadata/)).toBeTruthy();expect(legacy.category).toBeUndefined();
 fireEvent.change(screen.getByLabelText('Calendar status'),{target:{value:'Overdue'}});expect(screen.queryByText(/Historical lubrication/)).toBeNull();
});
it('S06 U07: due usage rows have no fabricated date; unreached/paused/archived work is excluded',()=>{
 atDate();const p=printer('p1',{hours:600,prints:15});const tasks=[task('due','p1',{title:'Due hours'}),task('prints','p1',{title:'Due prints',interval:{mode:'prints',prints:5}}),task('future','p1',{title:'Unknown future',interval:{mode:'hours',hours:900}}),task('paused','p1',{enabled:false,title:'Paused'})];
 mount(<Reports/>,{printers:[p],tasks});fireEvent.change(screen.getByLabelText('Report'),{target:{value:'Upcoming Maintenance'}});fireEvent.change(screen.getByLabelText('Reporting period'),{target:{value:'7'}});
 for(const title of ['Due hours','Due prints']){const row=screen.getByRole('cell',{name:title}).closest('tr')!;expect(within(row).getAllByRole('cell')[2].textContent).toBe('');expect(row.textContent).toContain('calendar date unknown');}
 expect(screen.queryByRole('cell',{name:'Unknown future'})).toBeNull();expect(screen.queryByRole('cell',{name:'Paused'})).toBeNull();
 fireEvent.change(screen.getByLabelText('From'),{target:{value:'2035-01-01'}});fireEvent.change(screen.getByLabelText('Through'),{target:{value:'2035-01-31'}});expect(screen.queryByRole('cell',{name:'Due hours'})).toBeNull();
});
it('S07 U08: parts rows align materials, currency, documentation and notes with their own headers',()=>{
 const l=log('parts',{materials:'Needle roller grease',cost:42.5,currency:'USD',notes:'Distinct notes'});mount(<Reports/>,{printers:[printer()],logs:[l]});
 fireEvent.change(screen.getByLabelText('Report'),{target:{value:'Parts Replacement History'}});const headers=screen.getAllByRole('columnheader').map(e=>e.textContent);const row=screen.getByRole('cell',{name:l.title}).closest('tr')!;const cells=within(row).getAllByRole('cell');
 expect(headers).toEqual(['Task','Printer','Date','Status','Materials / parts','Cost','Documentation','Notes','Recommendation classification and assumptions']);expect(cells).toHaveLength(headers.length);expect(cells[4].textContent).toBe(l.materials);expect(cells[5].textContent).toBe('42.50 USD');expect(within(cells[6]).getByRole('link').getAttribute('href')).toBe(l.sourceUrl);expect(cells[7].textContent).toBe('Distinct notes');expect(cells[8].textContent).toContain('historical attribution');
});
it('S08 U12: dashboard horizons exclude overdue/undated work and include inclusive date boundaries',()=>{
 atDate();const tasks=[calendarTask('today','2026-10-27'),calendarTask('day7','2026-11-03'),calendarTask('day8','2026-11-04'),calendarTask('overdue','2026-10-26'),task('undated')];
 mount(<Dashboard onAdd={()=>{}} onPrinter={()=>{}} onTask={()=>{}} navigate={()=>{}}/>,{printers:[printer()],tasks});fireEvent.click(screen.getByRole('button',{name:'7 days'}));expect(screen.getByRole('heading',{name:/Upcoming maintenance/}).textContent).toBe('Upcoming maintenance2');fireEvent.click(screen.getByRole('button',{name:'30 days'}));expect(screen.getByRole('heading',{name:/Upcoming maintenance/}).textContent).toBe('Upcoming maintenance3');
});
it('S09 U12: selected report range excludes past occurrences, preserves projections, and separates overdue usage',()=>{
 atDate();const p=printer('p1',{hours:601});const t=task('weekly','p1',{interval:{mode:'calendar',days:7},anchorDate:'2026-10-01',source:'User Defined'});
 const events=upcomingOccurrences(t,p,'2026-10-01','2026-11-03','2026-10-27');expect(events.map(e=>e.date)).toEqual(['2026-10-29']);expect(events.every(e=>e.projected)).toBe(true);
 expect(upcomingTask(calendarTask('overdue','2026-10-26'),p,'2026-10-27','2026-11-03','2026-10-27')).toBe(false);
 expect(upcomingOccurrences(t,p,'','2026-11-03')).toEqual([]);expect(upcomingOccurrences(t,p,'2035-01-02','2035-01-01')).toEqual([]);
});
it('S10 perpetual: month-end, leap-year and far-future recurrence remains unchanged through 2400',()=>{
 const t:Task=task('monthly','p1',{interval:{mode:'calendar',months:1},anchorDate:'2024-01-31',source:'User Defined'});const before=structuredClone(t);
 expect(occurrences(t,'2400-02-01','2400-03-31').map(e=>e.date)).toEqual(['2400-02-29','2400-03-31']);expect(addInterval('2035-12-31',1)).toBe('2036-01-01');expect(t).toEqual(before);expect('endDate' in t).toBe(false);
});
it('S11 explicit postponed usage dates are shown once without inventing a recurring calendar forecast',()=>{
 const t=task('hours','p1',{postponedUntil:'2035-03-01'}),p=printer('p1',{hours:600});
 expect(calendarOccurrences(t,'2035-03-01','2035-03-31')).toEqual([{task:t,date:'2035-03-01',projected:false,key:'hours2035-03-01'}]);
 expect(upcomingOccurrences(t,p,'2035-03-01','2035-03-31','2035-02-01')).toHaveLength(1);
 expect(calendarOccurrences(t,'2035-04-01','2035-04-30')).toEqual([]);
 expect(usageDue(t,p,'2035-02-01')).toBe(false);
});
it('S12 U12: a combined rule reached by usage is current work, not an upcoming later calendar deadline',()=>{
 const t=task('combined','p1',{interval:{mode:'combined',days:30,hours:500},anchorDate:'2026-10-01'}),p=printer('p1',{hours:600});
 expect(usageDue(t,p,'2026-10-27')).toBe(true);
 expect(upcomingTask(t,p,'2026-10-27','2026-11-03','2026-10-27')).toBe(false);
 expect(upcomingOccurrences(t,p,'2026-10-27','2026-11-03','2026-10-27')).toEqual([]);
});
