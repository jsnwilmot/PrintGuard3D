import {useEffect,useRef,useState} from 'react';
import {download,makeBackup,validateBackup,db} from './db';
import {activateWriter,writerContract} from './writerSafety';
import {UpdateReview,CandidatePoller,readUpdateCandidate,activateReviewedWorker,offlineUpdateMessage} from './updateReview';
import {Button} from './components';

export function UpdateSafety({acknowledged}:{acknowledged:boolean}){
 const review=useRef(new UpdateReview()).current;
 const [,render]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const mounted=useRef(false);
 useEffect(()=>{
  mounted.current=true;review.invalidate();
  const poller=new CandidatePoller(readUpdateCandidate,candidate=>{review.observe(candidate);setError('');render(v=>v+1);},error=>{review.invalidate();setError(error.message);render(v=>v+1);});
  const interrupt=()=>{poller.interrupt();review.invalidate();setError(navigator.onLine?'Connection changed. Review the update again.':offlineUpdateMessage);render(v=>v+1);void poller.poll();};
  void poller.poll();const timer=setInterval(poller.poll,3000);window.addEventListener('focus',poller.poll);window.addEventListener('offline',interrupt);window.addEventListener('online',interrupt);
  return()=>{mounted.current=false;poller.stop();clearInterval(timer);window.removeEventListener('focus',poller.poll);window.removeEventListener('offline',interrupt);window.removeEventListener('online',interrupt);review.invalidate();};
 },[acknowledged,review]);
 async function backup(){
  const token=review.token();setBusy(true);
  try{const value=await makeBackup();validateBackup(value);download('printguard-pre-update-full-backup.json',JSON.stringify(value,null,2));const candidate=await readUpdateCandidate();if(!review.matches(token)||candidate.key!==token.key)throw Error('The backup was downloaded, but the update changed. Review again with a fresh backup.');review.observe(candidate);review.downloaded(token);setError('');}
  catch(e){review.invalidate();setError((e as Error).message);}
  finally{if(mounted.current){setBusy(false);render(v=>v+1);}}
 }
 async function activate(kind:'worker'|'writer'){
  setBusy(true);try{const candidate=await review.revalidate();if(kind==='worker')await activateReviewedWorker(candidate);else{if(!candidate.status.upgrade||!candidate.status.control)throw Error('Writer adoption is no longer available.');await activateWriter(db,candidate.status.control);}location.reload();}
  catch(e){review.invalidate();setError((e as Error).message);setBusy(false);render(v=>v+1);}
 }
 const candidate=review.candidate,status=candidate?.status,waiting=candidate?.worker,incompatible=status&&!status.writable;
 if(!incompatible&&!waiting&&!error)return null;
 return <section className="callout amber compatibility-notice" aria-label="Application compatibility">
  <h2>{incompatible?'Read-only workshop':waiting?'Application update available':'Update check unavailable'}</h2>
  {status?.control&&<p>Saved writer version: {status.control.generation}. This application: {writerContract.generation}. {status.upgrade?'This newer compatible application needs your approval before workshop changes.':''}</p>}
  {candidate?.identity&&<p>Pending application: <code>{candidate.identity.build}</code>. Writer version: {candidate.identity.writer.generation}.</p>}
  <p>{incompatible?status.message:error?'Update readiness could not be confirmed. Keep the current application and review again.':'A complete update is waiting. Back up first, finish work and close other PrintGuard tabs/windows, then explicitly reload. Held tabs do not update their running code automatically.'}</p>
  <p>Keep backup files safely and test restoration in an isolated compatible browser profile. Downloading alone does not prove recovery. Do not clear site data or downgrade this workshop.</p>
  {acknowledged&&<Button variant="secondary" disabled={busy} onClick={backup}>Download update safety backup</Button>}
  {acknowledged&&(waiting||status?.upgrade)&&<><label className="check-label"><input type="checkbox" disabled={busy} checked={!!candidate&&review.confirmedKey===candidate.key} onChange={e=>{review.confirm(e.target.checked);render(v=>v+1);}}/>I saved the backup, finished work and reviewed the update.</label>
   {waiting&&<Button disabled={busy||!review.ready} onClick={()=>activate('worker')}>Activate update and reload</Button>}
   {status?.upgrade&&<Button disabled={busy||!review.ready} onClick={()=>activate('writer')}>Enable this writer version</Button>}</>}
  {error&&<p role="alert">{error}</p>}
 </section>;
}
