import {createContext,useContext} from 'react';
import type {Observation} from './observations';
import type {Printer,Task,Log,Reading,Inventory,Repair,Profile,Preferences} from './domain';
export interface AppData{observations?:Observation[];observationWarning?:string;printers:Printer[];tasks:Task[];logs:Log[];readings:Reading[];inventory:Inventory[];repairs:Repair[];profiles:Profile[];prefs:Preferences;notify:(message:string)=>void;run:(work:()=>Promise<unknown>,message?:string)=>Promise<boolean>;}
export const DataContext=createContext<AppData>(null!);
export const useData=()=>useContext(DataContext);
