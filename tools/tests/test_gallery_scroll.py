"""Regression checks for gallery layout and container-only horizontal scroll."""
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class GalleryScrollTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node.js required for frontend gallery test')
    def test_frontend_gallery_scroll(self):
        subprocess.run(['node', str(ROOT / 'tools/tests/test_gallery_scroll.cjs')],
                       cwd=ROOT, check=True, timeout=20)
