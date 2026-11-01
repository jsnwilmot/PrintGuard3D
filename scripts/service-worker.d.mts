import type {ReleaseContract} from './release-contract.mjs';
export function serviceWorkerSource(options:{cache:string;assets:string[];hashes:Record<string,string>;identity:string;writer:ReleaseContract['writer'];canonicalOrigin:string;deployable:boolean}):string;
