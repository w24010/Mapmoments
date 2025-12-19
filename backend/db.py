import os
from pathlib import Path
from urllib.parse import urlsplit

from dotenv import load_dotenv
from pymongo import MongoClient


ROOT_DIR = Path(__file__).resolve().parent
# Load backend/.env for local scripts (server.py does the same).
load_dotenv(ROOT_DIR / ".env")


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(
            f"{name} environment variable is required. "
            "Set it in your deployment environment and in local .env files."
        )
    return value


# Prefer the same env var your FastAPI app already uses.
# Example:
#   MONGO_URL="mongodb+srv://w24010_db_user:<password>@cluster0.dqlln5g.mongodb.net/?retryWrites=true&w=majority"
MONGO_URL = os.environ.get("MONGO_URL") or os.environ.get("MONGO_URI") or _require_env("MONGO_URL")

DB_NAME = os.environ.get("DB_NAME")
if not DB_NAME:
    try:
        parsed = urlsplit(MONGO_URL)
        inferred = (parsed.path or "").lstrip("/")
        DB_NAME = inferred or "mapmoments"
    except Exception:
        DB_NAME = "mapmoments"


client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000, tls=True)

db = client[DB_NAME]
