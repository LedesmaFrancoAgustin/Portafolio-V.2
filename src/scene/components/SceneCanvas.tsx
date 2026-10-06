import { useEffect, useRef, useState } from 'react'
import skyDayBase from '../../assets/images/scene/sky/Fondo.webp'
import { StarField } from './StarField'
import cloud1 from '../../assets/images/scene/interactive-cloud/Cloud-1.webp'
import cloud2 from '../../assets/images/scene/interactive-cloud/cloud-2.webp'
import cloud3 from '../../assets/images/scene/interactive-cloud/Cloud-3.webp'
import cloud4 from '../../assets/images/scene/interactive-cloud/Cloud-4.webp'
import cloud5 from '../../assets/images/scene/interactive-cloud/Cloud-5.webp'
import { SceneLoader } from './SceneLoader'
import '../scene.css'

const CLOUD_EFFECT = {
  influence: 0.22,
  strength: 0.28,
  glow: 1,
  erode: 1,
  breathe: 4,
}

// nubes hero (frente, más grandes) mantienen más partículas; las de fondo/haze
// se notan mucho menos en la dispersión y no justifican el mismo costo de simulación
const DENSITY_HERO = 0.5
const DENSITY_MID = 0.3
const DENSITY_WISP = 0.25
const DENSITY_HAZE = 0.18

// mismo corte que scene.css (max-width: 640px): en mobile hay bastante menos
// CPU disponible que en desktop, así que la simulación de partículas de cada
// nube (que no escala con el tamaño en pantalla, ver interactive-cloud.js)
// se reduce con un factor aparte
const MOBILE_QUERY = '(max-width: 640px)'
const MOBILE_DENSITY_FACTOR = 0.25

// Las nubes (5 contextos WebGL + simulación de partículas) y las estrellas son
// pura decoración: se montan recién cuando el navegador está ocioso después del
// primer pintado, para que no compitan con el render del hero ni inflen el TBT.
// El cielo (<img>) sí se muestra de inmediato; la escena es position:fixed, así
// que montar el resto después no mueve nada del layout.
function useDeferredScene() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let idleId: number | undefined
    let timeoutId: number | undefined

    const start = () => {
      const mount = () => {
        // el custom element <interactive-cloud> se registra al importar el módulo
        import('../lib/interactive-cloud.js').then(() => {
          if (!cancelled) setReady(true)
        })
      }
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(mount, { timeout: 1500 })
      } else {
        timeoutId = window.setTimeout(mount, 300)
      }
    }

    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', start)
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [])

  return ready
}

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

// sin evento de "listo" de una nube (error de red, WebGL caído) el loader no
// puede quedar colgado: pasado este tiempo se da la escena por cargada
const LOAD_TIMEOUT_MS = 10000

function useCloudsProgress(sceneReady: boolean, total: number) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(0)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const onReady = () => setLoaded((n) => n + 1)
    host.addEventListener('cloudready', onReady)
    const t = window.setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS)
    return () => {
      host.removeEventListener('cloudready', onReady)
      window.clearTimeout(t)
    }
  }, [])

  const done = timedOut || (sceneReady && loaded >= total)
  // el módulo de nubes cuenta como primer tramo; luego avanza con cada nube lista
  const progress = done ? 1 : sceneReady ? 0.15 + 0.85 * (loaded / total) : 0.05
  return { hostRef, done, progress }
}

interface SceneCanvasProps {
  isNight: boolean
}

export function SceneCanvas({ isNight }: SceneCanvasProps) {
  const isMobile = useIsMobileViewport()
  const sceneReady = useDeferredScene()
  const scale = isMobile ? MOBILE_DENSITY_FACTOR : 1
  const cloudCount = isMobile ? 4 : 5
  const { hostRef, done, progress } = useCloudsProgress(sceneReady, cloudCount)
  const cloudEffect = isNight ? { ...CLOUD_EFFECT, glow: 0.35 } : CLOUD_EFFECT

  return (
    <div
      ref={hostRef}
      className={`scene-canvas${isNight ? ' is-night' : ''}${done ? ' is-loaded' : ''}`}
      aria-hidden="true"
    >
      <img className="scene-sky" src={skyDayBase} alt="" />
      <div className="scene-night-moon">
        <svg viewBox="0 0 100 100">
          <mask id="scene-moon-mask">
            <rect width="100" height="100" fill="#fff" />
            <circle cx="63" cy="36" r="34" fill="#000" />
          </mask>
          <circle cx="50" cy="50" r="34" fill="#f6f2e2" mask="url(#scene-moon-mask)" />
        </svg>
      </div>
      <div className="scene-shooting-star" />
      <SceneLoader progress={progress} done={done} />
      {sceneReady && (
        <>
          <StarField night={isNight} />
          <interactive-cloud class="scene-cloud-interactive scene-cloud-interactive--4" src={cloud4} {...cloudEffect} density={DENSITY_HAZE * scale} />
          <interactive-cloud class="scene-cloud-interactive scene-cloud-interactive--3" src={cloud3} {...cloudEffect} density={DENSITY_MID * scale} />
          {/* en mobile se omite el wisp chico (el menos visible): una simulación WebGL menos */}
          {!isMobile && (
            <interactive-cloud class="scene-cloud-interactive scene-cloud-interactive--2" src={cloud2} {...cloudEffect} density={DENSITY_WISP * scale} />
          )}
          <interactive-cloud class="scene-cloud-interactive scene-cloud-interactive--1" src={cloud1} {...cloudEffect} density={DENSITY_HERO * scale} />
          <interactive-cloud class="scene-cloud-interactive scene-cloud-interactive--5" src={cloud5} {...cloudEffect} density={DENSITY_HERO * scale} />
        </>
      )}
    </div>
  )
}
