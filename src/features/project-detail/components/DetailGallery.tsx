import { useState } from 'react'
import { FeaturedGallery, type GalleryItem } from '../../projects/components/FeaturedGallery'
import { ProjectImageLightbox } from '../../projects/components/ProjectImageLightbox'

export function DetailGallery({
  galleryItems,
  images,
  image,
  name,
}: {
  galleryItems?: readonly GalleryItem[]
  images?: readonly string[]
  image?: string
  name: string
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const hasMultipleImages = Boolean(images && images.length > 1)

  const showPrevImage = () => {
    if (!images) return
    setActiveIndex((current) => ((current ?? 0) - 1 + images.length) % images.length)
  }

  const showNextImage = () => {
    if (!images) return
    setActiveIndex((current) => ((current ?? 0) + 1) % images.length)
  }

  const activeSrc = activeIndex === null ? undefined : images ? images[activeIndex] : image

  return (
    <section className="project-detail__section" aria-labelledby="project-detail-gallery-heading">
      <h2 className="project-detail__section-heading" id="project-detail-gallery-heading">
        Galería
      </h2>

      {galleryItems && galleryItems.length > 0 ? (
        <FeaturedGallery items={galleryItems} />
      ) : images && images.length > 0 ? (
        <div className="project-detail__image-grid">
          {images.map((src, index) => (
            <button
              aria-label={`Ampliar captura ${index + 1} de ${name}`}
              className="project-detail__image-button"
              key={src}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <img alt={`Captura ${index + 1} de ${name}`} className="project-detail__image" src={src} />
            </button>
          ))}
        </div>
      ) : image ? (
        <button
          aria-label={`Ampliar captura de ${name}`}
          className="project-detail__image-button project-detail__image-button--single"
          onClick={() => setActiveIndex(0)}
          type="button"
        >
          <img
            alt={`Captura de ${name}`}
            className="project-detail__image project-detail__image--single"
            src={image}
          />
        </button>
      ) : null}

      {activeSrc && (
        <ProjectImageLightbox
          alt={name}
          onClose={() => setActiveIndex(null)}
          onNext={hasMultipleImages ? showNextImage : undefined}
          onPrev={hasMultipleImages ? showPrevImage : undefined}
          src={activeSrc}
        />
      )}
    </section>
  )
}
