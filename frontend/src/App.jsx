import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { SEGMENT_PATH_CACHE } from './data/lineGeometryStore'
import OverviewPanel from './components/OverviewPanel'
import TimetablePanel from './components/TimetablePanel'
import {
  blockLayouts,
  externalLinks,
  horizontalBridges,
  timetable,
} from './data/campusData'
import { fetchRouteFromApi } from './lib/api'
import { edgeKey, formatTime, parseRouteNodes } from './lib/routeRuntime'

const BRIDGE_EDGE_SET = new Set(
  horizontalBridges.map(([a, b]) => edgeKey(a, b)),
)

const GRID_COLS = 15
const GRID_ROWS = 11

const ROUTE_CORNER_RADIUS = 1.05

function toCellCenterPercent(col, row) {
  return {
    x: ((col - 0.5) / GRID_COLS) * 100,
    y: ((row - 0.5) / GRID_ROWS) * 100,
  }
}

function blockCenterCell(block) {
  const col = Math.round(block.column + (block.width - 1) / 2)
  const row = Math.round(block.row + (block.height - 1) / 2)
  return { col, row }
}

function pathDataFromPoints(points) {
  if (points.length === 0) {
    return ''
  }

  if (points.length === 1) {
    const p = points[0]
    return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
  }

  if (points.length === 2) {
    const [first, second] = points
    return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} L ${second.x.toFixed(2)} ${second.y.toFixed(2)}`
  }

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`

  for (let index = 1; index < points.length - 1; index += 1) {
    const prev = points[index - 1]
    const current = points[index]
    const next = points[index + 1]

    const inDx = current.x - prev.x
    const inDy = current.y - prev.y
    const outDx = next.x - current.x
    const outDy = next.y - current.y

    const inLength = Math.hypot(inDx, inDy)
    const outLength = Math.hypot(outDx, outDy)

    if (inLength === 0 || outLength === 0) {
      continue
    }

    const inUx = inDx / inLength
    const inUy = inDy / inLength
    const outUx = outDx / outLength
    const outUy = outDy / outLength

    const dot = inUx * outUx + inUy * outUy
    const isStraight = Math.abs(dot) > 0.999

    if (isStraight) {
      path += ` L ${current.x.toFixed(2)} ${current.y.toFixed(2)}`
      continue
    }

    const cornerRadius = Math.min(ROUTE_CORNER_RADIUS, inLength / 2, outLength / 2)
    const entryX = current.x - inUx * cornerRadius
    const entryY = current.y - inUy * cornerRadius
    const exitX = current.x + outUx * cornerRadius
    const exitY = current.y + outUy * cornerRadius

    path += ` L ${entryX.toFixed(2)} ${entryY.toFixed(2)}`
    path += ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)} ${exitX.toFixed(2)} ${exitY.toFixed(2)}`
  }

  const last = points[points.length - 1]
  path += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`
  return path
}

function segmentCacheKey(fromBlockId, toBlockId) {
  return `${fromBlockId}->${toBlockId}`
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('amcs-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [activeView, setActiveView] = useState('overview')
  const [selectedBlock, setSelectedBlock] = useState('J')
  const [selectionPhase, setSelectionPhase] = useState('select-start')
  const [pendingSelection, setPendingSelection] = useState({ block: 'J', floor: 0 })
  const [hasClickedBlock, setHasClickedBlock] = useState(false)
  const [startSelection, setStartSelection] = useState(null)
  const [destinationSelection, setDestinationSelection] = useState(null)
  const [shortestPathBlocks, setShortestPathBlocks] = useState([])
  const [pathInstructions, setPathInstructions] = useState('')
  const [routeError, setRouteError] = useState('')
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const [clock, setClock] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(formatTime(new Date()))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('amcs-theme', theme)
  }, [theme])

  const handleBlockClick = (blockId) => {
    setSelectedBlock(blockId)
    setHasClickedBlock(true)
    setPendingSelection((current) => {
      if (current.block === blockId) {
        return { block: blockId, floor: (current.floor + 1) % 5 }
      }

      return { block: blockId, floor: 0 }
    })
  }

  const confirmSelection = async () => {
    if (selectionPhase === 'select-start') {
      setStartSelection(pendingSelection)
      setDestinationSelection(null)
      setShortestPathBlocks([])
      setPathInstructions('')
      setRouteError('')
      setSelectionPhase('select-destination')
      return
    }

    if (selectionPhase === 'select-destination') {
      if (!startSelection) {
        return
      }

      const selectedDestination = pendingSelection
      setDestinationSelection(selectedDestination)
      setSelectionPhase('route-ready')

      setIsRouteLoading(true)
      setRouteError('')

      try {
        const routeData = await fetchRouteFromApi(startSelection, selectedDestination)
        setShortestPathBlocks(routeData.path_blocks ?? [])
        setPathInstructions(routeData.path_instructions ?? '')
      } catch (error) {
        setShortestPathBlocks([])
        setPathInstructions('')
        setRouteError(error instanceof Error ? error.message : 'Unexpected route error.')
      } finally {
        setIsRouteLoading(false)
      }
    }
  }

  const resetSelectionFlow = () => {
    setSelectionPhase('select-start')
    setStartSelection(null)
    setDestinationSelection(null)
    setHasClickedBlock(false)
    setShortestPathBlocks([])
    setPathInstructions('')
    setRouteError('')
    setIsRouteLoading(false)
    setPendingSelection({ block: selectedBlock, floor: 0 })
  }

  const hasConfirmedRoute = Boolean(startSelection && destinationSelection)
  const textualPath = hasConfirmedRoute
    ? pathInstructions || 'No route instructions available yet.'
    : 'Path is shown after confirming both start and destination.'

  const selectionPrompt =
    selectionPhase === 'select-start'
      ? 'Step 1: Select start block and floor, then confirm.'
      : selectionPhase === 'select-destination'
        ? 'Step 2: Select destination block and floor, then confirm.'
        : isRouteLoading
          ? 'Fetching shortest path from backend...'
          : routeError
            ? `Route error: ${routeError}`
            : 'Route ready. You can reset and pick another path.'

  const routeSummary =
    hasConfirmedRoute
      ? `${startSelection.block} - ${startSelection.floor} to ${destinationSelection.block} - ${destinationSelection.floor}`
      : `${pendingSelection.block} - ${pendingSelection.floor}`

  const blockById = useMemo(
    () => Object.fromEntries(blockLayouts.map((block) => [block.id, block])),
    [],
  )

  const segmentPathCache = SEGMENT_PATH_CACHE

  const routeNodes = useMemo(() => {
    const explicitNodes = parseRouteNodes(pathInstructions || '')

    if (explicitNodes.length > 0) {
      return explicitNodes
    }

    if (!hasConfirmedRoute) {
      return []
    }

    const blocks = shortestPathBlocks.length > 0
      ? shortestPathBlocks
      : [startSelection.block, destinationSelection.block]

    return blocks.map((block, index) => ({
      key: `${block}${index === 0 ? startSelection.floor : index === blocks.length - 1 ? destinationSelection.floor : startSelection.floor}`,
      block,
      floor: index === 0 ? startSelection.floor : index === blocks.length - 1 ? destinationSelection.floor : startSelection.floor,
    }))
  }, [pathInstructions, hasConfirmedRoute, shortestPathBlocks, startSelection, destinationSelection])

  const routeSegments = useMemo(() => {
    if (!hasConfirmedRoute || routeNodes.length < 2) {
      return []
    }

    const segments = []

    for (let index = 0; index < routeNodes.length - 1; index += 1) {
      const from = routeNodes[index]
      const to = routeNodes[index + 1]
      const fromBlock = blockById[from.block]
      const toBlock = blockById[to.block]

      if (!fromBlock || !toBlock || from.block === to.block) {
        continue
      }

      const fromCenterCell = blockCenterCell(fromBlock)
      const toCenterCell = blockCenterCell(toBlock)
      const pathD =
        segmentPathCache[segmentCacheKey(from.block, to.block)] ||
        pathDataFromPoints([
          toCellCenterPercent(fromCenterCell.col, fromCenterCell.row),
          toCellCenterPercent(toCenterCell.col, toCenterCell.row),
        ])

      let kind = 'general'

      if (from.floor === 0 && to.floor === 0) {
        kind = 'ground'
      } else if (
        from.floor > 0 &&
        to.floor > 0 &&
        from.floor === to.floor &&
        BRIDGE_EDGE_SET.has(edgeKey(from.key, to.key))
      ) {
        kind = 'bridge'
      }

      segments.push({
        id: `segment-${index}`,
        from,
        to,
        kind,
        pathD,
      })
    }

    return segments
  }, [hasConfirmedRoute, routeNodes, blockById, segmentPathCache])

  const shouldRenderPathConnections = hasConfirmedRoute && routeSegments.length > 0

  const todayName = "Saturday"
  const todaySchedule = timetable.find((day) => day.day === todayName)

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <nav className="top-nav" aria-label="Primary navigation">
          <button
            type="button"
            className="nav-chip nav-chip--theme"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
          {externalLinks.map((link) => (
            <a
              key={link.id}
              className="nav-chip nav-chip--ext"
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hero-copy">
          <h1>AMCS Navigator</h1>
          <p className="hero-text">
            Select block and floor in two steps. First confirm the start point, then
            confirm the destination to render the shortest dummy path with text output.
          </p>
          <div className="hero-meta">
            <div>
              <span className="meta-label">Live time</span>
              <strong>{clock}</strong>
            </div>
            <div>
              <span className="meta-label">Selection</span>
              <strong>{routeSummary}</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="content-grid">
        {activeView === 'overview' ? (
          <OverviewPanel
            selectionPrompt={selectionPrompt}
            pendingSelection={pendingSelection}
            setPendingSelection={setPendingSelection}
            confirmSelection={confirmSelection}
            selectionPhase={selectionPhase}
            isRouteLoading={isRouteLoading}
            resetSelectionFlow={resetSelectionFlow}
            shouldRenderPathConnections={shouldRenderPathConnections}
            routeSegments={routeSegments}
            routeNodes={routeNodes}
            blockById={blockById}
            shortestPathBlocks={shortestPathBlocks}
            startSelection={startSelection}
            destinationSelection={destinationSelection}
            hasConfirmedRoute={hasConfirmedRoute}
            hasClickedBlock={hasClickedBlock}
            selectedBlock={selectedBlock}
            handleBlockClick={handleBlockClick}
            textualPath={textualPath}
            routeError={routeError}
            pathInstructions={pathInstructions}
            todaySchedule={todaySchedule}
          />
        ) : activeView === 'timetable' ? (
          <TimetablePanel
            timetable={timetable}
            onBackToMap={() => setActiveView('overview')}
          />
        ) : null}
      </main>
      <footer className="bottom-bar" aria-label="Quick links">
        {externalLinks.map((link) => (
          <a
            key={link.id}
            className="bottom-bar-chip"
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {link.label}
          </a>
        ))}
      </footer>
    </div>
  )
}

export default App
