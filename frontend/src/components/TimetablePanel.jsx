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

function formatRoom(entry) {
  if (!entry.room_name) {
    return 'Room not assigned'
  }

  if (entry.map_node) {
    return `${entry.room_name} (${entry.map_node})`
  }

  return entry.room_name
}

function TimetablePanel({
  timetableEntries,
  timetableLoading,
  timetableError,
  selectedSemesterLabel,
  selectedProgramme,
  onBackToMap,
}) {
  const groupedByDay = DAY_SEQUENCE
    .map((dayCode) => ({
      dayCode,
      dayLabel: DAY_LABEL[dayCode],
      items: timetableEntries.filter((entry) => entry.day_of_week === dayCode),
    }))
    .filter((dayGroup) => dayGroup.items.length > 0)

  return (
    <section className="timetable-panel card-surface is-prominent" aria-labelledby="full-timetable-title">
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

      {timetableLoading ? <p className="route-guide-text">Loading timetable...</p> : null}
      {timetableError ? <p className="route-error">{timetableError}</p> : null}

      {!timetableLoading && !timetableError ? (
        groupedByDay.length > 0 ? (
          <div className="timetable-strip" aria-label="Complete timetable by day">
            {groupedByDay.map((dayGroup) => (
              <article key={dayGroup.dayCode} className="day-card">
                <header>
                  <h3>{dayGroup.dayLabel}</h3>
                  <span>{dayGroup.items.length} sessions</span>
                </header>
                <div className="session-list">
                  {dayGroup.items.map((item) => (
                    <div key={item.id} className="session-card">
                      <p className="session-time">Period {item.period_number}</p>
                      <strong>{item.course_code || 'Course pending'}</strong>
                      <p>{formatRoom(item)}</p>
                      <span>{item.programme || 'Programme not set'}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="route-guide-text is-placeholder">No timetable entries found for the selected filters.</p>
        )
      ) : null}
    </section>
  )
}

export default TimetablePanel
