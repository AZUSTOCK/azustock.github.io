"""Stage, validate and inventory the public website. Python 3.10+, stdlib only.
Run after generate_projects.py; this tool never deploys or changes source files.
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

if __package__:
    from .release_validation import SITE_URL, CORE_FILES, validate_release
else:
    from release_validation import SITE_URL, CORE_FILES, validate_release
STAGING = ".gh-pages-temp"
REPORT_DIR = "tools/public-site-inventory"
LEGACY_REPORT_DIR = "public-site-inventory"
ARTIFACT_NAME = "public-site-inventory"
WORKFLOW = "deploy.yml"
BRANCH = "main"

# Single source of truth for copying AND validation. Case-sensitive like rsync.
ROOT_EXCLUDED = frozenset({
    "tools", "logs", "README.md", "CNAME", "index_local.html",
    "generate_projects.py", "main.js", "style.css", LEGACY_REPORT_DIR,
})
# All dotfiles/dotdirs (.git, .github, .gh-pages-temp, .env, .secrets.json,
# .github_sync.json, .build_cache.json, etc.) are excluded by p.startswith(".").
ANYWHERE_EXCLUDED = frozenset({"private", "node_modules", "__pycache__"})
SCOPED_EXCLUDED = {
    "api": frozenset({"meta.json"}),
    "projects": frozenset({"detail.json", "index.md"}),
}
REQUIRED_FILES = CORE_FILES
REQUIRED_DIRS = ("api",)


def should_exclude(relative):
    parts = PurePosixPath(relative).parts
    if not parts:
        return False
    # upload-pages-artifact@v4 already excludes dotfiles/dirs in its tar.
    # Match this explicitly so the inventory describes the actual payload.
    if any(p.startswith(".") or p in ANYWHERE_EXCLUDED for p in parts):
        return True
    if parts[0] in ROOT_EXCLUDED:
        return True
    return any(p in SCOPED_EXCLUDED.get(parts[0], ()) for p in parts[1:])


def reset_output(root, name):
    """Only reset our designated output directories, never follow links."""
    if name not in (STAGING, REPORT_DIR):
        raise ValueError("Unexpected output directory")
    target = root / name
    # REPORT_DIR is nested: never follow a symlink in its parent path.
    if name == REPORT_DIR:
        parent = target.parent
        if parent.is_symlink():
            raise ValueError(f"Output parent is a symlink: {parent}")
        parent.mkdir(exist_ok=True)
    if target.is_symlink():
        raise ValueError(f"Output directory is a symlink: {target}")
    if target.exists():
        if not target.is_dir():
            raise ValueError(f"Output path is not a directory: {target}")
        shutil.rmtree(target)
    target.mkdir()
    return target


def walk_entries(root, *, filter_excluded=False):
    """Yield relative paths; prune exclusions and reject links/special files."""
    def onerror(error):
        raise error
    for directory, dirs, files in os.walk(root, followlinks=False, onerror=onerror):
        base = Path(directory)
        dirs.sort()
        files.sort()
        for name in list(dirs) + files:
            path = base / name
            rel = path.relative_to(root).as_posix()
            if filter_excluded and should_exclude(rel):
                if name in dirs:
                    dirs.remove(name)
                continue
            if path.is_symlink():
                raise ValueError(f"Symbolic link in public site: {rel}")
            if not path.is_dir() and not path.is_file():
                raise ValueError(f"Unsupported public entry: {rel}")
            yield rel, path


def prepare_public_site(root):
    stage = reset_output(root, STAGING)
    for rel, path in walk_entries(root, filter_excluded=True):
        dest = stage / rel
        if path.is_dir():
            dest.mkdir(parents=True, exist_ok=True)
        else:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, dest)
    return stage


def verify_public_site(stage, source_root=None, *, file_hashes=None):
    if stage.is_symlink() or not stage.is_dir():
        raise ValueError("Invalid staging directory")
    for rel, _ in walk_entries(stage):
        if should_exclude(rel):
            raise ValueError(f"Excluded entry in public site: {rel}")
    for rel in REQUIRED_FILES:
        path = stage / rel
        if not path.is_file() or not path.stat().st_size:
            raise ValueError(f"Missing or empty {rel}")
    for rel in REQUIRED_DIRS:
        if not (stage / rel).is_dir():
            raise ValueError(f"Missing directory: {rel}")
    return validate_release(stage, source_root if source_root is not None else stage.parent, file_hashes=file_hashes)


def file_hash(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def generate_inventory(stage, *, file_hashes=None):
    files = []
    groups = defaultdict(lambda: {"files": 0, "bytes": 0})
    cached_hashes = file_hashes if file_hashes is not None else {}
    for rel, path in walk_entries(stage):
        if not path.is_file():
            continue
        size = path.stat().st_size
        digest = cached_hashes.get(rel) or file_hash(path)
        files.append({"path": rel, "bytes": size, "sha256": digest})
        group = rel.split("/", 1)[0] + "/" if "/" in rel else "(root)"
        groups[group]["files"] += 1
        groups[group]["bytes"] += size
    files.sort(key=lambda f: f["path"])
    return {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "commit": os.getenv("GITHUB_SHA") or None,
        "run_id": os.getenv("GITHUB_RUN_ID") or None,
        "run_attempt": os.getenv("GITHUB_RUN_ATTEMPT") or None,
        "site_url": SITE_URL,
        "total_files": len(files),
        "total_bytes": sum(f["bytes"] for f in files),
        "directories": dict(sorted(groups.items())),
        "files": files,
    }


def inventory_index(inventory):
    if inventory.get("schema_version") != 1 or not isinstance(inventory.get("files"), list):
        raise ValueError("Unsupported inventory schema")
    result = {}
    for f in inventory["files"]:
        path, size, digest = f["path"], f["bytes"], f["sha256"]
        if not isinstance(path, str) or path in result or not isinstance(size, int) or size < 0:
            raise ValueError("Invalid inventory file entry")
        if not isinstance(digest, str) or len(digest) != 64 or any(c not in "0123456789abcdef" for c in digest):
            raise ValueError("Invalid inventory digest")
        result[path] = (size, digest)
    return result


def compare_inventories(current, previous, *, source):
    if previous is None:
        return {"available": False, "reason": source}
    now, old = inventory_index(current), inventory_index(previous)
    common = now.keys() & old.keys()
    return {
        "available": True,
        "source": source,
        "baseline_run_id": previous.get("run_id"),
        "baseline_commit": previous.get("commit"),
        "added": sorted(now.keys() - old.keys()),
        "removed": sorted(old.keys() - now.keys()),
        "modified": sorted(p for p in common if now[p] != old[p]),
        "unchanged": sum(now[p] == old[p] for p in common),
    }


def previous_inventory():
    """Compare with the latest successful main workflow, not a failed build.
    Missing/expired reports or unavailable GitHub API do not block deployment.
    GH CLI is preinstalled on GitHub-hosted Ubuntu; local use needs no CLI.
    """
    repo = os.getenv("GITHUB_REPOSITORY")
    if not repo or not os.getenv("GH_TOKEN"):
        return None, "GitHub comparison credentials unavailable"
    try:
        endpoint = f"repos/{repo}/actions/workflows/{WORKFLOW}/runs?branch={BRANCH}&status=success&per_page=1"
        data = json.loads(subprocess.check_output(["gh", "api", endpoint], text=True, timeout=30, stderr=subprocess.DEVNULL))
        runs = data.get("workflow_runs", [])
        if not runs:
            return None, "No previous successful deployment workflow"
        run = runs[0]
        run_id = str(run["id"])
        if run_id == os.getenv("GITHUB_RUN_ID"):
            return None, "Previous run is the current workflow"
        with tempfile.TemporaryDirectory() as tmp:
            subprocess.run(["gh", "run", "download", run_id, "--repo", repo,
                            "--name", ARTIFACT_NAME, "--dir", tmp], check=True,
                           timeout=60, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            previous = json.loads((Path(tmp) / "public_inventory.json").read_text(encoding="utf-8"))
        inventory_index(previous)
        if str(previous.get("run_id")) != run_id or previous.get("commit") != run.get("head_sha"):
            return None, "Previous inventory does not match successful workflow"
        return previous, f"Successful workflow run {run_id}"
    except (OSError, subprocess.SubprocessError, ValueError, KeyError, TypeError, AttributeError):
        return None, "Previous inventory unavailable, expired, or invalid"


def generate_summary(inventory):
    def mib(size):
        return f"{size / (1024 ** 2):,.2f} MiB"
    lines = ["## Public Site Inventory", "", "Verified staging files (deployment not yet confirmed).", "",
             f"- Total files: **{inventory['total_files']:,}**",
             f"- Total size: **{mib(inventory['total_bytes'])}** ({inventory['total_bytes']:,} bytes)",
             "", "| Directory | Files | Size |", "| --- | ---: | ---: |"]
    for group, stats in inventory["directories"].items():
        safe = group.replace("|", "\\|").replace("\n", " ").replace("\r", " ").replace("<", "&lt;").replace(">", "&gt;")
        lines.append(f"| {safe} | {stats['files']:,} | {mib(stats['bytes'])} |")
    validation = inventory.get("validation")
    if validation:
        lines.extend(["", "### Release validation", "",
                      f"- System version: `{validation['version']}`",
                      f"- Article JSON files checked: **{validation['articles_checked']}**",
                      f"- Warnings: **{len(validation['warnings'])}**"])
        for warning in validation['warnings']:
            safe = warning.replace("\n", " ").replace("\r", " ").replace("<", "&lt;").replace(">", "&gt;")
            lines.append(f"  - {safe}")
    diff = inventory["comparison"]
    lines.extend(["", "### Deployment changes", ""])
    if diff["available"]:
        lines.extend([f"Baseline: {diff['source']}", "",
                      f"- Added: **{len(diff['added']):,}**",
                      f"- Modified: **{len(diff['modified']):,}**",
                      f"- Removed: **{len(diff['removed']):,}**",
                      f"- Unchanged: **{diff['unchanged']:,}**"])
    else:
        lines.append(f"No comparison: {diff['reason']}.")
    lines.extend(["", f"Full file list and SHA-256 hashes: Actions artifact `{ARTIFACT_NAME}`.", ""])
    return "\n".join(lines)


def write_reports(report, inventory):
    (report / "public_inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # One path per line, escape unusual newline characters for readability.
    paths = [f["path"].replace("\\", "\\\\").replace("\r", "\\r").replace("\n", "\\n") for f in inventory["files"]]
    (report / "public_inventory.txt").write_text("\n".join(paths) + "\n", encoding="utf-8")
    summary = generate_summary(inventory)
    (report / "summary.md").write_text(summary, encoding="utf-8")
    if os.getenv("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as stream:
            stream.write(summary + "\n")
    print(summary)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    comparison = parser.add_mutually_exclusive_group()
    comparison.add_argument("--baseline", type=Path, help="Previous public_inventory.json (local comparison)")
    comparison.add_argument("--compare-previous", action="store_true", help="Compare with last successful GitHub deployment workflow")
    args = parser.parse_args(argv)
    try:
        root = args.root.resolve(strict=True)
        # Read baseline before replacing the local report directory.
        previous, source = None, "No baseline requested"
        if args.baseline:
            previous = json.loads(args.baseline.read_text(encoding="utf-8"))
            inventory_index(previous)
            source = "Local inventory"
        elif args.compare_previous:
            previous, source = previous_inventory()
        report = reset_output(root, REPORT_DIR)
        stage = prepare_public_site(root)
        shared_hashes = {}
        validation = verify_public_site(stage, root, file_hashes=shared_hashes)
        inventory = generate_inventory(stage, file_hashes=shared_hashes)
        inventory["validation"] = validation
        inventory["comparison"] = compare_inventories(inventory, previous, source=source)
        write_reports(report, inventory)
        print(f"Staged {inventory['total_files']} files in {stage}")
        print(f"Inventory reports: {report}")
    except (OSError, ValueError, TypeError, KeyError, AttributeError) as error:
        parser.exit(1, f"Public site preparation failed: {error}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
