import sys
import os

# Add backend to path so all imports resolve correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app

# Vercel expects a module-level 'app' (ASGI handler)
# FastAPI is ASGI-compatible — this file is the Vercel entry point
