import { useEffect, useRef, useState } from 'react'
import { mountParticlePortrait } from '../lib/particle-portrait'

export function useParticlePortrait(imageSrc: string) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (reducedMotion || !canvas || !wrap) return

    // el halo de partículas es decoración sobre la foto ya visible: se monta
    // cuando el navegador queda ocioso para no competir con el primer render
    let controller: ReturnType<typeof mountParticlePortrait> | undefined
    const mount = () => {
      controller = mountParticlePortrait(canvas, wrap, imageSrc, {
        onReady: () => setReady(true),
      })
    }
    const handle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(mount, { timeout: 2000 })
        : window.setTimeout(mount, 500)

    return () => {
      if (typeof window.requestIdleCallback === 'function') window.cancelIdleCallback(handle)
      else window.clearTimeout(handle)
      controller?.destroy()
    }
  }, [imageSrc])

  return { wrapRef, canvasRef, ready }
}
