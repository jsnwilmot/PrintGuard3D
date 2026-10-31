// Build only local executable fixtures. No deployment or provider API.
import {build} from 'vite';
import {mkdir,cp,readFile,writeFile,readdir,symlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const id=process.argv[2];if(!/^[a-zA-Z0-9-]+$/.test(id||''))throw Error('Provide a new alphanumeric run ID');
await mkdir('.verification-local/clean-origin',{recursive:true});
const run=resolve('.verification-local/clean-origin',id);await mkdir(run,{recursive:false});
const source=join(run,'source');await mkdir(source);
for(const path of ['src','public','index.html','vite.config.ts','package.json','package-lock.json','tsconfig.json'])await cp(path,join(source,path),{recursive:true});
await symlink(resolve('node_modules'),join(source,'node_modules'),process.platform==='win32'?'junction':'dir');
const hash=b=>createHash('sha256').update(b).digest('hex');
const commit=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).stdout.trim();
const manifest={version:1,preparedAt:new Date().toISOString(),commit,lockSHA256:hash(await readFile('package-lock.json')),builds:{}};
const historical=resolve(process.argv[3]||'.verification-local/operational/op37-'+id);
if(!process.argv[3]){const result=spawnSync(process.execPath,['release1-operational-preflight/prepare.mjs','op37-'+id],{stdio:'inherit',windowsHide:true});if(result.status!==0)throw Error('Historical preparation failed');}
const oldManifest=JSON.parse(await readFile(join(historical,'manifest.json'),'utf8'));
for(const [name,commit]of Object.entries({prePhase5:'616e26ee5c0834a3d0900294981bcf8963d2c053',preRecommendations:'d03eb59cb887cfad335241b9f56d260b5a75abdc'})){
 if(oldManifest.versions[name].commit!==commit)throw Error('Wrong historical source');
 for(const [path,expected]of Object.entries(oldManifest.versions[name].files))if(hash(await readFile(join(historical,name,'dist',path)))!==expected)throw Error('Historical bytes changed');
 if(hash(await readFile(join(historical,name+'-probe.js')))!==oldManifest.versions[name].probeSHA256)throw Error('Historical probe changed');
}
manifest.historical={directory:historical,versions:oldManifest.versions};
const exports=`import * as api from ${JSON.stringify(join(source,'src/db.ts').replaceAll('\\','/'))};import * as writer from ${JSON.stringify(join(source,'src/writerSafety.ts').replaceAll('\\','/'))};import * as observations from ${JSON.stringify(join(source,'src/observationStore.ts').replaceAll('\\','/'))};export {api,writer,observations};`;
const entry=join(run,'probe.ts');await writeFile(entry,exports);
for(const generation of [1,2]){
 const built=spawnSync(process.execPath,[resolve('node_modules/vite/bin/vite.js'),'build'],{cwd:source,env:{...process.env,PRINTGUARD_WRITER_GENERATION:String(generation)},encoding:'utf8',windowsHide:true});
 await writeFile(join(run,'build'+generation+'.log'),built.stdout+built.stderr);if(built.status!==0)throw Error('Fixture build failed: '+built.stderr);
 const dir=join(run,'generation'+generation);await cp(join(source,'dist'),dir,{recursive:true,errorOnExist:true,force:false});
 const html=await readFile(join(dir,'index.html'),'utf8'),identity=html.match(/name="printguard-build" content="([^"]+)"/)[1];
 await build({configFile:false,logLevel:'warn',define:{__PRINTGUARD_BUILD__:JSON.stringify(identity),__PRINTGUARD_GENERATION__:generation},build:{outDir:join(run,'probe'+generation),emptyOutDir:false,minify:false,lib:{entry,formats:['es'],fileName:()=>`probe${generation}.js`}}});
 const files={};async function walk(at,prefix=''){for(const e of await readdir(at,{withFileTypes:true})){const rel=prefix+e.name,p=join(at,e.name);if(e.isDirectory())await walk(p,rel+'/');else files[rel]=hash(await readFile(p));}}await walk(dir);
 manifest.builds[generation]={identity,files,probeSHA256:hash(await readFile(join(run,'probe'+generation,`probe${generation}.js`)))};
}
await writeFile(join(run,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(run);
