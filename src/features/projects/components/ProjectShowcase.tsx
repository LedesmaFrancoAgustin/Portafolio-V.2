import { useEffect, useRef, useState } from 'react'

export interface ShowcaseVideo {
  /** Preferí .webm (más liviano) con .mp4 como respaldo. */
  webm?: string
  mp4?: string
  /** Primer cuadro estático: se ve antes de que arranque el video y con reduced-motion. */
  poster?: string
  /** Qué URL se está mostrando en cada tramo del video (segundos desde el inicio,
   *  en orden). La barra de dirección y el link siguen al tramo actual. */
  chapters?: readonly { from: number; url: string }[]
}

function urlAt(chapters: ShowcaseVideo['chapters'], time: number, fallback: string) {
  let url = fallback
  for (const chapter of chapters ?? []) {
    if (chapter.from <= time) url = chapter.url
  }
  return url
}

/**
 * Vista previa del proyecto destacado: un clip grabado en loop mudo dentro de un
 * marco tipo navegador. Reemplaza al iframe en vivo, que descargaba y ejecutaba la
 * SPA completa (y la re-montaba en cada rotación) — el sitio real queda a un clic.
 */
export function ProjectShowcase({ url, name, video }: { url: string; name: string; video: ShowcaseVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activeUrl, setActiveUrl] = useState(() => urlAt(video.chapters, 0, url))

  // `timeupdate` llega ~4 veces por segundo: alcanza para un cambio de URL, y el
  // setState no re-renderiza si el tramo no cambió.
  useEffect(() => {
    const el = videoRef.current
    if (!el || !video.chapters?.length) return

    const sync = () => setActiveUrl(urlAt(video.chapters, el.currentTime, url))
    el.addEventListener('timeupdate', sync)
    el.addEventListener('seeked', sync)
    return () => {
      el.removeEventListener('timeupdate', sync)
      el.removeEventListener('seeked', sync)
    }
  }, [video.chapters, url])

  // Solo reproduce mientras está en pantalla y con la pestaña visible: fuera de
  // eso se pausa para no decodificar de fondo.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    // React no siempre sincroniza `muted` a tiempo para el chequeo de autoplay.
    el.muted = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let isVisible = false
    const sync = () => {
      if (isVisible && document.visibilityState === 'visible') el.play().catch(() => {})
      else el.pause()
    }

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      sync()
    })
    observer.observe(el)
    document.addEventListener('visibilitychange', sync)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  return (
    <a
      className="project-showcase"
      href={activeUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Abrir el sitio en vivo de ${name}`}
    >
      <div className="project-showcase__chrome">
        <span />
        <span />
        <span />
        <span className="project-showcase__url">{activeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
      </div>

      <div className="project-showcase__frame">
        <video
          aria-label={`Recorrido por ${name}`}
          className="project-showcase__video"
          loop
          muted
          playsInline
          poster={video.poster}
          preload="none"
          ref={videoRef}
        >
          {video.webm && <source src={video.webm} type="video/webm" />}
          {video.mp4 && <source src={video.mp4} type="video/mp4" />}
        </video>
      </div>

      <span className="project-showcase__badge">Vista en vivo ↗</span>
    </a>
  )
}
