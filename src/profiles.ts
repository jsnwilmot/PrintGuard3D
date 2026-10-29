import { type Profile, type Task, type Printer, profileSchema } from './domain';
import {sameRecord} from './comparison';
export const manufacturers=['FlashForge','Bambu Lab','Creality','Prusa','Anycubic','Elegoo','QIDI Tech','Sovol','Ultimaker','Raise3D','Snapmaker','Formlabs','Custom'];
export const catalog:Record<string,string[]>={'FlashForge':['Creator 5','Creator 5 Pro'],'Bambu Lab':['P1S','X1 Carbon','A1'],'Creality':['K1','Ender-3 V3'],'Prusa':['MK4S','CORE One'],'Anycubic':['Kobra 3','Photon Mono M7'],'Elegoo':['Neptune 4','Saturn 4 Ultra'],'QIDI Tech':['Plus4'],'Sovol':['SV08'],'Ultimaker':['S7'],'Raise3D':['Pro3'],'Snapmaker':['Artisan'],'Formlabs':['Form 4'],'Custom':['Custom Printer']};
// Data-only definitions are reviewed in Git; import flags never modify this allowlist.
const definitions=import.meta.glob<unknown>('./profile-library/**/*.json',{eager:true,import:'default'});
function freeze<T>(value:T):T{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
export const reviewedProfiles:Profile[]=freeze(Object.values(definitions).map(value=>profileSchema.parse(value)));
// Preserve the accepted initial profile until an owner explicitly selects an update.
export const bundled:Profile[]=reviewedProfiles.filter(p=>p.id==='flashforge-creator-5'&&p.version==='1.0.0');
export const profileIdentity=(p:Profile)=>p.profileId||p.id;
export const profileArchiveId=(id:string,version:string)=>`version:${encodeURIComponent(id)}:${encodeURIComponent(version)}`;
export function compareVersions(a:string,b:string){
 const parse=(value:string)=>{const match=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(value);
  if(!match||match.slice(1,4).some(n=>!Number.isSafeInteger(Number(n)))||match[4]?.split('.').some(v=>/^\d+$/.test(v)&&v.length>1&&v.startsWith('0')))throw Error('Profile installation requires a semantic version (major.minor.patch).');return {core:match.slice(1,4).map(Number),pre:match[4]?.split('.')};};
 const left=parse(a),right=parse(b);
 for(let i=0;i<3;i++)if(left.core[i]!==right.core[i])return Math.sign(left.core[i]-right.core[i]);
 if(!left.pre||!right.pre)return left.pre?-1:right.pre?1:0;
 for(let i=0;i<Math.max(left.pre.length,right.pre.length);i++){const x=left.pre[i],y=right.pre[i];if(x===y)continue;if(x===undefined)return -1;if(y===undefined)return 1;const nx=/^\d+$/.test(x),ny=/^\d+$/.test(y);if(nx&&ny)return x.length!==y.length?Math.sign(x.length-y.length):x<y?-1:1;if(nx!==ny)return nx?-1:1;return x<y?-1:1;}return 0;
}
export const latestProfiles:Profile[]=[...reviewedProfiles.reduce((map,p)=>{const old=map.get(p.id);if(!old||compareVersions(p.version,old.version)>0)map.set(p.id,p);return map;},new Map<string,Profile>()).values()];
export const defaultProfiles=[...bundled,...latestProfiles.filter(p=>!bundled.some(b=>b.id===p.id))];
for(const profile of latestProfiles){const models=catalog[profile.manufacturer]||[];catalog[profile.manufacturer]=[...new Set([...models,profile.model])];if(!manufacturers.includes(profile.manufacturer))manufacturers.push(profile.manufacturer);}
export function selectTemplate(template:Profile['templates'][number],selectionId=''){
 if(!selectionId)return {...template};
 const option=template.intervalOptions?.find(o=>o.id===selectionId);if(!option)throw Error('Choose a documented usage band.');
 return {...template,interval:{...option.interval},originalInterval:{...option.interval},selectionId};
}
const evidenceFields=['title','description','category','priority','interval','originalInterval','sourceUrl','sourceTitle','verified','materials','safety','profileVersion','scheduleKind','intervalOptions','selectionId','legacyTitles'] as const;
export function isVerifiedTask(t:Pick<Task,typeof evidenceFields[number]|'source'|'profileId'|'templateId'|'recommendation'>,p:Pick<Printer,'manufacturer'|'model'|'technology'>){
 return !t.recommendation&&t.source==='Manufacturer Verified'&&reviewedProfiles.some(b=>b.manufacturer===p.manufacturer&&b.model===p.model&&b.technology===p.technology&&b.version===t.profileVersion&&(!t.profileId||t.profileId===b.id)&&b.templates.some(template=>{
  if(t.templateId&&t.templateId!==(template.templateId||template.title))return false;
  if(t.selectionId&&!template.intervalOptions?.some(o=>o.id===t.selectionId))return false;
  const expected=selectTemplate(template,t.selectionId);return evidenceFields.every(k=>sameRecord(t[k],expected[k]));
 }));
}
export function automaticTemplate(t:Profile['templates'][number],p:Pick<Printer,'manufacturer'|'model'|'technology'>){
 return isVerifiedTask(t,p)&&(!t.scheduleKind||t.scheduleKind==='recurring'||(t.scheduleKind==='usage-dependent'&&!!t.selectionId));
}
export function reviewTask(t:Task,p:Printer):Task{return t.source==='Manufacturer Verified'&&!isVerifiedTask(t,p)?{...t,source:'Pending Verification'}:t;}
export function reviewProfile(value:unknown):Profile{return assessProfile(profileSchema.parse(value));}
export function assessProfile(p:Profile):Profile{
 const normalized={...p,id:profileIdentity(p),profileId:undefined};
 const official=reviewedProfiles.find(b=>sameRecord(b,normalized));
 const templates=p.templates.map(t=>t.source==='Manufacturer Verified'&&(!official||!isVerifiedTask(t,p))?{...t,source:'Pending Verification' as const}:t);
 const references=p.references?.map(r=>!official&&r.status==='Verified Reference'?{...r,status:'Pending Verification' as const}:r);
 return {...p,templates,...(references?{references}:{}),status:official&&templates.length>0&&templates.every(t=>t.source==='Manufacturer Verified')?'Manufacturer Verified':'Pending Verification'};
}
export function findProfile(manufacturer:string,model:string,installed:Profile[]=[],applied?:{profileId:string;profileVersion:string}){
 const match=[...installed,...(applied?reviewedProfiles:defaultProfiles)].find(p=>p.manufacturer===manufacturer&&p.model===model&&(applied?(profileIdentity(p)===applied.profileId&&p.version===applied.profileVersion):!p.profileId));
 return match?assessProfile(match):undefined;
}
