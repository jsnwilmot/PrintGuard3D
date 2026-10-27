// @vitest-environment jsdom
import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {empty,seed,printer,task,input} from '../acceptance-review/fixtures';
import {DataContext,type AppData} from '../src/context';
import {defaults} from '../src/domain';
import {db,completeTask,makeBackup} from '../src/db';
import {bundled} from '../src/profiles';
import {Settings} from '../src/Settings';
import {Reports} from '../src/Reports';
import {PrinterForm,TaskForm,RepairForm} from '../src/forms';
import {advance,due} from '../src/engine';

beforeEach(async()=>{await empty();Object.defineProperty(navigator,'storage',{configurable:true,value:{estimate:async()=>({}),persisted:async()=>false}});});afterEach(cleanup);
function mount(children:React.ReactNode,extra:Partial<AppData>={}){
 const data:AppData={printers:[],tasks:[],logs:[],readings:[],inventory:[],repairs:[],profiles:[],prefs:defaults,notify:vi.fn(),run:async work=>{await work();return true;},...extra};
 return render(<DataContext.Provider value={data}>{children}</DataContext.Provider>);
}
function file(value:unknown){const f=new File([JSON.stringify(value)],'isolated.json',{type:'application/json'});Object.defineProperty(f,'text',{value:async()=>JSON.stringify(value)});return f;}
it('P35: import preview identifies conflicting rows and prevents confirmed merge',async()=>{
 await seed();const incoming=await makeBackup();await db.tasks.update('t1',{printerId:'p2'});
 mount(<Settings onLegal={()=>{}}/>);fireEvent.change(screen.getByLabelText('Choose JSON file'),{target:{files:[file(incoming)]}});
 await screen.findByText('Import blocked. No records changed.');expect(screen.getByText(/tasks t1: conflicting identity/)).toBeTruthy();
 fireEvent.click(screen.getByLabelText(/I reviewed this import/));expect((screen.getByRole('button',{name:'Restore and merge'}) as HTMLButtonElement).disabled).toBe(true);
 expect((await db.tasks.get('t1'))!.printerId).toBe('p2');
});
it('P36: pending imported profiles do not advertise automatic verified scheduling',()=>{
 const imported={...bundled[0],id:'imported',manufacturer:'New Manufacturer',model:'New Resin',technology:'Resin' as const,version:'2'};
 mount(<PrinterForm onClose={()=>{}}/>,{profiles:[imported]});fireEvent.change(screen.getByLabelText('Manufacturer'),{target:{value:'New Manufacturer'}});
 expect((screen.getByLabelText('Model') as HTMLSelectElement).value).toBe('New Resin');expect((screen.getByLabelText('Printing technology') as HTMLSelectElement).value).toBe('Resin');
 expect(screen.getByText('Profile pending verification')).toBeTruthy();expect(screen.queryByText('Activate verified maintenance schedule from the current usage reading')).toBeNull();
});
it('P37: editing a historical rule cannot move its history through the form',async()=>{
 await seed();await completeTask('t1',input());const old=(await db.tasks.get('t1'))!;const logs=await db.logs.toArray();
 mount(<TaskForm task={old} onClose={()=>{}}/>,{printers:await db.printers.toArray()});fireEvent.change(screen.getByLabelText('Printer'),{target:{value:'p2'}});fireEvent.submit(screen.getByRole('button',{name:'Save maintenance rule'}).closest('form')!);
 await screen.findByText(/A rule with maintenance history cannot be reassigned/);expect(await db.tasks.get('t1')).toEqual(old);expect(await db.logs.toArray()).toEqual(logs);
});
it('P38: fixed-cadence edit previews and persists the same forward date',async()=>{
 const p=printer('p1',{hours:600,prints:20});await db.printers.add(p);
 const old=advance(task('t1','p1',{anchorDate:'2026-01-31',interval:{mode:'calendar',months:1},base:'scheduled'}),'2026-06-30',600,20).task;await db.tasks.add(old);
 const close=vi.fn();mount(<TaskForm task={old} onClose={close}/>,{printers:[p]});fireEvent.change(screen.getByLabelText('Calendar interval'),{target:{value:'2'}});
 expect(screen.getByText(/Next due after saving: 2026-08-30/)).toBeTruthy();fireEvent.submit(screen.getByRole('button',{name:'Save maintenance rule'}).closest('form')!);await waitFor(()=>expect(close).toHaveBeenCalled());expect(due((await db.tasks.get(old.id))!).date).toBe('2026-08-30');
});
it('P39: historical report classification remains stable after current metadata changes',async()=>{
 await seed();await completeTask('t1',input());const logs=await db.logs.toArray();const tasks=await db.tasks.toArray();tasks[0].category='Cleaning';
 mount(<Reports/>,{printers:await db.printers.toArray(),tasks,logs});fireEvent.change(screen.getByLabelText('Category'),{target:{value:'Cleaning'}});expect(screen.queryByRole('cell',{name:logs[0].title})).toBeNull();
 fireEvent.change(screen.getByLabelText('Category'),{target:{value:'Lubrication'}});expect(screen.getByRole('cell',{name:logs[0].title})).toBeTruthy();
});
it('P40: profile preview shows changed intervals and pending attribution before acceptance',async()=>{
 const incoming=structuredClone(bundled[0]);incoming.version='2.0.0';incoming.templates[0].interval.hours=250;
 mount(<Settings onLegal={()=>{}}/>);fireEvent.change(screen.getByLabelText('Import profile JSON'),{target:{files:[file(incoming)]}});
 await screen.findByRole('heading',{name:'Review profile package'});expect(screen.getByText(/250 operating hours/)).toBeTruthy();expect(screen.getByText(/Unsubstantiated manufacturer labels are quarantined/)).toBeTruthy();expect((screen.getByRole('button',{name:'Accept profile package'}) as HTMLButtonElement).disabled).toBe(true);
});
it('P47: the repair form uses the guarded writer and cannot move an existing record',async()=>{
 await seed();const repair=(await db.repairs.toArray())[0];const errors:string[]=[];const close=vi.fn();
 mount(<RepairForm repair={repair} onClose={close}/>,{printers:await db.printers.toArray(),run:async work=>{try{await work();return true;}catch(error){errors.push((error as Error).message);return false;}}});
 fireEvent.change(screen.getByLabelText('Printer'),{target:{value:'p1'}});fireEvent.submit(screen.getByRole('button',{name:'Save repair'}).closest('form')!);
 await waitFor(()=>expect(errors.join(' ')).toContain('must retain its printer'));expect(await db.repairs.get(repair.id)).toEqual(repair);expect(close).not.toHaveBeenCalled();
});
