"""Collect reviewed synthetic QA summaries; requires pypdf and pdfplumber for PDF inspection.

Run from repository root after the unchanged/native Phase 5 suites. Raw artifacts remain ignored.
This script never opens a browser, accesses production, changes records or infers manual passes.
"""
import base64
import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

import pdfplumber
from pypdf import PdfReader

ROOT = Path('remediation-phase5')


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write_csv(name, rows):
    with (ROOT / name).open('w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def cases(node, project=''):
    if isinstance(node, dict):
        project = node.get('projectName') or project
        for result in node.get('results', []):
            yield project, result
        for key, child in node.items():
            if key != 'results':
                yield from cases(child, project)
    elif isinstance(node, list):
        for child in node:
            yield from cases(child, project)


def attached_json(result):
    for attachment in result.get('attachments', []):
        if attachment.get('contentType') == 'application/json' and attachment.get('body'):
            yield attachment['name'], json.loads(base64.b64decode(attachment['body']))


phase5 = read('test-results/phase5-native.json')
baseline = read('test-results/native-results.json')
standard = read('.verification-local/phase5-standard.json')
acceptance = read('.verification-local/phase5-acceptance.json')
incomplete, backups, print_cases, browser_versions = [], [], [], {}
for source, report in [('phase5', phase5), ('baseline-phase5', baseline)]:
    for engine, result in cases(report):
        for name, data in attached_json(result):
            if name == 'engine-version':
                browser_versions[engine] = data['browser']
            if name == 'large-backup-metrics':
                backups.append({
                    'engine': engine, 'browser': data['browser'], 'bytes': data['bytes'],
                    'restoreMs': data['restoreMs'], 'exportMs': data['exportMs'],
                    'storeCounts': json.dumps(data['counts'], sort_keys=True),
                    'storageUsage': data.get('storage', {}).get('usage'),
                    'storageQuota': data.get('storage', {}).get('quota'),
                    'reportedUsedJSHeap': (data.get('heap') or {}).get('used'),
                    'reportedJSHeapLimit': (data.get('heap') or {}).get('limit'),
                    'measurementLimit': 'Desktop sample, not peak RSS or physical quota exhaustion',
                })
            if name == 'print-layout-metrics':
                trace = next(a['path'] for a in result['attachments'] if a['name'] == 'trace')
                print_cases.append((Path(trace).parent, data))
            scans = data if name == 'axe-and-incomplete' else [data] if isinstance(data, dict) and 'incomplete' in data and 'violations' in data else []
            for scan in scans:
                for rule in scan.get('incomplete', []):
                    for node in rule['nodes']:
                        incomplete.append({
                            'source': source, 'engine': engine,
                            'scan': name + ' ' + scan.get('theme', '') + ' ' + scan.get('route', ''),
                            'rule': rule['id'], 'target': json.dumps(node['target']),
                            'checks': json.dumps([c.get('data') for c in node.get('any', [])]),
                        })

final_print = read('test-results/phase5-print-final.json') if Path('test-results/phase5-print-final.json').exists() else None
if final_print:
    print_cases = []
    for engine, result in cases(final_print):
        for name, data in attached_json(result):
            if name == 'print-layout-metrics':
                trace = next(a['path'] for a in result['attachments'] if a['name'] == 'trace')
                print_cases.append((Path(trace).parent, data))

pdf_rows = []
for folder, data in print_cases:
    for scale in [1, 0.9]:
        path = folder / ('schedule.pdf' if scale == 1 else 'schedule-scale90.pdf')
        reader = PdfReader(path)
        problems, text_parts, min_font, embedded = [], [], 100, False
        for page_number, page in enumerate(reader.pages, 1):
            for obj in page.get('/Resources', {}).get('/XObject', {}).values():
                image = obj.get_object()
                if image.get('/Width') == 900 and image.get('/Height') == 600:
                    embedded = True
        with pdfplumber.open(path) as pdf:
            for index, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ''
                text_parts.append(text)
                body_lines = [line for line in text.splitlines() if 'syntheticverification' not in re.sub(r'\s+', '', line)]
                if len(text.strip()) < 70 or len(body_lines) <= 2:
                    problems.append(f'Near-blank or orphan-contact page {index}')
                for char in page.chars:
                    if char['x0'] < -1 or char['x1'] > page.width + 1 or char['top'] < -1 or char['bottom'] > page.height + 1:
                        problems.append(f'Off-page glyph on {index}')
                    # Footer supplied by the test browser is deliberately smaller than body copy.
                    if char['top'] < page.height - 35 and char['text'].strip():
                        min_font = min(min_font, char['size'])
                tail = text.splitlines()[-3:]
                if any(re.match(r'^.*Synthetic print procedure p\d+-\d+\s*$', line) for line in tail):
                    problems.append(f'Possible orphan task heading on {index}')
        compact = re.sub(r'\s+', '', '\n'.join(text_parts))
        for printer in range(1, data['count'] + 1):
            for task in range(3 if data['count'] == 12 else 1):
                if f'ENDDESCRIPTIONp{printer}-{task}' not in compact:
                    problems.append(f'Missing description end p{printer}-{task}')
        if 'atyourownrisk' not in compact:
            problems.append('Missing safety warning')
        if not embedded:
            problems.append('Missing 900x600 user image')
        width, height = float(reader.pages[0].mediabox.width), float(reader.pages[0].mediabox.height)
        expected = (595.28, 841.89) if data['format'] == 'A4' else (612, 792)
        if abs(width - expected[0]) > 2 or abs(height - expected[1]) > 2:
            problems.append('Unexpected paper geometry')
        pdf_rows.append({
            'paper': data['format'], 'theme': data['theme'], 'printers': data['count'],
            'tasks': data['taskCount'], 'scale': scale, 'pages': len(reader.pages),
            'widthPt': round(width, 2), 'heightPt': round(height, 2),
            'minNonFooterFontPt': round(min_font, 2), 'embeddedUserImage': embedded,
            'allDescriptionEnds': not any('description' in p for p in problems),
            'result': 'FAIL' if problems else 'PASS', 'issues': '; '.join(sorted(set(problems))),
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'artifact': str(path.relative_to(Path.cwd()) if path.is_absolute() else path).replace('\\', '/'),
        })

write_csv('axe-incomplete-current.csv', incomplete)
write_csv('backup-measurements.csv', backups)
write_csv('print-qa.csv', pdf_rows)
summary = {
    'date': '2026-10-28', 'base': '616e26ee5c0834a3d0900294981bcf8963d2c053',
    'standard': {key: standard[key] for key in ['numTotalTests', 'numPassedTests', 'numFailedTests', 'numPendingTests']},
    'acceptance': {key: acceptance[key] for key in ['numTotalTests', 'numPassedTests', 'numFailedTests', 'numPendingTests']},
    'nativeBaseline': baseline['stats'], 'phase5Native': phase5['stats'],
    'browserVersions': browser_versions, 'finalPrintNative': final_print['stats'] if final_print else None, 'pdfs': len(pdf_rows),
    'pdfResults': dict(Counter(row['result'] for row in pdf_rows)),
    'incompleteNodesBySource': dict(Counter(row['source'] for row in incomplete)),
    'manualAccessibility': 'NOT VERIFIED', 'independentLegalReview': 'NOT VERIFIED',
    'productionHosting': 'NOT VERIFIED', 'release1': 'NOT APPROVED',
}
(ROOT / 'verification-results.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
print(json.dumps(summary, indent=2))
if any(row['result'] != 'PASS' for row in pdf_rows):
    raise SystemExit('PDF QA failures require inspection; none were reclassified.')
