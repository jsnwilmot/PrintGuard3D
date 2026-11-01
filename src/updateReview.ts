import {db} from './db';
import {buildIdentity,readWriterStatus,writerContract,type WriterControl,type WriterStatus} from './writerSafety';

export type WorkerIdentity={protocol:1;build:string;writer:{protocol:number;generation:number;capabilities:string[]}};
export type UpdateCandidate={key:string;worker:ServiceWorker|null;identity:WorkerIdentity|null;status:WriterStatus};
const workerIds=new WeakMap<ServiceWorker,number>();let nextId=0;
export const offlineUpdateMessage='Update confirmation is paused while offline. Your existing workshop and backup files are preserved. Reconnect and review again.';
export function controlIdentity(control:WriterControl){return JSON.stringify([control.id,control.protocol,control.generation,control.capabilities]);}
export function validateWorkerIdentity(value:unknown):WorkerIdentity{
 const v=value as WorkerIdentity;
 if(!v||v.protocol!==1||typeof v.build!=='string'||!/^[a-f0-9]{24}$/.test(v.build)||!v.writer||v.writer.protocol!==writerContract.protocol||!Number.isSafeInteger(v.writer.generation)||v.writer.generation<writerContract.generation||JSON.stringify(v.writer.capabilities)!==JSON.stringify(writerContract.capabilities))throw Error('Unknown or incompatible pending update. Keep the existing application and backup.');
 return v;
}
export function workerRequest(worker:ServiceWorker,message:unknown,timeout=5000):Promise<{identity:WorkerIdentity}>{
 return new Promise((resolve,reject)=>{
  const channel=new MessageChannel();let timer:ReturnType<typeof setTimeout>;
  const finish=(error?:Error,value?:{identity:WorkerIdentity})=>{clearTimeout(timer);channel.port1.close();channel.port2.close();error?reject(error):resolve(value!);};
  timer=setTimeout(()=>finish(Error('Update identity could not be confirmed. Review again after reconnecting.')),timeout);
  channel.port1.onmessage=e=>{try{if(!e.data?.ok)throw Error(e.data?.error||'Update refused');finish(undefined,{identity:validateWorkerIdentity(e.data.identity)});}catch(error){finish(error as Error);}};
  try{worker.postMessage(message,[channel.port2]);}catch(error){finish(error as Error);}
 });
}
export async function readUpdateCandidate():Promise<UpdateCandidate>{
 if(!navigator.onLine)throw Error(offlineUpdateMessage);
 const status=await readWriterStatus(db);
 if(!status.control)throw Error(status.message);
 if(!status.writable&&!status.upgrade)return {key:JSON.stringify([buildIdentity,controlIdentity(status.control)]),worker:null,identity:null,status};
 const registration=await navigator.serviceWorker?.getRegistration(),worker=registration?.waiting||null;
 let identity:WorkerIdentity|null=null,workerId=0;
 if(worker){
  identity=(await workerRequest(worker,{type:'PRINTGUARD_DESCRIBE'})).identity;
  if(registration?.waiting!==worker||worker.state!=='installed')throw Error('The pending update changed. Review the new update again.');
  if(identity.writer.generation<status.control.generation)throw Error('The pending update cannot write this workshop.');
  if(!workerIds.has(worker))workerIds.set(worker,++nextId);workerId=workerIds.get(worker)!;
 }
 // Repeat persisted read after the asynchronous worker handshake.
 const after=await readWriterStatus(db);
 if(!after.control||controlIdentity(after.control)!==controlIdentity(status.control))throw Error('Workshop writer requirements changed while checking the update.');
 return {key:JSON.stringify([buildIdentity,workerId,identity,controlIdentity(after.control)]),worker,identity,status:after};
}

/** Coalesce interval/focus reads so a slow error cannot be overtaken forever.
 * Explicit lifecycle interruption cancels the result, never the IDB operation.
 */
export class CandidatePoller{
 private running=false;
 private revision=0;
 private stopped=false;
 constructor(private read:()=>Promise<UpdateCandidate>,private accept:(candidate:UpdateCandidate)=>void,private reject:(error:Error)=>void){}
 poll=async()=>{
  if(this.running||this.stopped)return;
  this.running=true;const revision=this.revision;
  try{const candidate=await this.read();if(!this.stopped&&revision===this.revision)this.accept(candidate);}
  catch(error){if(!this.stopped&&revision===this.revision)this.reject(error as Error);}
  finally{this.running=false;}
 };
 interrupt(){this.revision++;}
 stop(){this.stopped=true;this.interrupt();}
}

/** In-memory permission only. A file download never proves recoverability. */
export class UpdateReview{
 private revision=0;
 candidate:UpdateCandidate|null=null;
 backupKey:string|null=null;
 confirmedKey:string|null=null;
 invalidate(){this.revision++;this.candidate=null;this.backupKey=null;this.confirmedKey=null;}
 observe(candidate:UpdateCandidate){if(this.candidate?.key!==candidate.key){this.invalidate();this.candidate=candidate;}else this.candidate=candidate;}
 token(){return {revision:this.revision,key:this.candidate?.key};}
 matches(token:ReturnType<UpdateReview['token']>){return token.revision===this.revision&&!!token.key&&token.key===this.candidate?.key;}
 downloaded(token:ReturnType<UpdateReview['token']>){if(this.matches(token))this.backupKey=token.key!;}
 confirm(value:boolean){this.confirmedKey=value&&this.candidate?this.candidate.key:null;}
 get ready(){return !!this.candidate&&(this.candidate.status.writable||this.candidate.status.upgrade)&&this.backupKey===this.candidate.key&&this.confirmedKey===this.candidate.key;}
 async revalidate(read=readUpdateCandidate){
  const token=this.token();if(!this.ready)throw Error('Download a fresh backup and review this specific update.');
  try{const candidate=await read();if(!this.matches(token)||candidate.key!==token.key)throw Error('Update or workshop requirements changed. Download a fresh backup and review again.');this.observe(candidate);return candidate;}
  catch(error){this.invalidate();throw error;}
 }
}

export async function activateReviewedWorker(candidate:UpdateCandidate){
 const {worker,identity,status}=candidate;if(!worker||!identity||!status.control||worker.state!=='installed'||!navigator.onLine)throw Error('The reviewed update is no longer ready.');
 const registration=await navigator.serviceWorker.getRegistration();
 if(registration?.waiting!==worker)throw Error('The pending update changed before activation.');
 const before=navigator.serviceWorker.controller;
 const answer=await workerRequest(worker,{type:'PRINTGUARD_ACTIVATE',build:identity.build,control:status.control});
 if(answer.identity.build!==identity.build)throw Error('Activated update identity disagrees with the reviewed version.');
 // No forced timeout reload. A timeout preserves the running page and data.
 if(navigator.serviceWorker.controller===before)await new Promise<void>((resolve,reject)=>{
  const changed=()=>{clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',changed);resolve();};
  const timer=setTimeout(()=>{navigator.serviceWorker.removeEventListener('controllerchange',changed);reject(Error('Update activation was not confirmed. Keep this page and review again.'));},5000);
  navigator.serviceWorker.addEventListener('controllerchange',changed);
  if(navigator.serviceWorker.controller!==before)changed();
 });
 const current=navigator.serviceWorker.controller;if(!current||(await workerRequest(current,{type:'PRINTGUARD_DESCRIBE'})).identity.build!==identity.build)throw Error('Another application version became active. Review it before reloading.');
}
