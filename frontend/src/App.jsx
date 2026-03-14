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

function App() {
  const [activeView, setActiveView] = useState('overview')
  const [selectedBlock, setSelectedBlock] = useState('J')
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
    setFloorCounts((current) => ({
      ...current,
      [blockId]: (current[blockId] + 1) % 5,
    }))
  }

  const activeBlock = blockLayouts.find((block) => block.id === selectedBlock)
  const activeBlockMeta = blockInfo[selectedBlock]

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
            Tap a block to cycle its floor marker from 0 to 4. The timetable view
            uses placeholder data for now and is ready to be wired to backend APIs
            later.
          </p>
          <div className="hero-meta">
            <div>
              <span className="meta-label">Live time</span>
              <strong>{clock}</strong>
            </div>
            <div>
              <span className="meta-label">Selected block</span>
              <strong>{activeBlockMeta.name}</strong>
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
              <p className="section-kicker">Interactive block map</p>
              <h2 id="map-panel-title">Tap any block to change the floor marker</h2>
            </div>
            <span className="legend-pill">Floor resets to 0 after 4</span>
          </div>

          <div className="map-frame">
            <div className="campus-map" role="img" aria-label="Interactive AMCS block map">
              {blockLayouts.map((block) => {
                const blockMeta = blockInfo[block.id]
                const floor = floorCounts[block.id]

                return (
                  <button
                    key={block.id}
                    type="button"
                    className={`map-block tone-${block.tone} ${selectedBlock === block.id ? 'is-selected' : ''}`}
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
                  </button>
                )
              })}
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
                <dd>Dummy data for frontend preview</dd>
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
