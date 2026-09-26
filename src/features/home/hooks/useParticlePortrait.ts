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

    const controller = mountParticlePortrait(canvas, wrap, imageSrc, {
      onReady: () => setReady(true),
    })

    return () => controller.destroy()
  }, [imageSrc])

  return { wrapRef, canvasRef, ready }
}
