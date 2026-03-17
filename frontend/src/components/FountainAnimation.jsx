import { useEffect, useRef } from 'react'

const MIN_TRIGGER_INTERVAL_MS = 220
const MAX_ACTIVE_BURSTS = 2
const BURST_RELEASE_MS = 1000
const PARTICLE_MIN = 14
const PARTICLE_MAX = 22
const PARTICLE_STAGGER_MS = 16

const PALETTE = ['#48e3c4', '#ffc45c', '#8dd3ff', '#7dd3fc']

export function FountainAnimation({ originRef, burstId }) {
	const layerRef = useRef(null)
	const lastTriggerAtRef = useRef(0)
	const activeBurstsRef = useRef(0)
	const timeoutIdsRef = useRef([])
	const rafIdsRef = useRef([])

	useEffect(() => {
		return () => {
			timeoutIdsRef.current.forEach((id) => window.clearTimeout(id))
			rafIdsRef.current.forEach((id) => window.cancelAnimationFrame(id))
			timeoutIdsRef.current = []
			rafIdsRef.current = []
		}
	}, [])

	useEffect(() => {
		if (!burstId || !originRef?.current || !layerRef.current) {
			return
		}

		const now = performance.now()
		if (now - lastTriggerAtRef.current < MIN_TRIGGER_INTERVAL_MS) {
			return
		}

		if (activeBurstsRef.current >= MAX_ACTIVE_BURSTS) {
			return
		}

		lastTriggerAtRef.current = now
		activeBurstsRef.current += 1

		const originRect = originRef.current.getBoundingClientRect()
		const layerRect = layerRef.current.getBoundingClientRect()
		const startX = originRect.left + (originRect.width / 2) - layerRect.left
		const startY = originRect.top + (originRect.height / 2) - layerRect.top

		const spawnParticle = () => {
			if (!layerRef.current) {
				return
			}

			const particle = document.createElement('div')
			const size = 3 + Math.random() * 5
			const angle = (Math.PI / 2) + ((Math.random() - 0.5) * 1.15)
			const speed = 2.2 + Math.random() * 2.5
			const vx = Math.cos(angle) * speed
			const vyStart = -Math.sin(angle) * (speed + 1.8)
			const gravity = 0.11 + Math.random() * 0.03
			const color = PALETTE[Math.floor(Math.random() * PALETTE.length)]

			particle.style.position = 'absolute'
			particle.style.left = `${startX}px`
			particle.style.top = `${startY}px`
			particle.style.width = `${size}px`
			particle.style.height = `${size}px`
			particle.style.borderRadius = '50%'
			particle.style.background = color
			particle.style.opacity = '0.94'
			particle.style.pointerEvents = 'none'
			particle.style.boxShadow = `0 0 ${Math.max(2, size)}px ${color}`

			layerRef.current.appendChild(particle)

			let x = 0
			let y = 0
			let vy = vyStart
			let opacity = 0.94

			const frame = () => {
				x += vx
				y += vy
				vy += gravity
				opacity -= 0.018

				particle.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
				particle.style.opacity = String(Math.max(0, opacity))

				if (opacity > 0) {
					const rafId = window.requestAnimationFrame(frame)
					rafIdsRef.current.push(rafId)
				} else {
					particle.remove()
				}
			}

			const rafId = window.requestAnimationFrame(frame)
			rafIdsRef.current.push(rafId)
		}

		const particleCount = PARTICLE_MIN + Math.floor(Math.random() * (PARTICLE_MAX - PARTICLE_MIN + 1))
		for (let i = 0; i < particleCount; i += 1) {
			const timeoutId = window.setTimeout(spawnParticle, i * PARTICLE_STAGGER_MS)
			timeoutIdsRef.current.push(timeoutId)
		}

		const releaseId = window.setTimeout(() => {
			activeBurstsRef.current = Math.max(0, activeBurstsRef.current - 1)
		}, BURST_RELEASE_MS)
		timeoutIdsRef.current.push(releaseId)
	}, [burstId, originRef])

	return (
		<div
			ref={layerRef}
			aria-hidden="true"
			style={{
				position: 'absolute',
				inset: 0,
				zIndex: 6,
				pointerEvents: 'none',
				overflow: 'hidden',
			}}
		/>
	)
}
