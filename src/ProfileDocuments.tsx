import {type Profile,safeUrl} from './domain';
import {External,Badge,Button,DisclaimerLink} from './components';
import {useData} from './context';
import {flagSource} from './db';

export function SourceLink({url,title}:{url:string;title:string}){
 const {prefs,run}=useData();const flagged=prefs.sourceFlags?.some(f=>f.url===url);
 if(!safeUrl(url))return <p className="callout amber">No valid documentation link is available. Obtain current instructions for this exact model from its manufacturer before servicing.</p>;
 return <span className="source-reference"><External url={url}>{title}</External>{flagged?<strong className="source-flag">Flagged for review — check current manufacturer instructions</strong>:<Button variant="secondary small" onClick={()=>run(()=>flagSource(url),'Source flagged locally for review; schedules and history were not changed.')}>Flag source issue</Button>}</span>;
}
export function ProfileDocuments({profile}:{profile:Profile}){
 const fixed=profile.templates.filter(t=>!t.scheduleKind||t.scheduleKind==='recurring').length;
 const options=profile.templates.filter(t=>t.scheduleKind==='usage-dependent').length;
 return <div className="profile-documents"><DisclaimerLink/>
  <p>{fixed} fixed-interval procedure(s) · {options} usage-dependent procedure(s) · {profile.references?.length||0} references.</p>
  <p>{profile.coverage?`${profile.coverage.reviewed}/${profile.coverage.indexTotal} indexed text articles reviewed. ${profile.coverage.notes}`:'Historical profile: limited coverage; newer reviewed definitions may be available. No completeness claim.'}</p>
  <p>Links were checked at the recorded review date, not continuously monitored. Flag unavailable or changed documentation for review; a historical verification label is not current safety assurance.</p>
  <SourceLink url={profile.documentation} title="Profile documentation"/>
  {profile.references&&<details><summary>Condition, corrective and unresolved references ({profile.references.length})</summary>{profile.references.map(r=><div key={r.id} className="profile-procedure"><strong>{r.title}</strong> <Badge>{r.status}</Badge><p>{r.kind} · {r.models.join(', ')} · Checked {r.checked} · {r.sourceVersion}<br/>Trigger: {r.intervalText}<br/>Materials: {r.materials}<br/>Safety: {r.safety}<br/>{r.notes}</p><SourceLink url={r.url} title="Manufacturer-indexed reference"/></div>)}</details>}
 </div>;
}
