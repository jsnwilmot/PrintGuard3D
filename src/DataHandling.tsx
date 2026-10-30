import {useState} from 'react';
import {Modal} from './Modal';

export const dataHandlingRevision='1.0 · 2026-10-30';
export const backupPrivacySummary='Full backups contain user-entered notes, photographs and saved decisions. Files are not encrypted by PrintGuard. Protect your copies and test restoration in a separate browser profile. Reports are not full recovery backups.';

/** Bundled source facts, not an adopted final privacy policy or a new consent gate. */
export function DataHandlingDetails(){
 return <div className="data-handling-info">
  <p>Information revision {dataHandlingRevision}. This describes the reviewed application. It is not a final privacy policy or a change to the safety disclaimer.</p>
  <h3>Workshop records stay in browser storage</h3>
  <p>The application saves printer details, usage, maintenance, repairs, inventory, photographs, preferences, source decisions and captured overdue observations in IndexedDB in this browser profile. It has no workshop upload or automatic synchronization feature. It has no app account or analytics integration in the reviewed source.</p>
  <p>Records have no automatic age-based expiry. Clearing site data, browser eviction, private browsing limits or device loss can remove them. Changing devices, browsers, profiles or site addresses does not transfer them automatically. The disclaimer acknowledgment is a local disclosure gate, not a password or encryption.</p>
  <h3>Keep a protected recovery copy</h3>
  <p>{backupPrivacySummary}</p>
  <p>Download a current full backup before an import or upgrade and regularly afterward. Browser persistence is not a backup or recovery guarantee. Without a usable backup, lost records may be unrecoverable. New optional backup fields may be rejected by older app versions; never strip fields to force restoration.</p>
  <p>Deleting a printer removes its core records but retains captured overdue observations. Replacement imports also retain and merge observations. Clearing this site's browser storage removes local records and cached assets; it does not erase downloaded files, email or other copies. There is no single in-app erase-all-copies action.</p>
  <h3>Files, notifications and printing</h3>
  <p>Selected JSON files and photographs are processed locally by the application. Downloads go to your chosen browser destination. Print/PDF, calendar imports, shared folders and device backups may create additional copies managed by your browser, operating system or chosen services.</p>
  <p>Browser notifications are optional and require permission. Their titles and bodies may expose printer names and maintenance details on your device. Disable them in Settings or browser permissions. Closed-app delivery is not guaranteed.</p>
  <h3>Connections and external services</h3>
  <p>Loading the app downloads its files from the host. The service worker caches bundled files for offline use and may request the site again on navigation or updates. Cached offline use is not a promise of no network activity.</p>
  <p>Manufacturer links open external websites and require internet. Those services handle their own requests. Feedback and printer requests open your email application with the text you choose; nothing is sent automatically. Review the draft before sending and avoid unnecessary personal information or workshop backups.</p>
  <h3>Hosting facts still need verification</h3>
  <p>The reviewed app source does not establish the live host's access logs, cookies, access system, processors, retention or processing countries. Hosting services may process request information such as IP addresses and browser details. No claim of zero logs, zero cookies, Canadian-only processing or no third-party transfers is made.</p>
  <p>For questions about data handling, <a className="text-link" href="mailto:design@roseandpaw.ca?subject=PrintGuard%203D%20-%20Data%20Handling%20Question">open a data handling email draft</a> to design@roseandpaw.ca. The mailbox operator, hosting practices and formal request process require owner confirmation before a final privacy policy is adopted. Email uses your chosen mail provider; this app cannot retrieve lost local records or promise deletion of provider-held information.</p>
 </div>;
}

export function DataHandlingDialog({onClose}:{onClose:()=>void}){
 return <Modal title="Data handling information" subtitle="Application facts and deployment uncertainties" onClose={onClose} wide><DataHandlingDetails/></Modal>;
}

export function DataHandlingButton({label='Data handling information',className}:{label?:string;className?:string}){
 const[open,setOpen]=useState(false);
 return <><button type="button" className={className} onClick={()=>setOpen(true)}>{label}</button>{open&&<DataHandlingDialog onClose={()=>setOpen(false)}/>}</>;
}
