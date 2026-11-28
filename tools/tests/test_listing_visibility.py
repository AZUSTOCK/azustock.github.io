"""Regression checks for permission-aware frontend listing and status aggregation."""
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class ListingVisibilityTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which('node'), 'Node.js required for frontend listing test')
    def test_frontend_listing_visibility(self):
        subprocess.run(['node', str(ROOT/'tools/tests/test_listing_visibility.cjs')],
                       cwd=ROOT, check=True, timeout=20)
