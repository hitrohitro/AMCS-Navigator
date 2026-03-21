import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { blockInfo, blockLayouts, mapLandmarks, BLOCK_MAX_FLOOR } from '../data/campusData'
import { FountainAnimation } from './FountainAnimation'

const MAP_ASSEMBLY_CONFIG = [
  { id: 'I',             type: 'block',    initial: { x: -0.45, y: -0.34, rotate: -18, scale: 0.78, opacity: 0.16, blur: 8  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'H',             type: 'block',    initial: { x:  0.48, y: -0.38, rotate:  14, scale: 0.80, opacity: 0.20, blur: 7  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'J',             type: 'block',    initial: { x:  0.56, y: -0.18, rotate:  20, scale: 0.79, opacity: 0.16, blur: 9  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'B',             type: 'block',    initial: { x: -0.52, y: -0.08, rotate: -12, scale: 0.81, opacity: 0.24, blur: 7  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'Y',             type: 'block',    initial: { x: -0.33, y:  0.22, rotate: -16, scale: 0.82, opacity: 0.20, blur: 6  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'G',             type: 'block',    initial: { x:  0.08, y: -0.22, rotate:  12, scale: 0.78, opacity: 0.18, blur: 8  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'F',             type: 'block',    initial: { x:  0.18, y: -0.31, rotate:  16, scale: 0.79, opacity: 0.16, blur: 8  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'T',             type: 'block',    initial: { x:  0.36, y: -0.29, rotate:  13, scale: 0.83, opacity: 0.24, blur: 6  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'D',             type: 'block',    initial: { x: -0.06, y:  0.33, rotate: -10, scale: 0.81, opacity: 0.18, blur: 7  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'A',             type: 'block',    initial: { x: -0.58, y:  0.41, rotate: -19, scale: 0.77, opacity: 0.14, blur: 10 }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'C',             type: 'block',    initial: { x: -0.28, y:  0.43, rotate:  -9, scale: 0.82, opacity: 0.22, blur: 6  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'E',             type: 'block',    initial: { x:  0.35, y:  0.37, rotate:  11, scale: 0.80, opacity: 0.18, blur: 8  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'K',             type: 'block',    initial: { x:  0.46, y:  0.31, rotate:  15, scale: 0.79, opacity: 0.16, blur: 8  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'M',             type: 'block',    initial: { x:  0.64, y:  0.24, rotate:  22, scale: 0.76, opacity: 0.12, blur: 10 }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'cube-fountain', type: 'landmark', initial: { x: -0.24, y: -0.46, rotate: -25, scale: 0.72, opacity: 0.10, blur: 10 }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'tech-bridge',   type: 'landmark', initial: { x:  0.26, y: -0.52, rotate:  18, scale: 0.74, opacity: 0.14, blur: 9  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'main-gate',     type: 'landmark', initial: { x: -0.48, y:  0.50, rotate: -14, scale: 0.78, opacity: 0.15, blur: 8  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'rear-gate',     type: 'landmark', initial: { x:  0.52, y: -0.45, rotate:  15, scale: 0.76, opacity: 0.12, blur: 9  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
  { id: 'parking-area',  type: 'landmark', initial: { x:  0.44, y:  0.42, rotate:  16, scale: 0.79, opacity: 0.15, blur: 8  }, final: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 } },
]

// Temporary verification toggle: render pristine static layout with transforms disabled.
const DEBUG_LAYOUT_ONLY = false

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/** Clamp a value to [0, 1]. */
const clamp01 = (value) => Math.min(1, Math.max(0, value))

/**
 * Return a scatter-distance multiplier based on viewport width.
 * Smaller screens get tighter initial offsets so elements don't
 * fly completely off-screen.
 */
const getScatterScale = () => {
  const w = window.innerWidth
  if (w <= 430) return 0.58
  if (w <= 860) return 0.72
  return 1
}

// ---------------------------------------------------------------------------
// Sub-components (unchanged from original)
// ---------------------------------------------------------------------------

function MapBlock({
  block,
  blockMeta,
  floor,
  selectedBlock,
  isOnPath,
  isStart,
  isDestination,
  isInteractiveBlock,
  hasClickedBlock,
  hasConfirmedRoute,
  handleBlockClick,
}) {
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
          className={`floor-badge ${
            !hasConfirmedRoute && !isStart && hasClickedBlock && selectedBlock === block.id
              ? 'is-floated'
              : ''
          }`}
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
}

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
          aria-label={
            landmark.id === 'cube-fountain' ? 'Play fountain animation' : undefined
          }
          onClick={landmark.id === 'cube-fountain' ? onFountainActivate : undefined}
          onKeyDown={
            landmark.id === 'cube-fountain'
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onFountainActivate()
                  }
                }
              : undefined
          }
        >
          {landmark.badge ? (
            <span className="landmark-badge">{landmark.badge}</span>
          ) : null}
          <span className="landmark-label">{landmark.label}</span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Assembly animation hook
// ---------------------------------------------------------------------------

/**
 * useMapAssemblyAnimation
 *
 * Drives a strict scroll-linked assembly animation:
 * progress = clamp((scrollY - start) / (end - start), 0, 1)
 * Scrolling down assembles; scrolling up reverses.
 *
 * All scroll boundary calculations are document-relative so they stay
 * accurate regardless of when the hook runs or how the page is scrolled.
 *
 * Key design decisions
 * ────────────────────
 * • sectionTop is re-read on every resize / orientationchange so
 *   the boundaries track layout reflows correctly.
 * • The "hot" scroll handler only reads window.scrollY (no layout reads).
 *   Layout measurements are cached and only refreshed when necessary.
 * • GSAP transforms are cleared on cleanup to prevent stale state.
 */
function useMapAssemblyAnimation(mapRef, mappedProgress, isPathSelected) {
  const isPathSelectedRef = useRef(isPathSelected)
  const mappedProgressRef = useRef(mappedProgress)
  const runtimeRef = useRef(null)
  const lockTweenRef = useRef(null)
  const renderedMappedProgressRef = useRef(0)
  const handoffGuardUntilRef = useRef(0)

  useLayoutEffect(() => {
    const mapEl     = mapRef.current

    if (!mapEl) return

    // ------------------------------------------------------------------
    // 1. Resolve DOM nodes for every config entry once at mount.
    //    We keep initial/final config alongside each node reference.
    // ------------------------------------------------------------------
    const animatedNodes = MAP_ASSEMBLY_CONFIG
      .map((config) => {
        const selector =
          config.type === 'block'
            ? `[data-block-id='${config.id}']`
            : `[data-landmark-id='${config.id}']`
        const node = mapEl.querySelector(selector)
        if (!node) return null
        return { node, initial: config.initial, final: config.final }
      })
      .filter(Boolean)

    const renderStaticFinalLayout = () => {
      animatedNodes.forEach(({ node }) => {
        gsap.set(node, { clearProps: 'x,y,z,rotation,scale,opacity,filter' })
      })
      mapEl.style.setProperty('--assembly-progress', '1')
      mapEl.dataset.assemblyProgress = '1.000'
      mapEl.classList.add('is-assembled')
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || DEBUG_LAYOUT_ONLY) {
      // Skip animated interpolation and render the final assembled state.
      renderStaticFinalLayout()

      return () => {
        animatedNodes.forEach(({ node }) => {
          gsap.set(node, { clearProps: 'x,y,z,rotation,scale,opacity,filter' })
        })
        mapEl.style.removeProperty('--assembly-progress')
        delete mapEl.dataset.assemblyProgress
        mapEl.classList.remove('is-assembled')
      }
    }

    // ------------------------------------------------------------------
    // 2. Cached layout measurements.
    //    These are the only values that require a layout read.
    //    Re-computed on resize / orientationchange, never on scroll.
    // ------------------------------------------------------------------
    let mapW          = 0
    let mapH          = 0
    let scatterScale  = 1

    const refreshLayout = () => {
      mapW         = mapEl.clientWidth
      mapH         = mapEl.clientHeight
      scatterScale = getScatterScale()
    }

    // ------------------------------------------------------------------
    // 3. Pure interpolation — no DOM reads, only DOM writes.
    // ------------------------------------------------------------------
    const applyMappedProgress = (mappedProgressValue) => {
      animatedNodes.forEach(({ node, initial, final }) => {
        // Interpolate from scattered (mappedProgress=0) -> final (mappedProgress=1).
        const x0 = initial.x * mapW * scatterScale
        const y0 = initial.y * mapH * scatterScale
        const x1 = final.x * mapW
        const y1 = final.y * mapH

        const x = x0 + ((x1 - x0) * mappedProgressValue)
        const y = y0 + ((y1 - y0) * mappedProgressValue)

        gsap.set(node, {
          x,
          y,
          z: 0,
          rotation: initial.rotate + ((final.rotate - initial.rotate) * mappedProgressValue),
          scale: initial.scale + ((final.scale - initial.scale) * mappedProgressValue),
          opacity: initial.opacity + ((final.opacity - initial.opacity) * mappedProgressValue),
          filter: `blur(${(initial.blur + ((final.blur - initial.blur) * mappedProgressValue)).toFixed(3)}px)`,
          transformOrigin: '50% 50%',
          force3D: true,
          overwrite: true,
        })
      })

      // Expose progress as a CSS custom property and data attribute
      // so CSS rules / debugging tools can react to it.
      mapEl.style.setProperty('--assembly-progress', mappedProgressValue.toFixed(4))
      mapEl.dataset.assemblyProgress = mappedProgressValue.toFixed(3)
      mapEl.classList.toggle('is-assembled', mappedProgressValue > 0.9)
      renderedMappedProgressRef.current = mappedProgressValue
    }

    // ------------------------------------------------------------------
    // 4. Resize / orientation handler.
    //    Re-measures layout then forces a repaint.
    // ------------------------------------------------------------------
    let resizeRafId = 0

    const handleResize = () => {
      if (resizeRafId) return
      resizeRafId = window.requestAnimationFrame(() => {
        resizeRafId = 0
        refreshLayout()
        if (isPathSelectedRef.current) {
          applyMappedProgress(renderedMappedProgressRef.current)
        } else {
          applyMappedProgress(mappedProgressRef.current)
        }
      })
    }

    // ------------------------------------------------------------------
    // 5. Bootstrap: measure → paint initial state → attach listeners.
    // ------------------------------------------------------------------
    refreshLayout()
    applyMappedProgress(mappedProgress)

    window.addEventListener('resize',            handleResize)
    window.addEventListener('orientationchange', handleResize)

    runtimeRef.current = {
      applyMappedProgress,
      syncToMappedProgress: (next) => {
        applyMappedProgress(next)
      },
    }

    // ------------------------------------------------------------------
    // 6. Cleanup: detach listeners, cancel pending frames, reset GSAP.
    // ------------------------------------------------------------------
    return () => {
      window.removeEventListener('resize',            handleResize)
      window.removeEventListener('orientationchange', handleResize)

      if (resizeRafId) window.cancelAnimationFrame(resizeRafId)
      if (lockTweenRef.current) {
        lockTweenRef.current.kill()
        lockTweenRef.current = null
      }

      runtimeRef.current = null
    }

  }, [])

  useEffect(() => {
    mappedProgressRef.current = mappedProgress
    const runtime = runtimeRef.current
    if (!runtime || isPathSelectedRef.current) return
    runtime.applyMappedProgress(mappedProgress)
  }, [mappedProgress])

  useEffect(() => {
    isPathSelectedRef.current = isPathSelected

    const runtime = runtimeRef.current
    if (!runtime) return

    if (lockTweenRef.current) {
      lockTweenRef.current.kill()
      lockTweenRef.current = null
    }

    // Debounce one-frame handoff so scroll and override updates never fight.
    handoffGuardUntilRef.current = performance.now() + 40

    if (isPathSelected) {
      const state = { progress: renderedMappedProgressRef.current }
      lockTweenRef.current = gsap.to(state, {
        progress: 1,
        duration: 0.26,
        ease: 'power2.out',
        onUpdate: () => {
          runtime.applyMappedProgress(state.progress)
        },
        onComplete: () => {
          renderedMappedProgressRef.current = 1
        },
      })
      return
    }

    // Restore original scroll-driven behavior immediately without replay.
    runtime.syncToMappedProgress(mappedProgress)
  }, [isPathSelected, mappedProgress])
}

// ---------------------------------------------------------------------------
// OverviewPanel
// ---------------------------------------------------------------------------

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
  const fountainRef        = useRef(null)
  const todayTimetableRef  = useRef(null)
  const assemblySectionRef = useRef(null)
  const mapRef             = useRef(null)
  const [mappedProgress, setMappedProgress] = useState(0)

  const [fountainBurstId, setFountainBurstId] = useState(0)
  const [isPathSelected, setIsPathSelected] = useState(false)

  const handleFountainActivate = () => {
    setFountainBurstId((current) => current + 1)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!mapRef.current) return

      const rect = mapRef.current.getBoundingClientRect()
      const vh = window.innerHeight

      // Normalize section visibility
      let mappedProgressValue = (vh - rect.top) / (vh + rect.height)

      mappedProgressValue = Math.max(0, Math.min(1, mappedProgressValue))

      const bufferStart = 0.4
      const bufferEnd = 0.6

      if (mappedProgressValue < bufferStart) {
        mappedProgressValue = mappedProgressValue / bufferStart
      } else if (mappedProgressValue >= bufferStart && mappedProgressValue <= bufferEnd) {
        mappedProgressValue = 1
      } else {
        mappedProgressValue = 1 - (mappedProgressValue - bufferEnd) / (1 - bufferEnd)
      }

      mappedProgressValue = Math.max(0, Math.min(1, mappedProgressValue))

      setMappedProgress(mappedProgressValue)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Attach the assembly animation (separated into its own hook for clarity).
  useMapAssemblyAnimation(mapRef, mappedProgress, isPathSelected)

  useEffect(() => {
    if (hasConfirmedRoute) {
      setIsPathSelected(true)
    }
  }, [hasConfirmedRoute])

  const handleResetSelection = () => {
    setIsPathSelected(false)
    resetSelectionFlow()
  }

  // Auto-scroll to today's timetable when data loads.
  useEffect(() => {
    if (!todayTimetableLoading && todaySchedule && todayTimetableRef.current) {
      const timer = setTimeout(() => {
        todayTimetableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [todayTimetableLoading, todaySchedule])

  return (
    <>
      {/* assemblySectionRef wraps the entire map section so sectionTop
          correctly represents when the map enters the viewport. */}
      <section
        ref={assemblySectionRef}
        className="map-assembly-section"
        aria-labelledby="map-panel-title"
      >
        <section className="map-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Interactive route map</p>
              <h2 id="map-panel-title">Confirm start first, then destination</h2>
            </div>
            <span className="legend-pill">{selectionPrompt}</span>
          </div>

          {/* ── Selection wizard ── */}
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
                        setPendingSelection((current) => ({ ...current, floor }))
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
                onClick={handleResetSelection}
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
                <div
                  className="smart-mode-group"
                  role="group"
                  aria-label="Choose timetable window"
                >
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

          {/* ── Map frame ── */}
          <div className="map-frame">
            <div className="map-main">
              <div
                ref={mapRef}
                className="campus-map"
                role="img"
                aria-label="Interactive AMCS block map"
              >
                <LandmarkLayer
                  fountainRef={fountainRef}
                  onFountainActivate={handleFountainActivate}
                />
                <FountainAnimation
                  originRef={fountainRef}
                  burstId={fountainBurstId}
                />

                {shouldRenderPathConnections ? (
                  <svg
                    className="route-overlay"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {routeSegments.map((segment) => (
                      <path
                        key={segment.id}
                        className={`route-segment kind-${segment.kind}`}
                        d={segment.pathD}
                      />
                    ))}
                    {routeNodes.map((node, index) => {
                      const block = blockById[node.block]
                      if (!block) return null

                      const x = (((block.column - 1) + block.width  / 2) / 15) * 100
                      const y = (((block.row    - 1) + block.height / 2) / 11) * 100
                      const nodeClass =
                        index === 0
                          ? 'is-start'
                          : index === routeNodes.length - 1
                            ? 'is-end'
                            : 'is-middle'

                      return (
                        <g key={`node-${node.key}-${index}`}>
                          <circle
                            className={`route-node ${nodeClass}`}
                            cx={x}
                            cy={y}
                            r="1.45"
                          />
                          <text className="route-node-label" x={x} y={y - 2.1}>
                            {node.key}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                ) : null}

                {blockLayouts.map((block) => {
                  const blockMeta         = blockInfo[block.id]
                  const isInteractiveBlock = block.tone === 'accent'
                  const isOnPath          = shortestPathBlocks.includes(block.id)
                  const isStart           = startSelection?.block === block.id
                  const isDestination     = destinationSelection?.block === block.id
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
                    <MapBlock
                      key={block.id}
                      block={block}
                      blockMeta={blockMeta}
                      floor={floor}
                      selectedBlock={selectedBlock}
                      isOnPath={isOnPath}
                      isStart={isStart}
                      isDestination={isDestination}
                      isInteractiveBlock={isInteractiveBlock}
                      hasClickedBlock={hasClickedBlock}
                      hasConfirmedRoute={hasConfirmedRoute}
                      handleBlockClick={handleBlockClick}
                    />
                  )
                })}
              </div>

              <div className="path-strip" aria-label="Dummy path preview">
                {(shortestPathBlocks.length > 0
                  ? shortestPathBlocks
                  : [pendingSelection.block]
                ).map((blockId, index, list) => (
                  <div key={`path-${blockId}`} className="path-chip">
                    <span>{blockId}</span>
                    {index < list.length - 1 ? <i className="path-arrow" /> : null}
                  </div>
                ))}
              </div>

              <p className="path-text" aria-live="polite">
                {textualPath}
              </p>
              {routeError ? <p className="route-error">{routeError}</p> : null}
            </div>

            {/* ── Sidebar ── */}
            <div className="map-sidebar">
              <div className="map-legend-card" aria-label="Map legend">
                <p className="legend-title">Legend</p>
                <div className="map-legend">
                  <span className="legend-item">
                    <i className="legend-dot accent" />
                    Main blocks
                  </span>
                  <span className="legend-item">
                    <i className="legend-dot neutral" />
                    Other blocks
                  </span>
                  <span className="legend-item is-highlight">
                    <i className="legend-dot selected" />
                    Selected
                  </span>
                  <span className="legend-item is-highlight">
                    <i className="legend-dot start" />
                    Start
                  </span>
                  <span className="legend-item is-highlight">
                    <i className="legend-dot destination" />
                    Destination
                  </span>
                  <span className="legend-item">
                    <i className="legend-line ground" />
                    Ground floor link
                  </span>
                  <span className="legend-item">
                    <i className="legend-line bridge" />
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
                      {startSelection.block}{startSelection.floor} to{' '}
                      {destinationSelection.block}{destinationSelection.floor}
                    </p>
                    <div className="route-guide-strip">
                      {routeNodes.map((node, index) => (
                        <span
                          key={`route-node-chip-${node.key}-${index}`}
                          className="route-guide-chip"
                        >
                          {node.key}
                        </span>
                      ))}
                    </div>
                    <p className="route-guide-text">
                      {pathInstructions || 'No route instructions available.'}
                    </p>
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
      </section>

      {/* ── Today's timetable ── */}
      <section className="today-timetable" ref={todayTimetableRef}>
        <div className="section-heading">
          <div>
            <p className="section-kicker">Today</p>
            <h2>{todaySchedule?.day ?? "Today's timetable"}</h2>
          </div>
        </div>

        {todayTimetableLoading ? (
          <p className="route-guide-text">Loading timetable...</p>
        ) : null}

        {!todayTimetableLoading && todaySchedule ? (
          <div className="session-list">
            {todaySchedule.items.map((item) => (
              <div
                key={item.key ?? item.time}
                className={`session-card ${item.isFree ? 'is-free' : ''}`}
              >
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
