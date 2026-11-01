"""Summarize synthetic diagnostic evidence without changing failures or source."""
import argparse
import collections
import hashlib
import json
from statistics import median
from pathlib import Path


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("diagnostics", type=Path, help="Raw readiness-*/RESULTS.json")
parser.add_argument("--out", type=Path, default=Path("release1-sw-readiness"))
args = parser.parse_args()
raw = read(args.diagnostics)
rows = raw["results"]
assert len({row["id"] for row in rows}) == len(rows), "Duplicate case identity"
manifest_path = args.diagnostics.parent.parent / "manifest.json"
assert digest(manifest_path) == raw["artifactManifestSHA256"]
manifest = read(manifest_path)
assert manifest["commit"] == "0d388b42afff7f57db01028a64deac85e293d2ba"
artifact_files = 0
for key, build in manifest["builds"].items():
    for name, expected in build["files"].items():
        assert digest(manifest_path.parent / ("generation" + key) / name) == expected, name
        artifact_files += 1

statistics = {}
for engine in ["chromium", "firefox", "webkit"]:
    selected = [row for row in rows if row["engine"] == engine]
    scenarios = {}
    for scenario in sorted({row["scenario"] for row in selected}):
        cases = [row for row in selected if row["scenario"] == scenario]
        times = sorted(row["observation"]["milliseconds"] for row in cases if "observation" in row)
        scenarios[scenario] = {
            "attempts": len(cases),
            "statuses": dict(collections.Counter(row["status"] for row in cases)),
            "injectedReadinessFailures": sum(row.get("readinessStatus") == "FAIL" for row in cases),
            "readyResolvedBeforeController": sum(any(event.get("event") == "ready-resolved" and not event.get("controller") for event in row.get("events", [])) for row in cases),
            "observationMilliseconds": {"min": min(times), "max": max(times), "median": median(times)} if times else None,
        }
    statistics[engine] = scenarios

selected_events = []
compact = []
for row in rows:
    entry = {key: value for key, value in row.items() if key not in ["events", "traces", "external"]}
    entry["externalRequests"] = row.get("external", [])
    entry["traces"] = [{"name": Path(path).name, "sha256": digest(Path(path))} for path in row.get("traces", [])]
    compact.append(entry)
    if row["attempt"] == 1 or row["status"] == "FAIL":
        selected_events.append({"id": row["id"], "status": row["status"], "events": row.get("events", [])})

result = {
    "version": 1,
    "pinnedRuntime": manifest["commit"],
    "runnerSHA256": raw["runnerSHA256"],
    "rawReportSHA256": digest(args.diagnostics),
    "artifactManifestSHA256": raw["artifactManifestSHA256"],
    "verifiedFrozenFiles": artifact_files,
    "plannedCases": 3 * (4 * raw["repetitions"] + 8),
    "completedCases": len(rows),
    "statuses": dict(collections.Counter(row["status"] for row in rows)),
    "statistics": statistics,
    "measurement": raw["measurement"],
    "rootCauseOfHistoricalTimeouts": "NOT DETERMINED",
    "historicalFailures": "Remain FAIL; independent greens and injected negatives are separate evidence.",
    "humanInstalledPWA_OS_Safari_iOS": "NOT VERIFIED",
    "runtimeFix": "NOT IMPLEMENTED; separate owner authorization required after Architect review",
    "cases": compact,
    "releaseApproved": False,
}
args.out.mkdir(exist_ok=True, parents=True)
write(args.out / "RESULTS.json", result)
write(args.out / "SELECTED-EVENTS.json", {"rawReportSHA256": digest(args.diagnostics), "measurement": raw["measurement"], "cases": selected_events})
print(json.dumps({key: result[key] for key in ["completedCases", "plannedCases", "statuses", "verifiedFrozenFiles", "rootCauseOfHistoricalTimeouts"]}))
