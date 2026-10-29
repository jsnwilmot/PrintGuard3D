import {useState,type FormEvent} from 'react';
import {useData} from './context';
import {acceptReviewReminder} from './db';
import {type Printer,today} from './domain';
import {exactReviewModel,printingAverage,suggestedMonths,reviewGroups,recommendationPolicy,type ReviewGroup} from './recommendations';
import {Modal,Field,Button,External,FormError} from './components';

export function RecommendationReview({onClose}:{onClose:()=>void}){
 const {printers,notify}=useData();const available=printers.filter(p=>!p.archived&&exactReviewModel(p));const[id,setId]=useState(available[0]?.id||'');
 return <Modal title="Review optional reminders" subtitle="A separate owner-approved inspection prompt. Existing servicing rules remain unchanged." onClose={onClose}>
  <p>{recommendationPolicy.explanation}</p><p className="callout amber">{recommendationPolicy.warning}</p>
  <Field label="Reminder printer"><select value={id} onChange={e=>setId(e.target.value)}>{available.map(p=><option value={p.id} key={p.id}>{p.name} · {p.model}</option>)}</select></Field>
  {available.find(p=>p.id===id)?<ReviewForm key={id} printer={available.find(p=>p.id===id)!} onClose={onClose}/>:<p>No active exact Creator 5 or Creator 5 Pro printer. Register the exact model first.</p>}
  <Button variant="secondary" onClick={()=>{notify('Suggestion rejected. No reminder or servicing schedule was stored.');onClose();}}>Reject suggestion</Button>
 </Modal>;
}
function ReviewForm({printer,onClose}:{printer:Printer;onClose:()=>void}){
 const {readings,run}=useData();const pro=printer.model==='Creator 5 Pro';
 const[group,setGroup]=useState<ReviewGroup>(pro?'filter':'fan');const[basis,setBasis]=useState<'manual'|'rolling30'|'condition'>(pro?'condition':'manual');
 const[reviewedOn]=useState(today());const[hours,setHours]=useState('');const[custom,setCustom]=useState(pro);const[months,setMonths]=useState('');const[printing,setPrinting]=useState(false);const[ack,setAck]=useState(false);const[busy,setBusy]=useState(false);const[error,setError]=useState('');
 const average=printingAverage(readings,printer);const value=basis==='rolling30'?(printing?average?.hours:undefined):hours.trim()?Number(hours):undefined;
 const suggested=value===undefined?null:suggestedMonths(group,value);const valid=pro||suggested!==null;
 const reset=()=>{setAck(false);setError('');};
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{if(await run(()=>acceptReviewReminder(printer.id,{group,dailyHours:value,months:custom&&!pro?Number(months):undefined,custom,basis,printingCounterConfirmed:printing,acknowledged:ack,reviewedOn}),'Inspection reminder saved. Existing servicing rules retained.'))onClose();}catch(err){setError((err as Error).message);}finally{setBusy(false);}}
 return <form onSubmit={submit}>
  <p>Exact applicability: FlashForge {printer.model} · FDM/FFF. Policy {recommendationPolicy.version}; source review {recommendationPolicy.reviewed}. No numbered article revision or manufacturer clarification is available.</p>
  {!pro&&<><Field label="Review subject"><select value={group} onChange={e=>{setGroup(e.target.value as ReviewGroup);reset();}}>{(['fan','xy','z'] as const).map(g=><option value={g} key={g}>{reviewGroups[g].label}</option>)}</select></Field>
   <Field label="Daily-use basis"><select value={basis} onChange={e=>{setBasis(e.target.value as 'manual'|'rolling30');reset();}}><option value="manual">Owner reported daily printing hours (unverified)</option><option value="rolling30">PrintGuard rolling 30-calendar-day printing average</option></select></Field>
   {basis==='manual'?<Field label="Owner reported daily printing hours" hint="Exact values only; no rounding or inferred boundary. This is your assertion, not a manufacturer-defined measurement."><input required type="number" min="0" max="24" step="any" value={hours} onChange={e=>{setHours(e.target.value);reset();}}/></Field>:<>
    <label className="check-label"><input type="checkbox" checked={printing} onChange={e=>{setPrinting(e.target.checked);reset();}}/>I confirm these readings measure actual printing hours, not powered-on time.</label>
    <p>{average?`Recorded window ${average.start}–${average.end}; 31 daily endpoints; ${average.hours} printing hours/day. Requires the printing-counter declaration.`:'Unavailable: requires 31 valid daily cumulative endpoints covering all 30 calendar days through today, monotone totals matching this printer, no conflicting same-day readings and no daily increase over 24 hours.'}</p>
    <p>No missing days are assumed idle. This averaging period is PrintGuard’s convention, not FlashForge’s.</p>
   </>}
  </>}
  <section className="callout" aria-label="Published ranges and optional interpretation"><h3>Published source versus application interpretation</h3><p>{reviewGroups[group].ranges}</p><External url={reviewGroups[group].url}>Official ambiguous source reference</External>
   {group==='fan'&&<p>Metric mismatch: the fan source says working hours. Printing-hour readings are not confirmed equivalent by FlashForge.</p>}
   <p>{pro?'User Defined: condition/visual inspection only; no calendar or replacement interval.':valid?`PrintGuard Suggested: ${suggested}-month inspection/review reminder at exactly ${value} daily hours. Not manufacturer-confirmed.`:'No approved suggestion at this exact reading. No reminder will be stored; you may defer or create a separate User Defined rule.'}</p>
  </section>
  {!pro&&<><label className="check-label"><input type="checkbox" checked={custom} onChange={e=>{setCustom(e.target.checked);reset();}}/>Customize this review interval as User Defined</label>{custom&&<Field label="Custom review interval in months"><input required type="number" min="1" max="1200" step="1" value={months} onChange={e=>{setMonths(e.target.value);reset();}}/></Field>}</>}
  <p>{recommendationPolicy.coverage}</p>
  <label className="check-label safety"><input type="checkbox" required checked={ack} onChange={e=>setAck(e.target.checked)}/>I understand the assumptions and reminder-only purpose. I choose to create this separate {custom?'User Defined':'PrintGuard Suggested'} review reminder; this does not authorize physical servicing.</label>
  <FormError message={error}/><div className="modal-footer"><Button variant="secondary" onClick={onClose}>Defer decision</Button><Button type="submit" disabled={!ack||!valid||busy||(custom&&!pro&&(!Number.isInteger(Number(months))||Number(months)<1))}>Create review reminder</Button></div>
 </form>;
}
