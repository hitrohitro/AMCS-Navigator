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

export const PERIOD_TIMES = {
  1: '8:30 – 9:20',
  2: '9:20 – 10:10',
  3: '10:30 – 11:20',
  4: '11:20 – 12:10',
  5: '1:40 – 2:30',
  6: '2:30 – 3:20',
  7: '3:30 – 4:20',
  8: '4:20 – 5:10',
}

export const PERIOD_WINDOWS = {
  1: { start: 8 * 60 + 30, end: 9 * 60 + 20 },
  2: { start: 9 * 60 + 20, end: 10 * 60 + 10 },
  3: { start: 10 * 60 + 30, end: 11 * 60 + 20 },
  4: { start: 11 * 60 + 20, end: 12 * 60 + 10 },
  5: { start: 13 * 60 + 40, end: 14 * 60 + 30 },
  6: { start: 14 * 60 + 30, end: 15 * 60 + 20 },
  7: { start: 15 * 60 + 30, end: 16 * 60 + 20 },
  8: { start: 16 * 60 + 20, end: 17 * 60 + 10 },
}

export function formatPeriodTime(periodNumber) {
  const time = PERIOD_TIMES[periodNumber]
  return time ? `Period ${periodNumber} · ${time}` : `Period ${periodNumber}`
}
