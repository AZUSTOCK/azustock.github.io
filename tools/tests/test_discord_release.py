"""Offline tests: python -m unittest discover -s tools/tests -p test_discord_release.py -v"""
import contextlib
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

from tools.notifications import discord_release as dr
from tools.config import site_config as cfg


class SummaryTests(unittest.TestCase):
    def test_heading_formats(self):
        for text in ("# [MAJOR] Summary", "## [MAJOR] Summary", "### [MAJOR] Summary",
                     "# **[MAJOR] Summary**", "#**[MAJOR] Summary**", "### **[MAJOR]** Summary",
                     "[MAJOR] Summary", "# [major] Summary ###", "\ufeff# [MAJOR] Summary"):
            with self.subTest(text=text):
                self.assertEqual(dr.parse_release_summary(text), ("MAJOR", "[MAJOR] Summary"))

    def test_first_tagged_heading(self):
        body = "## refactor\n# [MAJOR] Deployment refactor\n## [HOTFIX] Other"
        self.assertEqual(dr.parse_release_summary(body), ("MAJOR", "[MAJOR] Deployment refactor"))

    def test_legacy_title(self):
        self.assertEqual(dr.parse_release_summary("## refactor\nnotes", "[REFACTOR] Old summary", "U1"),
                         ("REFACTOR", "[REFACTOR] Old summary"))
        self.assertEqual(dr.parse_release_summary("notes", "U1", "U1"), ("", ""))
        self.assertEqual(dr.parse_release_summary("notes", "Plain title", "U1"), ("", "Plain title"))

    def test_fenced_code_ignored(self):
        body = "```md\n# [BUG] Example\n```\n# [MAJOR] Real"
        self.assertEqual(dr.parse_release_summary(body), ("MAJOR", "[MAJOR] Real"))

    def test_colors(self):
        names = cfg.SYS_TAGS | set(cfg.CONFIG['status']['discord_aliases'])
        expected = {tag:int(cfg.resolve_status_color(tag)[1:],16) for tag in names}
        self.assertEqual(dr.STATUS_COLORS, expected)
        for status, color in expected.items():
            with self.subTest(status=status):
                self.assertEqual(dr.resolve_embed_color(status.lower()), color)
                release = dr.Release(tag="U1", body=f"# [{status}] Summary")
                self.assertEqual(dr.build_embed(release, dr.Config())["embeds"][0]["color"], color)
        self.assertEqual(dr.resolve_embed_color("UNKNOWN"), dr.DEFAULT_COLOR)
        self.assertEqual(dr.resolve_embed_color(""), dr.DEFAULT_COLOR)


class EmbedTests(unittest.TestCase):
    def setUp(self):
        self.config = dr.Config(repo="owner/repo", site_url="https://example.com", banner_url="https://example.com/og.png")
        self.release = dr.Release(tag="U1.6.3", title="Duplicate title", body="# [MAJOR] Deployment refactor\n## refactor\n1. details", url="https://github.com/owner/repo/releases/tag/U1.6.3", timestamp="2026-11-25T00:00:00Z", author="user", avatar="https://example.com/avatar.png")

    def test_layout(self):
        payload = dr.build_embed(self.release, self.config)
        embed = payload['embeds'][0]
        self.assertEqual(embed['description'], "## [U1.6.3](https://github.com/owner/repo/releases/tag/U1.6.3) RELEASE\n-# owner/repo\n### [MAJOR] Deployment refactor\n[Visit Website ↗](https://example.com/?v=U1.6.3)")
        self.assertEqual(embed['color'], dr.STATUS_COLORS["MAJOR"])
        self.assertEqual(embed['author'], {"name":"user", "icon_url":"https://example.com/avatar.png"})
        self.assertEqual(embed['image']['url'], self.config.banner_url)
        self.assertEqual(embed['footer']['text'], "Version U1.6.3")
        self.assertEqual(embed['timestamp'], self.release.timestamp)
        self.assertEqual(payload['allowed_mentions'], {"parse": []})

    def test_optional_assets(self):
        embed = dr.build_embed(dr.Release(tag="v1"), dr.Config())['embeds'][0]
        self.assertNotIn('image', embed)
        self.assertNotIn('author', embed)
        self.assertNotIn('Visit Website', embed['description'])

    def test_description_limit(self):
        release = dr.Release(tag="v1", body="# [NEW] " + "😀" * 5000)
        desc = dr.build_embed(release, self.config)['embeds'][0]['description']
        self.assertLessEqual(dr.text_length(desc), 4000)
        self.assertTrue(desc.endswith("[Visit Website ↗](https://example.com/?v=v1)"))
        self.assertIn("...\n", desc)

    def test_draft_rejected(self):
        with self.assertRaises(dr.NotificationError):
            dr.build_embed(dr.Release(tag="v1", draft=True), self.config)


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.markdown = self.root / "update.md"
        self.markdown.write_text("# [MAJOR] Refactor\n## refactor\n1. details", encoding="utf-8")
        self.event_path = self.root / "event.json"
        self.event_path.write_text(json.dumps({"release": {"tag_name":"U1", "body":"### [REFACTOR] Old format", "draft":False}}), encoding="utf-8")
        self.summary_path = self.root / "summary.md"

    def invoke(self, argv, env):
        with patch.dict(os.environ, env, clear=True), contextlib.redirect_stdout(io.StringIO()) as out:
            result = dr.main(argv)
        return result, out.getvalue()

    def test_local_preview_never_sends(self):
        with patch.object(dr, 'send_webhook') as send, patch.object(dr, 'fetch_release') as fetch:
            result, output = self.invoke(['--file',str(self.markdown),'--tag','U1','--json'], {"GITHUB_EVENT_NAME":"release","INPUT_SEND":"true","DISCORD_WEBHOOK":"secret"})
            self.assertEqual(result, 0)
            self.assertEqual(json.loads(output)['embeds'][0]['color'], dr.STATUS_COLORS["MAJOR"])
            send.assert_not_called()
            fetch.assert_not_called()

    def test_automatic_event(self):
        with patch.object(dr, 'send_webhook') as send:
            result, _ = self.invoke([], {"GITHUB_EVENT_NAME":"release","GITHUB_EVENT_PATH":str(self.event_path),"DISCORD_WEBHOOK":"secret"})
            self.assertEqual(result, 0)
            send.assert_called_once()
            self.assertEqual(send.call_args.args[0]['embeds'][0]['color'], dr.STATUS_COLORS["REFACTOR"])

    def test_manual_modes(self):
        for mode in ('false','true'):
            with self.subTest(mode=mode), patch.object(dr,'fetch_release',return_value=dr.Release(tag='U1', body='# [NEW] Summary')) as fetch, patch.object(dr,'send_webhook') as send:
                result, _ = self.invoke([], {"GITHUB_EVENT_NAME":"workflow_dispatch","INPUT_TAG":"U1","INPUT_SEND":mode,"GITHUB_STEP_SUMMARY":str(self.summary_path)})
                self.assertEqual(result, 0)
                self.assertEqual(fetch.call_args.args[0].input_tag, 'U1')
                self.assertEqual(send.call_count, int(mode=='true'))
        self.assertIn('僅預覽模式',self.summary_path.read_text(encoding='utf-8'))

    def test_fetch_api_paths(self):
        for tag, suffix in (("", "latest"),("a/b", "tags/a%2Fb")):
            with self.subTest(tag=tag), patch.object(dr.urllib.request,'urlopen') as open_url:
                response = MagicMock()
                response.__enter__.return_value = io.BytesIO(b'{"tag_name":"U1"}')
                open_url.return_value = response
                release = dr.fetch_release(dr.Config(repo='owner/repo',input_tag=tag,token='test'))
                self.assertEqual(release.tag,'U1')
                self.assertTrue(open_url.call_args.args[0].full_url.endswith('/releases/'+suffix))

    def test_manual_preview_override(self):
        with patch.object(dr,'fetch_release',return_value=dr.Release(tag='U1')), patch.object(dr,'send_webhook') as send:
            result, _ = self.invoke(['--preview'], {"GITHUB_EVENT_NAME":"workflow_dispatch","INPUT_SEND":"true"})
            self.assertEqual(result,0)
            send.assert_not_called()


if __name__ == '__main__':
    unittest.main()
