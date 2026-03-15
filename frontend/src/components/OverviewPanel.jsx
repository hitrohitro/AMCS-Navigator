import { blockInfo, blockLayouts } from '../data/campusData'

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
}) {
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
                    className={`map-block tone-${block.tone} ${selectedBlock === block.id ? 'is-selected' : ''} ${isOnPath ? 'is-on-path' : ''} ${isStart ? 'is-start' : ''} ${isDestination ? 'is-destination' : ''} ${isInteractiveBlock ? '' : 'is-static'}`}
                    style={{
                      gridRow: `${block.row} / span ${block.height}`,
                      gridColumn: `${block.column} / span ${block.width}`,
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
                <span className="legend-item">
                  <i className="legend-line ground"></i>
                  Ground floor link
                </span>
                <span className="legend-item">
                  <i className="legend-line bridge"></i>
                  Horizontal bridge
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
    </>
  )
}

export default OverviewPanel
