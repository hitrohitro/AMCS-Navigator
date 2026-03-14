import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8000'

const blockLayouts = [
  { id: 'I', row: 1, column: 3, width: 6, height: 1, tone: 'neutral' },
  { id: 'H', row: 1, column: 11, width: 2, height: 2, tone: 'accent' },
  { id: 'J', row: 2, column: 13, width: 3, height: 3, tone: 'accent' },
  { id: 'B', row: 4, column: 1, width: 3, height: 2, tone: 'neutral' },
  { id: 'Y', row: 4, column: 4, width: 1, height: 4, tone: 'accent' },
  { id: 'G', row: 3, column: 6, width: 2, height: 4, tone: 'neutral' },
  { id: 'F', row: 3, column: 8, width: 3, height: 2, tone: 'accent' },
  { id: 'T', row: 3, column: 11, width: 2, height: 2, tone: 'accent' },
  { id: 'D', row: 7, column: 5, width: 3, height: 1, tone: 'neutral' },
  { id: 'A', row: 8, column: 1, width: 3, height: 4, tone: 'accent' },
  { id: 'C', row: 10, column: 4, width: 1, height: 2, tone: 'neutral' },
  { id: 'E', row: 8, column: 10, width: 2, height: 4, tone: 'accent' },
  { id: 'K', row: 8, column: 12, width: 2, height: 4, tone: 'accent' },
  { id: 'M', row: 8, column: 14, width: 2, height: 4, tone: 'accent' },
]

const blockInfo = {
  A: {
    name: 'AI and Data Lab',
    department: 'Artificial Intelligence',
    connector: 'South entrance corridor',
  },
  B: {
    name: 'Basic Sciences Wing',
    department: 'Common facilities',
    connector: 'West foyer',
  },
  C: {
    name: 'Central Help Point',
    department: 'Student support',
    connector: 'Near block A lobby',
  },
  D: {
    name: 'Design Studio',
    department: 'Product and UI labs',
    connector: 'Ground passage',
  },
  E: {
    name: 'Embedded Systems Hub',
    department: 'ECE and IoT labs',
    connector: 'South-east walkway',
  },
  F: {
    name: 'Faculty Lounge',
    department: 'Administration',
    connector: 'Mid connector spine',
  },
  G: {
    name: 'General Classrooms',
    department: 'Shared lecture rooms',
    connector: 'Central stairwell',
  },
  H: {
    name: 'High Performance Lab',
    department: 'Computing research',
    connector: 'North-east core',
  },
  I: {
    name: 'Innovation Gallery',
    department: 'Showcase and events',
    connector: 'Upper corridor',
  },
  J: {
    name: 'Junior Lecture Theatres',
    department: 'Large classrooms',
    connector: 'East plaza entry',
  },
  K: {
    name: 'Knowledge Center',
    department: 'Reference spaces',
    connector: 'South-east plaza',
  },
  M: {
    name: 'Makerspace',
    department: 'Rapid prototyping',
    connector: 'Far east access',
  },
  T: {
    name: 'Tutorial Rooms',
    department: 'Small group teaching',
    connector: 'North-east bridge',
  },
  Y: {
    name: 'Youth Incubation Cell',
    department: 'Startup mentoring',
    connector: 'Vertical link lobby',
  },
}

const timetable = [
  {
    day: 'Monday',
    items: [
      {
        time: '08:30 - 09:20',
        subject: 'Machine Learning',
        room: 'J201',
        faculty: 'Dr. V. Kumar',
      },
      {
        time: '09:30 - 10:20',
        subject: 'UI Engineering',
        room: 'D104',
        faculty: 'Prof. N. Meena',
      },
      {
        time: '10:40 - 12:20',
        subject: 'Compiler Lab',
        room: 'A302',
        faculty: 'Ms. Deepa',
      },
      {
        time: '13:20 - 14:10',
        subject: 'Probability',
        room: 'G105',
        faculty: 'Dr. Saravanan',
      },
    ],
  },
  {
    day: 'Tuesday',
    items: [
      {
        time: '08:30 - 09:20',
        subject: 'Database Systems',
        room: 'H103',
        faculty: 'Dr. Shalini',
      },
      {
        time: '09:30 - 10:20',
        subject: 'Placement Training',
        room: 'I Hall',
        faculty: 'Career Cell',
      },
      {
        time: '11:30 - 12:20',
        subject: 'Open Elective',
        room: 'K204',
        faculty: 'Guest Faculty',
      },
      {
        time: '14:20 - 16:00',
        subject: 'Mini Project Review',
        room: 'M Lab',
        faculty: 'Panel',
      },
    ],
  },
  {
    day: 'Wednesday',
    items: [
      {
        time: '08:30 - 10:10',
        subject: 'Networks Lab',
        room: 'E202',
        faculty: 'Mr. Prakash',
      },
      {
        time: '10:30 - 11:20',
        subject: 'Software Design',
        room: 'T101',
        faculty: 'Ms. Revathi',
      },
      {
        time: '13:20 - 14:10',
        subject: 'Mentor Hour',
        room: 'Y Hub',
        faculty: 'Faculty Advisor',
      },
      {
        time: '14:20 - 15:10',
        subject: 'Free Slot',
        room: 'Library',
        faculty: 'Self study',
      },
    ],
  },
  {
    day: 'Saturday',
    items: [
      {
        time: '09:00 - 10:00',
        subject: 'Workshop on AI',
        room: 'Auditorium',
        faculty: 'Dr. A. Kumar',
      },
      {
        time: '10:30 - 11:30',
        subject: 'Group Discussion',
        room: 'Seminar Hall',
        faculty: 'Prof. B. Singh',
      },
      {
        time: '13:00 - 14:00',
        subject: 'Sports Activity',
        room: 'Ground',
        faculty: 'Physical Education Dept',
      },
    ],
  },
]

const externalLinks = [
  {
    id: 'ecampus',
    label: 'eCampus',
    href: 'https://ecampus.psgtech.ac.in/studzone/',
  },
  {
    id: 'hostel',
    label: 'Hostel',
    href: 'https://edviewx.psgtech.ac.in/Hostel',
  },
]

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

async function fetchRouteFromApi(sourceSelection, destinationSelection) {
  const params = new URLSearchParams({
    source_block: sourceSelection.block,
    source_floor: String(sourceSelection.floor),
    dest_block: destinationSelection.block,
    dest_floor: String(destinationSelection.floor),
  })

  const response = await fetch(`${API_BASE_URL}/api/path?${params.toString()}`)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail ?? 'Unable to fetch path from backend API.')
  }

  return response.json()
}

function App() {
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

  const activeBlock = blockLayouts.find((block) => block.id === selectedBlock)
  const activeBlockMeta = blockInfo[selectedBlock]
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

  const todayName = "Saturday"
  const todaySchedule = timetable.find((day) => day.day === todayName)

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <nav className="top-nav" aria-label="Primary navigation">
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
          <>
            <section className="map-panel" aria-labelledby="map-panel-title">
              <div className="section-heading">
                <div>
                  <p className="section-kicker">Interactive route map</p>
                  <h2 id="map-panel-title">Confirm start first, then destination</h2>
                </div>
                <span className="legend-pill">{selectionPrompt}</span>
              </div>

              <div className="selection-wizard" aria-label="Route selection controls">
                <div className="wizard-main">
                  <span className="meta-label">Current pick</span>
                  <strong className="selection-output">
                    {pendingSelection.block} - {pendingSelection.floor}
                  </strong>
                  <div className="floor-picker" role="group" aria-label="Pick floor number">
                    {[0, 1, 2, 3, 4].map((floor) => (
                      <button
                        key={`floor-${floor}`}
                        type="button"
                        className={`floor-chip ${pendingSelection.floor === floor ? 'is-active' : ''}`}
                        onClick={() =>
                          setPendingSelection((current) => ({
                            ...current,
                            floor,
                          }))
                        }
                      >
                        {floor}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="wizard-actions">
                  <button
                    type="button"
                    className="primary-action"
                    onClick={confirmSelection}
                    disabled={selectionPhase === 'route-ready' || isRouteLoading}
                  >
                    {selectionPhase === 'select-start'
                      ? 'Confirm start'
                      : selectionPhase === 'select-destination'
                        ? 'Confirm destination'
                        : 'Route confirmed'}
                  </button>
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={resetSelectionFlow}
                  >
                    Reset selection
                  </button>
                </div>
              </div>

              <div className="map-frame">
                <div className="map-main">
                <div className="campus-map" role="img" aria-label="Interactive AMCS block map">
                  {blockLayouts.map((block) => {
                    const blockMeta = blockInfo[block.id]
                    const isOnPath = shortestPathBlocks.includes(block.id)
                    const isStart = startSelection?.block === block.id
                    const isDestination = destinationSelection?.block === block.id
                    const floor = hasConfirmedRoute
                      ? isDestination
                        ? destinationSelection.floor
                        : isStart
                          ? startSelection.floor
                          : null
                      : isStart && startSelection !== null
                        ? startSelection.floor
                        : hasClickedBlock && selectedBlock === block.id
                          ? pendingSelection.floor
                          : null

                    return (
                      <button
                        key={block.id}
                        type="button"
                        className={`map-block tone-${block.tone} ${selectedBlock === block.id ? 'is-selected' : ''} ${isOnPath ? 'is-on-path' : ''} ${isStart ? 'is-start' : ''} ${isDestination ? 'is-destination' : ''}`}
                        style={{
                          gridRow: `${block.row} / span ${block.height}`,
                          gridColumn: `${block.column} / span ${block.width}`,
                          ...(block.id === 'H' || block.id === 'T' ? { marginRight: '10px' } : {}),
                        }}
                        onClick={() => handleBlockClick(block.id)}
                        aria-pressed={selectedBlock === block.id}
                        aria-label={`${block.id} block, ${blockMeta.name}, floor ${floor}`}
                      >
                        <span className="block-id">{block.id}</span>
                        {floor !== null ? (
                          <span
                            className={`floor-badge ${!hasConfirmedRoute && !isStart && hasClickedBlock && selectedBlock === block.id ? 'is-floated' : ''}`}
                          >
                            {floor}
                          </span>
                        ) : null}

                        {hasClickedBlock && selectedBlock === block.id ? (
                          <div className="state-tags" aria-hidden="true">
                            <span className="state-tag selected">Selected</span>
                          </div>
                        ) : null}
                      </button>
                    )
                  })}
                </div>

                <div className="path-strip" aria-label="Dummy path preview">
                  {(shortestPathBlocks.length > 0 ? shortestPathBlocks : [pendingSelection.block]).map(
                    (blockId, index, list) => (
                    <div key={`path-${blockId}`} className="path-chip">
                      <span>{blockId}</span>
                      {index < list.length - 1 ? <i className="path-arrow"></i> : null}
                    </div>
                    ),
                  )}
                </div>

                <p className="path-text" aria-live="polite">
                  {textualPath}
                </p>
                {routeError ? <p className="route-error">{routeError}</p> : null}
                </div>{/* end map-main */}

                <div className="map-legend-card" aria-label="Map legend">
                  <p className="legend-title">Legend</p>
                  <div className="map-legend">
                    <span className="legend-item">
                      <i className="legend-dot connector"></i>
                      Connector
                    </span>
                    <span className="legend-item">
                      <i className="legend-dot accent"></i>
                      Academic blocks
                    </span>
                    <span className="legend-item">
                      <i className="legend-dot neutral"></i>
                      Support blocks
                    </span>
                    <span className="legend-item is-highlight">
                      <i className="legend-dot selected"></i>
                      Selected
                    </span>
                    <span className="legend-item is-highlight">
                      <i className="legend-dot start"></i>
                      Start
                    </span>
                    <span className="legend-item is-highlight">
                      <i className="legend-dot destination"></i>
                      Destination
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {true && (
              <section className="today-timetable">
                <div className="section-heading">
                  <h2>Today's Timetable</h2>
                </div>
                {todaySchedule ? (
                  <div className="session-list">
                    {todaySchedule.items.map((item) => (
                      <div key={item.time} className="session-card">
                        <p className="session-time">{item.time}</p>
                        <strong>{item.subject}</strong>
                        <p>{item.room}</p>
                        <span>{item.faculty}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No schedule for today</p>
                )}
              </section>
            )}
          </>
        ) : activeView === 'timetable' ? (
          <section
            className="timetable-panel is-prominent"
            aria-labelledby="timetable-title"
          >
            <div className="section-heading">
              <div>
                <p className="section-kicker">Student schedule</p>
                <h2 id="timetable-title">User timetable</h2>
              </div>
              <button
                type="button"
                className="secondary-action"
                onClick={() => setActiveView('overview')}
              >
                Back to map
              </button>
            </div>

            <div className="timetable-strip">
              {timetable.map((day) => (
                <article key={day.day} className="day-card">
                  <header>
                    <h3>{day.day}</h3>
                    <span>{day.items.length} sessions</span>
                  </header>
                  <div className="session-list">
                    {day.items.map((item) => (
                      <div key={`${day.day}-${item.time}-${item.subject}`} className="session-card">
                        <p className="session-time">{item.time}</p>
                        <strong>{item.subject}</strong>
                        <p>{item.room}</p>
                        <span>{item.faculty}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
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
