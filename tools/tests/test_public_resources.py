"""Public resource paths, stable IDs, and frontend cache regression checks."""
from copy import deepcopy
import shutil
import subprocess
import unittest

from tools.config import site_config as cfg
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

    @unittest.skipUnless(shutil.which('node'), 'Node.js required for frontend cache test')
    def test_frontend_resource_cache(self):
        subprocess.run(['node', str(cfg.ROOT_DIR / 'tools/tests/test_resource_cache.cjs')], cwd=cfg.ROOT_DIR, check=True, timeout=20)