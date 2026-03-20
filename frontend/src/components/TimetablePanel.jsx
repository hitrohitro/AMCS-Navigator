import { useState, useRef, useEffect } from 'react'
import { PERIOD_TIMES, formatPeriodTime } from '../lib/routeRuntime'

const DAY_SEQUENCE = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const DAY_LABEL = {
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

function formatRoom(entry) {
  if (!entry.room_name) {
    return 'Room not assigned'
  }

  return entry.room_name
}

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner-wrapper">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Loading timetable...</p>
      </div>
    </div>
  )
}

function TimetablePanel({
  timetableEntries,
  timetableLoading,
  timetableError,
  selectedSemesterLabel,
  selectedProgramme,
  onBackToMap,
}) {
  const [expandedDay, setExpandedDay] = useState(null)
  const timetableRef = useRef(null)

  // Auto-scroll to timetable after data loads
  useEffect(() => {
    // Scroll when data is loaded and not currently loading
    if (!timetableLoading && timetableEntries.length > 0) {
      // Increase delay to ensure full DOM paint and reflow
      const scrollTimer = setTimeout(() => {
        // Try the ref first, fall back to queryselect
        const element = timetableRef.current || document.querySelector('[data-timetable-root]')
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 250)
      
      return () => clearTimeout(scrollTimer)
    }
  }, [timetableLoading, timetableEntries.length])

  const groupedByDay = DAY_SEQUENCE
    .map((dayCode) => ({
      dayCode,
      dayLabel: DAY_LABEL[dayCode],
      items: (() => {
        const dayEntries = timetableEntries.filter((entry) => entry.day_of_week === dayCode)
        if (dayEntries.length === 0) {
          return []
        }

        const entriesByPeriod = new Map(dayEntries.map((entry) => [Number(entry.period_number), entry]))
        return PERIOD_SEQUENCE.map((periodNumber) => {
          const entry = entriesByPeriod.get(periodNumber)
          if (!entry) {
            return {
              id: `free-${dayCode}-${periodNumber}`,
              period_number: periodNumber,
              is_free: true,
            }
          }

          return {
            ...entry,
            is_free: false,
          }
        })
      })(),
    }))
    .filter((dayGroup) => dayGroup.items.length > 0)

  return (
    <section 
      ref={timetableRef}
      data-timetable-root
      className="timetable-panel card-surface is-prominent" 
      aria-labelledby="full-timetable-title"
    >
      <div className="section-heading compact">
        <div>
          <p className="section-kicker">Weekly schedule</p>
          <h2 id="full-timetable-title">Full timetable</h2>
        </div>
        <button type="button" className="secondary-action" onClick={onBackToMap}>
          Back to map
        </button>
      </div>

      <p className="timetable-meta">
        {selectedSemesterLabel}
        {selectedProgramme ? ` • ${selectedProgramme}` : ' • All programmes'}
      </p>

      {timetableLoading ? (
        <LoadingSpinner />
      ) : timetableError ? (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{timetableError}</p>
        </div>
      ) : groupedByDay.length > 0 ? (
        <div className="timetable-strip animate-fade-in" aria-label="Complete timetable by day">
          {groupedByDay.map((dayGroup, index) => {
            const isExpanded = expandedDay === dayGroup.dayCode
            return (
              <article 
                key={dayGroup.dayCode} 
                className={`day-card ${isExpanded ? 'is-expanded' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <header
                  role="button"
                  tabIndex={0}
                  className="day-card-header"
                  onClick={() => setExpandedDay(isExpanded ? null : dayGroup.dayCode)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setExpandedDay(isExpanded ? null : dayGroup.dayCode)
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-label={`${dayGroup.dayLabel}, ${dayGroup.items.filter((item) => !item.is_free).length} sessions`}
                >
                  <div>
                    <h3>{dayGroup.dayLabel}</h3>
                    <span className="session-count">{dayGroup.items.filter((item) => !item.is_free).length} sessions</span>
                  </div>
                  <span className={`day-card-toggle ${isExpanded ? 'is-open' : ''}`} aria-hidden="true">
                    ▼
                  </span>
                </header>
                {isExpanded ? (
                  <div className="session-list">
                    {dayGroup.items.map((item, itemIndex) => (
                      <div 
                        key={item.id} 
                        className={`session-card ${item.is_free ? 'is-free' : ''}`}
                        style={{ animationDelay: `${itemIndex * 30}ms` }}
                      >
                        <div className="session-time-badge">
                          {formatPeriodTime(item.period_number)}
                        </div>
                        <div className="session-content">
                          <strong className="course-title">
                            {item.is_free 
                              ? 'Free period' 
                              : (item.course_name ? `${item.course_code} - ${item.course_name}` : (item.course_code || 'Course pending'))
                            }
                          </strong>
                          <p className="room-info">
                            {item.is_free ? 'No class scheduled' : formatRoom(item)}
                          </p>
                          <span className="programme-tag">
                            {item.is_free ? 'Available' : (selectedProgramme || 'Programme not set')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : (
        <p className="route-guide-text is-placeholder">No timetable entries found for the selected filters.</p>
      )}
    </section>
  )
}

export default TimetablePanel
