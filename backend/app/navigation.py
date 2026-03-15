import re
from collections import deque

from fastapi import HTTPException

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
