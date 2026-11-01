// Public startup status only: no database, workshop records or persisted status.
export type OfflinePhase='idle'|'preparing'|'ready'|'unconfirmed'|'failed'|'offline'|'unsupported';
export type OfflineMilestones={registered:boolean;registrationReady:boolean;activated:boolean;controlled:boolean;completeCache:boolean};
export type OfflineState={phase:OfflinePhase;reason:string;revision:number;milestones:OfflineMilestones};
export type OfflineInspection={cache:string;assets:string[];hashes:Record<string,string>};
export const offlineWarning='Offline access is not ready. Your workshop remains available while online. Stay online, keep a backup and reconnect/recheck before relying on offline use.';
export const offlineUnknown='Offline preparation has not been confirmed. This page may remain usable, but reopening offline is not verified. Keep a backup and reconnect to recheck.';
const empty=():OfflineMilestones=>({registered:false,registrationReady:false,activated:false,controlled:false,completeCache:false});
export interface OfflineEnvironment{
 secure:boolean;sw:ServiceWorkerContainer|null;cache:Pick<CacheStorage,'match'>|null;events:EventTarget;
 online:()=>boolean;inspect:(worker:ServiceWorker,signal?:AbortSignal)=>Promise<unknown>;digest:(bytes:ArrayBuffer)=>Promise<string>;
 later:(callback:()=>void,ms:number)=>unknown;cancel:(timer:unknown)=>void;
}
export function parseOfflineInspection(value:unknown,build:string):OfflineInspection|null{
 const v=value as {ok?:boolean;identity?:{protocol?:number;build?:string};offline?:OfflineInspection};
 const data=v?.offline;if(!v?.ok||v.identity?.protocol!==1||v.identity.build!==build||!data||!/^printguard-[a-f0-9]{12}$/.test(data.cache)||!Array.isArray(data.assets)||!data.hashes||typeof data.hashes!=='object')return null;
 if(!data.assets.length||data.assets.length>1000||new Set(data.assets).size!==data.assets.length||!data.assets.includes('/index.html')||!data.assets.includes('/build-contract.json'))return null;
 if(data.assets.some(path=>typeof path!=='string'||path.length>500||!/^\/[a-zA-Z0-9_./-]+$/.test(path)||path.includes('..')||path.includes('//')||!/^[a-f0-9]{64}$/.test(data.hashes[path])))return null;
 if(Object.keys(data.hashes).sort().join('|')!==[...data.assets].sort().join('|'))return null;
 return data;
}
export async function verifyPreparedCache(environment:OfflineEnvironment,inspection:OfflineInspection):Promise<boolean>{
 const cache=environment.cache;if(!cache)return false;
 // CacheStorage.match with cacheName is read-only; never open/create a cache.
 const match=(path:string)=>cache.match(path,{cacheName:inspection.cache});
 const marker=async()=>{const response=await match('/__printguard_install__');if(!response?.ok)return false;try{const v=await response.json();return typeof v?.initial==='boolean'&&Object.keys(v).length===1;}catch{return false;}};
 if(!await marker())return false;let total=0;
 for(const path of inspection.assets){const response=await match(path);if(!response?.ok)return false;const bytes=await response.arrayBuffer();total+=bytes.byteLength;if(total>64*1024*1024||await environment.digest(bytes)!==inspection.hashes[path])return false;}
 return marker();
}
export class OfflineInstallObserver{
 private state:OfflineState={phase:'idle',reason:'not-started',revision:0,milestones:empty()};
 private listeners=new Set<()=>void>();private environment:OfflineEnvironment|null=null;
 private cleanups:Array<()=>void>=[];private timer:unknown;private epoch=0;private alive=false;private expired=false;private rejected=false;private redundant=false;private registrationReady=false;
 private registrations=new WeakSet<ServiceWorkerRegistration>();private workers=new WeakSet<ServiceWorker>();private checking=false;private queued=false;
 private lifetime=new AbortController();
 constructor(private source:()=>OfflineEnvironment,private build:string,private pendingMilliseconds=15000){}
 getSnapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener);};};
 private publish(phase:OfflinePhase,reason:string,milestones:OfflineMilestones){
  if(!this.alive)return;const previous=this.state;
  if(previous.phase===phase&&previous.reason===reason&&JSON.stringify(previous.milestones)===JSON.stringify(milestones))return;
  this.state={phase,reason,milestones,revision:previous.revision+1};for(const listener of this.listeners)listener();
 }
 private listen(target:EventTarget,type:string,listener:EventListener){target.addEventListener(type,listener);this.cleanups.push(()=>target.removeEventListener(type,listener));}
 private watch(registration:ServiceWorkerRegistration){
  if(!this.registrations.has(registration)){this.registrations.add(registration);this.listen(registration,'updatefound',()=>{this.watch(registration);this.recheck();});}
  for(const worker of [registration.installing,registration.waiting,registration.active])if(worker&&!this.workers.has(worker)){
   this.workers.add(worker);this.listen(worker,'statechange',()=>{if(worker.state==='redundant')this.redundant=true;this.recheck();});
   if(worker.state==='redundant')this.redundant=true;
  }
 }
 start=()=>{
  if(this.alive)return this.stop;this.alive=true;this.lifetime=new AbortController();this.expired=false;this.rejected=false;this.redundant=false;this.registrationReady=false;this.registrations=new WeakSet();this.workers=new WeakSet();const epoch=++this.epoch;
  try{this.environment=this.source();}catch{this.publish('unsupported','checks-unavailable',empty());return this.stop;}
  const environment=this.environment;
  if(!environment.secure||!environment.sw){this.publish('unsupported','worker-unavailable',empty());return this.stop;}
  this.publish(environment.online()?'preparing':'offline','initial-check',empty());
  this.listen(environment.sw,'controllerchange',this.recheck);
  for(const type of ['online','offline','focus','pageshow'])this.listen(environment.events,type,this.recheck);
  this.listen(environment.events,'pagehide',event=>{if(!(event as PageTransitionEvent).persisted)this.stop();});
  this.timer=environment.later(()=>{this.expired=true;this.recheck();},this.pendingMilliseconds);
  // Observe ready independently. It is a milestone, never the success oracle.
  try{void environment.sw.ready.then(registration=>{if(!this.alive||epoch!==this.epoch)return;this.registrationReady=true;this.watch(registration);this.recheck();}).catch(()=>{if(this.alive&&epoch===this.epoch){this.expired=true;this.recheck();}});}catch{this.expired=true;}
  try{void environment.sw.register('/sw.js',{updateViaCache:'none'}).then(registration=>{if(this.alive&&epoch===this.epoch){this.watch(registration);this.recheck();}}).catch(()=>{if(this.alive&&epoch===this.epoch){this.rejected=true;this.recheck();}});}catch{this.rejected=true;}
  this.recheck();return this.stop;
 };
 stop=()=>{this.alive=false;this.epoch++;this.lifetime.abort();if(this.environment)this.environment.cancel(this.timer);for(const cleanup of this.cleanups.splice(0))cleanup();this.queued=false;};
 recheck=()=>{if(!this.alive)return;if(!this.environment?.secure||!this.environment.sw){this.publish('unsupported','worker-unavailable',empty());return;}this.queued=true;if(!this.checking)void this.scan();};
 private async bounded<T>(work:Promise<T>,milliseconds:number):Promise<T>{
  const environment=this.environment!,signal=this.lifetime.signal;let timer:unknown,abort=()=>{};
  try{return await Promise.race([work,new Promise<T>((_,reject)=>{abort=()=>reject(Error('Offline check stopped'));signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();timer=environment.later(()=>reject(Error('Offline check not confirmed')),milliseconds);})]);}
  finally{environment.cancel(timer);signal.removeEventListener('abort',abort);}
 }
 private async scan(){
  this.checking=true;
  try{do{this.queued=false;const epoch=this.epoch,environment=this.environment!;let milestones={...this.state.milestones,completeCache:false};
   try{
    const registration=await this.bounded(environment.sw!.getRegistration(),2000);if(!this.alive||epoch!==this.epoch)continue;
    if(registration)this.watch(registration);const controller=environment.sw!.controller;
    milestones={...milestones,registered:!!registration,registrationReady:this.registrationReady,activated:registration?.active?.state==='activated',controlled:!!controller&&controller.state==='activated'};
    if(controller&&controller.state==='activated'&&registration?.active===controller&&environment.cache){
     const packet=await this.bounded(environment.inspect(controller,this.lifetime.signal),2000),inspection=parseOfflineInspection(packet,this.build);
     if(!this.alive||epoch!==this.epoch)continue;
     if(inspection){const complete=await this.bounded(verifyPreparedCache(environment,inspection),5000);if(!this.alive||epoch!==this.epoch)continue;
      if(environment.sw!.controller!==controller){this.queued=true;continue;}
      milestones.completeCache=complete;if(complete){this.publish(this.registrationReady?'ready':this.expired?'unconfirmed':'preparing',this.registrationReady?'verified-active-cache':'ready-milestone-unconfirmed',milestones);continue;}
      this.publish(environment.online()?'unconfirmed':'offline','cache-incomplete',milestones);continue;
     }
     this.publish(environment.online()?'unconfirmed':'offline','inspection-unavailable',milestones);continue;
    }
    if(!environment.online())this.publish('offline','network-unconfirmed',milestones);
    else if(this.rejected||this.redundant)this.publish('failed',this.rejected?'registration-rejected':'install-did-not-finish',milestones);
    else this.publish(this.expired?'unconfirmed':'preparing',this.expired?'readiness-unconfirmed':'installation-pending',milestones);
   }catch{if(this.alive&&epoch===this.epoch)this.publish(environment.online()?'unconfirmed':'offline','state-check-unavailable',milestones);}
  }while(this.queued&&this.alive);}finally{this.checking=false;if(this.queued&&this.alive)void this.scan();}
 }
}
function nativeInspection(worker:ServiceWorker,signal?:AbortSignal):Promise<unknown>{return new Promise(resolve=>{const channel=new MessageChannel(),timer=window.setTimeout(()=>finish(null),2000);const abort=()=>finish(null);let done=false;const finish=(value:unknown)=>{if(done)return;done=true;window.clearTimeout(timer);signal?.removeEventListener('abort',abort);channel.port1.close();channel.port2.close();resolve(value);};channel.port1.onmessage=event=>finish(event.data);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){finish(null);return;}try{worker.postMessage({type:'PRINTGUARD_OFFLINE_INSPECT'},[channel.port2]);}catch{finish(null);}});}
export const offlineInstall=new OfflineInstallObserver(()=>({secure:window.isSecureContext,sw:navigator.serviceWorker??null,cache:globalThis.caches??null,events:window,online:()=>navigator.onLine,inspect:nativeInspection,digest:async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(value=>value.toString(16).padStart(2,'0')).join(''),later:(callback,ms)=>window.setTimeout(callback,ms),cancel:timer=>window.clearTimeout(timer as number)}),__PRINTGUARD_BUILD__);
