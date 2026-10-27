import {type Profile,type Task} from './domain';
import {sameRecord} from './comparison';

export interface ProfileChange {path:string;before:unknown;after:unknown;}
function fields(before:unknown,after:unknown,path:string):ProfileChange[]{
 if(sameRecord(before,after))return [];
 if(Array.isArray(before)&&Array.isArray(after)&&[...before,...after].every(v=>v&&typeof v==='object'&&(v.id||v.templateId||v.title))){
  const key=(value:Record<string,unknown>,other:Record<string,unknown>[])=>String(value.id||value.templateId||other.find(v=>v.title===value.title||(Array.isArray(v.legacyTitles)&&v.legacyTitles.includes(value.title)))?.templateId||value.title);
  const left=new Map(before.map(v=>[key(v,after),v])),right=new Map(after.map(v=>[key(v,before),v]));
  if(left.size===before.length&&right.size===after.length){
   const order=sameRecord([...left.keys()],[...right.keys()])?[]:[{path:path+'.$order',before:[...left.keys()],after:[...right.keys()]}];
   return [...order,...[...new Set([...left.keys(),...right.keys()])].sort().flatMap(id=>fields(left.get(id),right.get(id),`${path}[${id}]`))];
  }
 }
 if(before&&after&&typeof before==='object'&&typeof after==='object'&&!Array.isArray(before)&&!Array.isArray(after)){
  const a=before as Record<string,unknown>,b=after as Record<string,unknown>;
  return [...new Set([...Object.keys(a),...Object.keys(b)])].sort().flatMap(key=>fields(a[key],b[key],path?path+'.'+key:key));
 }
 return [{path,before,after}];
}
export function profileChanges(before:Profile|undefined,after:Profile){
 // Every field is compared, including array order, additions/removals and applicability.
 return fields(before,after,'');
}
export function matchingTask(template:Profile['templates'][number],tasks:Task[],profileId:string){
 const identity=template.templateId||template.title;
 if(tasks.some(t=>t.templateId===identity&&t.profileId&&t.profileId!==profileId))throw Error(`Conflicting profile identity for ${identity}. Review the mapping before applying.`);
 const stable=tasks.filter(t=>t.templateId===identity);
 const legacy=tasks.filter(t=>!t.templateId&&(t.title===template.title||template.legacyTitles?.includes(t.title))
  &&(!t.profileId||t.profileId===profileId));
 const matches=[...stable,...legacy];
 if(matches.length>1)throw Error(`Ambiguous legacy/stable identity for ${identity}. Resolve the mapping explicitly; no rules were changed.`);
 return matches[0];
}
