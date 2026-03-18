import './HelpPage.css'

export default function HelpPage({ onClose }) {
  return (
    <div className="help-page">
      <div className="help-content">
        <header className="help-header">
          <div className="help-header-copy">
            <h1>Navigator Guide</h1>
            <p className="help-intro">A quick visual guide to using the interactive campus map.</p>
          </div>
          <button type="button" className="help-close-btn" onClick={onClose} aria-label="Close help">
            ✕
          </button>
        </header>

        <section className="help-section">
          <h2>Interactive Routing</h2>
          <div className="route-steps-container">
            <div className="visual-step">
              <div className="step-icon-wrap">
                <div className="step-number-badge">1</div>
                <svg viewBox="0 0 24 24" className="step-icon" aria-hidden="true" focusable="false">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>Pick Start Block</h3>
              <p>Tap a highlighted building on the map.</p>
            </div>
            
            <div className="step-connector"></div>
            
            <div className="visual-step">
              <div className="step-icon-wrap">
                <div className="step-number-badge">2</div>
                <svg viewBox="0 0 24 24" className="step-icon" aria-hidden="true" focusable="false">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <h3>Confirm Start</h3>
              <p>Hit the blue Confirm button. Then pick your destination.</p>
            </div>
            
            <div className="step-connector"></div>
            
            <div className="visual-step">
              <div className="step-icon-wrap">
                <div className="step-number-badge">3</div>
                <svg viewBox="0 0 24 24" className="step-icon" aria-hidden="true" focusable="false">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <h3>View Route</h3>
              <p>Follow the glowing line to your destination!</p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Map Legend</h2>
          <div className="help-features">
            <div className="feature">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </div>
              <h3>Selectable Blocks</h3>
              <p>Colored buildings are interactive.</p>
            </div>
            <div className="feature">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M4 12h13" />
                  <path d="m13 7 6 5-6 5" />
                </svg>
              </div>
              <h3>Route Path</h3>
              <p>The shortest route between buildings.</p>
            </div>
            <div className="feature">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M5 16h14" />
                  <path d="M8 16V9" />
                  <path d="M16 16V9" />
                </svg>
              </div>
              <h3>Connectors</h3>
              <p>Bridges linking blocks on the same floor.</p>
            </div>
            <div className="feature">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="9" r="3" />
                  <path d="M12 12v7" />
                  <path d="M9 19h6" />
                </svg>
              </div>
              <h3>Selection</h3>
              <p>Check the top panel for current block/floor.</p>
            </div>
          </div>
        </section>

        <section className="help-section">
          <h2>Pro Tips</h2>
          <div className="pro-tips-grid">
            <div className="tip-card">
              <div className="tip-icon-sidebar">
                <svg viewBox="0 0 24 24" className="tip-icon" aria-hidden="true" focusable="false">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="tip-content">
                <strong>Timetable Sync</strong>
                <p>Load your timetable to enable "Smart Mode" routing to your next class automatically.</p>
              </div>
            </div>
            <div className="tip-card">
              <div className="tip-icon-sidebar">
                <svg viewBox="0 0 24 24" className="tip-icon" aria-hidden="true" focusable="false">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </div>
              <div className="tip-content">
                <strong>Resetting Routes</strong>
                <p>Made a mistake? Hit "Reset selection" to clear the map instantly.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="help-repo-link-wrap">
          <a
            className="help-repo-link"
            href="https://github.com/hitrohitro/AMCS-Navigator"
            target="_blank"
            rel="noreferrer"
            aria-label="Open AMCS Navigator GitHub repository"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 2.25a9.75 9.75 0 0 0-3.083 19.002c.487.09.665-.21.665-.467v-1.64c-2.705.588-3.276-1.145-3.276-1.145a2.58 2.58 0 0 0-1.08-1.425c-.882-.603.067-.591.067-.591a2.043 2.043 0 0 1 1.49 1.004 2.072 2.072 0 0 0 2.833.808 2.08 2.08 0 0 1 .618-1.302c-2.16-.246-4.433-1.08-4.433-4.807a3.766 3.766 0 0 1 1.004-2.613 3.5 3.5 0 0 1 .096-2.576s.819-.262 2.684.998a9.26 9.26 0 0 1 4.886 0c1.865-1.26 2.683-.998 2.683-.998a3.5 3.5 0 0 1 .097 2.576 3.757 3.757 0 0 1 1.003 2.613c0 3.736-2.276 4.558-4.442 4.8a2.33 2.33 0 0 1 .662 1.807v2.677c0 .26.176.562.672.466A9.75 9.75 0 0 0 12 2.25Z" />
            </svg>
            <span>View Project on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  )
}
