"""Canonical repository paths; no dependency on the working directory."""
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parents[2]
TOOLS_DIR = ROOT_DIR / "tools"
PROJECTS_DIR = ROOT_DIR / "projects"
API_DIR = ROOT_DIR / "api"
LOGS_DIR = ROOT_DIR / "logs"
CACHE_DIR = TOOLS_DIR / ".cache"
CONFIG_DIR = TOOLS_DIR / "config"
INVENTORY_DIR = TOOLS_DIR / "public-site-inventory"
