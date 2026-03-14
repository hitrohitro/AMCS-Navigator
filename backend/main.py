import os
import json
import re
from collections import deque
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel


load_dotenv()
SUPABASE_URL = (os.getenv('SUPABASE_URL') or '').strip().strip('"')
SUPABASE_KEY = (os.getenv('SUPABASE_KEY') or '').strip().strip('"')

BLOCK_GRAPH = {
	'A': ['B', 'C', 'D'],
	'B': ['A', 'Y'],
	'C': ['A'],
	'D': ['A', 'Y', 'G', 'E'],
	'E': ['D', 'K'],
	'F': ['G', 'T'],
	'G': ['D', 'F', 'I'],
	'H': ['T', 'J'],
	'I': ['G'],
	'J': ['H', 'T'],
	'K': ['E', 'M'],
	'M': ['K'],
	'T': ['F', 'H', 'J'],
	'Y': ['B', 'D'],
}


class RouteResponse(BaseModel):
	source: str
	destination: str
	path_instructions: str
	path_blocks: list[str]
	cached: bool


class LocationResponse(BaseModel):
	id: int
	name: str
	block: str
	floor: str


app = FastAPI(title='AMCS Navigator API', version='0.1.0')

app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		'http://localhost:5173',
		'http://127.0.0.1:5173',
		'http://localhost:5174',
		'http://127.0.0.1:5174',
	],
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*'],
)


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


def normalize_block(block: str) -> str:
	normalized = block.strip().upper()

	if normalized not in BLOCK_GRAPH:
		raise HTTPException(status_code=400, detail=f'Unknown block: {block}')

	return normalized


def normalize_floor(floor: int) -> int:
	if floor < 0 or floor > 4:
		raise HTTPException(status_code=400, detail='Floor must be between 0 and 4.')

	return floor


def floor_label(floor: int) -> str:
	if floor == 0:
		return 'Ground Floor'

	return f'Floor {floor}'


def location_name(block: str, floor: int) -> str:
	return f'{block} Block {floor_label(floor)}'


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
		# Backward-compatible fallback for schemas storing floor labels in name.
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


def bfs_shortest_path(start_block: str, end_block: str) -> list[str]:
	if start_block == end_block:
		return [start_block]

	queue = deque([[start_block]])
	visited = {start_block}

	while queue:
		current_path = queue.popleft()
		current = current_path[-1]

		for neighbor in BLOCK_GRAPH.get(current, []):
			if neighbor in visited:
				continue

			next_path = [*current_path, neighbor]

			if neighbor == end_block:
				return next_path

			visited.add(neighbor)
			queue.append(next_path)

	return []


def build_path_instructions(path_blocks: list[str], source_floor: int, dest_floor: int) -> str:
	if not path_blocks:
		return ''

	parts = [f'{path_blocks[0]}-{source_floor}']
	parts.extend(path_blocks[1:-1])

	if len(path_blocks) > 1:
		parts.append(f'{path_blocks[-1]}-{dest_floor}')

	return ' -> '.join(parts)


def path_blocks_from_instructions(path_instructions: str) -> list[str]:
	blocks: list[str] = []
	for match in re.findall(r'[A-Za-z]+', path_instructions):
		block = match.upper()
		if block in BLOCK_GRAPH:
			if not blocks or blocks[-1] != block:
				blocks.append(block)

	return blocks


@app.get('/health')
def health() -> dict[str, str]:
	return {'status': 'ok'}


@app.get('/api/locations', response_model=list[LocationResponse])
def get_locations() -> list[LocationResponse]:
	rows = supabase_get(
		'locations',
		{
			'select': 'id,name,block,floor',
			'order': 'block.asc,floor.asc',
		},
	)

	return [LocationResponse(**row) for row in rows]


@app.get('/api/path', response_model=RouteResponse)
def get_path(
	source_block: str = Query(..., description='Source block code, e.g. J'),
	source_floor: int = Query(..., description='Source floor, 0 to 4'),
	dest_block: str = Query(..., description='Destination block code, e.g. M'),
	dest_floor: int = Query(..., description='Destination floor, 0 to 4'),
) -> RouteResponse:
	source_block = normalize_block(source_block)
	dest_block = normalize_block(dest_block)
	source_floor = normalize_floor(source_floor)
	dest_floor = normalize_floor(dest_floor)
	source_name = location_name(source_block, source_floor)
	destination_name = location_name(dest_block, dest_floor)

	source_id = get_location_id(source_block, source_floor)
	dest_id = get_location_id(dest_block, dest_floor)
	existing: dict | None = None

	if source_id is not None and dest_id is not None:
		rows = supabase_get(
			'paths',
			{
				'select': 'path_instructions',
				'source_id': f'eq.{source_id}',
				'dest_id': f'eq.{dest_id}',
				'limit': '1',
			},
		)
		existing = rows[0] if rows else None

	if existing:
		path_instructions = str(existing['path_instructions'])
		path_blocks = path_blocks_from_instructions(path_instructions)
		return RouteResponse(
			source=source_name,
			destination=destination_name,
			path_instructions=path_instructions,
			path_blocks=path_blocks,
			cached=True,
		)

	shortest_blocks = bfs_shortest_path(source_block, dest_block)

	if not shortest_blocks:
		raise HTTPException(status_code=404, detail='No path found between blocks.')

	path_instructions = build_path_instructions(
		shortest_blocks,
		source_floor,
		dest_floor,
	)

	return RouteResponse(
		source=source_name,
		destination=destination_name,
		path_instructions=path_instructions,
		path_blocks=shortest_blocks,
		cached=False,
	)
