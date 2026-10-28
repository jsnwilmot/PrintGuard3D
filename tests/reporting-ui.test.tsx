// @vitest-environment jsdom
import React from 'react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {printer,task,log,empty} from '../acceptance-review/fixtures';
import {DataContext,type AppData} from '../src/context';
import {defaults} from '../src/domain';
import {Reports} from '../src/Reports';
import {RecordChart} from '../src/RecordChart';

beforeEach(async()=>{await empty();window.scrollTo=vi.fn();});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
const mount=(child:React.ReactNode)=>render(<DataContext.Provider value={{printers:[printer()],tasks:[task()],logs:[log('done',{outcome:'Completed'}),log('skip',{outcome:'Skipped',onTime:false})],readings:[],inventory:[],repairs:[],profiles:[],prefs:defaults,notify:vi.fn(),run:async work=>{await work();return true;}} as AppData}>{child}</DataContext.Provider>);

it('R24 report completed KPI and printer completion chart cannot escape a selected skipped-outcome filter',()=>{
 mount(<Reports/>);fireEvent.change(screen.getByLabelText('Rule status / recorded outcome / repair status'),{target:{value:'Skipped'}});expect(screen.queryByRole('region',{name:'Maintenance by printer'})).toBeNull();const card=screen.getByRole('button',{name:/Completed tasks/});expect(card.textContent).toContain('0');fireEvent.click(card);expect(screen.queryByRole('cell',{name:'Historical lubrication'})).toBeNull();expect((screen.getByLabelText('Rule status / recorded outcome / repair status') as HTMLSelectElement).value).toBe('Skipped');expect(screen.getByText(/retains an exact record restriction/)).toBeTruthy();
});
it('R25 directly associated record controls expose actual descriptive accessible names and honest null/zero states',()=>{
 const onQuery=vi.fn(),query={type:'Complete Maintenance History' as const,filters:{recordKeys:[]}};mount(<RecordChart title="Empty chart" description="Actual values only" points={[{id:'zero',label:'2026-01',value:0,query},{id:'unknown',label:'2026-02',value:null,query}]} controlLabel="monthly completion" onQuery={onQuery}/>);expect(screen.getByText('Insufficient recorded data')).toBeTruthy();expect(screen.getByText('0 records')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'View monthly completion records for 2026-01'}));expect(onQuery).toHaveBeenCalledWith(query);expect(screen.getByRole('list',{name:'Empty chart values and record controls'})).toBeTruthy();
});
