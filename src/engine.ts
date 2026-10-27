import { type Task,type Printer,type Log,today } from './domain';
export function addInterval(date:string,days=0,months=0,cycles=1){
 const d=new Date(date+'T12:00:00');
 if(months){const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+months*cycles);const end=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,end));}
 d.setDate(d.getDate()+days*cycles);return localDate(d);
}
export function localDate(d:Date){return `${String(d.getFullYear()).padStart(4,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export const dayDiff=(a:string,b:string)=>Math.round((Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/86400000);
export function due(t:Task){const i=t.interval;return {date:i.mode==='once'?t.anchorDate:((i.mode==='calendar'||i.mode==='combined')?addInterval(t.anchorDate,i.days,i.months,(t.cycleOffset||0)+1):''),hours:(i.mode==='hours'||i.mode==='combined')?t.anchorHours+(i.hours||0):null,prints:i.mode==='prints'?t.anchorPrints+(i.prints||0):i.mode==='afterPrint'?t.anchorPrints+1:null};}
export type Status='Overdue'|'Due Today'|'Due Soon'|'Upcoming'|'Postponed'|'Not Yet Due'|'Completed'|'Paused';
export function status(t:Task,p:Printer,now=today(),reminder=7):Status{
 if(p.archived)return 'Paused';if(!t.enabled)return t.interval.mode==='once'?'Completed':'Paused';
 if(t.postponedUntil && t.postponedUntil>now)return 'Postponed';
 const d=due(t);const date=t.postponedUntil||d.date;
 if((date&&date<now)||(d.hours!==null&&p.hours>d.hours)||(d.prints!==null&&p.prints>d.prints))return 'Overdue';
 if((date&&date===now)||(d.hours!==null&&p.hours===d.hours)||(d.prints!==null&&p.prints===d.prints)||(t.interval.mode==='condition'&&t.condition))return 'Due Today';
 if(date&&dayDiff(date,now)<=reminder)return 'Due Soon';
 return date?'Upcoming':'Not Yet Due';
}
export interface Occurrence {task:Task;date:string;projected:boolean;key:string;}
export function occurrences(t:Task,start:string,end:string):Occurrence[]{
 if(!t.enabled)return [];const d=due(t).date;if(!d)return [];const first=t.postponedUntil||d;
 if(t.interval.mode==='once')return first>=start&&first<=end?[{task:t,date:first,projected:false,key:t.id+first}]:[];
 const i=t.interval;const offset=t.cycleOffset||0;const at=(n:number)=>addInterval(t.anchorDate,i.days,i.months,n+offset+1);
 // Jump directly to a distant visible range. Recurrence is bounded by the viewport, never by a final year.
 const lower=start>first?start:addInterval(first,1);
 let n=i.months?Math.max(1,Math.floor(((Number(lower.slice(0,4))-Number(t.anchorDate.slice(0,4)))*12+Number(lower.slice(5,7))-Number(t.anchorDate.slice(5,7)))/i.months)-offset-2):Math.max(1,Math.floor(dayDiff(lower,t.anchorDate)/(i.days||1))-offset-2);
 while(at(n)<lower)n++;
 const result:Occurrence[]=first>=start&&first<=end?[{task:t,date:first,projected:false,key:t.id+first}]:[];let date=at(n);
 while(date<=end){result.push({task:t,date,projected:n>0,key:t.id+date});n++;date=at(n);}
 return result;
}
export function advance(t:Task,date:string,hours:number,prints:number):{task:Task;skippedCycles:number}{
 const next={...t,postponedUntil:'',condition:false,anchorHours:hours,anchorPrints:prints,anchorDate:date,cycleOffset:0};let skippedCycles=0;
 if(t.interval.mode==='once')next.enabled=false;
 if(t.base==='scheduled'&&(t.interval.mode==='calendar'||t.interval.mode==='combined')){
  const i=t.interval;let n=i.months?Math.max(1,Math.floor(((+date.slice(0,4)-+t.anchorDate.slice(0,4))*12+ +date.slice(5,7)- +t.anchorDate.slice(5,7))/i.months)):Math.max(1,Math.floor(dayDiff(date,t.anchorDate)/(i.days||1)));
  while(addInterval(t.anchorDate,i.days,i.months,n+1)<=date)n++;
  while(n>1&&addInterval(t.anchorDate,i.days,i.months,n)>date)n--;
  n=Math.max(n,(t.cycleOffset||0)+1);
  // Preserve the original day-of-month for month-end and leap-year recurrences.
  next.anchorDate=t.anchorDate;
  next.cycleOffset=n;skippedCycles=Math.max(0,n-(t.cycleOffset||0)-1);
 }
 return {task:next,skippedCycles};
}
export function compliance(logs:Log[]){const completed=logs.filter(l=>l.outcome==='Completed');const eligible=logs.filter(l=>l.outcome!=='Postponed');return eligible.length?Math.round(100*completed.filter(l=>l.onTime).length/eligible.length):null;}
export function rebaseTaskEdit(value:Task,old?:Task):Task{
 const next={...value,originalInterval:old?.originalInterval??value.interval};
 if(old&&(JSON.stringify(old.interval)!==JSON.stringify(value.interval)||old.base!==value.base||old.anchorDate!==value.anchorDate)){
  if(old.base==='scheduled'&&old.anchorDate===value.anchorDate&&(old.cycleOffset||0)>0)next.anchorDate=addInterval(old.anchorDate,old.interval.days,old.interval.months,old.cycleOffset||0);
  next.cycleOffset=0;
 }
 return next;
}
