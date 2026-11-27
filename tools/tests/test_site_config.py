"""Shared config invariants and injection regression tests, no external dependencies."""
from copy import deepcopy
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from tools.config import site_config as cfg
from tools.deployment.release_validation import config_version
from tools.tracker import track_tags, track_pinned, tracker_sensitive_rules


class SiteConfigTests(unittest.TestCase):
    def setUp(self):
        self.config = deepcopy(cfg.CONFIG)

    def test_all_statuses_and_aliases_resolve(self):
        self.assertEqual(set(cfg.status_colors()), cfg.SYS_TAGS | set(self.config['status']['discord_aliases']))
        for tag in cfg.SYS_TAGS:
            for theme in ('dark', 'light'):
                self.assertRegex(cfg.resolve_status_color(tag, theme), r'^#[\da-fA-F]{6}$')
        self.assertEqual(cfg.resolve_status_color('BUG'), cfg.resolve_status_color('HOTFIX'))
        self.assertEqual(cfg.resolve_status_color('LATEST'), cfg.resolve_status_color('NEW'))

    def test_theme_changes_propagate(self):
        self.config['themes']['dark']['--accent'] = '#123456'
        cfg.validate_config(self.config)
        self.assertEqual(cfg.status_colors(self.config)['PATCH'], 0x123456)
        self.assertEqual(cfg.status_colors(self.config)['UPDATED'], 0x123456)
        self.assertIn('--accent: #123456;', cfg.render_theme(self.config, 'dark'))
        self.assertIn('[data-status="PATCH"] { --s-color: var(--accent);', cfg.render_palette(self.config))
        self.assertEqual(cfg.resolve_status_color('PATCH','light',self.config), cfg.resolve_status_color('PATCH','light'))

    def test_add_status_once(self):
        self.config['status']['groups'].append(['EXPERIMENTAL'])
        self.config['status']['tags']['EXPERIMENTAL'] = {'color':'#123456','shadow':'transparent'}
        cfg.validate_config(self.config)
        self.assertEqual(cfg.status_colors(self.config)['EXPERIMENTAL'], 0x123456)
        self.assertIn('[data-status="EXPERIMENTAL"]', cfg.render_palette(self.config))

    def test_reject_duplicate_group(self):
        self.config['status']['groups'].append(['PATCH'])
        with self.assertRaises(ValueError): cfg.validate_config(self.config)

    def test_reject_invalid_colors(self):
        for value in ('#GGGGGG','var(--not-defined)','rgba(0, 300, 0, 0.5)'):
            c = deepcopy(self.config)
            c['status']['tags']['PATCH']['color'] = value
            with self.subTest(value=value), self.assertRaises(ValueError): cfg.validate_config(c)

    def test_reject_invalid_shadow(self):
        self.config['status']['tags']['PATCH']['shadow'] = 'rgba(0, 0, 0, 2)'
        with self.assertRaises(ValueError): cfg.validate_config(self.config)

    def test_reject_alias_loop(self):
        self.config['status']['color_aliases']['LATEST'] = 'LATEST'
        with self.assertRaises(ValueError): cfg.validate_config(self.config)

    def test_reject_theme_variable_loop(self):
        self.config['themes']['dark']['--accent'] = 'var(--accent)'
        with self.assertRaises(ValueError): cfg.validate_config(self.config)

    def test_reject_invalid_expiry(self):
        self.config['status']['expire_days'] = 0
        with self.assertRaises(ValueError): cfg.validate_config(self.config)

    def test_duplicate_json_keys_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'config.json'; path.write_text('{"site":{},"site":{}}', encoding="utf-8")
            with self.assertRaisesRegex(ValueError, 'Duplicate'): cfg.load_config(path)

    def test_inject_idempotence_and_ci(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            for name in ('main.js','style.css'): shutil.copyfile(cfg.ROOT_DIR/name,root/name)
            self.config['frontend']['DEBUG_FETCH_DELAY']=123
            self.config['status']['expire_days']=21
            self.config['site']['url']='https://example.com'
            cfg.inject(root,version='U9.0.0',config=self.config,ci=True)
            self.assertEqual(cfg.inject(root,version='U9.0.0',config=self.config,ci=True,check=True),[])
            js=(root/'main.js').read_text(encoding="utf-8"); self.assertEqual(config_version(js),'U9.0.0')
            self.assertIn('DEBUG_FETCH_DELAY: 0',js)
            self.assertIn('TAG_EXPIRE_DAYS: 21',js)
            self.assertIn('"copyUrl": "https://example.com/"',js)
            cfg.inject(root,config=self.config)
            self.assertIn('DEBUG_FETCH_DELAY: 123',(root/'main.js').read_text(encoding="utf-8"))

    def test_missing_marker_no_partial_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            for name in ('main.js','style.css'): shutil.copyfile(cfg.ROOT_DIR/name,root/name)
            before=(root/'main.js').read_bytes()
            css=root/'style.css'; css.write_text(css.read_text(encoding="utf-8").replace('/* END GENERATED STATUS PALETTE */',''), encoding="utf-8")
            with self.assertRaises(ValueError): cfg.inject(root,version='U9.0.0')
            self.assertEqual((root/'main.js').read_bytes(),before)

    def test_tracker_reads_shared_custom_root(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); path=root/'tools/config/site_config.json'; path.parent.mkdir(parents=True)
            self.config['status']['expire_days']=23
            self.config['sensitive_templates']['EXAMPLE']=deepcopy(self.config['sensitive_templates']['MAIN'])
            path.write_text(json.dumps(self.config),encoding='utf-8')
            projects=root/'projects'
            with patch.object(track_tags,'PROJECTS_DIR',str(projects)), patch.object(track_pinned,'PROJECTS_DIR',str(projects)):
                self.assertEqual(track_tags.detect_tag_expire_days(),23)
                self.assertEqual(track_pinned.detect_expire_days(),23)
                self.assertIn('EXAMPLE',tracker_sensitive_rules.discover_sensitive_templates(projects))
                self.assertEqual(track_tags.normalize_tag('PATCH:2026-01-01')[0],'PATCH:2026-01-01')
                self.assertEqual(track_tags.normalize_tag('NEW:2026-01-01')[0],'NEW')

    def test_discord_loads_changed_color_in_fresh_process(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            shutil.copytree(cfg.ROOT_DIR/'tools',root/'tools',ignore=shutil.ignore_patterns('__pycache__','.cache','public-site-inventory'))
            self.config['themes']['dark']['--accent']='#123456'
            (root/'tools/config/site_config.json').write_text(json.dumps(self.config),encoding='utf-8')
            result=subprocess.check_output([sys.executable,'-c', 'from tools.notifications.discord_release import *; print(build_embed(Release(tag="U9", body="# [PATCH] Test"), Config())["embeds"][0]["color"])'],cwd=root,text=True)
            self.assertEqual(int(result),0x123456)


if __name__=='__main__':
    unittest.main()
