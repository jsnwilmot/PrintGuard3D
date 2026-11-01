import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {generateKeyPairSync,sign} from 'node:crypto';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import {serviceWorkerSource} from '../scripts/service-worker.mjs';
import {validateContract,validateReleaseReview,buildContext,canonical,configureBuild,bootstrap} from '../scripts/release-contract.mjs';
import declaration from '../release-contract.json';
const fresh=()=>structuredClone(declaration);
const context=()=>buildContext(process.cwd(),fresh(),1,'release');
function signed(){
 const contract=fresh(),{publicKey,privateKey}=generateKeyPairSync('ed25519');
 contract.approvedReviewers={synthetic:{name:'Disposable test reviewer',publicKey:publicKey.export({format:'pem',type:'spki'}).toString()}};
 const artifact=context(),review={reviewerId:'synthetic',reviewedAt:'2026-10-31T00:00:00.000Z',reference:'https://github.com/jsnwilmot/PrintGuard3D/issues/39',decision:'approved'};
 const receipt={schemaVersion:1,artifact,review,signature:sign(null,Buffer.from(canonical({schemaVersion:1,artifact,review})),privateKey).toString('base64')};
 return {contract,artifact,receipt};
}
it('G01 explicit compatible contract preserves known generation and data format',()=>{expect(validateContract(fresh()).writer).toEqual(bootstrap.writer);});
it('G02 absent release declaration is never inferred',()=>{expect(()=>validateContract({})).toThrow(/missing/);});
it('G03 missing compatibility reasoning/evidence refuses',()=>{const c=fresh();c.compatibility.evidence=[];expect(()=>validateContract(c)).toThrow(/evidence/);});
it('G04 incompatible change cannot retain its old generation',()=>{const c=fresh();c.compatibility.classification='writer-bump';expect(()=>validateContract(c)).toThrow(/generation disagree/);});
it('G05 same-format declared writer bump is permitted with higher generation',()=>{const c=fresh();c.compatibility.classification='writer-bump';c.writer.generation=2;expect(validateContract(c).writer.generation).toBe(2);});
it('G06 compatible declaration cannot silently increase generation',()=>{const c=fresh();c.writer.generation=2;expect(()=>validateContract(c)).toThrow(/generation disagree/);});
it('G07 unsupported capabilities require separate migration STOP',()=>{const c=fresh();c.writer.capabilities[0]='backup:2';expect(()=>validateContract(c)).toThrow(/unsupported/);});
it('G08 unsupported native schema refuses',()=>{const c=fresh();c.nativeVersion=30;expect(()=>validateContract(c)).toThrow(/STOP/);});
it('G09 incompatible format classification refuses instead of automatic adoption',()=>{const c=fresh();c.compatibility.classification='incompatible-format';expect(()=>validateContract(c)).toThrow(/STOP/);});
it('G10 positive signed exact-artifact review validates only with a registered disposable key',()=>{const {contract,artifact,receipt}=signed();expect(validateReleaseReview(receipt,artifact,contract)).toBe(receipt);});
it('G11 real draft has no trusted signer and cannot forge approved release',()=>{const {artifact,receipt}=signed();expect(()=>validateReleaseReview(receipt,artifact,fresh())).toThrow(/not in/);});
it('G12 altered source SHA invalidates prior approval',()=>{const {contract,artifact,receipt}=signed();expect(()=>validateReleaseReview(receipt,{...artifact,sourceCommit:'0'.repeat(40)},contract)).toThrow(/exact SHA/);});
it('G13 altered build identity invalidates prior approval',()=>{const {contract,artifact,receipt}=signed();expect(()=>validateReleaseReview(receipt,{...artifact,buildIdentity:'0'.repeat(24)},contract)).toThrow(/exact SHA/);});
it('G14 tampered compatibility reasoning invalidates signature even for a matching supplied context',()=>{const {contract,artifact,receipt}=signed();receipt.artifact.compatibility.reason+=' Tampered.';expect(()=>validateReleaseReview(receipt,artifact,contract)).toThrow(/signature/);});
it('G15 rejected/missing review cannot produce a release',()=>{const {contract,artifact,receipt}=signed();receipt.review.decision='rejected';expect(()=>validateReleaseReview(receipt,artifact,contract)).toThrow(/approved review/);expect(()=>validateReleaseReview({},artifact,contract)).toThrow(/missing/);});
it('G16 dirty source cannot use an earlier signed approval',()=>{const {contract,artifact,receipt}=signed();expect(()=>validateReleaseReview(receipt,artifact,contract,{clean:false})).toThrow(/uncommitted/);});
it('G17 development/fixture artifacts remain nondeployable',()=>{const {contract,artifact,receipt}=signed();expect(()=>validateReleaseReview(receipt,{...artifact,kind:'development'},contract)).toThrow(/NON-DEPLOYABLE/);const build=configureBuild(process.cwd(),{},'production');expect(build.deployable).toBe(false);expect(build.context.kind).toBe('development');});
it('G18 unmarked generation environment override refuses; explicit fixture cannot enter release mode',()=>{expect(()=>configureBuild(process.cwd(),{PRINTGUARD_WRITER_GENERATION:'2'},'production')).toThrow(/restricted/);expect(()=>configureBuild(process.cwd(),{PRINTGUARD_FIXTURE:'1',PRINTGUARD_WRITER_GENERATION:'2'},'release')).toThrow(/cannot produce/);});
it('G19 actual release configuration refuses missing signed approval before writing build output',()=>{const proc=spawnSync(process.execPath,[resolve('node_modules/vite/bin/vite.js'),'build','--mode','release'],{encoding:'utf8',env:{...process.env,VITEST:'',PRINTGUARD_RELEASE_REVIEW:'',PRINTGUARD_FIXTURE:'',PRINTGUARD_WRITER_GENERATION:''},windowsHide:true,timeout:20000});expect(proc.status).not.toBe(0);expect(proc.stdout+proc.stderr).toContain('missing signed exact-artifact review');},30000);
it('G20 reviewer signature is independent of JSON key ordering but not payload values',()=>{const {contract,artifact,receipt}=signed();const reordered={...receipt,review:Object.fromEntries(Object.entries(receipt.review).reverse())};expect(validateReleaseReview(reordered,artifact,contract)).toEqual(reordered);});
it('G21 tracked writer/runtime contract uses the single reviewed declaration',()=>{expect(readFileSync('src/writerSafety.ts','utf8')).toContain('releaseContract.writer.generation');expect(readFileSync('vite.config.ts','utf8')).not.toContain('WRITER_GENERATION||1');});
it('G22 production release refuses test identity mode',()=>{expect(()=>configureBuild(process.cwd(),{VITEST:'true'},'release')).toThrow(/test identity cannot produce/);});
it('G23 future-dated approval does not authorize a release',()=>{const {contract,artifact,receipt}=signed();receipt.review.reviewedAt='9999-01-01T00:00:00.000Z';expect(()=>validateReleaseReview(receipt,artifact,contract)).toThrow(/dated approved/);});
it('G24 reviewer register accepts only public key material',()=>{const c=fresh(),{privateKey}=generateKeyPairSync('ed25519');c.approvedReviewers={synthetic:{name:'Disposable test reviewer',publicKey:privateKey.export({type:'pkcs8',format:'pem'}).toString()}};expect(()=>validateContract(c)).toThrow(/never private/);});
it('G25 an already installed canonical PWA cannot install an unsigned developer worker or touch its reviewed cache',async()=>{
 const origin='https://printguard3d.roseandpaw.ca',handlers:Record<string,(event:{waitUntil:(promise:Promise<void>)=>void})=>void>={},touches:string[]=[];
 const source=serviceWorkerSource({cache:'nondeployable-fixture',assets:[],hashes:{},identity:'a'.repeat(24),writer:bootstrap.writer,canonicalOrigin:origin,deployable:false});
 runInNewContext(source,{self:{location:{origin},registration:{active:{state:'activated'}},addEventListener:(name:string,handler:typeof handlers[string])=>{handlers[name]=handler;}},fetch:()=>{touches.push('fetch');throw Error('Must not fetch');},caches:{open:()=>{touches.push('cache');throw Error('Must not touch reviewed cache');}}});
 let install!:Promise<void>;handlers.install({waitUntil:promise=>{install=promise;}});await expect(install).rejects.toThrow('Non-deployable artifact cannot install at the canonical origin');expect(touches).toEqual([]);
 // Positive control exercises the declared release flag; this is not a real
 // signing approval or a provider/browser deployment claim.
 const entries:unknown[]=[];const release=serviceWorkerSource({cache:'declared-release-fixture',assets:[],hashes:{},identity:'b'.repeat(24),writer:bootstrap.writer,canonicalOrigin:origin,deployable:true});
 runInNewContext(release,{self:{location:{origin},registration:{active:{state:'activated'}},addEventListener:(name:string,handler:typeof handlers[string])=>{handlers[name]=handler;}},Response,caches:{open:async(name:string)=>{expect(name).toBe('declared-release-fixture');return {put:async(path:string,value:Response)=>{entries.push({path,value:await value.json()});}};}}});
 handlers.install({waitUntil:promise=>{install=promise;}});await install;expect(entries).toEqual([{path:'/__printguard_install__',value:{initial:false}}]);
});
