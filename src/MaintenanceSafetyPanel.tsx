import {type Task,type Printer} from './domain';
import {maintenanceSafety,hazardLabels,technicianCaution,manufacturerIndependence} from './maintenanceSafety';
import {External} from './components';

export function ManufacturerNotice(){return <p className="muted manufacturer-notice">{manufacturerIndependence}</p>;}
export function MaintenanceSafety({task,printer}:{task:Task;printer:Printer}){
 const assessment=maintenanceSafety(task,printer);
 return <section className="callout amber" aria-label="Maintenance safety context"><h3>{assessment.state==='identified'?'Identified hazard references':assessment.state==='review-only'?'Review-only reminder':'Safety not independently assessed'}</h3>
  {!!assessment.hazards.length&&<ul>{assessment.hazards.map(hazard=><li key={hazard}>{hazardLabels[hazard]}</li>)}</ul>}
  <p>{assessment.scope}</p><p>Policy {assessment.version}. Identified references are not complete safety assessment or a declaration that work is safe. No operating temperature, isolation sequence or required qualification is prescribed by PrintGuard.</p>
  {assessment.references.map((url,i)=><p key={url}><External url={url}>{i?'Manufacturer model safety notice':'Manufacturer procedure reference'}</External></p>)}
  {assessment.state!=='review-only'&&<p>{technicianCaution}</p>}<p>A temporarily unavailable source does not prevent a truthful past or skipped record. Review available context now and note documentation limits; no pre-service conduct is certified.</p>
 </section>;
}
