import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import '../projects.css'
import { ProjectImageLightbox } from './ProjectImageLightbox'

export interface GalleryItem {
  id: string
  title: string
  category: string
  alt: string
  /** Imagen estática (poster del video, o imagen sola si no hay video). Sin esto, se usa un degradé de relleno. */
  src?: string
  /** Clip corto en loop mudo. Preferí .webm (bastante más liviano) con .mp4 como respaldo. */
  video?: { webm?: string; mp4?: string }
}

// Nuestros clips son todos capturas de pantalla con casi la misma proporción (a
// diferencia de fotos variadas), así que sin esto todos los paneles inactivos
// quedarían con idéntica altura — se fuerza variedad tipo collage.
const INACTIVE_MEDIA_HEIGHTS = ['38%', '62%', '46%', '70%', '30%']

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(150deg, rgba(183, 155, 255, 0.35) 0%, rgba(109, 93, 159, 0.4) 55%, rgba(18, 10, 38, 0.55) 100%)',
  'linear-gradient(150deg, rgba(125, 211, 252, 0.32) 0%, rgba(56, 99, 140, 0.38) 55%, rgba(12, 20, 38, 0.55) 100%)',
  'linear-gradient(150deg, rgba(251, 146, 180, 0.32) 0%, rgba(140, 70, 99, 0.38) 55%, rgba(38, 12, 24, 0.55) 100%)',
  'linear-gradient(150deg, rgba(253, 224, 71, 0.28) 0%, rgba(140, 110, 40, 0.36) 55%, rgba(38, 28, 10, 0.55) 100%)',
  'linear-gradient(150deg, rgba(134, 239, 172, 0.28) 0%, rgba(60, 120, 90, 0.36) 55%, rgba(10, 30, 20, 0.55) 100%)',
]

/**
 * true una vez que el elemento se acerca al viewport (y queda así) — nada de la
 * galería (posters ni clips) se pide antes, así no compite con la carga inicial.
 */
function useNearViewport<T extends Element>(rootMargin = '300px') {
  const ref = useRef<T>(null)
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || isNear) return
    if (typeof IntersectionObserver === 'undefined') {
      setIsNear(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNear(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isNear, rootMargin])

  return [ref, isNear] as const
}

/**
 * Solo el panel activo reproduce su video — evita que el navegador tenga que
 * decodificar varios clips en simultáneo (y algunos motores pausan autoplay
 * "de fondo" sin volver a reanudarlo solos). Los inactivos muestran el poster,
 * y el clip recién se descarga la primera vez que el panel se activa.
 */
function GalleryVideo({
  alt,
  inactiveHeight,
  isActive,
  isPaused = false,
  poster,
  video,
}: {
  alt: string
  inactiveHeight: string
  isActive: boolean
  isPaused?: boolean
  poster?: string
  video: { webm?: string; mp4?: string }
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasBeenActive, setHasBeenActive] = useState(isActive)

  if (isActive && !hasBeenActive) setHasBeenActive(true)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    // React no siempre sincroniza la propiedad `muted` a tiempo para el chequeo de
    // autoplay del navegador cuando se setea solo vía JSX — se fuerza acá antes de play().
    el.muted = true

    if (!isActive || isPaused) {
      el.pause()
      return
    }

    el.play().catch(() => {})

    // Chrome pausa el video mudo "de fondo" para ahorrar batería si la pestaña
    // queda oculta (cambio de pestaña, minimizado) — se reintenta al volver.
    const resumeIfVisible = () => {
      if (document.visibilityState === 'visible') el.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', resumeIfVisible)
    return () => document.removeEventListener('visibilitychange', resumeIfVisible)
  }, [isActive, isPaused])

  return (
    <video
      aria-label={alt}
      className="featured-gallery__media featured-gallery__video"
      loop
      muted
      playsInline
      poster={poster}
      preload={hasBeenActive ? 'auto' : 'none'}
      ref={videoRef}
      style={{ height: isActive ? undefined : inactiveHeight }}
    >
      {video.webm && <source src={video.webm} type="video/webm" />}
      {video.mp4 && <source src={video.mp4} type="video/mp4" />}
    </video>
  )
}

export function FeaturedGallery({ items }: { items: readonly GalleryItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [galleryRef, isNearViewport] = useNearViewport<HTMLDivElement>()

  // Solo se pueden ampliar los ítems con captura real (no los de degradé de relleno).
  const enlargeable = items.filter((item) => item.src)
  const lightboxItem = lightboxIndex !== null ? enlargeable[lightboxIndex] : undefined
  const hasMultipleEnlargeable = enlargeable.length > 1

  const showInLightbox = (step: number) => {
    if (lightboxIndex === null) return
    const nextIndex = (lightboxIndex + step + enlargeable.length) % enlargeable.length
    setLightboxIndex(nextIndex)
    setActiveId(enlargeable[nextIndex].id)
  }

  // Primer toque activa el panel (clave en mobile, donde no hay hover); sobre el
  // panel ya activo, abre el visor a pantalla completa.
  const handleItemClick = (item: GalleryItem) => {
    if (item.id !== activeId) {
      setActiveId(item.id)
      return
    }
    const index = enlargeable.findIndex((candidate) => candidate.id === item.id)
    if (index !== -1) setLightboxIndex(index)
  }

  const handleItemKeyDown = (event: KeyboardEvent<HTMLDivElement>, item: GalleryItem) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleItemClick(item)
  }

  return (
    <div className="featured-gallery" ref={galleryRef}>
      {items.map((item, index) => {
        const isActive = item.id === activeId
        const inactiveHeight = INACTIVE_MEDIA_HEIGHTS[index % INACTIVE_MEDIA_HEIGHTS.length]
        const placeholder = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]
        return (
          <div
            aria-label={isActive && item.src ? `Ampliar ${item.title}` : `Ver ${item.title}`}
            className={
              isActive ? 'featured-gallery__item featured-gallery__item--active' : 'featured-gallery__item'
            }
            key={item.id}
            onClick={() => handleItemClick(item)}
            onKeyDown={(event) => handleItemKeyDown(event, item)}
            onMouseEnter={() => setActiveId(item.id)}
            role="button"
            tabIndex={0}
          >
            {!isNearViewport ? (
              <div
                aria-label={item.alt}
                className="featured-gallery__media"
                role="img"
                style={{ backgroundImage: placeholder, height: isActive ? undefined : inactiveHeight }}
              />
            ) : item.video ? (
              <GalleryVideo
                alt={item.alt}
                inactiveHeight={inactiveHeight}
                isActive={isActive}
                // Con el visor abierto se pausa: el mismo clip ya se reproduce ampliado.
                isPaused={Boolean(lightboxItem)}
                poster={item.src}
                video={item.video}
              />
            ) : item.src ? (
              <img
                alt={item.alt}
                className="featured-gallery__media"
                decoding="async"
                loading="lazy"
                src={item.src}
                style={{ height: isActive ? undefined : inactiveHeight }}
              />
            ) : (
              <div
                aria-label={item.alt}
                className="featured-gallery__media"
                role="img"
                style={{ backgroundImage: placeholder, height: isActive ? undefined : inactiveHeight }}
              />
            )}
            <div className="featured-gallery__overlay" />

            <div className="featured-gallery__content">
              <div className="featured-gallery__active-content">
                <span className="featured-gallery__tag">{item.category}</span>
                <h3 className="featured-gallery__title">{item.title}</h3>
                <span className="featured-gallery__cta">
                  Ver más
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="14"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    width="14"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
              </div>

              <div className="featured-gallery__inactive-label">
                <span className="featured-gallery__inactive-label-vertical">{item.title}</span>
                <span className="featured-gallery__inactive-label-id">{item.id}</span>
              </div>
            </div>
          </div>
        )
      })}

      {lightboxItem?.src && (
        <ProjectImageLightbox
          alt={lightboxItem.alt}
          onClose={() => setLightboxIndex(null)}
          onNext={hasMultipleEnlargeable ? () => showInLightbox(1) : undefined}
          onPrev={hasMultipleEnlargeable ? () => showInLightbox(-1) : undefined}
          src={lightboxItem.src}
          video={lightboxItem.video}
        />
      )}
    </div>
  )
}
