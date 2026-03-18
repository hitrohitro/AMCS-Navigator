import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './App.css'
import { SEGMENT_PATH_CACHE } from './data/lineGeometryStore'
import OverviewPanel from './components/OverviewPanel'
import TimetablePanel from './components/TimetablePanel'
import HelpPage from './components/HelpPage'
import {
  BLOCK_MAX_FLOOR,
  blockLayouts,
  externalLinks,
  horizontalBridges,
} from './data/campusData'
import {
  fetchRouteFromApi,
  fetchTimetableFromApi,
  fetchTimetableOptions,
} from './lib/api'
import { PERIOD_TIMES, PERIOD_WINDOWS, edgeKey, formatPeriodTime, formatTime, parseRouteNodes } from './lib/routeRuntime'

const BRIDGE_EDGE_SET = new Set(
  horizontalBridges.map(([a, b]) => edgeKey(a, b)),
)

const GRID_COLS = 15
const GRID_ROWS = 11

const ROUTE_CORNER_RADIUS = 1.05
const SELECTABLE_BLOCK_IDS = new Set(
  blockLayouts.filter((block) => block.tone === 'accent').map((block) => block.id),
)
const JS_DAY_TO_CODE = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DAY_LABEL_BY_CODE = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
}
const PERIOD_SEQUENCE = Object.keys(PERIOD_TIMES)
  .map(Number)
  .sort((a, b) => a - b)
const SMART_MODE_OPTIONS = [
  { value: 'previous', label: 'Previous' },
  { value: 'current', label: 'Current' },
  { value: 'next', label: 'Next' },
]
const ARRIVAL_BUFFER_MINUTES = 12

function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes()
}

function parseDestinationFromEntry(entry) {
  const candidates = [entry?.map_node, entry?.room_name]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const match = String(candidate).toUpperCase().match(/\b([A-Z])\s*[- ]?\s*([0-4])\b/)
    if (match) {
      return {
        block: match[1],
        floor: Number(match[2]),
      }
    }
  }

  return null
}

function programmeShortLabel(programmeName) {
  const normalized = String(programmeName || '')
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/\s+/g, ' ')
    .trim()

  if (normalized.includes('THEORETICAL COMPUTER SCIENCE')) {
    return 'TCS'
  }

  if (normalized.includes('SOFTWARE SYSTEMS')) {
    return 'SS'
  }

  if (normalized.includes('CYBER SECURITY')) {
    return 'CS'
  }

  if (normalized.includes('DATA SCIENCE')) {
    return 'DS'
  }

  if (normalized.includes('APPLIED MATHEMATICS')) {
    return 'AM'
  }

  if (normalized.includes('COMPUTER SYSTEMS') && normalized.includes('DESIGN')) {
    return 'CSD'
  }

  return normalized
}

function FilterDropdown({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 })

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setMenuPosition({ top: rect.bottom + 8, left: rect.left, width: rect.width })
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    updatePosition()

    const handlePointerDown = (event) => {
      const insideContainer = containerRef.current?.contains(event.target)
      const insideMenu = menuRef.current?.contains(event.target)
      if (!insideContainer && !insideMenu) {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, updatePosition])

  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = selectedOption?.label ?? placeholder

  const handlePick = (nextValue) => {
    onChange(nextValue)
    setIsOpen(false)
  }

  return (
    <label className={`filter-field ${disabled ? 'is-disabled' : ''}`}>
      <span className="meta-label">{label}</span>
      <div
        ref={containerRef}
        className={`timetable-select-shell ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
      >
        <button
          ref={triggerRef}
          type="button"
          className="timetable-select-trigger"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={label}
        >
          <span className={`timetable-select-value ${selectedOption ? 'is-selected' : ''}`}>{displayLabel}</span>
          <span className="timetable-select-caret" aria-hidden="true">⌄</span>
        </button>

        {isOpen && !disabled
          ? createPortal(
              <div
                ref={menuRef}
                className="timetable-select-menu"
                role="listbox"
                aria-label={`${label} options`}
                style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }}
              >
                <button
                  type="button"
                  className={`timetable-select-option ${value === '' ? 'is-selected' : ''}`}
                  onClick={() => handlePick('')}
                >
                  {placeholder}
                </button>
                {options.map((option) => (
                  <button
                    key={`${label}-${option.value}`}
                    type="button"
                    className={`timetable-select-option ${value === option.value ? 'is-selected' : ''}`}
                    onClick={() => handlePick(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>,
              document.body,
            )
          : null}
      </div>
    </label>
  )
}

function getCurrentDayCode() {
  return JS_DAY_TO_CODE[new Date().getDay()]
}

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
  const [timetableOptions, setTimetableOptions] = useState({
    semesters: [],
    programmes: [],
    active_semester: null,
  })
  const [timetableFilters, setTimetableFilters] = useState({
    semesterId: '',
    programme: '',
  })
  const [timetableSummary, setTimetableSummary] = useState({
    academicYear: '',
    term: '',
  })
  const [timetableEntries, setTimetableEntries] = useState([])
  const [timetableError, setTimetableError] = useState('')
  const [isTimetableLoading, setIsTimetableLoading] = useState(false)
  const [isTimetableLoaded, setIsTimetableLoaded] = useState(false)
  const [smartMode, setSmartMode] = useState('current')
  const [smartPeriodIndex, setSmartPeriodIndex] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const programmeRequestRef = useRef(null)

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

  const loadTimetable = async (filters) => {
    if (!filters.programme) {
      setTimetableEntries([])
      setTimetableError('Select a programme first.')
      setIsTimetableLoaded(false)
      setSmartPeriodIndex(null)
      return
    }

    if (!filters.semesterId) {
      setTimetableEntries([])
      setTimetableError('Select a semester after choosing programme.')
      setIsTimetableLoaded(false)
      setSmartPeriodIndex(null)
      return
    }

    setIsTimetableLoading(true)
    setTimetableError('')

    try {
      const timetableData = await fetchTimetableFromApi(filters)
      setTimetableEntries(timetableData.entries ?? [])
      setTimetableSummary({
        academicYear: timetableData.academic_year,
        term: timetableData.term,
      })
      setIsTimetableLoaded(true)
      setSmartPeriodIndex(null)
    } catch (error) {
      setTimetableEntries([])
      setTimetableError(error instanceof Error ? error.message : 'Unable to fetch timetable.')
      setIsTimetableLoaded(false)
      setSmartPeriodIndex(null)
    } finally {
      setIsTimetableLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function initializeTimetable() {
      try {
        const options = await fetchTimetableOptions()
        if (cancelled) {
          return
        }

        setTimetableOptions((current) => ({
          ...current,
          programmes: options.programmes ?? [],
          semesters: [],
          active_semester: null,
        }))
      } catch (error) {
        if (!cancelled) {
          setTimetableEntries([])
          setTimetableError(error instanceof Error ? error.message : 'Unable to fetch timetable options.')
        }
      }
    }

    initializeTimetable()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSemesterChange = (value) => {
    if (!value) {
      setTimetableFilters((current) => ({ ...current, semesterId: '' }))
      setIsTimetableLoaded(false)
      setSmartPeriodIndex(null)
      return
    }

    setTimetableFilters((current) => ({ ...current, semesterId: value }))
    setTimetableError('')
    setIsTimetableLoaded(false)
    setSmartPeriodIndex(null)
  }

  const handleProgrammeChange = async (programme) => {
    programmeRequestRef.current = programme

    setTimetableEntries([])
    setIsTimetableLoaded(false)
    setSmartPeriodIndex(null)
    setTimetableSummary({ academicYear: '', term: '' })

    if (!programme) {
      setTimetableFilters({
        programme: '',
        semesterId: '',
      })
      setTimetableOptions((current) => ({
        ...current,
        semesters: [],
        active_semester: null,
      }))
      setTimetableError('')
      return
    }

    setIsTimetableLoading(true)

    try {
      const refreshedOptions = await fetchTimetableOptions({ programme })
      const semester = refreshedOptions.active_semester ?? refreshedOptions.semesters?.[0] ?? null

      if (programmeRequestRef.current !== programme) {
        return
      }

      setTimetableOptions((current) => ({
        ...current,
        semesters: refreshedOptions.semesters ?? [],
        active_semester: semester,
      }))

      setTimetableFilters({
        programme,
        semesterId: semester ? String(semester.id) : '',
      })
      setTimetableError('')
    } catch (error) {
      setTimetableFilters({
        programme,
        semesterId: '',
      })
      setTimetableOptions((current) => ({
        ...current,
        semesters: [],
        active_semester: null,
      }))
      setTimetableError(error instanceof Error ? error.message : 'Unable to load semesters for programme.')
    } finally {
      setIsTimetableLoading(false)
    }

  }

  const handleLoadTimetable = async () => {
    await loadTimetable(timetableFilters)
  }

  const handleBlockClick = (blockId) => {
    if (!SELECTABLE_BLOCK_IDS.has(blockId)) {
      return
    }

    setSelectedBlock(blockId)
    setHasClickedBlock(true)
    setPendingSelection((current) => {
      const maxFloor = BLOCK_MAX_FLOOR[blockId] ?? 4
      if (current.block === blockId) {
        return { block: blockId, floor: (current.floor + 1) % (maxFloor + 1) }
      }

      return { block: blockId, floor: 0 }
    })
  }

  const fetchRouteForSelection = async (source, destination) => {
    setDestinationSelection(destination)
    setSelectionPhase('route-ready')
    setIsRouteLoading(true)
    setRouteError('')

    try {
      const routeData = await fetchRouteFromApi(source, destination)
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
      await fetchRouteForSelection(startSelection, selectedDestination)
    }
  }

  const handleSmartModeChange = (nextMode) => {
    setSmartMode(nextMode)

    const nowMinutes = minutesSinceMidnight(new Date())
    const currentWindowIndex = PERIOD_SEQUENCE.findIndex((periodNumber) => {
      const slot = PERIOD_WINDOWS[periodNumber]
      return slot
        ? nowMinutes >= slot.start - ARRIVAL_BUFFER_MINUTES && nowMinutes < slot.end
        : false
    })

    const nextWindowIndex = PERIOD_SEQUENCE.findIndex((periodNumber) => {
      const slot = PERIOD_WINDOWS[periodNumber]
      return slot
        ? nowMinutes < slot.start - ARRIVAL_BUFFER_MINUTES
        : false
    })

    const referenceIndex = currentWindowIndex >= 0
      ? currentWindowIndex
      : nextWindowIndex >= 0
        ? nextWindowIndex - 1
        : PERIOD_SEQUENCE.length - 1

    setSmartPeriodIndex((currentIndex) => {
      if (nextMode === 'current') {
        return currentWindowIndex >= 0 ? currentWindowIndex : null
      }

      if (nextMode === 'previous') {
        const newIndex = currentIndex !== null ? currentIndex - 1 : referenceIndex
        return Math.max(newIndex, -1)
      }

      const newIndex = currentIndex !== null ? currentIndex + 1 : referenceIndex + 1
      return Math.min(newIndex, PERIOD_SEQUENCE.length)
    })
  }

  const todayCode = getCurrentDayCode()

  const smartDestinationPreview = useMemo(() => {
    if (!isTimetableLoaded) {
      return { available: false, message: 'Load timetable to enable smart destination.' }
    }

    const todayEntries = timetableEntries
      .filter((entry) => entry.day_of_week === todayCode)
      .sort((a, b) => Number(a.period_number) - Number(b.period_number))

    if (todayEntries.length === 0) {
      return { available: false, message: 'No class today.' }
    }

    const entriesByPeriod = new Map(todayEntries.map((entry) => [Number(entry.period_number), entry]))
    const nowMinutes = minutesSinceMidnight(new Date())
    const currentWindowIndex = PERIOD_SEQUENCE.findIndex((periodNumber) => {
      const slot = PERIOD_WINDOWS[periodNumber]
      return slot
        ? nowMinutes >= slot.start - ARRIVAL_BUFFER_MINUTES && nowMinutes < slot.end
        : false
    })

    const nextWindowIndex = PERIOD_SEQUENCE.findIndex((periodNumber) => {
      const slot = PERIOD_WINDOWS[periodNumber]
      return slot
        ? nowMinutes < slot.start - ARRIVAL_BUFFER_MINUTES
        : false
    })

    const referenceIndex = currentWindowIndex >= 0
      ? currentWindowIndex
      : nextWindowIndex >= 0
        ? nextWindowIndex - 1
        : PERIOD_SEQUENCE.length - 1

    let targetIndex = null
    if (smartMode === 'current') {
      if (currentWindowIndex < 0) {
        return { available: false, message: 'No class now.' }
      }
      targetIndex = smartPeriodIndex ?? currentWindowIndex
    } else if (smartMode === 'previous') {
      targetIndex = smartPeriodIndex ?? referenceIndex
    } else {
      targetIndex = smartPeriodIndex ?? (referenceIndex + 1)
    }

    if (targetIndex === null || targetIndex < 0 || targetIndex >= PERIOD_SEQUENCE.length) {
      const message = smartMode === 'next' ? 'No next class today.' : 'No previous class today.'
      return { available: false, message }
    }

    const targetPeriod = PERIOD_SEQUENCE[targetIndex]
    const pickedEntry = entriesByPeriod.get(targetPeriod) ?? null

    if (!pickedEntry) {
      return {
        available: false,
        message: `${formatPeriodTime(targetPeriod)} · No class now.`,
      }
    }

    const destination = parseDestinationFromEntry(pickedEntry)
    if (!destination || !SELECTABLE_BLOCK_IDS.has(destination.block)) {
      return { available: false, message: 'Class location is unavailable on the map.' }
    }

    return {
      available: true,
      destination,
      entry: pickedEntry,
      message: `${formatPeriodTime(pickedEntry.period_number)} · ${pickedEntry.course_code || 'Class'} · ${pickedEntry.room_name || 'Room TBD'}${pickedEntry.map_node ? ` (${pickedEntry.map_node})` : ''}`,
    }
  }, [isTimetableLoaded, smartMode, smartPeriodIndex, timetableEntries, todayCode])

  const applySmartDestination = async () => {
    if (!startSelection || selectionPhase === 'select-start') {
      setRouteError('Confirm start first, then use Smart Destination.')
      return
    }

    if (!smartDestinationPreview.available || !smartDestinationPreview.destination) {
      setRouteError(smartDestinationPreview.message)
      return
    }

    const destination = smartDestinationPreview.destination
    setSelectedBlock(destination.block)
    setHasClickedBlock(true)
    setPendingSelection(destination)

    await fetchRouteForSelection(startSelection, destination)
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

  const todaySchedule = useMemo(() => {
    if (timetableEntries.length === 0) {
      return null
    }

    const todayEntries = timetableEntries.filter((entry) => entry.day_of_week === todayCode)
    const entriesByPeriod = new Map(todayEntries.map((entry) => [Number(entry.period_number), entry]))

    return {
      day: DAY_LABEL_BY_CODE[todayCode],
      items: PERIOD_SEQUENCE.map((periodNumber) => {
        const entry = entriesByPeriod.get(periodNumber)
        if (!entry) {
          return {
            key: `free-${periodNumber}`,
            time: formatPeriodTime(periodNumber),
            subject: 'Free period',
            room: 'No class scheduled',
            faculty: 'Available',
            isFree: true,
          }
        }

        return {
          key: String(entry.id ?? `entry-${periodNumber}`),
          time: formatPeriodTime(entry.period_number),
          subject: entry.course_code || 'Course pending',
          room: entry.room_name
            ? entry.map_node
              ? `${entry.room_name} (${entry.map_node})`
              : entry.room_name
            : 'Room not assigned',
          faculty: entry.programme || 'Programme not set',
          isFree: false,
        }
      }),
    }
  }, [timetableEntries, todayCode])

  const selectedSemesterValue = timetableFilters.semesterId

  const programmeOptions = timetableOptions.programmes.map((programme) => ({
    value: programme,
    label: programmeShortLabel(programme),
  }))

  const semesterOptions = timetableOptions.semesters.map((semester) => ({
    value: String(semester.id),
    label: semester.semester_number
      ? `Semester ${semester.semester_number} \u00b7 ${semester.academic_year} ${semester.term}`
      : `${semester.academic_year} ${semester.term}`,
  }))

  const selectedSemesterOption = timetableOptions.semesters.find(
    (semester) => String(semester.id) === timetableFilters.semesterId,
  )

  const selectedSemesterLabel = selectedSemesterOption
    ? `${selectedSemesterOption.academic_year} (${selectedSemesterOption.term})`
    : timetableSummary.academicYear && timetableSummary.term
      ? `${timetableSummary.academicYear} (${timetableSummary.term})`
      : 'No semester selected'

  const selectedSemesterNumberLabel = selectedSemesterOption?.semester_number
    ? `Semester ${selectedSemesterOption.semester_number}`
    : (selectedSemesterOption?.semester_label ?? '')

  return (
    <>
      {showHelp && <HelpPage onClose={() => setShowHelp(false)} />}
      <div className="app-shell">
      <header className="hero-panel">
        <nav className="top-nav" aria-label="Primary navigation">
          <button
            type="button"
            className="nav-chip nav-chip--help"
            onClick={() => setShowHelp(true)}
            aria-label="Open help"
            title="Help"
          >
            ?
          </button>
          <button
            type="button"
            className={`nav-chip nav-chip--timetable ${activeView === 'timetable' ? 'is-active' : ''}`}
            onClick={() => setActiveView((current) => (current === 'overview' ? 'timetable' : 'overview'))}
          >
            {activeView === 'overview' ? 'Timetable' : 'Map'}
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
          <label className="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            <input
              type="checkbox"
              className="theme-toggle__input"
              checked={theme === 'dark'}
              onChange={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            />
            <span className="theme-switch" aria-hidden="true">
              <span className={`theme-switch__track ${theme === 'dark' ? 'is-dark' : ''}`}>
                <span className="theme-switch__thumb" />
              </span>
              <span className={`theme-switch__state ${theme === 'dark' ? 'is-dark' : 'is-light'}`}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </span>
          </label>
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

          <div className="timetable-toolbar" aria-label="Timetable filters">
            <FilterDropdown
              label="Programme"
              value={timetableFilters.programme}
              options={programmeOptions}
              placeholder="Choose programme"
              onChange={handleProgrammeChange}
            />

            <FilterDropdown
              label="Semester"
              value={selectedSemesterValue}
              options={semesterOptions}
              placeholder="Choose semester"
              disabled={!timetableFilters.programme}
              onChange={handleSemesterChange}
            />

            <button
              type="button"
              className="primary-action timetable-load-button"
              onClick={handleLoadTimetable}
              disabled={
                isTimetableLoading ||
                !timetableFilters.programme ||
                !timetableFilters.semesterId
              }
            >
              {isTimetableLoading ? 'Loading...' : 'Load timetable'}
            </button>
          </div>

          {selectedSemesterNumberLabel ? (
            <p className="timetable-hint">
              Selected: {selectedSemesterNumberLabel} ({selectedSemesterLabel})
            </p>
          ) : null}

          {timetableError ? <p className="route-error timetable-error">{timetableError}</p> : null}
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
            todayTimetableLoading={isTimetableLoading}
            smartMode={smartMode}
            smartModeOptions={SMART_MODE_OPTIONS}
            onSmartModeChange={handleSmartModeChange}
            onSmartDestinationApply={applySmartDestination}
            smartDestinationMessage={smartDestinationPreview.message}
            smartDestinationAvailable={smartDestinationPreview.available}
            smartDestinationDisabled={isRouteLoading || selectionPhase === 'select-start'}
          />
        ) : (
          <TimetablePanel
            timetableEntries={timetableEntries}
            timetableLoading={isTimetableLoading}
            timetableError={timetableError}
            selectedSemesterLabel={selectedSemesterLabel}
            selectedProgramme={programmeShortLabel(timetableFilters.programme)}
            onBackToMap={() => setActiveView('overview')}
          />
        )}
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
      <SpeedInsights />
      </div>
    </>
  )
}

export default App
