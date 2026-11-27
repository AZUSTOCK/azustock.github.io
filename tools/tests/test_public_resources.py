"""Resource relocation, stable IDs, and real frontend cache regression checks."""
from copy import deepcopy
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

from tools.config import site_config as cfg
from tools.config.migrate_resources import migrate
from tools.deployment.release_validation import DATA_VERSION_FILES


class PublicResourceTests(unittest.TestCase):
    def test_stable_ids_and_paths(self):
        self.assertEqual(DATA_VERSION_FILES['changelogs'], 'changelogs.json')
        for key, path in cfg.RESOURCE_PATHS.items():
            self.assertEqual(DATA_VERSION_FILES[key], path)
            self.assertNotIn(cfg.LEGACY_RESOURCE_PATHS[key], DATA_VERSION_FILES)
        config = deepcopy(cfg.CONFIG)
        config['resources']['kotoba'] = 'content/words.md'
        cfg.validate_config(config)
        self.assertIn('"kotoba": "content/words.md"', cfg.render_js_config(config, 'U1'))
        self.assertIn('"kotoba": "kotoba.md"', cfg.render_js_config(config, 'U1'))

    def test_invalid_paths(self):
        for path in ('/content/kotoba.md', 'content/../kotoba.md', 'content/.hidden.md', 'https://x/kotoba.md', 'content/a.md?x', 'tools/kotoba.md', 'content/private/kotoba.md', 'content/quotes.md'):
            config = deepcopy(cfg.CONFIG)
            config['resources']['kotoba'] = path
            with self.subTest(path=path), self.assertRaises(ValueError):
                cfg.validate_config(config)

    def test_move_preview_apply_repeat(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            data = b'\xef\xbb\xbfline\r\n---\r\nnext'
            for name in cfg.LEGACY_RESOURCE_PATHS.values():
                (root / name).write_bytes(data)
            migrate(root)
            self.assertFalse((root/'content').exists())
            migrate(root, apply=True)
            for key, path in cfg.RESOURCE_PATHS.items():
                self.assertEqual((root/path).read_bytes(), data)
                self.assertFalse((root/cfg.LEGACY_RESOURCE_PATHS[key]).exists())
            self.assertTrue(all('Already moved' in m for m in migrate(root, apply=True)))

    def test_mermaid_runtime_config_path(self):
        self.assertEqual(cfg.RESOURCE_PATHS['mermaid_styles'], 'config/mermaid_styles.txt')
        self.assertEqual(cfg.LEGACY_HASH_KEYS['mermaid_styles'], 'mermaid_styles.txt')
        self.assertIn('"mermaid_styles": "config/mermaid_styles.txt"',
                      cfg.render_js_config(cfg.CONFIG, 'U1'))
        for path in ('assets/styles/mermaid_styles.txt', 'tools/config/mermaid_styles.txt',
                     'config/../mermaid_styles.txt', 'config/private/mermaid_styles.txt'):
            config = deepcopy(cfg.CONFIG)
            config['resources']['mermaid_styles'] = path
            with self.subTest(path=path), self.assertRaises(ValueError):
                cfg.validate_config(config)

    def test_move_previous_mermaid_location(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            src = root/'assets/styles/mermaid_styles.txt'
            src.parent.mkdir(parents=True)
            data = b'\xef\xbb\xbfclassDef a fill:red;\r\n'
            src.write_bytes(data)
            dest = root/'config/mermaid_styles.txt'
            self.assertTrue(any('assets/styles/mermaid_styles.txt -> config/mermaid_styles.txt' in m
                                for m in migrate(root)))
            self.assertFalse(dest.exists())
            migrate(root, apply=True)
            self.assertEqual(dest.read_bytes(), data)
            self.assertFalse(src.exists())
            self.assertTrue(any('Already moved: config/mermaid_styles.txt' in m
                                for m in migrate(root, apply=True)))

    def test_mermaid_conflicts_across_all_locations(self):
        paths = ('mermaid_styles.txt', 'assets/styles/mermaid_styles.txt', 'config/mermaid_styles.txt')
        for pair in ((0, 1), (0, 2), (1, 2)):
            with self.subTest(pair=pair), tempfile.TemporaryDirectory() as temp:
                root = Path(temp)
                (root/'kotoba.md').write_text('untouched', encoding="utf-8")
                for index in pair:
                    path = root/paths[index]
                    path.parent.mkdir(parents=True, exist_ok=True)
                    path.write_text(str(index), encoding="utf-8")
                with self.assertRaises(FileExistsError):
                    migrate(root, apply=True)
                self.assertTrue((root/'kotoba.md').exists())
                self.assertFalse((root/'content/kotoba.md').exists())
                for index in pair:
                    self.assertEqual((root/paths[index]).read_text(encoding="utf-8"), str(index))

    def test_mermaid_legacy_symlink_parent_rejected(self):
        with tempfile.TemporaryDirectory() as temp, tempfile.TemporaryDirectory() as outside:
            root = Path(temp)
            (root/'assets').mkdir()
            try:
                (root/'assets/styles').symlink_to(outside, target_is_directory=True)
            except OSError:
                self.skipTest('symlink unavailable')
            src = Path(outside)/'mermaid_styles.txt'
            src.write_text('original', encoding="utf-8")
            with self.assertRaisesRegex(ValueError, 'Symlink'):
                migrate(root, apply=True)
            self.assertEqual(src.read_text(encoding="utf-8"), 'original')
            self.assertFalse((root/'config').exists())

    def test_conflict_aborts_all_moves(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root/'kotoba.md').write_text('original', encoding="utf-8")
            (root/'quotes.md').write_text('old', encoding="utf-8")
            dest = root/cfg.RESOURCE_PATHS['quotes']; dest.parent.mkdir(parents=True)
            dest.write_text('new', encoding="utf-8")
            with self.assertRaises(FileExistsError): migrate(root, apply=True)
            self.assertEqual(dest.read_text(encoding="utf-8"), 'new')
            self.assertTrue((root/'kotoba.md').exists())
            self.assertFalse((root/cfg.RESOURCE_PATHS['kotoba']).exists())

    def test_symlink_parent_rejected(self):
        with tempfile.TemporaryDirectory() as temp, tempfile.TemporaryDirectory() as outside:
            root = Path(temp)
            try: (root/'content').symlink_to(outside, target_is_directory=True)
            except OSError: self.skipTest('symlink unavailable')
            (root/'kotoba.md').write_text('original', encoding="utf-8")
            with self.assertRaisesRegex(ValueError, 'Symlink'): migrate(root, apply=True)
            self.assertTrue((root/'kotoba.md').exists())
            self.assertFalse((Path(outside)/'kotoba.md').exists())

    @unittest.skipUnless(shutil.which('node'), 'Node.js required for frontend cache test')
    def test_frontend_resource_cache(self):
        subprocess.run(['node', str(cfg.ROOT_DIR/'tools/tests/test_resource_cache.cjs')], cwd=cfg.ROOT_DIR, check=True, timeout=20)
