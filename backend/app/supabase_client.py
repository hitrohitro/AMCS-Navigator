import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException

from app.config import SUPABASE_KEY, SUPABASE_URL
from app.navigation import location_name


def supabase_get(table: str, params: dict[str, str]) -> list[dict]:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError('Missing SUPABASE_URL or SUPABASE_KEY.')

    base_url = SUPABASE_URL.rstrip('/')
    query = urlencode(params)
    url = f'{base_url}/rest/v1/{table}?{query}'

    request = Request(
        url,
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Accept': 'application/json',
        },
    )

    try:
        with urlopen(request, timeout=12) as response:
            payload = response.read().decode('utf-8')
            data = json.loads(payload) if payload else []
            if isinstance(data, list):
                return data
            return []
    except HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='ignore')
        raise HTTPException(status_code=502, detail=f'Supabase request failed: {detail or exc.reason}')
    except URLError as exc:
        raise HTTPException(status_code=502, detail=f'Supabase unreachable: {exc.reason}')


def get_location_id(block: str, floor: int) -> int | None:
    rows = supabase_get(
        'locations',
        {
            'select': 'id',
            'block': f'eq.{block}',
            'floor': f'eq.{floor}',
            'limit': '1',
        },
    )

    if not rows:
        loc_name = location_name(block, floor)
        rows = supabase_get(
            'locations',
            {
                'select': 'id',
                'name': f'eq.{loc_name}',
                'limit': '1',
            },
        )

    if not rows:
        return None

    return int(rows[0]['id'])
