"""Article-level opt-out affects build reminders only, never published data."""
import importlib
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


class ExpirationReminderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            cls.generator = importlib.import_module('generate_projects')
        except ModuleNotFoundError as exc:
            if exc.name in {'PIL', 'rjsmin', 'rcssmin'}:
                raise unittest.SkipTest(f'Generator dependency missing: {exc.name}') from exc
            raise

    def test_article_opt_out_preserves_public_data_and_other_reminders(self):
        g = self.generator
        with tempfile.TemporaryDirectory() as tmp:
            previous_cwd = os.getcwd()
            try:
                os.chdir(tmp)
                project = Path('projects/category/demo')
                project.mkdir(parents=True)
                (project / 'detail.json').write_text(json.dumps({
                    'title': 'Project', 'tags': ['NEW:2000-01-01'],
                    'skip_expiration_reminders': True,
                }), encoding='utf-8')
                article = project / 'articles/example'
                article.mkdir(parents=True)
                detail = article / 'detail.json'
                md = article / 'index.md'
                content = ('# Example\n\n++[NEW:2000-01-01]Old++\n\n'
                           ':::highlight[UPDATED:2000-01-01|EXPIRE]\nOld block\n:::\n\n'
                           '++[NEW:2999-01-01]Future++\n')
                md.write_text(content, encoding='utf-8')
                base = {'title': 'Example', 'tags': ['NEW:2000-01-01', 'FEATURE:2999-01-01'],
                        'new': '2000-01-01', 'hidden': '2000-01-01'}
                sibling = project / 'articles/sibling'
                sibling.mkdir()
                (sibling / 'detail.json').write_text(json.dumps({'title': 'Sibling', 'new': '2000-01-01'}), encoding='utf-8')
                (sibling / 'index.md').write_text('# Sibling\n', encoding='utf-8')
                sentinel = object()
                baseline = None
                for flag in (sentinel, True, False, 'true', 1):
                    with self.subTest(flag=flag):
                        data = dict(base)
                        if flag is not sentinel:
                            data['skip_expiration_reminders'] = flag
                        detail.write_text(json.dumps(data), encoding='utf-8')
                        with patch.object(g, 'cout') as cout:
                            g.generate_projects_json(expire_days=14)
                        reminders = cout.collect_reminder.call_args_list
                        example_reminders = [c.args[0] for c in reminders if "'Example'" in c.args[1]]
                        project_reminders = [c for c in reminders if "'Project'" in c.args[1]]
                        sibling_reminders = [c for c in reminders if "'Sibling'" in c.args[1]]
                        skips = [c for c in cout.skip.call_args_list if 'skip_expiration_reminders: true' in c.args[0]]
                        self.assertEqual(len(project_reminders), 1)
                        self.assertEqual(len(sibling_reminders), 1)
                        if flag is True:
                            self.assertEqual(example_reminders, [])
                            self.assertEqual(len(skips), 1)
                        else:
                            self.assertCountEqual(example_reminders, ['標籤過期', '狀態過期', '解封提醒', '高光過期', '高光過期'])
                            self.assertEqual(skips, [])
                        outputs = tuple(Path(path).read_bytes() for path in (
                            'all_projects.json', 'api/demo/example/contents.json', 'api/demo/example/index.html'))
                        if baseline is None:
                            baseline = outputs
                        self.assertEqual(outputs, baseline)
                        self.assertNotIn(b'skip_expiration_reminders', outputs[0])
                        self.assertEqual(json.loads(outputs[1])['content'], content)
                        self.assertEqual(md.read_text(encoding='utf-8'), content)
                        self.assertEqual(json.loads(detail.read_text(encoding='utf-8')), data)
            finally:
                os.chdir(previous_cwd)
