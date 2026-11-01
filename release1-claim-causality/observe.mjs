import {appendFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
export async function observe(context,info,id,run){
 const out=join(run,'page-events');await mkdir(out,{recursive:true});let serial=Promise.resolve();
 const write=event=>{serial=serial.then(()=>appendFile(join(out,id+'.ndjson'),JSON.stringify({context:id,source:'page',receivedAt:new Date().toISOString(),nodeMonotonic:process.hrtime.bigint().toString(),...event})+'\n'));return serial;};
 await context.exposeBinding('__causalLog',(_source,value)=>write(value));
 await context.addInitScript(()=>{
  const documentId=crypto.randomUUID();globalThis.__causalDocument=documentId;
  const emit=(event,extra={})=>{void globalThis.__causalLog({event,document:documentId,url:location.href,readyState:document.readyState,controller:!!navigator.serviceWorker.controller,controllerState:navigator.serviceWorker.controller?.state,wall:Date.now(),monotonic:performance.now(),timeOrigin:performance.timeOrigin,...extra}).catch(()=>{});};
  const map=async()=>{try{const r=await navigator.serviceWorker.getRegistration();r?.active?.postMessage({type:'FORENSIC_DOCUMENT',document:documentId,href:location.href,readyState:document.readyState,controller:!!navigator.serviceWorker.controller});}catch{emit('mapping-unknown');}};
  emit('document-start');for(const name of ['DOMContentLoaded','load','pageshow','pagehide','beforeunload'])addEventListener(name,()=>{emit(name);void map();});document.addEventListener('readystatechange',()=>emit('ready-state'));
  navigator.serviceWorker.addEventListener('controllerchange',()=>{emit('controllerchange');void map();});void navigator.serviceWorker.ready.then(r=>{emit('ready-resolved',{active:r.active?.state});void map();});
  const register=navigator.serviceWorker.register.bind(navigator.serviceWorker);navigator.serviceWorker.register=(...args)=>register(...args).then(r=>{emit('register-resolved');const watch=w=>{if(!w)return;emit('worker-state',{state:w.state});w.addEventListener('statechange',()=>{emit('worker-state',{state:w.state});void map();});};watch(r.installing);watch(r.waiting);watch(r.active);r.addEventListener('updatefound',()=>watch(r.installing));return r;});
 });
 context.on('page',page=>{
  page.on('request',r=>{if(r.isNavigationRequest())void write({source:'navigation',event:'request',url:r.url(),method:r.method()});});
  page.on('response',r=>{if(r.request().isNavigationRequest())void write({source:'navigation',event:'response',url:r.url(),status:r.status()});});
  page.on('framenavigated',frame=>{if(frame===page.mainFrame())void (async()=>{let documentId;try{documentId=await frame.evaluate(()=>globalThis.__causalDocument);}catch{}await write({source:'navigation',event:'commit',url:frame.url(),document:documentId||null});})();});
  page.on('console',m=>{if(m.type()==='error')void write({source:'console',event:'error',text:m.text()});});page.on('pageerror',e=>void write({event:'pageerror',error:e.message}));
 });
 return {write,flush:()=>serial};
}
