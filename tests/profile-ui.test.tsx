// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {ProfileReview} from '../src/ProfileReview';
import {DataContext,type AppData} from '../src/context';
import {defaults,printerSchema} from '../src/domain';
import {bundled,latestProfiles} from '../src/profiles';
const incoming=latestProfiles.find(p=>p.id==='flashforge-creator-5')!;
const p=printerSchema.parse({id:'p',name:'Synthetic C5',manufacturer:'FlashForge',model:'Creator 5',technology:'FDM/FFF',serial:'',location:'',purchaseDate:'',hours:0,prints:0,firmware:'',notes:'',image:'',profileId:'',profileVersion:'',archived:false,installed:'2026-01-01',created:'2026-01-01'});
function mount(){const close=vi.fn(),run=vi.fn();const data:AppData={printers:[p,{...p,id:'pro',name:'Synthetic Pro',model:'Creator 5 Pro'}],tasks:[],logs:[],readings:[],inventory:[],repairs:[],profiles:[],prefs:defaults,run,notify:vi.fn()};render(<DataContext.Provider value={data}><ProfileReview incoming={incoming} prior={bundled[0]} onClose={close}/></DataContext.Provider>);return {close,run};}
afterEach(cleanup);
it('V21 review starts unacknowledged, excludes incompatible targets and defers without writes',()=>{
 const {close,run}=mount();const accept=screen.getByRole('button',{name:'Accept profile package'}) as HTMLButtonElement;expect(accept.disabled).toBe(true);expect(screen.queryByRole('option',{name:'Synthetic Pro'})).toBeNull();
 expect(screen.getByText('Complete old/new comparison')).toBeTruthy();expect(screen.getByText(/templates\[extruder-mount-positioning-balls\]\.safety/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Defer update'}));expect(close).toHaveBeenCalledOnce();expect(run).not.toHaveBeenCalled();
});
it('V22 changing selection or printer after review clears acknowledgment',()=>{
 mount();const ack=screen.getByLabelText(/I reviewed the changes and official documentation/) as HTMLInputElement;fireEvent.click(ack);expect(ack.checked).toBe(true);
 fireEvent.click(screen.getByRole('checkbox',{name:/Add procedure: Nozzle cold pull/i}));expect(ack.checked).toBe(false);
 fireEvent.click(ack);fireEvent.change(screen.getByRole('combobox',{name:/^Optional: apply/}),{target:{value:'p'}});expect(ack.checked).toBe(false);
});
it('V23 unresolved usage selection cannot be accepted; documented band selection must be reviewed again',()=>{
 mount();fireEvent.change(screen.getByRole('combobox',{name:/^Optional: apply/}),{target:{value:'p'}});
 const t=incoming.templates.find(t=>t.intervalOptions)!;fireEvent.click(screen.getByRole('checkbox',{name:'Add procedure: '+t.title}));fireEvent.click(screen.getByLabelText(/I reviewed the changes and official documentation/));
 expect((screen.getByRole('button',{name:'Accept profile package'}) as HTMLButtonElement).disabled).toBe(true);expect(screen.getByRole('alert').textContent).toContain('Choose a published usage band');
 fireEvent.change(screen.getByRole('combobox',{name:new RegExp('^Usage band for '+t.title)}),{target:{value:'regular'}});expect((screen.getByLabelText(/I reviewed the changes and official documentation/) as HTMLInputElement).checked).toBe(false);
 fireEvent.click(screen.getByLabelText(/I reviewed the changes and official documentation/));expect((screen.getByRole('button',{name:'Accept profile package'}) as HTMLButtonElement).disabled).toBe(false);
});
