"""Run with python -m unittest discover -s tools -p test_public_site.py -v."""
import hashlib
import json
import shutil
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import prepare_public_site as site
import release_validation as release


class PublicSiteTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.version = "U1.7.0"
        self.put("main.min.js", f'const CONFIG={{VERSION:"{self.version}",DEBUG_FETCH_DELAY:0}};')
        self.put("style.min.css", "body{color:#fff}")
        self.put("index.html", self.homepage())
        self.put("assets/favicon.svg", "<svg/>")
        self.put("assets/icon.png", "icon")
        self.put("assets/og.png", "og")
        for page in ("api/p/index.html", "api/p/a/index.html"):
            self.put(page, f'<meta property="og:url" content="https://azustock.com/{page}">'
                           '<meta property="og:image" content="https://azustock.com/assets/og.png">')
        self.put("assets/site.webmanifest", json.dumps({
            "icons": [{"src": "./icon.png"}], "start_url": "/", "scope": "/", "id": "/"
        }))
        self.put("api/p/a/contents.json", json.dumps({"content": "Article"}))
        self.put("all_projects.json", json.dumps({"categories": [{"id": "c"}], "projects": [
            {"id": "p", "category": "c", "articles": [{"id": "a", "content_path": "./api/p/a/contents.json"}]}
        ]}))
        self.put("logs/U1.7.0/detail.json", json.dumps({"version": self.version, "status": "MAJOR"}))
        self.put("logs/U1.7.0/update.md", "# [MAJOR] Test release")
        for name in release.OPTIONAL_FILES:
            self.put(name, "feature")
        self.sync_logs()
        self.refresh_hashes()

    def homepage(self, *, version=None, href="/assets/site.webmanifest", icon="assets/favicon.svg?v=1"):
        return (f'<link rel="manifest" href="{href}"><link rel="icon" href="{icon}">'
                '<link rel="stylesheet" href="style.min.css"><script src="main.min.js"></script>'
                f'<span id="sys-version">{version or self.version}</span>')

    def sync_logs(self):
        entries, latest = release.collect_log_entries(self.root / "logs")
        self.put("version.json", json.dumps({"version": latest}))
        cl_dir = self.root / "api" / "_changelogs"
        if cl_dir.exists():
            shutil.rmtree(cl_dir)
        logs_index = []
        for folder, v, detail in entries:
            rec = release.public_log_record(folder, v, detail)
            if rec is None:
                continue
            chunk_rel = f"api/_changelogs/{rec['id']}.json"
            chunk_path = self.put(chunk_rel, json.dumps({"content": rec['content']}, ensure_ascii=False))
            chunk_hash = hashlib.sha256(chunk_path.read_bytes()).hexdigest()[:16]
            logs_index.append({
                "id": rec['id'], "version": rec['version'], "date": rec['date'],
                "status": rec['status'], "description": rec['description'], "group": rec['group'],
                "content_path": f"./{chunk_rel}?v={chunk_hash}",
            })
        groups = release.load_log_groups(self.root / "logs")
        self.put("changelogs.json", json.dumps({"groups": groups, "logs": logs_index}, ensure_ascii=False))

    def refresh_hashes(self):
        self.put("data_version.json", json.dumps({key: hashlib.sha256((self.root / path).read_bytes()).hexdigest()[:16]
                                                if (self.root / path).is_file() else ""
                                                for key, path in release.DATA_VERSION_FILES.items()}))

    def put(self, path, text="data"):
        dest = self.root / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text, encoding="utf-8")
        return dest

    def stage(self):
        return site.prepare_public_site(self.root)

    def test_exclusions_and_preservation(self):
        excluded = ["tools/discord_release.py", "logs/U1/update.md", "README.md", "CNAME", "main.js", "style.css", "index_local.html", "generate_projects.py", "api/meta.json", "api/p/meta.json", "projects/detail.json", "projects/p/detail.json", "projects/index.md", "projects/p/a/index.md", "projects/p/private/test.txt", ".github_sync.json", "assets/.secrets.json", "assets/.env.production", "assets/.hidden/a", ".well-known/test", "node_modules/a", "projects/p/__pycache__/a", ".build_cache.json", "public-site-inventory/old.txt", "tools/public-site-inventory/old.txt"]
        included = ["projects/p/README.md", "projects/p/notes.md", "projects/p/settings.json", "projects/p/main.js", "projects/p/style.css", "projects/p/hidden/cover.webp", "projects/p/wip/movie.mp4", "projects/p/document.pdf", "projects/p/index.html", "projects/p/logs/a.txt", "api/p/a/contents.json", "api/p/index.md", "assets/detail.json", "assets/icon.webp", "kotoba.md"]
        for name in excluded + included:
            if not (self.root / name).exists():
                self.put(name)
        stage = self.stage()
        for name in excluded:
            with self.subTest(name=name):
                self.assertFalse((stage / name).exists())
                self.assertTrue((self.root / name).exists())
        for name in included:
            with self.subTest(name=name):
                self.assertTrue((stage / name).is_file())
        site.verify_public_site(stage)

    def test_root_and_nested_rules(self):
        for name in ("README.md", "projects/index.md", "projects/a/b/index.md", "api/meta.json", "api/a/meta.json"):
            self.assertTrue(site.should_exclude(name))
        for name in ("projects/README.md", "assets/index.md", "projects/a/meta.json", "api/detail.json"):
            self.assertFalse(site.should_exclude(name))

    def test_stale_files_removed(self):
        self.put("old.txt")
        stage = self.stage()
        self.assertTrue((stage / "old.txt").exists())
        (self.root / "old.txt").unlink()
        self.assertFalse((self.stage() / "old.txt").exists())

    def test_reject_excluded_entry_after_copy(self):
        stage = self.stage()
        for name in ("README.md", "tools/a.py", "api/p/meta.json", "projects/a/index.md", ".secret"):
            target = stage / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text("bad")
            with self.subTest(name=name), self.assertRaisesRegex(ValueError, "Excluded entry"):
                site.verify_public_site(stage)
            target.unlink()
            # Remove newly introduced excluded directories before the next case.
            if name == "tools/a.py":
                target.parent.rmdir()

    def test_missing_required(self):
        stage = self.stage()
        (stage / "main.min.js").unlink()
        with self.assertRaisesRegex(ValueError, "Missing or empty main.min.js"):
            site.verify_public_site(stage)

    def test_invalid_manifest(self):
        self.put("assets/site.webmanifest", "{broken")
        with self.assertRaises(ValueError):
            site.verify_public_site(self.stage())

    def test_resource_check(self):
        for href in ("http://azustock.com/assets/favicon.svg", "https://azustock.github.io/assets/favicon.svg", "/assets/missing.svg", "/assets/%2e%2e/favicon.svg"):
            with self.subTest(href=href):
                self.put("index.html", self.homepage(icon=href))
                with self.assertRaises(ValueError):
                    site.verify_public_site(self.stage())

    def test_missing_manifest_link(self):
        self.put("index.html", "<html></html>")
        with self.assertRaisesRegex(ValueError, "Missing manifest link"):
            site.verify_public_site(self.stage())

    def test_symlink_rejected(self):
        link = self.root / "assets/link.txt"
        try:
            link.symlink_to(self.root / "index.html")
        except (OSError, NotImplementedError):
            self.skipTest("Symlinks unavailable")
        with self.assertRaisesRegex(ValueError, "Symbolic link"):
            self.stage()

    def test_output_symlink_rejected(self):
        try:
            (self.root / site.STAGING).symlink_to(self.root / "assets", target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("Symlinks unavailable")
        with self.assertRaisesRegex(ValueError, "symlink"):
            self.stage()
        self.assertTrue((self.root / "assets/favicon.svg").is_file())

    def test_report_output_symlink_rejected(self):
        report = self.root / site.REPORT_DIR
        report.parent.mkdir()
        try:
            report.symlink_to(self.root / "assets", target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("Symlinks unavailable")
        with self.assertRaisesRegex(ValueError, "symlink"):
            site.reset_output(self.root, site.REPORT_DIR)
        self.assertTrue((self.root / "assets/favicon.svg").is_file())

    def test_report_parent_symlink_rejected(self):
        try:
            (self.root / "tools").symlink_to(self.root / "assets", target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("Symlinks unavailable")
        with self.assertRaisesRegex(ValueError, "symlink"):
            site.reset_output(self.root, site.REPORT_DIR)
        self.assertFalse((self.root / "assets/public-site-inventory").exists())

    def test_inventory_hash_counts_and_order(self):
        self.put("projects/言葉.txt", "abc")
        inv = site.generate_inventory(self.stage())
        entry = next(f for f in inv["files"] if f["path"] == "projects/言葉.txt")
        self.assertEqual(entry["sha256"], hashlib.sha256(b"abc").hexdigest())
        self.assertEqual(entry["bytes"], 3)
        self.assertEqual(inv["total_files"], len(inv["files"]))
        self.assertEqual(inv["total_bytes"], sum(f["bytes"] for f in inv["files"]))
        self.assertEqual(inv["directories"]["projects/"], {"files": 1, "bytes": 3})
        self.assertEqual([f["path"] for f in inv["files"]], sorted(f["path"] for f in inv["files"]))

    def test_diff(self):
        self.put("old.txt", "old")
        old = site.generate_inventory(self.stage())
        (self.root / "old.txt").unlink()
        self.put("new.txt", "new")
        js = (self.root / "main.min.js").read_text()
        self.put("main.min.js", js.replace("U1.7.0", "U1.7.1"))  # same byte length, different hash
        now = site.generate_inventory(self.stage())
        diff = site.compare_inventories(now, old, source="test")
        self.assertEqual(diff["added"], ["new.txt"])
        self.assertEqual(diff["removed"], ["old.txt"])
        self.assertEqual(diff["modified"], ["main.min.js"])
        self.assertEqual(diff["unchanged"], now["total_files"] - 2)

    def test_no_baseline_not_all_added(self):
        self.assertEqual(site.compare_inventories({}, None, source="first run"), {"available": False, "reason": "first run"})

    def test_report_is_not_staged_and_local_baseline(self):
        with patch.dict(os.environ, {"GITHUB_STEP_SUMMARY": ""}):
            site.main(["--root", str(self.root)])
            report = self.root / site.REPORT_DIR
            self.assertEqual(report, self.root / "tools/public-site-inventory")
            self.assertTrue((report / "public_inventory.txt").is_file())
            self.assertTrue((report / "summary.md").is_file())
            self.assertFalse((self.root / site.STAGING / site.REPORT_DIR).exists())
            self.assertFalse((self.root / site.STAGING / site.LEGACY_REPORT_DIR).exists())
            self.assertFalse((self.root / site.LEGACY_REPORT_DIR).exists())
            (report / "stale.txt").write_text("old", encoding="utf-8")
            self.put("new.txt")
            site.main(["--root", str(self.root), "--baseline", str(report / "public_inventory.json")])
            inv = json.loads((report / "public_inventory.json").read_text(encoding="utf-8"))
            self.assertEqual(inv["comparison"]["added"], ["new.txt"])
            self.assertFalse((report / "stale.txt").exists())

    def test_previous_successful_run(self):
        baseline = site.generate_inventory(self.stage())
        baseline.update(run_id="123", commit="oldsha")
        def download(cmd, **kwargs):
            target = Path(cmd[cmd.index("--dir") + 1])
            (target / "public_inventory.json").write_text(json.dumps(baseline), encoding="utf-8")
        with patch.dict(os.environ, {"GITHUB_REPOSITORY": "owner/repo", "GH_TOKEN": "fake", "GITHUB_RUN_ID": "124"}), \
             patch.object(subprocess, "check_output", return_value=json.dumps({"workflow_runs": [{"id": 123, "head_sha": "oldsha"}]})) as api, \
             patch.object(subprocess, "run", side_effect=download):
            result, source = site.previous_inventory()
            self.assertEqual(result, baseline)
            self.assertIn("123", source)
            self.assertIn("status=success", api.call_args.args[0][-1])

    def test_expired_previous_report_nonfatal(self):
        with patch.dict(os.environ, {"GITHUB_REPOSITORY": "owner/repo", "GH_TOKEN": "fake", "GITHUB_RUN_ID": "124"}), \
             patch.object(subprocess, "check_output", return_value=json.dumps({"workflow_runs": [{"id": 123, "head_sha": "oldsha"}]})), \
             patch.object(subprocess, "run", side_effect=subprocess.CalledProcessError(1, "gh")):
            result, reason = site.previous_inventory()
            self.assertIsNone(result)
            self.assertIn("unavailable", reason)

    def test_required_json_and_hash_files(self):
        for name in ("version.json", "data_version.json", "changelogs.json"):
            stage = self.stage()
            (stage / name).unlink()
            with self.subTest(name=name), self.assertRaisesRegex(ValueError, "Missing or empty"):
                site.verify_public_site(stage)
        for name, invalid in (("version.json", "[]"), ("data_version.json", "[]"), ("all_projects.json", "[]"), ("changelogs.json", "[]")):
            stage = self.stage()
            (stage / name).write_text(invalid)
            with self.subTest(name=name), self.assertRaises(ValueError):
                site.verify_public_site(stage)

    def test_version_mismatch(self):
        for name, bad in (("version.json", '{"version":"U1.6.2"}'),
                          ("main.min.js", 'const CONFIG={VERSION:"U1.6.2"};'),
                          ("index.html", self.homepage(version="U1.6.2"))):
            stage = self.stage()
            (stage / name).write_text(bad)
            with self.subTest(name=name), self.assertRaisesRegex(ValueError, "System version mismatch"):
                site.verify_public_site(stage)

    def test_stale_changelog_and_latest_source(self):
        stage = self.stage()
        (stage / "changelogs.json").write_text('{"groups": {}, "logs": []}')
        with self.assertRaisesRegex(ValueError, "differs from source logs"):
            site.verify_public_site(stage)
        self.put("logs/U1.7.1/detail.json", '{"version":"U1.7.1"}')
        with self.assertRaisesRegex(ValueError, "latest tracked log"):
            site.verify_public_site(self.stage())

    def test_hidden_and_no_track_log_semantics(self):
        self.put("logs/U1.7.0.1/detail.json", '{"version":"U1.7.0.1"}')
        self.put("logs/U1.7.0.1/update.md", "Internal log")
        self.put("logs/U2.0.0/detail.json", '{"version":"U2.0.0","no_track":true}')
        self.put("logs/U2.0.0/update.md", "Public but untracked")
        self.version = "U1.7.0.1"
        self.put("main.min.js", f'const CONFIG={{VERSION:"{self.version}"}};')
        self.put("index.html", self.homepage())
        self.sync_logs()
        self.refresh_hashes()
        result = site.verify_public_site(self.stage())
        self.assertEqual(result["version"], self.version)
        self.assertTrue(any("no public changelog entry" in w for w in result["warnings"]))
        cl_doc = json.loads((self.root / "changelogs.json").read_text())
        self.assertEqual([row["version"] for row in cl_doc["logs"]], ["U2.0.0", "U1.7.0"])

    def test_optional_files_warn(self):
        (self.root / "kotoba.md").unlink()
        self.refresh_hashes()
        result = site.verify_public_site(self.stage())
        self.assertEqual(result["warnings"], ["Optional feature file missing or empty: kotoba.md"])

    def test_hash_mismatch(self):
        stage = self.stage()
        (stage / "style.min.css").write_text("body{color:red}")
        with self.assertRaisesRegex(ValueError, "data_version.json hash mismatch: style.min.css"):
            site.verify_public_site(stage)

    def test_missing_homepage_core_links(self):
        self.put("index.html", self.homepage().replace('<script src="main.min.js"></script>', ''))
        with self.assertRaisesRegex(ValueError, "must reference main.min.js"):
            site.verify_public_site(self.stage())

    def test_manifest_icons_scope_start_url(self):
        base = {"icons": [{"src": "./icon.png"}], "start_url": "/", "scope": "/"}
        for change, error in (({"icons": []}, "Missing manifest icons"),
                              ({"icons": [{"src": "missing.png"}]}, "Missing or empty resource"),
                              ({"icons": [{"src": "https://other.test/icon.png"}]}, "Invalid icon/manifest"),
                              ({"start_url": "https://other.test/"}, "Invalid icon/manifest"),
                              ({"scope": "/assets/"}, "outside scope"),
                              ({"start_url": "/missing"}, "Missing or empty resource")):
            with self.subTest(change=change), self.assertRaisesRegex(ValueError, error):
                self.put("assets/site.webmanifest", json.dumps({**base, **change}))
                site.verify_public_site(self.stage())
        self.put("assets/site.webmanifest", json.dumps({**base, "start_url": "/?v=U1.7.0"}))
        site.verify_public_site(self.stage())

    def test_article_and_database_structure(self):
        stage = self.stage()
        (stage / "api/p/a/contents.json").unlink()
        with self.assertRaisesRegex(ValueError, "Missing or empty resource.*contents.json"):
            site.verify_public_site(stage)
        self.put("api/p/a/contents.json", '{"content":42}')
        with self.assertRaisesRegex(ValueError, "Invalid content field"):
            site.verify_public_site(self.stage())
        self.put("all_projects.json", '{"categories":[],"projects":[{"id":"p","category":"c"}]}')
        self.refresh_hashes()
        with self.assertRaisesRegex(ValueError, "Unknown category"):
            site.verify_public_site(self.stage())

    def test_generated_media_and_hidden_article(self):
        self.put("projects/p/原 圖.webp", "original")
        self.put("api/p/thumb.webp", "thumbnail")
        self.put("projects/p/movie.mp4", "movie")
        self.put("projects/p/poster.webp", "poster")
        self.put("projects/p/cover.webp", "cover")
        sha = hashlib.sha256(b"thumbnail").hexdigest()[:16]
        markdown = f"""![image](./api/p/thumb.webp?v={sha}#full=./projects/p/原%20圖.webp&w=100&h=200)
![video](./projects/p/movie.mp4#poster=./projects/p/poster.webp&w=100&h=200)
<img src="./api/p/thumb.webp" data-full="./projects/p/原%20圖.webp">
![external](https://example.com/missing.png)
[normal link](./projects/p/index.md)
`![code](not-real.png)`
```md
![code](not-real.png)
```
"""
        self.put("api/p/a/contents.json", json.dumps({"content": markdown}))
        db = json.loads((self.root / "all_projects.json").read_text())
        article = db["projects"][0]["articles"][0]
        article.update(is_hidden=True, cover_image="./projects/p/cover.webp")
        self.put("all_projects.json", json.dumps(db))
        self.refresh_hashes()
        result = site.verify_public_site(self.stage())
        self.assertEqual(result["articles_checked"], 1)
        for resource in ("projects/p/原 圖.webp", "projects/p/poster.webp", "projects/p/cover.webp", "api/p/thumb.webp"):
            stage = self.stage()
            (stage / resource).unlink()
            with self.subTest(resource=resource), self.assertRaisesRegex(ValueError, "Missing or empty resource"):
                site.verify_public_site(stage)
        stage = self.stage()
        (stage / "api/p/thumb.webp").write_text("bad content")
        with self.assertRaisesRegex(ValueError, "Resource hash mismatch"):
            site.verify_public_site(stage)

    def test_version_helper_is_strict_and_preserves_other_versions(self):
        source = 'const CONFIG = {\n // comment\n VERSION: "U1.6.2", DEBUG_FETCH_DELAY: 2}; const Other={VERSION:1};'
        self.assertEqual(release.config_version(source), "U1.6.2")
        new = release.replace_config_version(source, "U1.7.0")
        self.assertIn("Other={VERSION:1}", new)
        self.assertEqual(release.config_version(new), "U1.7.0")
        with self.assertRaisesRegex(ValueError, "Missing CONFIG.VERSION"):
            release.replace_config_version('const Other={VERSION:"1"}', "U1.7.0")
        for bad in (None, 1, True, "", 'foo"bar'):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                release.replace_config_version(source, bad)

    def test_share_page_and_og(self):
        for rel in ("api/p/index.html", "api/p/a/index.html", "assets/og.png"):
            stage = self.stage()
            (stage / rel).unlink()
            with self.subTest(rel=rel), self.assertRaisesRegex(ValueError, "Missing or empty resource"):
                site.verify_public_site(stage)
        self.put("api/p/index.html", '<meta property="og:url" content="https://azustock.github.io/api/p/index.html">')
        with self.assertRaisesRegex(ValueError, "Invalid icon/manifest"):
            site.verify_public_site(self.stage())

    def test_invalid_json_constants(self):
        self.put("api/p/a/contents.json", '{"content":"Article","other":NaN}')
        with self.assertRaisesRegex(ValueError, "Non-JSON numeric constant"):
            site.verify_public_site(self.stage())

    def test_main_blocks_invalid_release_before_report(self):
        self.put("version.json", '{"version":"U1.6.2"}')
        with patch.dict(os.environ, {"GITHUB_STEP_SUMMARY": ""}), self.assertRaises(SystemExit) as exc:
            site.main(["--root", str(self.root)])
        self.assertEqual(exc.exception.code, 1)
        self.assertFalse((self.root / site.REPORT_DIR / "public_inventory.json").exists())

    def test_report_includes_validation(self):
        with patch.dict(os.environ, {"GITHUB_STEP_SUMMARY": ""}):
            site.main(["--root", str(self.root)])
        report = self.root / site.REPORT_DIR
        inv = json.loads((report / "public_inventory.json").read_text())
        self.assertEqual(inv["validation"], {"version": self.version, "articles_checked": 1, "warnings": []})
        self.assertIn("Release validation", (report / "summary.md").read_text())
        self.assertFalse((self.root / site.STAGING / site.REPORT_DIR).exists())


    def test_strip_markdown_code_single_line_triple_backticks(self):
        markdown = "```inline code```\n![broken](./projects/p/missing.webp)\n"
        self.put("api/p/a/contents.json", json.dumps({"content": markdown}))
        with self.assertRaisesRegex(ValueError, "Missing or empty resource"):
            site.verify_public_site(self.stage())

    def test_shared_hash_cache_avoids_rehash(self):
        stage = self.stage()
        shared_hashes = {}
        site.verify_public_site(stage, self.root, file_hashes=shared_hashes)
        self.assertIn("main.min.js", shared_hashes)
        self.assertEqual(len(shared_hashes["main.min.js"]), 64)
        with patch.object(site, "file_hash", wraps=site.file_hash) as spy:
            inv = site.generate_inventory(stage, file_hashes=shared_hashes)
        hashed_paths = {call.args[0].relative_to(stage).as_posix() for call in spy.call_args_list}
        self.assertNotIn("main.min.js", hashed_paths)
        self.assertNotIn("style.min.css", hashed_paths)
        self.assertEqual(inv["total_files"], len(inv["files"]))


if __name__ == "__main__":
    unittest.main()
