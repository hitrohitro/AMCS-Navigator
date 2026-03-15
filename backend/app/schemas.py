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
