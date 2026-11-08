"""Vercel looks for a module-level FastAPI `app`. The server itself lives in api.py."""

from api import app

__all__ = ["app"]
