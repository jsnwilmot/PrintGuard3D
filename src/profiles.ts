import { type Profile, type Task, type Printer, profileSchema } from './domain';
const url='https://wiki.flashforge.com/en/creator-series/creator-5-series';
export const manufacturers=['FlashForge','Bambu Lab','Creality','Prusa','Anycubic','Elegoo','QIDI Tech','Sovol','Ultimaker','Raise3D','Snapmaker','Formlabs','Custom'];
export const catalog:Record<string,string[]>={'FlashForge':['Creator 5','Creator 5 Pro'],'Bambu Lab':['P1S','X1 Carbon','A1'],'Creality':['K1','Ender-3 V3'],'Prusa':['MK4S','CORE One'],'Anycubic':['Kobra 3','Photon Mono M7'],'Elegoo':['Neptune 4','Saturn 4 Ultra'],'QIDI Tech':['Plus4'],'Sovol':['SV08'],'Ultimaker':['S7'],'Raise3D':['Pro3'],'Snapmaker':['Artisan'],'Formlabs':['Form 4'],'Custom':['Custom Printer']};
export const bundled:Profile[]= [profileSchema.parse({id:'flashforge-creator-5',manufacturer:'FlashForge',model:'Creator 5',family:'Creator 5 series',technology:'FDM/FFF',image:'/printer.svg',imageSource:'PrintGuard 3D generic illustration',imageRights:'Original application asset; generic fallback, not a product photograph.',documentation:url,status:'Manufacturer Verified',version:'1.0.0',verified:'2026-10-26',revisions:['1.0.0: Verified positioning-ball and needle-roller maintenance at 500 operating hours. Other procedures require further verification.'],templates:[{title:'Service positioning balls & needle rollers',description:'Maintain the extruder mount positioning balls and extruder positioning plate needle rollers. Follow the model-specific manufacturer procedure.',category:'Lubrication',priority:'Normal',interval:{mode:'hours',hours:500},originalInterval:{mode:'hours',hours:500},base:'completion',source:'Manufacturer Verified',sourceUrl:url+'/maintenance/extruder-mount-positioning-balls',sourceTitle:'How to Maintain the Creator 5 Extruder Positioning Plate Needle Rollers and Extruder Mount Positioning Balls',verified:'2026-10-26',materials:'WD-40, lint-free cloth or wipes, and grease (as specified in the official procedure).',safety:'Read the complete official procedure before starting. The manufacturer instructs removal of the PEI plate before this procedure to prevent contamination.',minutes:0,notes:'500 hours is the documented interval. Initial tracking begins at your registration reading; adjust the task baseline if you have a previous service reading.',enabled:true,postponedUntil:'',condition:false,profileVersion:'1.0.0'}]})];
export const profileIdentity=(p:Profile)=>p.profileId||p.id;
export const profileArchiveId=(id:string,version:string)=>`version:${encodeURIComponent(id)}:${encodeURIComponent(version)}`;
// This allowlist is application-reviewed evidence, never a flag supplied by an import.
const evidenceFields=['title','description','category','priority','interval','originalInterval','sourceUrl','sourceTitle','verified','materials','safety','profileVersion'] as const;
export function isVerifiedTask(t:Pick<Task,typeof evidenceFields[number]|'source'|'profileId'|'templateId'>,p:Pick<Printer,'manufacturer'|'model'|'technology'>){
 return t.source==='Manufacturer Verified'&&bundled.some(b=>b.manufacturer===p.manufacturer&&b.model===p.model&&b.technology===p.technology&&b.version===t.profileVersion&&(!t.profileId||t.profileId===b.id)&&b.templates.some(template=>(!t.templateId||t.templateId===(template.templateId||template.title))&&evidenceFields.every(k=>JSON.stringify(t[k])===JSON.stringify(template[k]))));
}
export function reviewTask(t:Task,p:Printer):Task{return t.source==='Manufacturer Verified'&&!isVerifiedTask(t,p)?{...t,source:'Pending Verification'}:t;}
export function reviewProfile(value:unknown):Profile{
 return assessProfile(profileSchema.parse(value));
}
export function assessProfile(p:Profile):Profile{
 const official=bundled.find(b=>b.id===profileIdentity(p)&&b.version===p.version&&b.manufacturer===p.manufacturer&&b.model===p.model&&b.technology===p.technology&&b.family===p.family&&b.documentation===p.documentation&&b.verified===p.verified);
 const templates=p.templates.map(t=>t.source==='Manufacturer Verified'&&(!official||!isVerifiedTask(t,p))?{...t,source:'Pending Verification' as const}:t);
 return {...p,templates,status:official&&templates.length>0&&templates.every(t=>t.source==='Manufacturer Verified')?'Manufacturer Verified':'Pending Verification'};
}
export function findProfile(manufacturer:string,model:string,installed:Profile[]=[],applied?:{profileId:string;profileVersion:string}){
 const match=[...installed,...bundled].find(p=>p.manufacturer===manufacturer&&p.model===model&&(applied?(profileIdentity(p)===applied.profileId&&p.version===applied.profileVersion):!p.profileId));
 return match?assessProfile(match):undefined;
}
