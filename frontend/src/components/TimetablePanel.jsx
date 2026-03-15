function TimetablePanel({ timetable, onBackToMap }) {
  return (
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
          onClick={onBackToMap}
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
  )
}

export default TimetablePanel
