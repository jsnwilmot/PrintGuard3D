// Serialized only into a disposable localhost worker response, never a build.
function traceWorker(config){
 if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(self.location.origin)||!config.testOnly)throw Error('Forensic worker is localhost-only');
 const fetchNative=self.fetch.bind(self),digestNative=crypto.subtle.digest.bind(crypto.subtle),addNative=self.addEventListener.bind(self),openNative=caches.open.bind(caches),claimNative=self.clients.claim.bind(self.clients);
 const boot=crypto.randomUUID();let sequence=0,path='';
 const emit=(event,detail={})=>{const payload={source:'worker',context:config.context,boot,sequence:++sequence,event,wall:Date.now(),monotonic:performance.now(),timeOrigin:performance.timeOrigin,...detail};void fetchNative('/__forensic/log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{});};
 emit('worker-start',{originalSHA:config.originalSHA,cache:config.cache});
 self.fetch=(...args)=>{const url=new URL(args[0]?.url||args[0],self.location.href);path=url.pathname;emit('fetch-start',{path});return fetchNative(...args).then(response=>{emit('fetch-response',{path:url.pathname,status:response.status});return response;},error=>{emit('fetch-reject',{path:url.pathname,error:String(error)});throw error;});};
 crypto.subtle.digest=(algorithm,bytes)=>{const requestPath=path;return digestNative(algorithm,bytes).then(result=>{const actual=Array.from(new Uint8Array(result)).map(value=>value.toString(16).padStart(2,'0')).join('');emit('digest',{path:requestPath,bytes:bytes.byteLength,expected:config.hashes[requestPath],actual,match:actual===config.hashes[requestPath]});return result;},error=>{emit('digest-reject',{path:requestPath,error:String(error)});throw error;});};
 caches.open=(name)=>{emit('cache-open-start',{name});return openNative(name).then(cache=>{emit('cache-open-end',{name});return new Proxy(cache,{get(target,key){
  if(key==='put')return(request,response)=>{const asset=typeof request==='string'?request:request.url,marker=asset==='/__printguard_install__';emit('cache-put-start',{name,asset,marker});if(marker)void response.clone().json().then(value=>emit('marker-value',{name,initial:value.initial})).catch(error=>emit('marker-value-unreadable',{error:String(error)}));return target.put(request,response).then(value=>{emit(marker?'marker-complete':'cache-put-end',{name,asset,marker});return value;},error=>{emit('cache-put-reject',{name,asset,marker,error:String(error)});throw error;});};
  if(key==='match')return(...args)=>target.match(...args).then(response=>{emit('cache-match',{name,key:String(args[0]),found:!!response});return response;});
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }});},error=>{emit('cache-open-reject',{name,error:String(error)});throw error;});};
 self.clients.claim=()=>{emit('claim-start');return claimNative().then(value=>{emit('claim-end');return value;},error=>{emit('claim-reject',{error:String(error)});throw error;});};
 self.addEventListener=(type,listener,options)=>{
  if(!['install','activate'].includes(type))return addNative(type,listener,options);
  addNative(type,event=>{
   emit(type+'-start');const wait=event.waitUntil.bind(event);
   const proxy=new Proxy(event,{get(target,key){if(key==='waitUntil')return promise=>wait(Promise.resolve(promise).then(value=>{emit(type+'-complete');return value;},error=>{emit(type+'-reject',{error:String(error)});throw error;}));const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
   try{typeof listener==='function'?listener.call(self,proxy):listener.handleEvent(proxy);}catch(error){emit(type+'-throw',{error:String(error)});throw error;}
  },options);
 };
 addNative('error',event=>emit('worker-error',{error:event.message}));addNative('unhandledrejection',event=>emit('worker-unhandled-rejection',{error:String(event.reason)}));
}
export function instrumentWorker(original,config){return '('+traceWorker.toString()+')('+JSON.stringify({...config,testOnly:true})+');\n'+original;}
