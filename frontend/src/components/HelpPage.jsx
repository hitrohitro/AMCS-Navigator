import './HelpPage.css'

export default function HelpPage({ onClose }) {
  return (
    <div className="help-page">
      <button type="button" className="help-close-btn" onClick={onClose} aria-label="Close help">
        ✕
      </button>

      <div className="help-content">
        <h1>AMCS Navigator Guide</h1>
        <p className="help-intro">Learn how to navigate through the campus using AMCS Navigator</p>

        <section className="help-section">
          <h2>Finding a Route</h2>
          <div className="help-card">
            <h3>Step 1: Select Your Starting Point</h3>
            <div className="help-instruction">
              <p className="step-number">1</p>
              <div className="step-content">
                <p>Click on any <strong>highlighted block</strong> shown in the campus map to select your starting location.</p>
                <p className="hint">You must confirm this selection before moving to the next step.</p>
              </div>
            </div>
          </div>

          <div className="help-card">
            <h3>Step 2: Select Floor Level</h3>
            <div className="help-instruction">
              <p className="step-number">2</p>
              <div className="step-content">
                <p>Choose the <strong>floor level</strong> (0-4) you want to start from using the floor selector.</p>
                <p className="hint">Each block has multiple floors. Ground floor is level 0.</p>
              </div>
            </div>
          </div>

          <div className="help-card">
            <h3>Step 3: Confirm Starting Point</h3>
            <div className="help-instruction">
              <p className="step-number">3</p>
              <div className="step-content">
                <p>Click the <strong>"Confirm"</strong> button to set your starting location.</p>
                <p className="hint">Once confirmed, you'll move to selecting your destination.</p>
              </div>
            </div>
          </div>

          <div className="help-card">
            <h3>Step 4: Select Your Destination</h3>
            <div className="help-instruction">
              <p className="step-number">4</p>
              <div className="step-content">
                <p>Repeat the process: select a block, choose the floor, and confirm. This time for your destination.</p>
                <p className="hint">The route will be calculated automatically once both points are confirmed.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Understanding the Map Display</h2>
          <div className="help-features">
            <div className="feature">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </div>
              <h3>Blocks</h3>
              <p>Clickable building blocks. Highlighted blocks mean they're navigable.</p>
            </div>
            <div className="feature">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M4 12h13" />
                  <path d="m13 7 6 5-6 5" />
                </svg>
              </div>
              <h3>Route Path</h3>
              <p>The calculated shortest path from your start to destination, shown as a colored line on the map.</p>
            </div>
            <div className="feature">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M5 16h14" />
                  <path d="M8 16V9" />
                  <path d="M16 16V9" />
                </svg>
              </div>
              <h3>Bridges</h3>
              <p>Connections between blocks on the same floor level that the route may use.</p>
            </div>
            <div className="feature">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="9" r="3" />
                  <path d="M12 12v7" />
                  <path d="M9 19h6" />
                </svg>
              </div>
              <h3>Selection Indicator</h3>
              <p>Shows your currently selected block and floor in the "Selection" field at the top.</p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Using Timetable Features</h2>
          <div className="help-card">
            <h3>View Your Timetable</h3>
            <div className="help-instruction">
              <p>1. Select your <strong>Programme</strong> from the dropdown</p>
              <p>2. A <strong>Semester</strong> will be suggested automatically</p>
              <p>3. Click <strong>"Load timetable"</strong> to see your schedule</p>
              <p className="hint">The "Timetable" tab shows your classes with locations</p>
            </div>
          </div>

          <div className="help-card">
            <h3>Smart Mode Navigation</h3>
            <div className="help-instruction">
              <p>Choose from:</p>
              <ul>
                <li><strong>Previous</strong> - Lesson from before this time</li>
                <li><strong>Current</strong> - Ongoing lesson right now</li>
                <li><strong>Next</strong> - Upcoming lesson</li>
              </ul>
              <p className="hint">Click "Apply" to automatically navigate to that lesson location</p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Helpful Tips</h2>
          <ul className="tips-list">
            <li><strong>Live Time</strong>: Check the current time in the top section</li>
            <li><strong>Selection Summary</strong>: Shows your current block-floor selection</li>
            <li><strong>Reset Route</strong>: Start over by clicking "Reset" after confirming a route</li>
            <li><strong>External Links</strong>: Quick access to campus resources in the top navigation</li>
          </ul>
        </section>

        <section className="help-section">
          <h2>Quick Reference</h2>
          <table className="quick-ref-table">
            <tbody>
              <tr>
                <td className="column-label">Blocks</td>
                <td>Click on colored areas in the map</td>
              </tr>
              <tr>
                <td className="column-label">Floor Selection</td>
                <td>Use arrows or click the floor number</td>
              </tr>
              <tr>
                <td className="column-label">Confirm Selection</td>
                <td>Press the blue "Confirm" button</td>
              </tr>
              <tr>
                <td className="column-label">View Route</td>
                <td>Path appears on map after confirming destination</td>
              </tr>
              <tr>
                <td className="column-label">Read Instructions</td>
                <td>Text directions below the map</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
