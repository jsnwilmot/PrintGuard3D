// @vitest-environment jsdom
import React from 'react';
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
import {empty,seed,photo} from '../acceptance-review/fixtures';
import {db,makeBackup,validateBackup} from '../src/db';
import {DataHandlingDetails,DataHandlingButton,backupPrivacySummary,dataHandlingRevision} from '../src/DataHandling';
import {Help} from '../src/Help';
import {disclaimerVersion} from '../src/legal';

beforeEach(async()=>{await empty();});afterEach(cleanup);
it('PB-U01 public information opens without workshop context or acknowledgment writes and returns focus',async()=>{
 await seed();const before=await makeBackup();render(<DataHandlingButton/>);const trigger=screen.getByRole('button',{name:'Data handling information'});trigger.focus();fireEvent.click(trigger);
 const dialog=screen.getByRole('dialog');expect(within(dialog).getByText(/not a final privacy policy/)).toBeTruthy();expect(within(dialog).queryByRole('checkbox')).toBeNull();expect(dialog.textContent).not.toContain(before.printers[0].serial);
 fireEvent.click(within(dialog).getByRole('button',{name:'Close dialog'}));expect(document.activeElement).toBe(trigger);const after=await makeBackup();expect(after.preferences).toEqual(before.preferences);expect(after.printers).toEqual(before.printers);expect(after.logs).toEqual(before.logs);expect(disclaimerVersion).toBe('1.0');expect(dataHandlingRevision).toBe('1.0 · 2026-10-30');
});
it('PB-U02 source-scoped copy discloses hosting uncertainty and does not adopt placeholder policy promises',()=>{
 const {container}=render(<DataHandlingDetails/>);expect(screen.getByRole('heading',{name:'Hosting facts still need verification'})).toBeTruthy();
 for(const phrase of ['not establish the live host','No claim of zero logs','not a password or encryption','no automatic age-based expiry','not a backup or recovery guarantee','retains captured overdue observations'])expect(container.textContent).toContain(phrase);
 const link=screen.getByRole('link',{name:'open a data handling email draft'});expect(link.getAttribute('href')).toMatch(/^mailto:design@roseandpaw.ca/);expect(container.querySelector('form,input,script,iframe')).toBeNull();
});
it('PB-U03 public Help needs no workshop provider and preserves manufacturer independence alongside bundled information',()=>{
 const onLegal=vi.fn();render(<Help onLegal={onLegal}/>);expect(screen.getByRole('region',{name:'Data handling information'})).toBeTruthy();expect(screen.getAllByText(/Manufacturer and model names identify equipment only/)).toHaveLength(1);expect(screen.getByText(backupPrivacySummary)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Read safety & legal disclaimer'}));expect(onLegal).toHaveBeenCalledOnce();
});
it('PB-U04 full backup privacy warning matches actual plain exported notes/images and opening information leaves records intact',async()=>{
 await seed();await db.printers.update('p1',{notes:'Synthetic personal note for backup disclosure',image:photo});const before=await makeBackup();const text=JSON.stringify(before);expect(text).toContain('Synthetic personal note for backup disclosure');expect(text).toContain(photo);expect(validateBackup(JSON.parse(text)).printers).toEqual(before.printers);
 render(<DataHandlingDetails/>);expect(screen.getByText(backupPrivacySummary)).toBeTruthy();const after=await makeBackup();for(const key of ['printers','tasks','logs','profiles','preferences','overdueHistory'] as const)expect(after[key]).toEqual(before[key]);
});
