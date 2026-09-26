import { useMemo, useRef, type RefObject } from 'react'
import { useProjectionBeam } from '../hooks/useProjectionBeam'

interface ProjectionBeamProps {
  containerRef: RefObject<HTMLElement | null>
  sourceRef: RefObject<HTMLElement | null>
  targetRef: RefObject<HTMLElement | null>
  /** While true (mascot hovered/clicked), stop sending data chips down the beam. */
  paused?: boolean
}

interface Ray {
  angle: number
  lengthPct: number
  topPx: number
  opacity: number
  duration: number
  delay: number
}

interface Chip {
  angle: number
  topPx: number
  size: number
  tone: 'white' | 'cyan'
  duration: number
  delay: number
}

interface Mote {
  t: number
  jitter: number
  size: number
  duration: number
  delay: number
}

const RAY_ANGLES = [-16, -14, -12.5, -6, 1, 8, 15, 20]
const CHIP_COUNT = 9
const MOTE_COUNT = 7

function buildRays(): Ray[] {
  return RAY_ANGLES.map((angle, i) => ({
    angle,
    lengthPct: 84 + ((i * 23) % 16),
    topPx: (Math.sin(i * 5.1) * 0.5) * 10,
    opacity: 0.22 + ((i * 13) % 10) / 32,
    duration: 4.4 + ((i * 17) % 5),
    delay: -((i * 31) % 8),
  }))
}

function buildChips(): Chip[] {
  return Array.from({ length: CHIP_COUNT }, (_, i) => ({
    angle: RAY_ANGLES[i % RAY_ANGLES.length],
    topPx: (Math.sin(i * 6.7) * 0.5) * 6,
    size: 4 + ((i * 11) % 3),
    tone: i % 3 === 0 ? 'cyan' : 'white',
    duration: 2.6 + ((i * 19) % 6) * 0.35,
    delay: -((i * 41) % 24) * 0.35,
  }))
}

function buildMotes(): Mote[] {
  return Array.from({ length: MOTE_COUNT }, (_, i) => ({
    t: 0.22 + (i / MOTE_COUNT) * 0.68 + (Math.sin(i * 12.9) * 0.5 + 0.5) * 0.05,
    jitter: Math.sin(i * 7.3),
    size: 2 + ((i * 37) % 4),
    duration: 6 + ((i * 53) % 7),
    delay: -((i * 29) % 9),
  }))
}

/** The mascot "projecting" the floating code panel — a light cone measured
 * live between both anchors, so it holds up across the responsive grid.
 * Built from a fan of individual rays plus small data "chips" flying along
 * the beam, echoing the reference projector look. */
export function ProjectionBeam({ containerRef, sourceRef, targetRef, paused = false }: ProjectionBeamProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const lensRef = useRef<HTMLDivElement>(null)
  const hidden = useProjectionBeam(containerRef, sourceRef, targetRef, rootRef, lensRef)
  const rays = useMemo(buildRays, [])
  const chips = useMemo(buildChips, [])
  const motes = useMemo(buildMotes, [])

  if (hidden) return null

  return (
    <div className="about-beam-layer" aria-hidden="true">
      <div className="about-beam-lens" ref={lensRef}>
        <span className="about-beam-lens-ring" />
        <span className="about-beam-lens-core" />
      </div>

      <div className="about-beam-root" ref={rootRef}>
        <div className="about-beam-cone" />

        <div className="about-beam-rays">
          {rays.map((r, i) => (
            <span
              key={i}
              className="about-beam-ray"
              style={{
                width: `${r.lengthPct}%`,
                top: `calc(50% + ${r.topPx}px)`,
                opacity: r.opacity,
                transform: `rotate(${r.angle}deg)`,
                animationDuration: `${r.duration}s`,
                animationDelay: `${r.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="about-beam-core" />

        <div className="about-beam-sweep-wrap">
          <div className="about-beam-sweep" />
        </div>

        {!paused && chips.map((c, i) => (
          <span
            key={i}
            className="about-beam-chip-track"
            style={{
              top: `calc(50% + ${c.topPx}px)`,
              transform: `rotate(${c.angle}deg)`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          >
            <span
              className={`about-beam-chip about-beam-chip--${c.tone}`}
              style={{
                width: c.size,
                height: c.size * 0.6,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
              }}
            />
          </span>
        ))}

        {motes.map((m, i) => (
          <span
            key={i}
            className="about-beam-mote"
            style={{
              left: `${m.t * 100}%`,
              top: `calc(50% + ${m.jitter * 32}px)`,
              width: m.size,
              height: m.size,
              animationDuration: `${m.duration}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
