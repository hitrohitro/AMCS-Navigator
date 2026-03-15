from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_TITLE, APP_VERSION, CORS_ORIGINS
from app.navigation import (
	bfs_shortest_path,
	build_path_instructions,
	location_name,
	normalize_block,
	normalize_floor,
	path_blocks_from_instructions,
)
from app.schemas import LocationResponse, RouteResponse
from app.supabase_client import get_location_id, supabase_get


app = FastAPI(title=APP_TITLE, version=APP_VERSION)

app.add_middleware(
	CORSMiddleware,
	allow_origins=CORS_ORIGINS,
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*'],
)


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
