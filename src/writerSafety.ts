import Dexie, {type DBCore, type DBCoreTransaction} from 'dexie';
import {z} from 'zod';

export const writerControlKey='__printguard_writer_control_v1__';
export const writerStore='writerControl';
const controlSchema=z.object({id:z.literal(writerControlKey),protocol:z.literal(1),generation:z.number().int().positive(),capabilities:z.array(z.string()).max(30)}).strict();
export type WriterControl=z.infer<typeof controlSchema>;
export const writerContract:WriterControl=Object.freeze({id:writerControlKey,protocol:1,generation:typeof __PRINTGUARD_GENERATION__==='undefined'?1:__PRINTGUARD_GENERATION__,capabilities:['backup:1','observations:1','profiles:1','recommendations:1']});
Object.freeze(writerContract.capabilities);
export const buildIdentity=typeof __PRINTGUARD_BUILD__==='undefined'?'source-test':__PRINTGUARD_BUILD__;
export type WriterStatus={writable:boolean;upgrade:boolean;message:string;control?:WriterControl};
const refusal='This application cannot safely write this workshop. Keep this tab read-only, download a full backup, and open a compatible reviewed version. Do not clear site data or downgrade in place.';
export function mixedBuild(){const html=typeof document==='undefined'?null:document.querySelector('meta[name="printguard-build"]')?.getAttribute('content');return typeof document!=='undefined'&&buildIdentity!=='source-test'?html!==buildIdentity:!!html&&html!==buildIdentity;}
function equal(a:WriterControl,b:WriterControl){return a.protocol===b.protocol&&a.generation===b.generation&&JSON.stringify(a.capabilities)===JSON.stringify(b.capabilities);}
export function assessWriter(value:unknown):WriterStatus{
 if(mixedBuild())return {writable:false,upgrade:false,message:'Mixed application assets detected. '+refusal};
 const parsed=controlSchema.safeParse(value);if(!parsed.success)return {writable:false,upgrade:false,message:'Missing or unknown writer requirements. '+refusal};
 const control=parsed.data,capable=JSON.stringify(control.capabilities)===JSON.stringify(writerContract.capabilities);
 if(equal(control,writerContract))return {writable:true,upgrade:false,message:'Compatible workshop writer.',control};
 return {writable:false,upgrade:capable&&control.generation<writerContract.generation,message:'Workshop writer generation differs. '+refusal,control};
}
export async function readWriterStatus(db:Dexie):Promise<WriterStatus>{
 await db.open();
 if(!db.backendDB().objectStoreNames.contains(writerStore))return {writable:false,upgrade:false,message:'Unsupported pre-public database layout. '+refusal};
 const control=await db.table(writerStore).get(writerControlKey);
 return assessWriter(control);
}
function abort(trans:DBCoreTransaction){try{trans.abort();}catch{/* Already aborted: preserve the original refusal. */}}
function fail(trans:DBCoreTransaction,message:string):never{abort(trans);throw Error(message);}

/** The persistent comparison and every mutation share a native transaction. */
export function installWriterFence(db:Dexie){
 db.use({stack:'dbcore',name:'printguard-writer-fence',level:0,create(core:DBCore){
  const control=core.schema.tables.some(t=>t.name===writerStore)?core.table(writerStore):null;
  const checked=new WeakMap<DBCoreTransaction,Promise<void>>();
  const check=(trans:DBCoreTransaction)=>{
   if((trans as IDBTransaction).db.version!==20)return Dexie.Promise.reject(Error('Unsupported native database version. '+refusal));
   if(mixedBuild())return Dexie.Promise.reject(Error('Mixed application assets detected. '+refusal));
   const prior=checked.get(trans);if(prior)return prior;
   if(!control)return Dexie.Promise.reject(Error('Unsupported pre-public database layout. '+refusal));
   const approval=control.get({trans,key:writerControlKey}).then(value=>{
   const status=assessWriter(value);if(!status.writable)fail(trans,status.message);
   });checked.set(trans,approval);return approval;
  };
  return {...core,transaction(stores,mode,options){
   return core.transaction(mode==='readwrite'&&control?[...new Set([...stores,writerStore])]:stores,mode,options);
  },table(name){const table=core.table(name);return {...table,mutate(req){return check(req.trans).then(async()=>{
   if(name===writerStore){
    if(req.type==='deleteRange'){
     return {numFailures:0,failures:{},lastResult:undefined};
    }
    fail(req.trans,'Operational writer requirements cannot be edited or removed by workshop operations.');
   }
   return table.mutate(req);
  }).catch(error=>{abort(req.trans);throw error;});}};}};
 }});
}

/** Explicit, monotonic control-only activation; never imported from a backup. */
export async function activateWriter(db:Dexie,expected:WriterControl){
 const status=assessWriter(expected);if(!status.upgrade||mixedBuild())throw Error(refusal);
 await db.open();
 return new Promise<void>((resolve,reject)=>{
  const tx=db.backendDB().transaction(writerStore,'readwrite'),store=tx.objectStore(writerStore);
  let reason='Writer requirements changed. Review the update again.';
  const request=store.get(writerControlKey);
  request.onsuccess=()=>{const parsed=controlSchema.safeParse(request.result);if(!parsed.success||!equal(parsed.data,expected)||!assessWriter(parsed.data).upgrade){tx.abort();return;}store.put(writerContract);};
  tx.oncomplete=()=>resolve();tx.onabort=()=>reject(Error(reason));tx.onerror=()=>{reason=tx.error?.message||reason;};
 });
}
