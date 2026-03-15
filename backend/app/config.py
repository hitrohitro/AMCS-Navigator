import os

from dotenv import load_dotenv

load_dotenv()

APP_TITLE = 'AMCS Navigator API'
APP_VERSION = '0.1.0'

SUPABASE_URL = (os.getenv('SUPABASE_URL') or '').strip().strip('"')
SUPABASE_KEY = (os.getenv('SUPABASE_KEY') or '').strip().strip('"')

CORS_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]
