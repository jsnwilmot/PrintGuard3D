import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist'),audit=resolve('acceptance-review');
const auditFiles={'/review.html':'review.html','/review-harness.js':'review-harness.js','/review-harness.css':'review-harness.css','/fixture-backup.json':'fixture-backup.json'};
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const port=Number(process.argv[2]||4319);
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=auditFiles[pathname]?resolve(audit,auditFiles[pathname]):resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!(file.startsWith(root+sep)||file.startsWith(audit+sep)))throw Error('Forbidden');const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Isolated review: http://127.0.0.1:${port}/review.html`));
