// Detached, synthetic worktree only. Never changes runtime source or hosting.
import {mkdir,symlink,readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const base='0d388b42afff7f57db01028a64deac85e293d2ba',id=process.argv[2];
if(!/^[a-zA-Z0-9-]+$/.test(id||''))throw Error('New alphanumeric run ID required');
const root=process.cwd(),run=resolve('.verification-local/sw-readiness',id);await mkdir(run,{recursive:true});
const source=join(run,'approved');execFileSync('git',['worktree','add','--detach',source,base],{stdio:'inherit',windowsHide:true});
await symlink(join(root,'node_modules'),join(source,'node_modules'),process.platform==='win32'?'junction':'dir');
const execute=(script,args=[])=>execFileSync(process.execPath,[join(root,'node_modules',script),...args],{cwd:source,stdio:'inherit',windowsHide:true});
execute('typescript/bin/tsc',['-b']);execute('vite/bin/vite.js',['build']);
execFileSync(process.execPath,['release1-clean-origin/prepare.mjs','approved',...(process.argv[3]?[resolve(process.argv[3])]:[])],{cwd:source,stdio:'inherit',windowsHide:true});
const frozen=join(source,'.verification-local/clean-origin/approved');const manifest=JSON.parse(await readFile(join(frozen,'manifest.json'),'utf8'));if(manifest.commit!==base)throw Error('Pin mismatch');
const ordinaryFiles={};async function walk(path,prefix=''){for(const entry of await readdir(path,{withFileTypes:true})){const name=prefix+entry.name;if(entry.isDirectory())await walk(join(path,entry.name),name+'/');else ordinaryFiles[name]=createHash('sha256').update(await readFile(join(path,entry.name))).digest('hex');}}await walk(join(source,'dist'));
await writeFile(join(run,'SOURCE.json'),JSON.stringify({base,source,frozen,originalN09:'release1-reporting/native/reporting.mjs',originalConfig:'release1-reporting/playwright.config.mjs',repetitions:10,retries:0,caseCeilingMilliseconds:120000,ordinaryFiles},null,2));
console.log('Pinned fixture: '+frozen);
