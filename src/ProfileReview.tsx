import {ManufacturerNotice} from './MaintenanceSafetyPanel';
import {taskClassification,recommendationPolicy} from './recommendations';
import {useState} from 'react';
import {type Profile,type Task,intervalLabel} from './domain';
import {useData} from './context';
import {installProfile} from './db';
import {assessProfile,selectTemplate} from './profiles';
import {profileChanges,matchingTask} from './profileChanges';
import {Modal,Button,Field,External} from './components';

export function ProfileReview({incoming,prior,onClose}:{incoming:Profile;prior?:Profile;onClose:()=>void}){
 const {printers,tasks,run}=useData();
 const [target,setTarget]=useState(''),[ack,setAck]=useState(false),[busy,setBusy]=useState(false);
 const [selected,setSelected]=useState(incoming.templates.filter(t=>t.scheduleKind!=='usage-dependent').map(t=>t.templateId||t.title));
 const [bands,setBands]=useState<Record<string,string>>({});
 const changes=profileChanges(prior,incoming);
 let conflict='';
 if(target)try{for(const t of incoming.templates)matchingTask(t,tasks.filter(t=>t.printerId===target),incoming.id);}catch(error){conflict=(error as Error).message;}
 const unresolved=!!target&&incoming.templates.some(t=>t.scheduleKind==='usage-dependent'&&selected.includes(t.templateId||t.title)&&!bands[t.templateId||t.title]);
 function choose(id:string,checked:boolean){setAck(false);setSelected(values=>checked?[...new Set([...values,id])]:values.filter(v=>v!==id));}
 return <Modal title="Review profile package" subtitle={`${incoming.manufacturer} ${incoming.model} · v${incoming.version}`} onClose={onClose}>
  <div className="callout">{prior?`Installed/bundled version: ${prior.version}. Incoming version: ${incoming.version}.`:'This is a new profile.'} No service history will be overwritten. Existing rules, customizations and service baselines stay pinned to their applied versions.</div>
  <h3>Revision history</h3><ManufacturerNotice/>{incoming.revisions.map((r,n)=><p key={n}>{r}</p>)}
  <div className="callout amber">{incoming.status==='Manufacturer Verified'?'Documented facts; limited coverage':incoming.status}. Unsubstantiated manufacturer labels are quarantined. Applying pending tasks is an explicit custom scheduling decision; it does not verify their safety or intervals.</div>
  {incoming.coverage&&<p>{incoming.coverage.reviewed}/{incoming.coverage.indexTotal} indexed text articles reviewed. {incoming.coverage.notes}</p>}
  <h3>Complete old/new comparison</h3>
  <p>{changes.length} changed field(s). Removed definitions do not delete active rules. Expand a field to inspect its full old and new value, including documentation, applicability, materials, safety and reference arrays.</p>
  <div className="profile-comparison">{changes.map((change,n)=><details key={n}><summary>{change.path||'Entire profile'}</summary><strong>Before</strong><pre>{change.before===undefined?'Not present':JSON.stringify(change.before,null,2)}</pre><strong>After</strong><pre>{change.after===undefined?'Removed from package':JSON.stringify(change.after,null,2)}</pre></details>)}</div>
  <p>{recommendationPolicy.explanation}</p><p>{recommendationPolicy.counter}</p><h3>Incoming tasks</h3>{incoming.templates.map(t=>{const id=t.templateId||t.title;return <div key={id} className="profile-procedure">
   <label className="check-label"><input type="checkbox" checked={selected.includes(id)} onChange={e=>choose(id,e.target.checked)}/>Add procedure: {t.title}</label>
   <p><strong>{t.title}</strong> · {taskClassification(t as Task,incoming)} · {intervalLabel(t.interval)}<br/>Template: {id} · Source version {t.profileVersion}<br/>Description: {t.description}<br/>Materials: {t.materials}<br/>Safety: {t.safety}<br/>{t.sourceUrl&&<External url={t.sourceUrl}>Review reference</External>}</p>
   {t.intervalOptions&&<Field label={`Usage band for ${t.title}`} hint="Choose only a published band that applies to your actual usage. Source boundaries may overlap or have gaps at exactly 5/10 hours per day; seek manufacturer clarification, do not infer a band."><select value={bands[id]||''} onChange={e=>{setBands({...bands,[id]:e.target.value});choose(id,!!e.target.value);}}><option value="">Do not activate; retain as reference</option>{t.intervalOptions.map(o=><option key={o.id} value={o.id}>{o.label} — {intervalLabel(o.interval)} — {taskClassification(selectTemplate(t,o.id) as Task,incoming)}</option>)}</select></Field>}
  </div>;})}
  {prior&&<><h3>Current task definitions</h3>{prior.templates.map((t,n)=><p key={n}>{t.title} · {intervalLabel(t.interval)} · {t.description} · {t.materials} · {t.safety}</p>)}</>}
  <Field label="Optional: apply new defaults to a matching printer" hint="Only selected new procedures are added. Matching active rules remain completely unchanged; no automatic replacement or deletion. Usage readings and history are preserved."><select value={target} onChange={e=>{setTarget(e.target.value);setAck(false);}}><option value="">Install profile only; retain current schedules</option>{printers.filter(p=>!p.archived&&p.manufacturer===incoming.manufacturer&&p.model===incoming.model&&p.technology===incoming.technology).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
  {conflict&&<p className="form-error" role="alert">{conflict}</p>}
  {unresolved&&<p className="form-error" role="alert">Choose a published usage band for each selected usage-dependent procedure, or deselect it.</p>}
  <label className="check-label safety"><input type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)}/>I reviewed the changes and official documentation. I understand pending templates are not manufacturer verified.</label>
  <div className="modal-footer"><Button variant="secondary" onClick={onClose}>Defer update</Button><Button disabled={!ack||!!conflict||unresolved||busy} onClick={async()=>{setBusy(true);try{if(await run(()=>installProfile(incoming,target,{templates:selected,selections:bands,...(prior?{expected:assessProfile(prior)}:{})}),'Profile installed; existing rules and history retained.'))onClose();}finally{setBusy(false);}}}>Accept profile package</Button></div>
 </Modal>;
}
