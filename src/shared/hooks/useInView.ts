import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Reports once an element has entered the viewport (or `rootMargin` around it) and then
 * keeps reporting true — pensado para gatear contenido pesado (iframes, videos) que debe
 * montarse una sola vez y quedarse montado, no des-montarse de nuevo si el usuario hace
 * scroll hacia atrás.
 */
export function useInView<T extends HTMLElement>(rootMargin = '300px 0px'): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView, rootMargin])

  return [ref, inView]
}
