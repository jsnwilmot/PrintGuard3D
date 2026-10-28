import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist'),audit=resolve('acceptance-review'),fixture=resolve('remediation-phase1/fixture-backup.json');
const auditFiles={'/review.html':'review.html','/review-harness.js':'review-harness.js','/review-harness.css':'review-harness.css','/fixture-backup.json':'fixture-backup.json'};
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
// Optional local verification of the existing host header file; never changes hosting.
const headers=process.argv.includes('--source-headers')?Object.fromEntries((await readFile('public/_headers','utf8')).split(/\r?\n/).filter(line=>/^\s+[^:]+:/.test(line)).map(line=>{const colon=line.indexOf(':');return [line.slice(0,colon).trim(),line.slice(colon+1).trim()];})):{};
const port=Number(process.argv[2]||4341);
let networkUnavailable=false;
http.createServer(async(req,res)=>{
 if(process.argv.includes('--offline-control')){
  if(req.method==='POST'&&['/__synthetic-network/off','/__synthetic-network/on'].includes(req.url)){networkUnavailable=req.url.endsWith('/off');res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({networkUnavailable}));return;}
  if(networkUnavailable){req.socket.destroy();return;}
 }
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=pathname==='/fixture-backup.json'?fixture:auditFiles[pathname]?resolve(audit,auditFiles[pathname]):resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!(file.startsWith(root+sep)||file.startsWith(audit+sep)||file===fixture))throw Error('Forbidden');const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff',...headers});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Isolated review: http://127.0.0.1:${port}/review.html`));
