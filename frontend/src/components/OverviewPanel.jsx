import { useRef, useState, useEffect } from 'react'
import { blockInfo, blockLayouts, mapLandmarks, BLOCK_MAX_FLOOR } from '../data/campusData'
import { FountainAnimation } from './FountainAnimation'

function LandmarkLayer({ fountainRef, onFountainActivate }) {
  return (
    <div className="campus-features" aria-hidden="true">
      {mapLandmarks.map((landmark) => (
        <div
          key={landmark.id}
          ref={landmark.id === 'cube-fountain' ? fountainRef : null}
          data-landmark-id={landmark.id}
          className={`map-landmark map-landmark--${landmark.type}`}
          style={{
            left: `${landmark.x}%`,
            top: `${landmark.y}%`,
            width: `${landmark.width}%`,
            height: `${landmark.height}%`,
            ...(landmark.id === 'cube-fountain'
              ? { pointerEvents: 'auto', cursor: 'pointer' }
              : {}),
          }}
          role={landmark.id === 'cube-fountain' ? 'button' : undefined}
          tabIndex={landmark.id === 'cube-fountain' ? 0 : undefined}
          aria-label={landmark.id === 'cube-fountain' ? 'Play fountain animation' : undefined}
          onClick={landmark.id === 'cube-fountain' ? onFountainActivate : undefined}
          onKeyDown={landmark.id === 'cube-fountain'
            ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onFountainActivate()
              }
            }
            : undefined}
        >
          {landmark.badge ? <span className="landmark-badge">{landmark.badge}</span> : null}
          <span className="landmark-label">{landmark.label}</span>
        </div>
      ))}
    </div>
  )
}

function OverviewPanel({
  selectionPrompt,
  pendingSelection,
  setPendingSelection,
  confirmSelection,
  selectionPhase,
  isRouteLoading,
  resetSelectionFlow,
  shouldRenderPathConnections,
  routeSegments,
  routeNodes,
  blockById,
  shortestPathBlocks,
  startSelection,
  destinationSelection,
  hasConfirmedRoute,
  hasClickedBlock,
  selectedBlock,
  handleBlockClick,
  textualPath,
  routeError,
  pathInstructions,
  todaySchedule,
  todayTimetableLoading,
  smartMode,
  smartModeOptions,
  onSmartModeChange,
  onSmartDestinationApply,
  smartDestinationMessage,
  smartDestinationAvailable,
  smartDestinationDisabled,
}) {
  const fountainRef = useRef(null)
  const todayTimetableRef = useRef(null)
  const [fountainBurstId, setFountainBurstId] = useState(0)

  const handleFountainActivate = () => {
    setFountainBurstId((current) => current + 1)
  }

  // Auto-scroll to today's timetable when data loads
  useEffect(() => {
    if (!todayTimetableLoading && todaySchedule && todayTimetableRef.current) {
      setTimeout(() => {
        todayTimetableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 250)
    }
  }, [todayTimetableLoading, todaySchedule])

  return (
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
              {[0, 1, 2, 3, 4].map((floor) => {
                const maxFloor = BLOCK_MAX_FLOOR[pendingSelection.block] ?? 4
                const isDisabled = floor > maxFloor
                return (
                  <button
                    key={`floor-${floor}`}
                    type="button"
                    className={`floor-chip ${pendingSelection.floor === floor ? 'is-active' : ''} ${isDisabled ? 'is-disabled' : ''}`}
                    disabled={isDisabled}
                    onClick={() =>
                      setPendingSelection((current) => ({
                        ...current,
                        floor,
                      }))
                    }
                  >
                    {floor}
                  </button>
                )
              })}
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

          <div className="smart-destination" aria-label="Smart destination">
            <div className="smart-destination-head">
              <span className="meta-label">Smart destination</span>
              <p className="smart-destination-message">{smartDestinationMessage}</p>
            </div>
            <div className="smart-destination-controls">
              <div className="smart-mode-group" role="group" aria-label="Choose timetable window">
                {smartModeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`smart-mode-chip ${smartMode === option.value ? 'is-active' : ''}`}
                    onClick={() => onSmartModeChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="secondary-action smart-destination-action"
                onClick={onSmartDestinationApply}
                disabled={smartDestinationDisabled || !smartDestinationAvailable}
              >
                Set destination
              </button>
            </div>
          </div>
        </div>

        <div className="map-frame">
          <div className="map-main">
            <div className="campus-map" role="img" aria-label="Interactive AMCS block map">
              <LandmarkLayer
                fountainRef={fountainRef}
                onFountainActivate={handleFountainActivate}
              />
              <FountainAnimation
                originRef={fountainRef}
                burstId={fountainBurstId}
              />

              {shouldRenderPathConnections ? (
                <svg className="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {routeSegments.map((segment) => (
                    <path
                      key={segment.id}
                      className={`route-segment kind-${segment.kind}`}
                      d={segment.pathD}
                    />
                  ))}
                  {routeNodes.map((node, index) => {
                    const block = blockById[node.block]
                    if (!block) {
                      return null
                    }

                    const x = (((block.column - 1) + block.width / 2) / 15) * 100
                    const y = (((block.row - 1) + block.height / 2) / 11) * 100
                    const nodeClass = index === 0
                      ? 'is-start'
                      : index === routeNodes.length - 1
                        ? 'is-end'
                        : 'is-middle'

                    return (
                      <g key={`node-${node.key}-${index}`}>
                        <circle className={`route-node ${nodeClass}`} cx={x} cy={y} r="1.45" />
                        <text className="route-node-label" x={x} y={y - 2.1}>
                          {node.key}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              ) : null}

              {blockLayouts.map((block) => {
                const blockMeta = blockInfo[block.id]
                const isInteractiveBlock = block.tone === 'accent'
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
                    data-block-id={block.id}
                    className={`map-block tone-${block.tone} ${selectedBlock === block.id ? 'is-selected' : ''} ${isOnPath ? 'is-on-path' : ''} ${isStart ? 'is-start' : ''} ${isDestination ? 'is-destination' : ''} ${isInteractiveBlock ? '' : 'is-static'}`}
                    style={{
                      gridRow: `${block.row} / span ${block.height}`,
                      gridColumn: `${block.column} / span ${block.width}`,
                      ...(['F', 'T'].includes(block.id) ? { marginTop: '18px' } : {}),
                      ...(block.id === 'H' ? { marginTop: '18px', marginBottom: '-10px' } : {}),
                      ...(block.id === 'G' ? { marginTop: '12px' } : {}),
                      ...(block.id === 'J' ? { marginTop: '6px' } : {}),
                      ...(block.id === 'H' || block.id === 'T' ? { marginRight: '10px' } : {}),
                    }}
                    onClick={() => handleBlockClick(block.id)}
                    disabled={!isInteractiveBlock}
                    aria-pressed={selectedBlock === block.id}
                    aria-disabled={!isInteractiveBlock}
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
          </div>

          <div className="map-sidebar">
            <div className="map-legend-card" aria-label="Map legend">
              <p className="legend-title">Legend</p>
              <div className="map-legend">
                <span className="legend-item">
                  <i className="legend-dot accent"></i>
                  Main blocks
                </span>
                <span className="legend-item">
                  <i className="legend-dot neutral"></i>
                  Other blocks
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
                <span className="legend-item">
                  <i className="legend-line ground"></i>
                  Ground floor link
                </span>
                <span className="legend-item">
                  <i className="legend-line bridge"></i>
                  Horizontal bridge
                </span>
                <span className="legend-item">
                  <i className="legend-badge parking">P</i>
                  Parking area
                </span>
              </div>
            </div>

            <aside className="route-guide-card" aria-label="Path to classroom">
              <p className="legend-title">Path To Classroom</p>
              {hasConfirmedRoute ? (
                <>
                  <p className="route-guide-meta">
                    {startSelection.block}{startSelection.floor} to {destinationSelection.block}{destinationSelection.floor}
                  </p>
                  <div className="route-guide-strip">
                    {routeNodes.map((node, index) => (
                      <span key={`route-node-chip-${node.key}-${index}`} className="route-guide-chip">
                        {node.key}
                      </span>
                    ))}
                  </div>
                  <p className="route-guide-text">{pathInstructions || 'No route instructions available.'}</p>
                </>
              ) : (
                <p className="route-guide-text is-placeholder">
                  Confirm start and destination to display classroom path.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="today-timetable" ref={todayTimetableRef}>
        <div className="section-heading">
          <div>
            <p className="section-kicker">Today</p>
            <h2>{todaySchedule?.day ?? "Today's timetable"}</h2>
          </div>
        </div>

        {todayTimetableLoading ? <p className="route-guide-text">Loading timetable...</p> : null}

        {!todayTimetableLoading && todaySchedule ? (
          <div className="session-list">
            {todaySchedule.items.map((item) => (
              <div key={item.key ?? item.time} className={`session-card ${item.isFree ? 'is-free' : ''}`}>
                <p className="session-time">{item.time}</p>
                <strong>{item.subject}</strong>
                <p>{item.room}</p>
                <span>{item.faculty}</span>
              </div>
            ))}
          </div>
        ) : !todayTimetableLoading ? (
          <p>No schedule for today</p>
        ) : null}
      </section>
    </>
  )
}

export default OverviewPanel
