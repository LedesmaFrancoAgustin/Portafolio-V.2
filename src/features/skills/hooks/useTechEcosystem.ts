import { useCallback, useEffect, useRef } from 'react'
import type { TechEcosystemController, TechEcosystemOptions } from '../lib/tech-ecosystem-scene'
import type { CategoryId } from '../lib/tech-data'

/** How far ahead of the viewport the scene starts downloading/mounting —
 *  enough for three.js (~140 KB gzip) to arrive before the user gets there. */
const PRELOAD_MARGIN = '400px 0px'

export function useTechEcosystem(options: Partial<TechEcosystemOptions> = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<TechEcosystemController | null>(null)
  // Kept so a highlight set before the scene finished loading isn't lost.
  const highlightRef = useRef<CategoryId | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let controller: TechEcosystemController | null = null

    // three.js only lives in the scene module, so importing it here (instead
    // of statically) keeps it out of the Skills chunk: the cards and text
    // render right away and the 3D scene loads only when it's about to show.
    const mount = () => {
      import('../lib/tech-ecosystem-scene').then(({ mountTechEcosystem }) => {
        if (cancelled) return
        controller = mountTechEcosystem(container, options)
        controller.setHighlightCategory(highlightRef.current)
        controllerRef.current = controller
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        mount()
      },
      { rootMargin: PRELOAD_MARGIN },
    )
    observer.observe(container)

    return () => {
      cancelled = true
      observer.disconnect()
      controllerRef.current = null
      controller?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setHighlightCategory = useCallback((category: CategoryId | null) => {
    highlightRef.current = category
    controllerRef.current?.setHighlightCategory(category)
  }, [])

  return { containerRef, setHighlightCategory }
}
