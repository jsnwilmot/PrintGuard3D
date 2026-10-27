import {type Task,type Printer,type Log,today} from './domain';
import {due,status,occurrences,localDate} from './engine';

// Presentation selectors never update rules, readings or historical records.
export function validCalendarDate(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value.startsWith('0000-'))return false;
 const parsed=new Date(value+'T12:00:00');
 return Number.isFinite(+parsed)&&localDate(parsed)===value;
}
export function usageDue(task:Task,printer:Printer,now=today()){
 if(!task.enabled||printer.archived||task.postponedUntil>now)return false;
 const threshold=due(task);
 return (threshold.hours!==null&&printer.hours>=threshold.hours)
  ||(threshold.prints!==null&&printer.prints>=threshold.prints);
}
export function upcomingTask(task:Task,printer:Printer,start:string,end:string,now=today()){
 if(!task.enabled||printer.archived||!validCalendarDate(start)||!validCalendarDate(end)||start>end)return false;
 const date=task.postponedUntil||due(task).date;
 return !!date&&date>=now&&date>=start&&date<=end&&status(task,printer,now)!=='Overdue'
  &&!(date>now&&usageDue(task,printer,now));
}
export function upcomingOccurrences(task:Task,printer:Printer,start:string,end:string,now=today()){
 if(!task.enabled||printer.archived||!validCalendarDate(start)||!validCalendarDate(end)||start>end)return [];
 const lower=start>now?start:now;
 if(lower>end)return [];
 return calendarOccurrences(task,lower,end).filter(event=>event.projected
  ||(status(task,printer,now)!=='Overdue'&&!(event.date>now&&usageDue(task,printer,now))));
}
export function calendarOccurrences(task:Task,start:string,end:string){
 // A user's explicit postponement is a real date, not a forecast from usage.
 if(task.enabled&&task.postponedUntil&&!due(task).date){
  const date=task.postponedUntil;
  return date>=start&&date<=end?[{task,date,projected:false,key:task.id+date}]:[];
 }
 return occurrences(task,start,end);
}
export function historyMatches(log:Log,filters:{printer:string;category:string;priority:string;state:string}){
 return log.outcome==='Completed'&&(!filters.printer||log.printerId===filters.printer)
  &&(!filters.category||!log.category||log.category===filters.category)
  &&(!filters.priority||!log.priority||log.priority===filters.priority)
  &&(!filters.state||filters.state==='Completed');
}
