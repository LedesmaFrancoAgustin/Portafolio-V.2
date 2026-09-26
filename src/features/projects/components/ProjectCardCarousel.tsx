import { useEffect, useState } from 'react'

const ROTATION_INTERVAL_MS = 3500
const LIGHTBOX_ROTATION_INTERVAL_MS = 7000

export function ProjectCardCarousel({
  alt,
  images,
  activeIndex,
  onActiveIndexChange,
  slowRotation = false,
}: {
  alt: string
  images: readonly string[]
  activeIndex: number
  onActiveIndexChange: (updater: (current: number) => number) => void
  slowRotation?: boolean
}) {
  // Con loading="lazy" alcanza para no pedir las imágenes antes de que la card entre en
  // viewport, pero las 3-4 fotos del carrusel igual se piden todas juntas en ese momento
  // aunque solo se muestre una. Se van sumando de a una a medida que la rotación las va
  // necesitando, así la primera carga sola y el resto se reparte en el tiempo.
  const [loadedIndexes, setLoadedIndexes] = useState<ReadonlySet<number>>(() => new Set([0]))

  useEffect(() => {
    setLoadedIndexes((current) => (current.has(activeIndex) ? current : new Set(current).add(activeIndex)))
  }, [activeIndex])

  useEffect(() => {
    if (images.length <= 1) return

    const intervalMs = slowRotation ? LIGHTBOX_ROTATION_INTERVAL_MS : ROTATION_INTERVAL_MS
    const id = setInterval(() => {
      onActiveIndexChange((current) => (current + 1) % images.length)
    }, intervalMs)

    return () => clearInterval(id)
  }, [images.length, onActiveIndexChange, slowRotation])

  return (
    <>
      {images.map(
        (src, index) =>
          loadedIndexes.has(index) && (
            <img
              alt={index === activeIndex ? alt : ''}
              className={
                index === activeIndex
                  ? 'project-card__image project-card__image--active'
                  : 'project-card__image'
              }
              key={src}
              src={src}
              loading="lazy"
              decoding="async"
            />
          ),
      )}

      {images.length > 1 && (
        <div className="project-card__dots" aria-hidden="true">
          {images.map((src, index) => (
            <span
              className={
                index === activeIndex ? 'project-card__dot project-card__dot--active' : 'project-card__dot'
              }
              key={src}
            />
          ))}
        </div>
      )}
    </>
  )
}
