from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.config import APP_TITLE, APP_VERSION, CORS_ORIGINS, CORS_ORIGIN_REGEX
from app.navigation import (
	bfs_shortest_path,
	build_path_instructions,
	location_name,
	normalize_block,
	normalize_floor,
	path_blocks_from_instructions,
)
from app.schemas import (
	LocationResponse,
	RouteResponse,
	SemesterOption,
	TimetableEntryResponse,
	TimetableOptionsResponse,
	TimetableResponse,
)
from app.supabase_client import get_location_id, supabase_get


app = FastAPI(title=APP_TITLE, version=APP_VERSION)

DAY_ORDER = {
	'MON': 0,
	'TUE': 1,
	'WED': 2,
	'THU': 3,
	'FRI': 4,
	'SAT': 5,
	'SUN': 6,
}

TERM_ORDER = {
	'ODD': 0,
	'EVEN': 1,
}


def _ordinal(value: int) -> str:
	if 10 <= value % 100 <= 20:
		suffix = 'th'
	else:
		suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(value % 10, 'th')
	return f'{value}{suffix} sem'


def _normalize_term(term: str) -> str:
	normalized = term.strip().upper()
	if normalized not in {'ODD', 'EVEN'}:
		raise HTTPException(status_code=400, detail='Term must be ODD or EVEN.')
	return normalized


def _normalize_day(day_of_week: str) -> str:
	normalized = day_of_week.strip().upper()
	if normalized not in DAY_ORDER:
		raise HTTPException(status_code=400, detail='day_of_week must be one of MON,TUE,WED,THU,FRI,SAT,SUN.')
	return normalized


def _load_semesters() -> list[dict]:
	return supabase_get(
		'semesters',
		{
			'select': 'id,academic_year,term,is_active,semester_number',
			'order': 'academic_year.asc,term.asc',
		},
	)


def _semester_sort_key(semester: dict) -> tuple[int, int]:
	academic_year = str(semester.get('academic_year', '0-0'))
	start_year_text = academic_year.split('-')[0].strip()
	try:
		start_year = int(start_year_text)
	except ValueError:
		start_year = 0

	term = str(semester.get('term', '')).upper()
	return (start_year, TERM_ORDER.get(term, 99))


def _all_programmes() -> list[str]:
	rows = supabase_get(
		'timetable',
		{
			'select': 'programme',
			'order': 'programme.asc',
		},
	)

	return sorted(
		{
			str(row.get('programme')).strip()
			for row in rows
			if row.get('programme') and str(row.get('programme')).strip()
		}
	)


def _build_semester_options(
	all_semesters: list[dict],
	programme: str | None,
) -> list[SemesterOption]:
	if not programme:
		return []

	programme_rows = supabase_get(
		'timetable',
		{
			'select': 'semester_id',
			'programme': f'eq.{programme}',
		},
	)
	semester_ids = {int(row['semester_id']) for row in programme_rows if row.get('semester_id') is not None}

	filtered = [semester for semester in all_semesters if int(semester.get('id')) in semester_ids]
	filtered.sort(key=_semester_sort_key)

	semester_options: list[SemesterOption] = []
	for index, semester in enumerate(filtered, start=1):
		db_sem_num = semester.get('semester_number')
		sem_num = int(db_sem_num) if db_sem_num is not None else index
		semester_options.append(
			SemesterOption(
				id=int(semester['id']),
				academic_year=str(semester['academic_year']),
				term=str(semester['term']).upper(),
				is_active=bool(semester.get('is_active')),
				semester_number=sem_num,
				semester_label=_ordinal(sem_num),
			)
		)

	return semester_options


def _pick_semester(semesters: list[dict], academic_year: str | None, term: str | None) -> dict:
	if bool(academic_year) ^ bool(term):
		raise HTTPException(status_code=400, detail='Provide both academic_year and term together.')

	if academic_year and term:
		normalized_term = _normalize_term(term)
		for semester in semesters:
			if semester.get('academic_year') == academic_year and str(semester.get('term', '')).upper() == normalized_term:
				return semester
		raise HTTPException(status_code=404, detail='Requested semester was not found.')

	active = next((semester for semester in semesters if semester.get('is_active')), None)
	if active:
		return active

	if semesters:
		return semesters[0]

	raise HTTPException(status_code=404, detail='No semesters are available.')

app.add_middleware(
	CORSMiddleware,
	allow_origins=CORS_ORIGINS,
	allow_origin_regex=CORS_ORIGIN_REGEX,
	allow_credentials=True,
	allow_methods=['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	allow_headers=['*'],
)

app.add_middleware(GZipMiddleware, minimum_size=1024)


@app.api_route('/health', methods=['GET', 'HEAD'])
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


@app.get('/api/timetable/options', response_model=TimetableOptionsResponse)
def get_timetable_options(
	programme: str | None = Query(default=None),
	academic_year: str | None = Query(default=None),
	term: str | None = Query(default=None),
) -> TimetableOptionsResponse:
	normalized_programme = programme.strip() if programme else None
	semesters = _load_semesters()
	programmes = _all_programmes()
	semester_options = _build_semester_options(semesters, normalized_programme)

	active_semester = None
	if semester_options:
		if academic_year and term:
			normalized_term = _normalize_term(term)
			active_semester = next(
				(
					semester
					for semester in semester_options
					if semester.academic_year == academic_year and semester.term == normalized_term
				),
				None,
			)
		if active_semester is None:
			active_semester = next((semester for semester in semester_options if semester.is_active), None)
		if active_semester is None:
			active_semester = semester_options[-1]

	return TimetableOptionsResponse(
		semesters=semester_options,
		programmes=programmes,
		active_semester=active_semester,
	)


@app.get('/api/timetable', response_model=TimetableResponse)
def get_timetable(
	semester_id: int | None = Query(default=None),
	academic_year: str | None = Query(default=None),
	term: str | None = Query(default=None),
	programme: str | None = Query(default=None),
	day_of_week: str | None = Query(default=None),
) -> TimetableResponse:
	semesters = _load_semesters()
	if semester_id is not None:
		selected_semester = next(
			(s for s in semesters if int(s['id']) == semester_id),
			None,
		)
		if not selected_semester:
			raise HTTPException(status_code=404, detail='Semester not found.')
	else:
		selected_semester = _pick_semester(semesters, academic_year, term)
	normalized_programme = programme.strip() if programme else None
	normalized_day = _normalize_day(day_of_week) if day_of_week else None

	rows = supabase_get(
		'timetable',
		{
			'select': 'id,semester_id,programme,day_of_week,period_number,course_code,room_id',
			'semester_id': f"eq.{selected_semester['id']}",
			'order': 'day_of_week.asc,period_number.asc',
		},
	)

	if normalized_programme:
		rows = [row for row in rows if str(row.get('programme') or '').strip() == normalized_programme]

	if normalized_day:
		rows = [row for row in rows if str(row.get('day_of_week', '')).upper() == normalized_day]

	room_ids = sorted({int(row['room_id']) for row in rows if row.get('room_id') is not None})
	room_lookup: dict[int, dict] = {}

	if room_ids:
		room_rows = supabase_get(
			'rooms',
			{
				'select': 'id,room_name,map_node',
				'id': f"in.({','.join(str(room_id) for room_id in room_ids)})",
			},
		)
		room_lookup = {int(room['id']): room for room in room_rows}

	entries: list[TimetableEntryResponse] = []
	for row in rows:
		room_id = int(row['room_id']) if row.get('room_id') is not None else None
		room = room_lookup.get(room_id) if room_id is not None else None
		entries.append(
			TimetableEntryResponse(
				id=int(row['id']),
				semester_id=int(row['semester_id']),
				programme=str(row.get('programme')).strip() if row.get('programme') else None,
				day_of_week=str(row.get('day_of_week', '')).upper(),
				period_number=int(row.get('period_number') or 0),
				course_code=str(row.get('course_code')).strip() if row.get('course_code') else None,
				room_id=room_id,
				room_name=str(room.get('room_name')).strip() if room and room.get('room_name') else None,
				map_node=str(room.get('map_node')).strip() if room and room.get('map_node') else None,
			)
		)

	entries.sort(
		key=lambda item: (
			DAY_ORDER.get(item.day_of_week, 99),
			item.period_number,
		),
	)

	return TimetableResponse(
		academic_year=str(selected_semester['academic_year']),
		term=str(selected_semester['term']).upper(),
		programme=normalized_programme,
		day_of_week=normalized_day,
		entries=entries,
	)
