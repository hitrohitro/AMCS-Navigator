const GRID_COLS = 15
const GRID_ROWS = 11

export function edgeKey(a, b) {
  return [a, b].sort().join('|')
}

export function parseRouteNodes(pathInstructions) {
  const matches = [...pathInstructions.matchAll(/([A-Za-z])\s*-?\s*([0-4])/g)]
  const nodes = []

  for (const match of matches) {
    const block = String(match[1]).toUpperCase()
    const floor = Number(match[2])
    nodes.push({
      key: `${block}${floor}`,
      block,
      floor,
    })
  }

  return nodes
}

export function toCellCenterPercent(col, row) {
  return {
    x: ((col - 0.5) / GRID_COLS) * 100,
    y: ((row - 0.5) / GRID_ROWS) * 100,
  }
}

export function blockCenterCell(block) {
  const col = Math.round(block.column + (block.width - 1) / 2)
  const row = Math.round(block.row + (block.height - 1) / 2)
  return { col, row }
}

export function segmentCacheKey(fromBlockId, toBlockId) {
  return `${fromBlockId}->${toBlockId}`
}

export function formatTime(date) {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
