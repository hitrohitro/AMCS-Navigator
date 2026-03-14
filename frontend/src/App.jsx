import { useEffect, useState } from 'react'
import './App.css'

const blockLayouts = [
  { id: 'I', row: 1, column: 3, width: 6, height: 1, tone: 'neutral' },
  { id: 'H', row: 1, column: 11, width: 2, height: 2, tone: 'accent' },
  { id: 'J', row: 2, column: 13, width: 3, height: 3, tone: 'accent' },
  { id: 'B', row: 4, column: 1, width: 3, height: 2, tone: 'neutral' },
  { id: 'Y', row: 4, column: 4, width: 1, height: 4, tone: 'accent' },
  { id: 'G', row: 3, column: 6, width: 2, height: 4, tone: 'neutral' },
  { id: 'F', row: 4, column: 8, width: 3, height: 1, tone: 'accent' },
  { id: 'T', row: 4, column: 11, width: 2, height: 1, tone: 'accent' },
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
]

const quickLinks = [
  { id: 'home', label: 'Home', type: 'view', view: 'overview' },
  { id: 'map', label: 'Map', type: 'view', view: 'overview' },
  { id: 'timetable', label: 'Time Table', type: 'view', view: 'timetable' },
  {
    id: 'ecampus',
    label: 'eCampus',
    type: 'external',
    href: 'https://ecampus.psgtech.ac.in/studzone/',
  },
  {
    id: 'hostel',
    label: 'Hostel',
    type: 'external',
    href: 'https://edviewx.psgtech.ac.in/Hostel',
  },
  {
    id: 'nucleus',
    label: 'Nucleus',
    type: 'external',
    href: 'https://nucleus.psgtech.ac.in/',
  },
]

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const blockGraph = {
  A: ['B', 'C', 'D'],
  B: ['A', 'Y'],
  C: ['A'],
  D: ['A', 'Y', 'G', 'E'],
  E: ['D', 'K'],
  F: ['G', 'T'],
  G: ['D', 'F', 'I'],
  H: ['T', 'J'],
  I: ['G'],
  J: ['H', 'T'],
  K: ['E', 'M'],
  M: ['K'],
  T: ['F', 'H', 'J'],
  Y: ['B', 'D'],
}

function findShortestPath(startBlockId, destinationBlockId) {
  if (startBlockId === destinationBlockId) {
    return [startBlockId]
  }

  const queue = [[startBlockId]]
  const visited = new Set([startBlockId])

  while (queue.length > 0) {
    const currentPath = queue.shift()
    const currentBlock = currentPath[currentPath.length - 1]
    const neighbours = blockGraph[currentBlock] ?? []

    for (const neighbour of neighbours) {
      if (visited.has(neighbour)) {
        continue
      }

      const nextPath = [...currentPath, neighbour]

      if (neighbour === destinationBlockId) {
        return nextPath
      }

      visited.add(neighbour)
      queue.push(nextPath)
    }
  }

  return []
}

function App() {
  const [activeView, setActiveView] = useState('overview')
  const [selectedBlock, setSelectedBlock] = useState('J')
  const [selectionPhase, setSelectionPhase] = useState('select-start')
  const [pendingSelection, setPendingSelection] = useState({ block: 'J', floor: 0 })
  const [startSelection, setStartSelection] = useState(null)
  const [destinationSelection, setDestinationSelection] = useState(null)
  const [clock, setClock] = useState(() => formatTime(new Date()))
  const [floorCounts, setFloorCounts] = useState(() =>
    Object.fromEntries(blockLayouts.map((block) => [block.id, 0])),
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(formatTime(new Date()))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const handleBlockClick = (blockId) => {
    setSelectedBlock(blockId)
    const nextFloor = (floorCounts[blockId] + 1) % 5
    setFloorCounts((current) => ({
      ...current,
      [blockId]: (current[blockId] + 1) % 5,
    }))
    setPendingSelection({ block: blockId, floor: nextFloor })
  }

  const confirmSelection = () => {
    if (selectionPhase === 'select-start') {
      setStartSelection(pendingSelection)
      setDestinationSelection(null)
      setSelectionPhase('select-destination')
      return
    }

    if (selectionPhase === 'select-destination') {
      setDestinationSelection(pendingSelection)
      setSelectionPhase('route-ready')
    }
  }

  const resetSelectionFlow = () => {
    setSelectionPhase('select-start')
    setStartSelection(null)
    setDestinationSelection(null)
    setPendingSelection({ block: selectedBlock, floor: floorCounts[selectedBlock] })
  }

  const activeBlock = blockLayouts.find((block) => block.id === selectedBlock)
  const activeBlockMeta = blockInfo[selectedBlock]
  const hasConfirmedRoute = Boolean(startSelection && destinationSelection)
  const shortestPathBlocks = hasConfirmedRoute
    ? findShortestPath(startSelection.block, destinationSelection.block)
    : []
  const textualPath = hasConfirmedRoute
    ? shortestPathBlocks
        .map((blockId, index) => {
          let floorNumber = floorCounts[blockId]

          if (index === 0) {
            floorNumber = startSelection.floor
          }

          if (index === shortestPathBlocks.length - 1) {
            floorNumber = destinationSelection.floor
          }

          return `${blockId} - ${floorNumber}`
        })
        .join(' -> ')
    : 'Path is shown after confirming both start and destination.'

  const selectionPrompt =
    selectionPhase === 'select-start'
      ? 'Step 1: Select start block and floor, then confirm.'
      : selectionPhase === 'select-destination'
        ? 'Step 2: Select destination block and floor, then confirm.'
        : 'Route ready. You can reset and pick another path.'

  const routeSummary =
    hasConfirmedRoute
      ? `${startSelection.block} - ${startSelection.floor} to ${destinationSelection.block} - ${destinationSelection.floor}`
      : `${pendingSelection.block} - ${pendingSelection.floor}`

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <nav className="top-nav" aria-label="Primary navigation">
          {quickLinks.map((link) =>
            link.type === 'external' ? (
              <a
                key={link.id}
                className="nav-chip"
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <button
                key={link.id}
                type="button"
                className={`nav-chip ${activeView === link.view ? 'is-active' : ''}`}
                onClick={() => setActiveView(link.view)}
              >
                {link.label}
              </button>
            ),
          )}
        </nav>

        <div className="hero-copy">
          <p className="eyebrow">AMCS Navigator</p>
          <h1>The AMCS Map</h1>
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
            <button
              type="button"
              className="primary-action"
              onClick={() => setActiveView('timetable')}
            >
              Open user timetable
            </button>
          </div>
        </div>
      </header>

      <main className="content-grid">
        <section className="map-panel card-surface" aria-labelledby="map-panel-title">
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
                disabled={selectionPhase === 'route-ready'}
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
            <div className="campus-map" role="img" aria-label="Interactive AMCS block map">
              {blockLayouts.map((block) => {
                const blockMeta = blockInfo[block.id]
                const floor = floorCounts[block.id]
                const isOnPath = shortestPathBlocks.includes(block.id)
                const isStart = startSelection?.block === block.id
                const isDestination = destinationSelection?.block === block.id
                const isPending = pendingSelection.block === block.id

                return (
                  <button
                    key={block.id}
                    type="button"
                    className={`map-block tone-${block.tone} ${selectedBlock === block.id ? 'is-selected' : ''} ${isOnPath ? 'is-on-path' : ''} ${isStart ? 'is-start' : ''} ${isDestination ? 'is-destination' : ''} ${isPending ? 'is-pending' : ''}`}
                    style={{
                      gridRow: `${block.row} / span ${block.height}`,
                      gridColumn: `${block.column} / span ${block.width}`,
                    }}
                    onClick={() => handleBlockClick(block.id)}
                    aria-pressed={selectedBlock === block.id}
                    aria-label={`${block.id} block, ${blockMeta.name}, floor ${floor}`}
                  >
                    <span className="block-id">{block.id}</span>
                    <span className="floor-badge">F{floor}</span>
                    {isStart ? <span className="path-marker start-marker">Start</span> : null}
                    {isDestination ? (
                      <span className="path-marker destination-marker">End</span>
                    ) : null}
                    {isPending ? (
                      <span className="path-marker pending-marker">Pick</span>
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

            <div className="map-legend" aria-label="Map legend">
              <span>
                <i className="legend-dot connector"></i>
                Connector
              </span>
              <span>
                <i className="legend-dot accent"></i>
                Academic blocks
              </span>
              <span>
                <i className="legend-dot neutral"></i>
                Support blocks
              </span>
              <span>
                <i className="legend-dot selected"></i>
                Selected
              </span>
              <span>
                <i className="legend-dot start"></i>
                Start
              </span>
              <span>
                <i className="legend-dot destination"></i>
                Destination
              </span>
              <span>
                <i className="legend-dot pending"></i>
                Current pick
              </span>
            </div>
          </div>
        </section>

        <aside className="info-panel card-surface" aria-labelledby="info-panel-title">
          <div className="section-heading compact">
            <div>
              <p className="section-kicker">Block details</p>
              <h2 id="info-panel-title">{selectedBlock} Block</h2>
            </div>
            <span className="block-counter">Floor {floorCounts[selectedBlock]}</span>
          </div>

          <div className="detail-stack">
            <div className="route-summary-card">
              <span className="meta-label">Dummy route preview</span>
              <h3>
                {hasConfirmedRoute
                  ? `${startSelection.block} - ${startSelection.floor} to ${destinationSelection.block} - ${destinationSelection.floor}`
                  : 'Waiting for both confirmations'}
              </h3>
              <p>
                {textualPath}
              </p>
            </div>

            <div className="detail-hero">
              <span className="detail-token">{selectedBlock}</span>
              <div>
                <h3>{activeBlockMeta.name}</h3>
                <p>{activeBlockMeta.department}</p>
              </div>
            </div>

            <dl className="detail-grid">
              <div>
                <dt>Current floor marker</dt>
                <dd>{floorCounts[selectedBlock]}</dd>
              </div>
              <div>
                <dt>Connector</dt>
                <dd>{activeBlockMeta.connector}</dd>
              </div>
              <div>
                <dt>Layout position</dt>
                <dd>
                  Row {activeBlock.row}, Column {activeBlock.column}
                </dd>
              </div>
              <div>
                <dt>Use case</dt>
                <dd>Step-based selection and dummy shortest path</dd>
              </div>
            </dl>

            <button
              type="button"
              className="secondary-action"
              onClick={() => setActiveView('timetable')}
            >
              Go to timetable
            </button>
          </div>
        </aside>

        <section
          className={`timetable-panel card-surface ${activeView === 'timetable' ? 'is-prominent' : ''}`}
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
      </main>
    </div>
  )
}

export default App
