"""Run with python -m unittest discover -s tools -p test_public_site.py -v."""
import hashlib
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import prepare_public_site as site


class PublicSiteTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in site.REQUIRED_FILES:
            self.put(name, "{}")
        self.put("index.html", '<link rel="manifest" href="/assets/site.webmanifest"><link rel="icon" href="assets/favicon.svg?v=1">')
        self.put("assets/favicon.svg", "<svg/>")
        self.put("api/p/contents.json", "{}")

    def put(self, path, text="data"):
        dest = self.root / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text, encoding="utf-8")
        return dest

    def stage(self):
        return site.prepare_public_site(self.root)

    def test_exclusions_and_preservation(self):
        excluded = ["tools/discord_release.py", "logs/U1/update.md", "README.md", "CNAME", "main.js", "style.css", "index_local.html", "generate_projects.py", "api/meta.json", "api/p/meta.json", "projects/detail.json", "projects/p/detail.json", "projects/index.md", "projects/p/a/index.md", "projects/p/private/test.txt", ".github_sync.json", "assets/.secrets.json", "assets/.env.production", "assets/.hidden/a", ".well-known/test", "node_modules/a", "projects/p/__pycache__/a", ".build_cache.json", "public-site-inventory/old.txt", "tools/public-site-inventory/old.txt"]
        included = ["projects/p/README.md", "projects/p/notes.md", "projects/p/settings.json", "projects/p/main.js", "projects/p/style.css", "projects/p/hidden/cover.webp", "projects/p/wip/movie.mp4", "projects/p/document.pdf", "projects/p/index.html", "projects/p/logs/a.txt", "api/p/contents.json", "api/p/index.md", "assets/detail.json", "assets/icon.webp", "memory-migration.html", "kotoba.md"]
        for name in excluded + included:
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
                self.put("index.html", f'<link rel="manifest" href="/assets/site.webmanifest"><link rel="icon" href="{href}">')
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
        self.put("main.min.js", "[]")  # same byte length, different hash
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


if __name__ == "__main__":
    unittest.main()
