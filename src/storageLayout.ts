import type Dexie from 'dexie';

/** Per-instance guard: never let Dexie's automatic patch mutate a future DB. */
export function guardedFactory(factory:IDBFactory|undefined):IDBFactory|undefined{
 if(!factory)return undefined;
 return new Proxy(factory,{get(target,key){
  if(key==='open')return (name:string,version?:number)=>{
   const request=version===undefined?target.open(name):target.open(name,version);
   request.addEventListener('upgradeneeded',event=>{
    const allowed=event.newVersion===20&&(event.oldVersion===0||event.oldVersion===10);
    if(!allowed)request.transaction!.abort();
   });
   return request;
  };
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }});
}

export function supportedLayout(db:Dexie,native:IDBDatabase,allowLegacy=false){
 const legacy=allowLegacy&&native.version===10;
 if(native.version!==20&&!legacy)return false;
 const expected=db.tables.filter(t=>!legacy||!['observations','writerControl'].includes(t.name)),names=[...native.objectStoreNames].sort();
 if(JSON.stringify(names)!==JSON.stringify(expected.map(t=>t.name).sort()))return false;
 const tx=native.transaction(names,'readonly');
 return expected.every(table=>{
  const store=tx.objectStore(table.name);
  if(JSON.stringify(store.keyPath)!==JSON.stringify(table.schema.primKey.keyPath)||store.autoIncrement)return false;
  if(legacy)return true;
  const indexes=table.schema.indexes;
  if(JSON.stringify([...store.indexNames].sort())!==JSON.stringify(indexes.map(i=>i.name).sort()))return false;
  return indexes.every(index=>{const actual=store.index(index.name);return JSON.stringify(actual.keyPath)===JSON.stringify(index.keyPath)&&actual.unique===!!index.unique&&actual.multiEntry===!!index.multi;});
 });
}
