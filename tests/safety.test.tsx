// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import App from '../src/App';
import {db,makeBackup} from '../src/db';
import {seed,empty,task,printer} from '../acceptance-review/fixtures';
import {defaults} from '../src/domain';
import {disclaimerVersion} from '../src/legal';
import {exportSafety,reportCSV,scheduleICS,hasAcknowledgment} from '../src/safety';
import {Modal,Field,SafetyNote,TaskApplicability} from '../src/components';
import {DataContext,type AppData} from '../src/context';
import {CompletionForm} from '../src/forms';
import {SourceLink} from '../src/ProfileDocuments';

beforeEach(async()=>{await empty();history.replaceState(null,'','/');window.scrollTo=vi.fn();});
afterEach(cleanup);
const context=(extra:Partial<AppData>={}):AppData=>({printers:[printer()],tasks:[task()],logs:[],readings:[],repairs:[],inventory:[],profiles:[],prefs:defaults,notify:vi.fn(),run:async work=>{await work();return true;},...extra});
function mount(children:React.ReactNode,extra:Partial<AppData>={}){return render(<DataContext.Provider value={context(extra)}>{children}</DataContext.Provider>);}

it('L01 acknowledgment requires the current version and a recorded date',()=>{
 expect(hasAcknowledgment(defaults)).toBe(false);expect(hasAcknowledgment({...defaults,acknowledgment:{version:'old',date:'2026-01-01'}})).toBe(false);expect(hasAcknowledgment({...defaults,acknowledgment:{version:disclaimerVersion,date:''}})).toBe(false);expect(hasAcknowledgment({...defaults,acknowledgment:{version:disclaimerVersion,date:'2026-01-01'}})).toBe(true);
});
it('L02 stale acknowledgment hides stored workshop data even in dashboard exploration, search and deep links',async()=>{
 await seed();await db.preferences.update('preferences',{acknowledgment:{version:'old',date:'2026-01-01'}});const before=await makeBackup();history.replaceState(null,'','/#Reports');
 const spies=[db.printers,db.tasks,db.logs,db.inventory].map(table=>vi.spyOn(table,'toArray'));
 render(<App/>);await screen.findByRole('heading',{name:'Welcome to a better-kept workshop'});fireEvent.click(screen.getByRole('button',{name:'Explore the dashboard first'}));
 expect(screen.queryByText('Review printer p1')).toBeNull();fireEvent.change(screen.getByLabelText('Search printers and tasks'),{target:{value:'Service'}});expect(screen.getByText('No matching printers or tasks.')).toBeTruthy();
 for(const spy of spies){expect(spy).not.toHaveBeenCalled();spy.mockRestore();}
 expect((await makeBackup()).printers).toEqual(before.printers);expect((await makeBackup()).logs).toEqual(before.logs);
});
it('L03 explicit acknowledgment preserves all preexisting preferences and records',async()=>{
 await seed();await db.preferences.update('preferences',{acknowledgment:null,target:77,sourceFlags:[{url:'https://example.com/source',date:'2026-10-27',reason:'Review'}]});const before=await makeBackup();
 render(<App/>);await screen.findByRole('button',{name:'Review the disclaimer'});fireEvent.click(screen.getByRole('button',{name:'Review the disclaimer'}));const checkbox=screen.getByRole('checkbox') as HTMLInputElement;expect(checkbox.checked).toBe(false);fireEvent.click(checkbox);fireEvent.click(screen.getByRole('button',{name:/I Understand and Agree/}));await screen.findByRole('heading',{name:'Meet your next great print'});
 const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles'] as const)expect(after[key]).toEqual(before[key]);expect({...after.preferences,acknowledgment:null}).toEqual(before.preferences);expect(after.preferences!.acknowledgment!.version).toBe(disclaimerVersion);
});
it('L04 CSV safety notice survives empty/multiline/quoted exports with consistent columns',()=>{
 const parse=(text:string)=>{const rows:string[][]=[[]];let value='',quoted=false;text=text.replace(/^\ufeff/,'');for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(!quoted&&c===','){rows.at(-1)!.push(value);value='';}else if(!quoted&&c==='\r'&&text[i+1]==='\n'){rows.at(-1)!.push(value);rows.push([]);value='';i++;}else value+=c;}expect(quoted).toBe(false);rows.at(-1)!.push(value);return rows;};
 for(const rows of [[],[['Nozzle, "clean"\nSecond line','5']]]){const result=parse(reportCSV(['Task','Cost'],rows));expect(result).toHaveLength(rows.length+1);expect(result.every(row=>row.length===3)).toBe(true);expect(result[0].slice(0,2)).toEqual(['Task','Cost']);expect(result[0][2]).toBe('Safety notice: '+exportSafety);if(rows.length){expect(result[1].slice(0,2)).toEqual(rows[0]);expect(result[1][2]).toBe(exportSafety);}}
});
it('L05 ICS warning is present at calendar and event level, UTF-8 lines fold at 75 octets and escaping prevents property injection',()=>{
 const text=scheduleICS([{id:'stable-id',date:'2035-01-01',title:'Nozzle, clean; ☃ '.repeat(20)+'\nBEGIN:VEVENT',description:'Current official source; model A, variant B\\source'}],'20261027T000000Z');
 expect(text.endsWith('\r\n')).toBe(true);for(const line of text.trimEnd().split('\r\n'))expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
 const unfolded=text.replace(/\r\n /g,'');expect(unfolded.match(/^BEGIN:VEVENT$/gm)).toHaveLength(1);expect(unfolded).toContain('UID:stable-id@printguard3d');expect(unfolded).toContain('DTEND;VALUE=DATE:20350102');expect(unfolded).toContain('X-WR-CALDESC:Independent');expect(unfolded).toContain('DESCRIPTION:Current official source\\; model A\\, variant B\\\\source\\nIndependent');expect(unfolded).toContain('\\nBEGIN:VEVENT');
 expect(scheduleICS([],'20261027T000000Z')).toContain('X-WR-CALDESC:Independent');
});
it('L06 nested dialogs use unique labels, isolate lower layers and restore them on Escape',()=>{
 function Nested(){const[open,setOpen]=React.useState(false);return <Modal title="Parent"><button onClick={()=>setOpen(true)}>Nested disclaimer</button>{open&&<Modal title="Child" onClose={()=>setOpen(false)}>Read safely</Modal>}</Modal>;}
 const view=render(<Nested/>);screen.getByRole('button',{name:'Nested disclaimer'}).focus();fireEvent.click(screen.getByRole('button',{name:'Nested disclaimer'}));expect(screen.getAllByRole('dialog')).toHaveLength(1);const all=[...document.querySelectorAll('[role="dialog"]')];expect(new Set(all.map(d=>d.getAttribute('aria-labelledby'))).size).toBe(2);expect(all[0].closest('.modal-backdrop')!.hasAttribute('inert')||(all[0].closest('.modal-backdrop') as HTMLElement).inert).toBe(true);expect(document.activeElement?.textContent).toBe('Child');
 fireEvent.keyDown(document,{key:'Escape'});expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe(all[0].getAttribute('aria-labelledby'));expect(screen.getByRole('button',{name:'Nested disclaimer'})).toBe(document.activeElement);view.unmount();expect(document.body.style.overflow).toBe('');
});
it('L07 field hints are descriptions rather than part of the control name',()=>{
 render(<Field label="Safe date" hint="Choose a valid date"><input/></Field>);const input=screen.getByLabelText('Safe date');expect(input.getAttribute('aria-describedby')).toBeTruthy();expect(document.getElementById(input.getAttribute('aria-describedby')!)!.textContent).toBe('Choose a valid date');
});
it('L08 maintenance warnings disclose exact model, missing/flagged documentation and full unchanged disclaimer',()=>{
 const t={...task(),sourceUrl:''};mount(<><SafetyNote/><TaskApplicability task={t} printer={printer()}/></>);expect(screen.getByText(/Printer applicability: FlashForge Creator 5/)).toBeTruthy();expect(screen.getByText(/No manufacturer instructions are linked/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Read full safety & legal disclaimer'}));expect(screen.getByRole('heading',{name:'Safety & legal disclaimer'})).toBeTruthy();expect(screen.getByText(/Nothing in this disclaimer excludes liability/)).toBeTruthy();
});
it('L09 submitting a completion form cannot bypass its safety acknowledgment',async()=>{
 const run=vi.fn();mount(<CompletionForm task={task()} onClose={()=>{}}/>,{run});fireEvent.submit(screen.getByRole('button',{name:'Save completed record'}).closest('form')!);await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('Review and acknowledge'));expect(run).not.toHaveBeenCalled();
});
it('L10 supplied legal draft and version remain byte-identical to the approved Phase 3 text',()=>{
 // LF normalization matches Git's cross-platform checkout convention.
 const text=readFileSync('src/legal.ts','utf8').replaceAll('\r\n','\n');expect(createHash('sha256').update(text).digest('hex')).toBe('0850b9239a7fa435f4f2857ccfcb7b9e225671d529037b778cdbff9c64a3f94f');
});
it('L11 missing profile documentation offers an explicit warning rather than an empty external link or ineffective flag action',()=>{
 mount(<SourceLink url="" title="Profile documentation"/>);expect(screen.getByText(/No valid documentation link is available/)).toBeTruthy();expect(screen.queryByRole('link')).toBeNull();expect(screen.queryByRole('button',{name:'Flag source issue'})).toBeNull();
});
