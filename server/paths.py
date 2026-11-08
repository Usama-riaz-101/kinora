import os
from pathlib import Path


def outputs_root() -> Path:
    """Local disk in development. /tmp on Vercel, where the project directory is read-only."""
    root = Path("/tmp/outputs") if os.environ.get("VERCEL") else Path("outputs")
    root.mkdir(parents=True, exist_ok=True)
    return root
