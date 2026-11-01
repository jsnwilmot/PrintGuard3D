import http from 'node:http';
import {spawn} from 'node:child_process';
import {readFile,mkdir,appendFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {instrumentWorker} from './worker-copy.mjs';
const run=resolve(process.env.PRINTGUARD_FORENSIC_RUN||''),metadata=JSON.parse(await readFile(join(run,'SOURCE.json'),'utf8'));if(metadata.base!=='0d388b42afff7f57db01028a64deac85e293d2ba')throw Error('Unapproved source');
const out=join(run,'events');await mkdir(out,{recursive:true});
const original=await readFile(join(metadata.source,'dist/sw.js'),'utf8'),originalSHA=createHash('sha256').update(original).digest('hex');if(originalSHA!==metadata.files['sw.js'])throw Error('Worker bytes changed');
const match=original.match(/const CACHE=("[^"]+"),ASSETS=(\[.*?\]),HASHES=(\{.*?\});/);if(!match)throw Error('Unknown pinned worker layout');
const cache=JSON.parse(match[1]),hashes=JSON.parse(match[3]);
const headers=Object.fromEntries((await readFile(join(metadata.source,'public/_headers'),'utf8')).split(/\r?\n/).filter(line=>/^\s+[^:]+:/.test(line)).map(line=>{const i=line.indexOf(':');return[line.slice(0,i).trim(),line.slice(i+1).trim()];}));
const upstream=spawn(process.execPath,['remediation-phase1/server.mjs','4351','--source-headers','--offline-control'],{cwd:metadata.source,stdio:'inherit',windowsHide:true});
const contextId=request=>{const value=(request.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('pg_forensic_context='))?.split('=')[1];return value&&/^[a-zA-Z0-9_-]{1,120}$/.test(value)?value:'no-context';};
const mode=request=>(request.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('pg_forensic_mode='))?.split('=')[1]||'natural';
async function log(context,event){await appendFile(join(out,context+'.ndjson'),JSON.stringify({receivedAt:new Date().toISOString(),nodeMonotonic:process.hrtime.bigint().toString(),...event})+'\n');}
const server=http.createServer(async(request,response)=>{
 const url=new URL(request.url,'http://127.0.0.1:4359'),context=contextId(request);
 if(url.pathname==='/__forensic/health'){response.writeHead(200);response.end('synthetic');return;}
 if(url.pathname==='/__forensic/log'&&request.method==='POST'){
  try{let body='';for await(const chunk of request){body+=chunk;if(body.length>65536)throw Error('Too large');}const value=JSON.parse(body);if(typeof value.context!=='string'||!/^[a-zA-Z0-9_-]{1,120}$/.test(value.context))throw Error('Unknown context');await log(value.context,value);response.writeHead(200);response.end('recorded');}catch{response.writeHead(400);response.end('invalid');}return;
 }
 await log(context,{source:'server',event:'request',path:url.pathname,mode:mode(request)});
 if(url.pathname==='/sw.js'&&context!=='no-context'){
  const copy=instrumentWorker(original,{context,originalSHA,cache,hashes}),sha=createHash('sha256').update(copy).digest('hex');await writeFile(join(out,context+'.worker.js'),copy);await log(context,{source:'server',event:'worker-copy',originalSHA,instrumentedSHA:sha});response.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-cache',...headers});response.end(copy);return;
 }
 if(url.pathname==='/workshop.svg'&&['503','hash','delay'].includes(mode(request))){
  if(mode(request)==='delay')await new Promise(resolve=>setTimeout(resolve,1000));
  else{const status=mode(request)==='503'?503:200;await log(context,{source:'server',event:'fault-response',status,path:url.pathname});response.writeHead(status,{'Content-Type':'image/svg+xml',...headers});response.end('<svg xmlns="http://www.w3.org/2000/svg"><title>Forensic negative</title></svg>');return;}
 }
 const forwarded=http.request({hostname:'127.0.0.1',port:4351,path:request.url,method:request.method,headers:request.headers},incoming=>{void log(context,{source:'server',event:'response',path:url.pathname,status:incoming.statusCode});response.writeHead(incoming.statusCode||502,incoming.headers);incoming.pipe(response);});
 forwarded.on('error',error=>{void log(context,{source:'server',event:'request-reject',path:url.pathname,error:error.message});response.destroy();});request.pipe(forwarded);
});
let upstreamReady=false;for(let attempt=0;attempt<100&&!upstreamReady;attempt++){
 upstreamReady=await new Promise(resolve=>{const request=http.get('http://127.0.0.1:4351/review.html',response=>{response.resume();resolve(response.statusCode===200);});request.on('error',()=>resolve(false));});
 if(!upstreamReady)await new Promise(resolve=>setTimeout(resolve,50));
}
if(!upstreamReady){upstream.kill();throw Error('Pinned upstream failed to start');}
server.listen(4359,'127.0.0.1',()=>console.log('Disposable worker-phase proxy on127.0.0.1:4359'));
process.on('exit',()=>upstream.kill());process.on('SIGTERM',()=>{upstream.kill();server.close();process.exit();});process.on('SIGINT',()=>{upstream.kill();server.close();process.exit();});
