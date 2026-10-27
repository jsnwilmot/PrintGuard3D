import {useState} from 'react';
import {Plus,ChevronLeft,ChevronRight,Download,CalendarDays} from 'lucide-react';
import {useData} from './context';
import {type Task,today,formatDate} from './domain';
import {localDate,addInterval,status,due} from './engine';
import {download,postponeTask} from './db';
import {Button,PageHeading,Empty,Badge} from './components';
import {TaskForm} from './forms';
import {scheduleICS} from './safety';
import {reviewTask} from './profiles';
import {validCalendarDate,usageDue,historyMatches,calendarOccurrences} from './scheduleView';

export function Calendar({onTask}:{onTask:(t:Task)=>void}){
 const {tasks,printers,logs,run}=useData();
 const [cursor,setCursor]=useState(today());
 const [jumpDate,setJumpDate]=useState(today());
 const [view,setView]=useState('Month');
 const [printer,setPrinter]=useState('');
 const [category,setCategory]=useState('');
 const [priority,setPriority]=useState('');
 const [state,setState]=useState('');
 const [add,setAdd]=useState<string|null>(null);
 const date=new Date(cursor+'T12:00:00');
 // Clone the parsed date: the numeric Date constructor treats years 0–99 as 1900–1999.
 const monthStart=new Date(date);monthStart.setDate(1);
 const monthEnd=new Date(monthStart);monthEnd.setMonth(monthEnd.getMonth()+1);monthEnd.setDate(0);
 const first=localDate(monthStart),last=localDate(monthEnd);
 const weekStart=addInterval(cursor,-((date.getDay()+6)%7));
 const days=Array.from({length:view==='Month'?42:view==='Week'?7:1},(_,n)=>view==='Month'
  ?addInterval(first,-((monthStart.getDay()+6)%7)+n):view==='Week'?addInterval(weekStart,n):cursor);
 const start=view==='Month'?days[0]:view==='Agenda'?first:view==='Week'?weekStart:cursor;
 const end=view==='Month'?days[41]:view==='Agenda'?last:view==='Week'?addInterval(weekStart,6):cursor;
 const visible=tasks.filter(t=>{
  const p=printers.find(p=>p.id===t.printerId);
  return p&&!p.archived&&t.enabled&&(!printer||t.printerId===printer)
   &&(!category||category===t.category)&&(!priority||priority===t.priority)&&(!state||status(t,p)===state);
 });
 const events=visible.flatMap(t=>calendarOccurrences(t,start,end)).sort((a,b)=>a.date.localeCompare(b.date));
 const history=logs.filter(l=>l.date>=start&&l.date<=end
  &&printers.some(p=>p.id===l.printerId)&&historyMatches(l,{printer,category,priority,state}));
 const usage=visible.filter(t=>usageDue(t,printers.find(p=>p.id===t.printerId)!));
 function goTo(value:string){if(validCalendarDate(value)){setCursor(value);setJumpDate(value);}}
 function move(n:number){goTo(view==='Month'||view==='Agenda'?addInterval(cursor,0,n):addInterval(cursor,n*(view==='Week'?7:1)));}
 async function reschedule(id:string,date:string){
  const t=visible.find(t=>t.id===id),p=t&&printers.find(p=>p.id===t.printerId);
  if(!t||!p||date<today())return;
  await run(()=>postponeTask(id,date,'Moved in the calendar; interval preserved.'),'Next occurrence moved. The maintenance interval is unchanged.');
 }
 function exportICS(){
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const rows=events.map(e=>{const p=printers.find(p=>p.id===e.task.printerId)!;return {id:e.key,date:e.date,title:e.task.title,description:`${p.name}. ${e.projected?'Projected recurrence; actual next date may change after completion. ':''}Source: ${reviewTask(e.task,p).source}; profile ${e.task.profileVersion||'not verified'}. ${e.task.sourceUrl}`};});
  download(`printguard-schedule-${start}.ics`,scheduleICS(rows,stamp),'text/calendar');
 }
 function completedEvents(day?:string){return history.filter(l=>!day||l.date===day).map(l=><div key={l.id} className="calendar-event complete">
  ✓ {l.title}<small>Completed · {formatDate(l.date)} · {printers.find(p=>p.id===l.printerId)?.name}
  {(!l.category||!l.priority)&&' · Unclassified historical metadata'}</small></div>);}
 return <>
  <PageHeading eyebrow="MAKE TIME FOR MAINTENANCE" title="Calendar" description="A plan for this month. A care routine for years to come.">
   <Button variant="secondary" onClick={exportICS}><Download size={16}/>Export ICS</Button>
   <Button disabled={!printers.some(p=>!p.archived)} onClick={()=>setAdd(cursor)}><Plus size={17}/>Add task</Button>
  </PageHeading>
  <div className="calendar-toolbar"><div className="calendar-nav">
   <button className="icon-button" onClick={()=>move(-1)} aria-label="Previous period"><ChevronLeft size={20}/></button>
   <button className="icon-button" onClick={()=>move(1)} aria-label="Next period"><ChevronRight size={20}/></button>
   <h2>{view==='Day'?formatDate(cursor):view==='Week'?`${formatDate(start)} – ${formatDate(end)}`:date.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2>
   <Button variant="secondary small" onClick={()=>goTo(today())}>Today</Button>
  </div><div className="segmented">{['Month','Week','Day','Agenda'].map(x=><button key={x} onClick={()=>setView(x)} className={view===x?'selected':''} aria-pressed={view===x}>{x}</button>)}</div></div>
  <div className="toolbar wrap">
   <select aria-label="Calendar printer" value={printer} onChange={e=>setPrinter(e.target.value)}><option value="">All printers</option>{printers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
   <select aria-label="Calendar category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{[...new Set([...tasks.map(t=>t.category),...logs.flatMap(l=>l.category?[l.category]:[])])].map(x=><option key={x}>{x}</option>)}</select>
   <select aria-label="Calendar priority" value={priority} onChange={e=>setPriority(e.target.value)}><option value="">All priorities</option>{['Low','Normal','High','Critical'].map(x=><option key={x}>{x}</option>)}</select>
   <select aria-label="Calendar status" value={state} onChange={e=>setState(e.target.value)}><option value="">All statuses</option>{['Overdue','Due Today','Due Soon','Upcoming','Postponed','Not Yet Due','Completed'].map(x=><option key={x}>{x}</option>)}</select>
   <label className="jump-date">Jump to date<input aria-label="Jump to calendar date" type="date" value={jumpDate}
    onChange={e=>{setJumpDate(e.target.value);if(validCalendarDate(e.target.value))setCursor(e.target.value);}}/></label>
  </div>
  <p className="muted">Historical records without category or priority snapshots remain visible as unclassified when those filters are selected. Printer and status filters always apply; current rules never supply missing historical metadata.</p>
  <section className="panel calendar-panel">{view==='Agenda'?<div className="agenda">
   {events.map(e=><button key={e.key} className="agenda-row" onClick={()=>onTask(e.task)}><span className="agenda-date">{new Date(e.date+'T12:00:00').toLocaleDateString(undefined,{month:'short'})}<strong>{Number(e.date.slice(-2))}</strong></span><span><strong>{e.task.title}</strong><small>{printers.find(p=>p.id===e.task.printerId)?.name}</small></span><Badge>{e.projected?'Projected recurrence':'Next occurrence'}</Badge></button>)}
   {completedEvents()}
   {!events.length&&!history.length&&<Empty icon={CalendarDays} title="A little breathing room" text="No dated maintenance in this period. Usage thresholds are listed separately when actual readings reach them."/>}
  </div>:<>
   <div className={'calendar-weekdays '+(view==='Day'?'day':'')}>{(view==='Day'?[date.toLocaleDateString(undefined,{weekday:'long'})]:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map(d=><span key={d}>{d}</span>)}</div>
   <div className={'calendar-grid '+(view==='Day'?'day':'')}>{days.map(day=><div key={day}
    onDragOver={e=>{if(day>=today())e.preventDefault();}}
    onDrop={e=>{e.preventDefault();reschedule(e.dataTransfer.getData('text/plain'),day);}}
    className={'calendar-cell '+(day.slice(0,7)!==cursor.slice(0,7)&&view==='Month'?'muted-day ':'')+(day===today()?'is-today':'')}>
    <button className="calendar-day" onClick={()=>{if(printers.some(p=>!p.archived))setAdd(day);else goTo(day);}} aria-label={`Add maintenance on ${formatDate(day)}`}>{+day.slice(-2)}</button>
    {events.filter(e=>e.date===day).map(e=><button
     className={'calendar-event '+(e.projected?'projected':status(e.task,printers.find(p=>p.id===e.task.printerId)!)==='Overdue'?'overdue':'')}
     key={e.key} draggable={!e.projected}
     onDragStart={event=>{event.dataTransfer.setData('text/plain',e.task.id);event.dataTransfer.effectAllowed='move';}}
     title={`${e.task.title} · ${e.projected?'Projected recurrence':'Next due'}`} onClick={()=>onTask(e.task)}>
     {e.projected?'↻ ':''}{e.task.title}<small>{printers.find(p=>p.id===e.task.printerId)?.name}</small></button>)}
    {completedEvents(day)}
   </div>)}</div>
  </>}
   <div className="calendar-legend"><span><i className="legend-dot blue"/>Next occurrence</span><span><i className="legend-dot light"/>Projected recurrence</span><span><i className="legend-dot green"/>Completed</span><span><i className="legend-dot red"/>Overdue</span></div>
  </section>
  <section className="panel usage-due-panel" aria-label="Maintenance due from recorded usage"><h2>Due from recorded usage</h2>
   <p>As of {formatDate(today())}. These tasks have reached an operating-hour or print-count threshold. No calendar date is forecast from usage.</p>
   {usage.length?usage.map(t=><button key={t.id} className="agenda-row" onClick={()=>onTask(t)}><span><strong>{t.title}</strong><small>{printers.find(p=>p.id===t.printerId)?.name} · {status(t,printers.find(p=>p.id===t.printerId)!)}</small></span><Badge>{[due(t).hours!==null?`${due(t).hours} h`:'',due(t).prints!==null?`${due(t).prints} prints`:''].filter(Boolean).join(' or ')} · usage threshold reached</Badge></button>):<p>No tasks have reached their recorded usage thresholds.</p>}
  </section>
  <p className="muted calendar-note">Future recurrences are generated for the visible period and never expire. Projected dates may change after completion. Hour-based and print-count rules appear when actual readings reach their thresholds, without invented calendar dates.</p>
  {visible.some(t=>{const d=due(t).date;return d&&d<start&&status(t,printers.find(p=>p.id===t.printerId)!)==='Overdue';})&&<div className="callout amber">Outstanding overdue tasks remain in Maintenance, even when their due date falls before this calendar period.</div>}
  {add&&<TaskForm date={add} printerId={printer} onClose={()=>setAdd(null)}/>}
 </>;
}
