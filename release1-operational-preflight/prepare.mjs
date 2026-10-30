// Local-only historical build preparation. Never opens a hosted site or edits application source.
import {spawnSync} from 'node:child_process';
import {mkdir,writeFile,readFile,readdir,symlink} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {build} from 'vite';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const run=resolve(root,'.verification-local/operational',process.argv[2]||new Date().toISOString().replace(/[:.]/g,'-'));
if(!run.startsWith(resolve(root,'.verification-local/operational')+'/')&&!run.startsWith(resolve(root,'.verification-local/operational')+'\\'))throw Error('Output must stay within isolated operational workspace.');
const sha=b=>createHash('sha256').update(b).digest('hex');
function command(name,args,cwd=root){const r=spawnSync(name,args,{cwd,encoding:null,maxBuffer:100*1024*1024,windowsHide:true});if(r.status!==0)throw Error(`${name} ${args.join(' ')} failed: ${r.stderr}`);return r.stdout;}
await mkdir(resolve(root,'.verification-local/operational'),{recursive:true});
await mkdir(run,{recursive:false});
const versions={prePhase5:'616e26ee5c0834a3d0900294981bcf8963d2c053',preRecommendations:'d03eb59cb887cfad335241b9f56d260b5a75abdc',current:'aa6ae5892fde8e0d621bbb34b765c41739e7a2ba'};
const installedLock=await readFile(join(root,'package-lock.json')),manifest={version:1,preparedAt:new Date().toISOString(),run:relative(root,run).replaceAll('\\','/'),toolchain:{node:process.version,lockSHA256:sha(installedLock)},versions:{}};
for(const [name,commit]of Object.entries(versions)){
 const dir=join(run,name);await mkdir(dir);const archive=join(run,name+'.tar');await writeFile(archive,command('git',['archive','--format=tar',commit]));command('tar',['-xf',archive,'-C',dir]);
 if(sha(await readFile(join(dir,'package-lock.json')))!==sha(installedLock))throw Error('Historical lock differs: install its own reviewed dependencies before continuing.');
 await symlink(join(root,'node_modules'),join(dir,'node_modules'),process.platform==='win32'?'junction':'dir');
 const log=[];for(const args of [[join(root,'node_modules/typescript/bin/tsc'),'-b'],[join(root,'node_modules/vite/bin/vite.js'),'build']])log.push(command(process.execPath,args,dir));await writeFile(join(run,name+'-build.log'),Buffer.concat(log));
 const bridge=`import * as api from ${JSON.stringify(join(dir,'src/db.ts').replaceAll('\\','/'))};export const db=api.db;export const validate=api.validateBackup;export const restore=api.restoreBackup;export const backup=api.makeBackup;export const complete=api.completeTask;`;
 const entry=join(run,name+'-probe.ts');await writeFile(entry,bridge);
 await build({root:dir,configFile:false,logLevel:'silent',build:{outDir:join(run,name+'-probe'),emptyOutDir:false,minify:false,lib:{entry,formats:['es'],fileName:()=>name+'-probe.js'}}});
 await writeFile(join(run,name+'-probe.js'),await readFile(join(run,name+'-probe',name+'-probe.js')));
 const files={};async function walk(at){for(const e of await readdir(at,{withFileTypes:true})){const p=join(at,e.name);if(e.isDirectory())await walk(p);else files[relative(join(dir,'dist'),p).replaceAll('\\','/')]=sha(await readFile(p));}}await walk(join(dir,'dist'));
 manifest.versions[name]={commit,sourceTree:command('git',['rev-parse',commit+'^{tree}']).toString().trim(),lockSHA256:sha(installedLock),files,probeSHA256:sha(await readFile(join(run,name+'-probe.js')))};console.log(`Built unchanged ${name} ${commit}`);
}
await writeFile(join(run,'manifest.json'),JSON.stringify(manifest,null,2));console.log('OP32_RUN='+relative(root,run).replaceAll('\\','/'));
