"""Package completed synthetic evidence without rerunning any browser case.

Usage: python release1-claim-causality/package.py
Requires the four retained causal-local-* runs. Refuses to overwrite a package.
"""
import collections
import datetime
import hashlib
import json
import pathlib
import re
import shutil
import statistics
import zipfile

BASE = pathlib.Path('.verification-local/claim-causality')
RUN = BASE / 'causal-local-4'
DEST = pathlib.Path('release1-claim-causality/evidence')
DEST.mkdir()


def read(path):
    return json.loads(path.read_text(encoding='utf8'))


def lines(path):
    return [json.loads(line) for line in path.read_text(encoding='utf8').splitlines() if line]


def write(name, value):
    (DEST / name).write_text(json.dumps(value, indent=2) + '\n', encoding='utf8', newline='\n')


def describe(values):
    values = sorted(values)
    return dict(samples=len(values), minimum=min(values), median=statistics.median(values),
                p95=values[int(.95 * (len(values) - 1))], maximum=max(values))


summary = read(RUN / 'SUMMARY.json')
rows = summary['rows']
assert len(rows) == 144
assert all(row['timingQualified'] for row in rows)
assert collections.Counter(row['status'] for row in rows) == {'PASS': 106, 'FAIL': 38}
assert all(row.get('historicalRowsPreserved') for row in rows)
assert all(row.get('offlineProof') for row in rows if row['status'] == 'PASS')
assert all(row['measurement']['document']['readyResolved'] for row in rows if row['status'] == 'FAIL')
assert all(not row['hashMismatches'] and row['puts'] >= 15 and row['marker'] >= 1 and row['nativeClaimEnds'] == 1 for row in rows)

for name in ['SOURCE.json', 'controls-HARNESS.json', 'matrix-HARNESS.json', 'BROWSER-BINARIES.json',
             'controls.json', 'matrix.json', 'SUMMARY.json']:
    shutil.copyfile(RUN / name, DEST / name)
for name in ['original.json', 'BASELINE-ENVIRONMENT.json', 'BASELINE-EXIT.json']:
    shutil.copyfile(BASE / 'causal-local-3' / name, DEST / name)
for number in range(1, 4):
    shutil.copyfile(BASE / f'causal-local-{number}' / 'controls.json', DEST / f'controls-attempt-{number}.json')

# Complete logs and delivered worker copies, including both control observer versions.
with zipfile.ZipFile(DEST / 'synthetic-logs.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for number in [3, 4]:
        run = BASE / f'causal-local-{number}'
        for folder in ['events', 'page-events', 'case-outcomes']:
            for path in sorted((run / folder).glob('*')):
                if path.is_file():
                    archive.write(path, f'causal-local-{number}/{folder}/{path.name}')
    archive.write(BASE / 'causal-local-3/baseline-resources.ndjson', 'causal-local-3/baseline-resources.ndjson')

# Preserve the untouched original red trace, plus every red matrix trace (all 38).
source = pathlib.Path(summary['source']['source'])
original_traces = list((source / 'test-results/reporting').rglob('trace.zip'))
assert len(original_traces) == 1
shutil.copyfile(original_traces[0], DEST / 'original-firefox-repeat3-trace.zip')
for engine in ['chromium', 'firefox', 'webkit']:
    with zipfile.ZipFile(DEST / f'{engine}-red-traces.zip', 'w', zipfile.ZIP_STORED) as archive:
        for row in rows:
            if row['engine'] != engine or row['status'] != 'FAIL':
                continue
            config = row['configuration']
            case = 'cases.mjs-' + '-'.join(str(config[key]) for key in ['clock', 'transport', 'navigation', 'count']) + '-' + engine
            folder = RUN / 'matrix-traces' / case
            assert (folder / 'trace.zip').exists()
            for path in sorted(folder.iterdir()):
                if path.is_file():
                    archive.write(path, row['id'] + '/' + path.name)

intervals, free, rss, clocks = [], [], [], collections.defaultdict(list)
for row in rows:
    for event in lines(RUN / 'events' / (row['id'] + '.ndjson')):
        if event['event'] == 'sample':
            intervals.append(event['intervalMilliseconds'])
            free.append(event['freeMemory'])
            rss.append(event['memory']['rss'])
    for event in lines(RUN / 'page-events' / (row['id'] + '.ndjson')):
        if event['event'] == 'DOMContentLoaded' and event.get('document') == row['measurement']['document']['document']:
            receipt = datetime.datetime.fromisoformat(event['receivedAt'].replace('Z', '+00:00')).timestamp() * 1000
            clocks[row['configuration']['clock']].append(receipt - event['wall'])

write('QUALIFICATION.json', dict(
    completed=144, counts=dict(collections.Counter(row['status'] for row in rows)),
    timingQualified=144, historicalRowsPreserved=144, actualOfflineProof=106,
    offlineNotReachedNotVerified=38, readyButUncontrolledAt10s=38,
    oldControlledNewUncontrolled=38,
    replacementAbsentAfterClaimSnapshot=sum(row['newAbsentFromClaimSnapshot'] is True for row in rows if row['status'] == 'FAIL'),
    replacementPresentAfterClaimSnapshot=[row['id'] for row in rows if row['status'] == 'FAIL' and row['newAbsentFromClaimSnapshot'] is False],
    duplicateInstallEvidence=[row['id'] for row in rows if row['digests'] != 15],
    serverSampleIntervalsMilliseconds=describe(intervals), freeMemoryBytes=describe(free), serverRSSBytes=describe(rss),
    pageDOMContentLoadedReceiptMinusWallMilliseconds={clock: describe(values) for clock, values in clocks.items()},
    interpretation='Receipt lag is not clock precision. Host sampling does not measure every browser process or exclude scheduling contention. Windows loadavg is unavailable.',
))

# Hash every raw trace, including green traces retained locally (all CI traces are artifacts).
inventory = {}
for run_id in ['causal-local-1', 'causal-local-2', 'causal-local-3', 'causal-local-4']:
    run = BASE / run_id
    paths = list(run.glob('*'))
    for folder in ['events', 'page-events', 'case-outcomes', 'controls-traces', 'matrix-traces', 'tooling']:
        paths.extend((run / folder).rglob('*'))
    for path in sorted(paths):
        if not path.is_file():
            continue
        if path.suffix not in ['.json', '.ndjson', '.zip', '.js', '.txt']:
            continue
        content = path.read_bytes()
        inventory[path.relative_to(BASE).as_posix()] = dict(bytes=len(content), sha256=hashlib.sha256(content).hexdigest())
write('RAW-INVENTORY.json', inventory)

# Targeted credential/path/CRC scan; this is evidence hygiene, not a comprehensive security audit.
patterns = {
    'github_token': rb'gh[pousr]_[A-Za-z0-9]{30,}',
    'github_pat': rb'github_pat_[A-Za-z0-9_]{30,}',
    'aws_key': rb'AKIA[A-Z0-9]{16}',
    'private_key': rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
    'signed_download_query': rb'[?&](?:sig|X-Amz-Signature)=[A-Za-z0-9%+/]{20,}',
}
matches, checked = [], 0


def scan(name, content):
    global checked
    checked += 1
    for kind, pattern in patterns.items():
        if re.search(pattern, content):
            matches.append(dict(file=name, kind=kind))


for path in sorted(DEST.iterdir()):
    if path.suffix == '.zip':
        with zipfile.ZipFile(path) as archive:
            assert archive.testzip() is None
            for name in archive.namelist():
                assert not name.startswith(('/', '\\')) and '..' not in pathlib.PurePosixPath(name).parts
                content = archive.read(name)
                if name.endswith('/trace.zip'):
                    import io
                    with zipfile.ZipFile(io.BytesIO(content)) as trace:
                        assert trace.testzip() is None
                        for inner in trace.namelist():
                            scan(path.name + '/' + name + '/' + inner, trace.read(inner))
                else:
                    scan(path.name + '/' + name, content)
    else:
        scan(path.name, path.read_bytes())
write('HYGIENE.json', dict(entriesScanned=checked, matches=matches, archiveCRC='PASS',
    scope=list(patterns), limitation='Targeted pattern scan only; no exhaustive credential or security guarantee. All data is synthetic localhost test data.'))
assert not matches, matches
write('PACKAGE-HASHES.json', {path.name: dict(bytes=path.stat().st_size, sha256=hashlib.sha256(path.read_bytes()).hexdigest())
                           for path in sorted(DEST.iterdir()) if path.is_file()})
print(json.dumps(dict(files=len(list(DEST.iterdir())), bytes=sum(path.stat().st_size for path in DEST.iterdir())), indent=2))
