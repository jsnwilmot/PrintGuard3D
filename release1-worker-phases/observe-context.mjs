import {readFile,appendFile,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const run=resolve(process.env.PRINTGUARD_FORENSIC_RUN||'');
export const origin='http://127.0.0.1:4359';
export async function observeContext(context,info,index,mode='natural'){
 const id=[info.project.name,'r'+info.repeatEachIndex,'c'+index,mode].join('-'),directory=join(run,'page-events');await mkdir(directory,{recursive:true});
 const write=event=>appendFile(join(directory,id+'.ndjson'),JSON.stringify({context:id,receivedAt:new Date().toISOString(),nodeMonotonic:process.hrtime.bigint().toString(),...event})+'\n');
 await context.addCookies([{name:'pg_forensic_context',value:id,url:origin,httpOnly:true},{name:'pg_forensic_mode',value:mode,url:origin,httpOnly:true}]);
 await context.exposeBinding('__recordPhase',(_source,event)=>write({source:'page',...event}));
 await context.addInitScript(()=>{
  const navigation=crypto.randomUUID();
  globalThis.__phaseEmit=(event,detail={})=>{void globalThis.__recordPhase({event,navigation,wall:Date.now(),monotonic:performance.now(),timeOrigin:performance.timeOrigin,url:location.href,...detail}).catch(()=>{});};
  globalThis.__phaseEmit('document-start',{controller:!!navigator.serviceWorker.controller});
  navigator.serviceWorker.addEventListener('controllerchange',()=>globalThis.__phaseEmit('controllerchange',{controller:!!navigator.serviceWorker.controller,state:navigator.serviceWorker.controller?.state}));
  void navigator.serviceWorker.ready.then(registration=>globalThis.__phaseEmit('independent-ready-resolved',{controller:!!navigator.serviceWorker.controller,active:registration.active?.state}));
  addEventListener('error',event=>globalThis.__phaseEmit('page-error',{error:event.message}));
 });
 const instrumentPage=page=>{
  const evaluate=page.evaluate.bind(page);
  page.evaluate=(expression,...args)=>{
   const text=String(expression);
   if(!text.includes('navigator.serviceWorker.ready')||!text.includes('controllerchange')||text.includes('__phaseEmit'))return evaluate(expression,...args);
   // Only the original combined N09 wait is replaced in this separate
   // instrumented variant. Same awaits/listener, no extra timeout or retry.
   void write({source:'harness',event:'combined-wait-intercepted'});
   return evaluate(async()=>{
    globalThis.__phaseEmit('ready-wait-start');await navigator.serviceWorker.ready;globalThis.__phaseEmit('ready-wait-resolved');
    if(!navigator.serviceWorker.controller){globalThis.__phaseEmit('controller-wait-start');await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));globalThis.__phaseEmit('controller-wait-resolved');}
    else globalThis.__phaseEmit('controller-already-present');
   });
  };
  page.on('console',message=>{void write({source:'console',event:message.type(),text:message.text()});});
  page.on('pageerror',error=>{void write({source:'page',event:'pageerror',error:error.message});});
  page.on('requestfailed',request=>{void write({source:'request',event:'failed',url:request.url(),error:request.failure()});});
 };
 context.on('page',instrumentPage);for(const page of context.pages())instrumentPage(page);
 context.on('close',()=>{void write({source:'harness',event:'context-closed',caseStatus:info.status});});
 await write({source:'harness',event:'context-created',mode,originalCeiling:info.timeout});
 return {id,write};
}
export async function pinnedSource(){return JSON.parse(await readFile(join(run,'SOURCE.json'),'utf8'));}
