import {type Printer,type Task,formatDate,intervalLabel} from './domain';
import {due,status} from './engine';
import {reviewTask} from './profiles';
import {PrinterArt} from './components';

export function SchedulePrint({printers,tasks,flagged,reminderDays=7}:{printers:Printer[];tasks:Task[];flagged:string[];reminderDays?:number}){
 return <div className="schedule-print">{printers.map(printer=><section key={printer.id} className="schedule-printer">
  <header><PrinterArt printer={printer}/><div><h3>{printer.name}</h3><p>{printer.manufacturer} {printer.model} · {printer.technology}</p><p>Printer ID: {printer.id} · Serial: {printer.serial||'Not recorded'}</p></div></header>
  {tasks.filter(t=>t.printerId===printer.id).map(t=>{const d=due(t),reviewed=reviewTask(t,printer);return <article key={t.id} className="schedule-task">
   <h4>□ {t.title}</h4><p>{t.description||'No description recorded. Consult the applicable documentation before servicing.'}</p>
   <dl><div><dt>Interval</dt><dd>{intervalLabel(t.interval)} · {t.interval.mode==='once'?'One time':'Indefinite recurrence'}</dd></div>
    <div><dt>Original recommendation</dt><dd>{intervalLabel(t.originalInterval)}</dd></div>
    <div><dt>Current status / next date</dt><dd>{status(t,printer,undefined,reminderDays)} · {d.date||t.postponedUntil?formatDate(t.postponedUntil||d.date):'Calendar date unknown'}</dd></div>
    <div><dt>Usage thresholds</dt><dd>{[d.hours!==null?`${d.hours} operating hours`:'',d.prints!==null?`${d.prints} prints`:''].filter(Boolean).join(' or ')||'Not applicable'} · Actual recorded usage: {printer.hours} h / {printer.prints} prints</dd></div>
    <div><dt>Materials / safety</dt><dd>{t.materials||'Not specified'} · {t.safety||'Review applicable manufacturer safety precautions before work.'}</dd></div>
    <div><dt>Source / profile version</dt><dd>{reviewed.source} · {t.profileId||printer.profileId||'No profile'} / {t.profileVersion||'Not recorded'} · Documentation checked: {t.verified||'Not verified'}</dd></div>
    <div><dt>Documentation</dt><dd>{t.sourceTitle||'No documentation title recorded'}<br/>{t.sourceUrl?<a href={t.sourceUrl}>{t.sourceUrl}</a>:'No documentation link recorded'}<br/>{flagged.includes(t.sourceUrl)?'FLAGGED: source requires review.':'Check the current exact-model instructions before servicing; external documentation requires internet.'}</dd></div>
   </dl>
  </article>;})}
  {!tasks.some(t=>t.printerId===printer.id)&&<p>No maintenance rules match these filters.</p>}
 </section>)}</div>;
}
