import os

from dotenv import load_dotenv

load_dotenv()

APP_TITLE = 'AMCS Navigator API'
APP_VERSION = '0.1.0'

SUPABASE_URL = (os.getenv('SUPABASE_URL') or '').strip().strip('"')
SUPABASE_KEY = (os.getenv('SUPABASE_KEY') or '').strip().strip('"')

_DEFAULT_CORS_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]


def _parse_csv_env(name: str) -> list[str]:
    raw = (os.getenv(name) or '').strip()
    if not raw:
        return []
    return [item.strip() for item in raw.split(',') if item.strip()]


CORS_ORIGINS = _parse_csv_env('CORS_ORIGINS') or _DEFAULT_CORS_ORIGINS
CORS_ORIGIN_REGEX = (os.getenv('CORS_ORIGIN_REGEX') or r'^https://.*\.vercel\.app$').strip()
