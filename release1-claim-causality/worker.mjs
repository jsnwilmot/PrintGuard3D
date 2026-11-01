// Only serialized into disposable localhost worker responses.
function additions(config){
 const send=self.fetch.bind(self),add=self.addEventListener.bind(self),claim=self.clients.claim.bind(self.clients),boot=crypto.randomUUID();let seq=0;
 const emit=(event,detail={})=>send('/__forensic/log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:'clients',context:config.context,boot,sequence:++seq,event,wall:Date.now(),monotonic:performance.now(),timeOrigin:performance.timeOrigin,...detail})}).catch(()=>{});
 const snapshot=async event=>{try{const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});await emit(event,{clients:clients.map(c=>({id:c.id,url:c.url,type:c.type,frameType:c.frameType,visibilityState:c.visibilityState,focused:c.focused}))});}catch(e){await emit(event+'-unknown',{error:String(e)});}};
 add('message',event=>{if(event.data?.type==='FORENSIC_DOCUMENT')event.waitUntil(emit('document-client-map',{clientId:event.source?.id,clientURL:event.source?.url,document:event.data.document,readyState:event.data.readyState,controller:event.data.controller,href:event.data.href}));});
 self.clients.claim=()=>{void emit('native-claim-start');const p=claim();return p.then(v=>{void emit('native-claim-end');void snapshot('clients-after-claim');return v;},e=>{void emit('native-claim-reject',{error:String(e)});throw e;});};
 self.addEventListener=(type,listener,options)=>{
  if(type!=='install')return add(type,listener,options);
  return add(type,event=>{const wait=event.waitUntil.bind(event),before=snapshot('clients-before-install');wait(before);const proxy=new Proxy(event,{get(target,key){if(key==='waitUntil')return promise=>wait(Promise.resolve(promise).then(async v=>{await before;if(config.gated){await emit('install-gate-enter');await send('/__forensic/install-gate?context='+config.context);await emit('install-gate-released');}return v;}));const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});listener.call(self,proxy);},options);
 };
}
export function prefix(config){return '('+additions.toString()+')('+JSON.stringify(config)+');\n';}
