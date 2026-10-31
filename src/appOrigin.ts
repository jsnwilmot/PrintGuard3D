export const canonicalOrigin='https://printguard3d.roseandpaw.ca';
export function allowedOrigin(url:string){const u=new URL(url);return u.origin===canonicalOrigin||(['127.0.0.1','localhost','[::1]'].includes(u.hostname)&&['http:','https:'].includes(u.protocol));}
