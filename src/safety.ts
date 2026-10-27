import {disclaimerVersion,shortDisclaimer} from './legal';
import type {Preferences} from './domain';
import {csv} from './db';
import {addInterval} from './engine';

export const exportSafety=shortDisclaimer+' Not affiliated with or endorsed by printer manufacturers.';
export const hasAcknowledgment=(prefs:Preferences)=>prefs.acknowledgment?.version===disclaimerVersion&&!!prefs.acknowledgment.date;
export function reportCSV(headers:string[],rows:(string|number)[][]){
 // Include the notice even in a header-only empty export; never invent a task row.
 return csv([[...headers,'Safety notice: '+exportSafety],...rows.map(row=>[...row,exportSafety])]);
}
const escapeICS=(value:string)=>value.replaceAll('\\','\\\\').replaceAll('\r\n','\n').replaceAll('\r','\n').replaceAll('\n','\\n').replaceAll(';','\\;').replaceAll(',','\\,');
export function scheduleICS(events:{id:string;date:string;title:string;description:string}[],stamp:string){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Rose and Paw//PrintGuard3D//EN','CALSCALE:GREGORIAN','X-WR-CALDESC:'+escapeICS(exportSafety)];
 for(const e of events)lines.push('BEGIN:VEVENT','UID:'+escapeICS(e.id+'@printguard3d'),'DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+e.date.replaceAll('-',''),'DTEND;VALUE=DATE:'+addInterval(e.date,1).replaceAll('-',''),'SUMMARY:'+escapeICS(e.title),'DESCRIPTION:'+escapeICS(e.description+'\n'+exportSafety),'END:VEVENT');
 lines.push('END:VCALENDAR');
 // RFC 5545 content lines are folded at 75 UTF-8 octets, never inside a character.
 return lines.map(line=>{let out='',part='';for(const char of line){if(new TextEncoder().encode(part+char).length>75){out+=part+'\r\n';part=' ';}part+=char;}return out+part;}).join('\r\n')+'\r\n';
}
