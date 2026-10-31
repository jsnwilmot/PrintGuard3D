// Local build/release validation only. No deploy, provider API or signing key.
import {readFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash,createPublicKey,verify} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export const bootstrapCommit='f93bbf5297ac1ca858a521cc2781777b4c492073';
const capabilities=['backup:1','consent:1.0','observations:1','profiles:1','recommendations:1'];
export const bootstrap={writer:{protocol:1,generation:1,capabilities},nativeVersion:20};
const exact=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function keys(value,names){return value&&typeof value==='object'&&!Array.isArray(value)&&exact(Object.keys(value).sort(),[...names].sort());}
function assert(ok,message){if(!ok)throw Error('Release contract: '+message);}
export function canonical(value){return JSON.stringify(value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(k=>[k,JSON.parse(canonical(value[k]))])):Array.isArray(value)?value.map(v=>JSON.parse(canonical(v))):value);}
export function validateContract(value,baseline=bootstrap){
 assert(keys(value,['schemaVersion','releaseVersion','writer','nativeVersion','compatibility','approvedReviewers']),'missing/unknown declaration fields');
 assert(value.schemaVersion===1&&/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?$/.test(value.releaseVersion),'unsupported schema/release version');
 const w=value.writer,c=value.compatibility;
 assert(baseline?.writer&&Number.isSafeInteger(baseline.writer.generation)&&baseline.writer.generation>0,'invalid immutable baseline writer contract');
 assert(keys(w,['protocol','generation','capabilities'])&&w.protocol===1&&Number.isSafeInteger(w.generation)&&w.generation>0&&exact(w.capabilities,capabilities),'unsupported writer protocol/capabilities or generation');
 assert(value.nativeVersion===20&&baseline.nativeVersion===20&&exact(w.capabilities,baseline.writer.capabilities)&&w.protocol===baseline.writer.protocol,'format/schema transition needs separately authorized migration; STOP');
 assert(keys(c,['classification','baselineCommit','reason','evidence'])&&/^[a-f0-9]{40}$/.test(c.baselineCommit)&&typeof c.reason==='string'&&c.reason.trim().length>=40&&Array.isArray(c.evidence)&&c.evidence.length>0&&c.evidence.every(p=>typeof p==='string'&&p.length>0),'explicit baseline, reasoning and evidence required');
 assert(c.classification==='compatible'||c.classification==='writer-bump','unknown/incompatible-format classification; STOP');
 assert(c.classification==='compatible'?w.generation===baseline.writer.generation:w.generation>baseline.writer.generation,'compatibility classification and writer generation disagree');
 assert(value.approvedReviewers&&typeof value.approvedReviewers==='object'&&!Array.isArray(value.approvedReviewers),'reviewer trust register required');
 for(const [id,entry]of Object.entries(value.approvedReviewers)){
  assert(/^[a-zA-Z0-9._-]+$/.test(id)&&keys(entry,['name','publicKey'])&&typeof entry.name==='string'&&entry.name.trim().length>0,'invalid reviewer registration');
  assert(typeof entry.publicKey==='string'&&entry.publicKey.startsWith('-----BEGIN PUBLIC KEY-----')&&createPublicKey(entry.publicKey).asymmetricKeyType==='ed25519','reviewer requires Ed25519 public key, never private material');
 }
 return value;
}
function git(root,args){return execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']}).trim();}
export function baselineContract(root,contract){
 const ref=contract?.compatibility?.baselineCommit;
 assert(typeof ref==='string'&&/^[a-f0-9]{40}$/.test(ref),'immutable baseline SHA required');
 execFileSync('git',['merge-base','--is-ancestor',ref,'HEAD'],{cwd:root,windowsHide:true,stdio:'pipe'});
 if(ref===bootstrapCommit)return bootstrap; // Accepted pre-contract first-public implementation, never inferred from a mutable branch.
 const prior=JSON.parse(git(root,['show',ref+':release-contract.json']));
 assert(prior.schemaVersion===1,'unsupported baseline contract');return prior;
}
export function buildContext(root,contract,generation=contract.writer.generation,kind='development'){
 const walk=at=>readdirSync(at,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(at,e.name)):[join(at,e.name)]).sort();
 const paths=[...walk(join(root,'src')),...walk(join(root,'public')),...['package.json','package-lock.json','tsconfig.json','index.html','vite.config.ts','release-contract.json','scripts/release-contract.mjs','scripts/service-worker.mjs'].map(p=>join(root,p))];
 const hash=createHash('sha256');for(const path of paths)hash.update(relative(root,path).replaceAll('\\','/')+'\0').update(readFileSync(path)).update('\0');
 const buildIdentity=hash.update(canonical({generation,kind})).digest('hex').slice(0,24);
 return {sourceCommit:git(root,['rev-parse','HEAD']),buildIdentity,releaseVersion:contract.releaseVersion,writer:{...contract.writer,generation},nativeVersion:contract.nativeVersion,compatibility:contract.compatibility,kind};
}
export function validateReleaseReview(declaration,context,contract,{clean=true}={}){
 assert(clean,'release source has uncommitted changes');
 assert(context.kind==='release','development/fixture output is NON-DEPLOYABLE');
 assert(keys(declaration,['schemaVersion','artifact','review','signature'])&&declaration.schemaVersion===1,'signed per-artifact review is missing');
 assert(exact(canonical(declaration.artifact),canonical(context)),'review is not pinned to this exact SHA/build/compatibility decision');
 const review=declaration.review;
 assert(keys(review,['reviewerId','reviewedAt','reference','decision'])&&review.decision==='approved'&&typeof review.reference==='string'&&/^https:\/\/github\.com\/jsnwilmot\/PrintGuard3D\/(?:pull|issues)\/\d+(?:#[-a-zA-Z0-9]+)?$/.test(review.reference)&&Number.isFinite(Date.parse(review.reviewedAt))&&new Date(review.reviewedAt).toISOString()===review.reviewedAt&&Date.parse(review.reviewedAt)<=Date.now()+300000,'explicit named, dated approved review/reference required');
 const reviewer=contract.approvedReviewers[review.reviewerId];assert(reviewer,'reviewer key is not in the independently reviewed trust register');
 const message=Buffer.from(canonical({schemaVersion:1,artifact:declaration.artifact,review}));
 assert(typeof declaration.signature==='string'&&verify(null,message,reviewer.publicKey,Buffer.from(declaration.signature,'base64')),'invalid reviewer signature');
 return declaration;
}
export function configureBuild(root,env,mode){
 const contract=JSON.parse(readFileSync(join(root,'release-contract.json'),'utf8'));
 validateContract(contract,baselineContract(root,contract));
 for(const path of contract.compatibility.evidence){assert(!path.startsWith('/')&&!path.includes('..'),'evidence must be a repository path');readFileSync(join(root,path));}
 const fixture=env.PRINTGUARD_FIXTURE==='1',override=env.PRINTGUARD_WRITER_GENERATION;
 assert(!override||fixture,'generation override is restricted to explicitly NON-DEPLOYABLE local fixtures');
 assert(mode!=='release'||(!fixture&&!override&&!env.VITEST),'fixture/override/test identity cannot produce a release');
 const generation=override?Number(override):contract.writer.generation;
 assert(Number.isSafeInteger(generation)&&generation>0,'invalid fixture generation');
 const kind=mode==='release'?'release':fixture?'fixture':'development';
 const fixtureContract=fixture&&generation!==contract.writer.generation?{...contract,writer:{...contract.writer,generation},compatibility:{...contract.compatibility,classification:generation===baselineContract(root,contract).writer.generation?'compatible':'writer-bump',reason:'Explicit NON-DEPLOYABLE synthetic fixture: same known data format, controlled writer generation for native stale-writer and adoption evidence.'}}:contract;
 validateContract(fixtureContract,baselineContract(root,contract));
 const context=buildContext(root,fixtureContract,generation,kind);
 if(kind==='release'){
  assert(env.PRINTGUARD_RELEASE_REVIEW,'missing signed exact-artifact review; no release output authorized');
  const clean=!git(root,['status','--porcelain','--untracked-files=all']);
  validateReleaseReview(JSON.parse(readFileSync(env.PRINTGUARD_RELEASE_REVIEW,'utf8')),context,contract,{clean});
 }
 return {contract,context,deployable:kind==='release'};
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 assert(process.argv[2]==='--describe','use --describe to prepare a review payload; signing/release is separate');
 const root=process.cwd(),contract=JSON.parse(readFileSync(join(root,'release-contract.json'),'utf8'));
 validateContract(contract,baselineContract(root,contract));
 console.log(JSON.stringify({schemaVersion:1,artifact:buildContext(root,contract,contract.writer.generation,'release'),review:{reviewerId:'PENDING',reviewedAt:'PENDING',reference:'https://github.com/jsnwilmot/PrintGuard3D/issues/39',decision:'PENDING'},signature:'PENDING — independent approved reviewer required'},null,2));
}
