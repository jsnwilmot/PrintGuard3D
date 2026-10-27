export const sameRecord=(a:unknown,b:unknown):boolean=>{
 if(a===b)return true;
 if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
 const left=a as Record<string,unknown>,right=b as Record<string,unknown>;
 const keys=Object.keys(left).filter(k=>left[k]!==undefined).sort();
 return keys.join('\0')===Object.keys(right).filter(k=>right[k]!==undefined).sort().join('\0')&&keys.every(k=>sameRecord(left[k],right[k]));
};
