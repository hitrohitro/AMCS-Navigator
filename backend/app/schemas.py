from pydantic import BaseModel


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


class SemesterOption(BaseModel):
    id: int
    academic_year: str
    term: str
    is_active: bool = False
    semester_number: int | None = None
    semester_label: str | None = None


class TimetableOptionsResponse(BaseModel):
    semesters: list[SemesterOption]
    programmes: list[str]
    active_semester: SemesterOption | None = None


class TimetableEntryResponse(BaseModel):
    id: int
    day_of_week: str
    period_number: int
    course_code: str | None = None
    course_name: str | None = None
    room_id: int | None = None
    room_name: str | None = None
    map_node: str | None = None


class TimetableResponse(BaseModel):
    programme: str | None = None
    semester: int
    timetable: list[TimetableEntryResponse]
