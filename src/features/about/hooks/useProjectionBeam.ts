import { useEffect, useState, type RefObject } from 'react'

/**
 * Tracks the line between a source anchor (the mascot's eye) and a target
 * anchor (the code panel) inside a shared container, writing the geometry
 * straight onto the root/lens elements every frame via refs (no React
 * state) so the beam keeps pointing true while the mascot bobs and the
 * panel floats/tilts — not just at the instant it was first measured.
 * Disabled below 900px, where the columns stack and the diagonal breaks.
 * Also paused whenever the container scrolls out of view, so the rAF loop
 * doesn't keep measuring/writing geometry for a beam nobody can see.
 */
export function useProjectionBeam(
  containerRef: RefObject<HTMLElement | null>,
  sourceRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  rootRef: RefObject<HTMLElement | null>,
  lensRef: RefObject<HTMLElement | null>,
) {
  const [hidden, setHidden] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 900px)')
    const update = () => setHidden(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '200px 0px',
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef])

  useEffect(() => {
    if (hidden || !visible) return

    let frameId: number

    function tick() {
      const container = containerRef.current
      const source = sourceRef.current
      const target = targetRef.current
      const root = rootRef.current
      const lens = lensRef.current

      if (container && source && target && root && lens) {
        const containerRect = container.getBoundingClientRect()
        const sourceRect = source.getBoundingClientRect()
        const targetRect = target.getBoundingClientRect()

        const sx = sourceRect.left + sourceRect.width / 2 - containerRect.left
        const sy = sourceRect.top + sourceRect.height / 2 - containerRect.top
        const tx = targetRect.left + targetRect.width / 2 - containerRect.left
        const ty = targetRect.top + targetRect.height / 2 - containerRect.top

        const dx = tx - sx
        const dy = ty - sy
        const angleDeg = (Math.atan2(dy, dx) * 120) / Math.PI
        const length = Math.hypot(dx, dy)

        root.style.left = `${sx}px`
        root.style.top = `${sy}px`
        root.style.width = `${length}px`
        root.style.transform = `rotate(${angleDeg}deg)`

        lens.style.left = `${sx}px`
        lens.style.top = `${sy}px`
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [hidden, visible, containerRef, sourceRef, targetRef, rootRef, lensRef])

  return hidden
}
