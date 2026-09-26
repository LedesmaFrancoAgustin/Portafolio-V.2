import { useEffect, useRef, useState, type RefObject } from 'react'
import petPixelStrip from '../../../assets/images/about/pet-pixel-strip.png'

interface PetMascotProps {
  /** Anchor for the projection beam's light source (roughly the pet's eye). */
  eyeRef?: RefObject<HTMLSpanElement>
  /** Fires whenever hovering swaps the writing loop for the idle look (and back). */
  onPausedChange?: (paused: boolean) => void
}

/**
 * Walking pixel-art mascot, ported from the "Hero Projection" Claude
 * Design prototype (65-frame sprite strip, looped via steps()). Hovering it
 * swaps the "writing" loop for a quiet standing look (about-pet-idle-look)
 * — and, via onPausedChange, halts the beam's data chips too — then both
 * resume as soon as the mouse leaves.
 */
export function PetMascot({ eyeRef, onPausedChange }: PetMascotProps) {
  const [hovered, setHovered] = useState(false)
  const [inView, setInView] = useState(true)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onPausedChange?.(hovered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '200px 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={stageRef}
      className="about-mascot-stage"
      data-in-view={inView}
      aria-hidden="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="about-mascot-wrap" data-paused={hovered || undefined}>
        <div className="about-mascot-aura" />
        <div className="about-mascot-ground" />
        <div className="about-mascot-sprite" style={{ backgroundImage: `url(${petPixelStrip})` }} />
        <div className="about-mascot-sprite about-mascot-sprite--ghost" style={{ backgroundImage: `url(${petPixelStrip})` }} />
        <span ref={eyeRef} className="about-mascot-eye-anchor" />
      </div>
    </div>
  )
}
