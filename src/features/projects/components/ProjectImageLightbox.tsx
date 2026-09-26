import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function ProjectImageLightbox({
  src,
  alt,
  onClose,
  onPrev,
  onNext,
  video,
}: {
  /** Imagen a ampliar; si hay `video`, se usa como poster mientras carga el clip. */
  src: string
  alt: string
  video?: { webm?: string; mp4?: string }
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrev?.()
      if (event.key === 'ArrowRight') onNext?.()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrev, onNext])

  return createPortal(
    <div className="project-lightbox" onClick={onClose} role="presentation">
      <button
        className="project-lightbox__close"
        onClick={onClose}
        aria-label="Cerrar imagen ampliada"
        type="button"
      >
        ×
      </button>

      {onPrev && (
        <button
          className="project-lightbox__nav project-lightbox__nav--prev"
          onClick={(event) => {
            event.stopPropagation()
            onPrev()
          }}
          aria-label="Imagen anterior"
          type="button"
        >
          ‹
        </button>
      )}

      {video ? (
        <video
          aria-label={alt}
          autoPlay
          className="project-lightbox__image project-lightbox__image--video"
          key={src}
          loop
          muted
          onClick={(event) => event.stopPropagation()}
          playsInline
          poster={src}
        >
          {video.webm && <source src={video.webm} type="video/webm" />}
          {video.mp4 && <source src={video.mp4} type="video/mp4" />}
        </video>
      ) : (
        <img
          className="project-lightbox__image"
          src={src}
          alt={alt}
          decoding="async"
          onClick={(event) => event.stopPropagation()}
        />
      )}

      {onNext && (
        <button
          className="project-lightbox__nav project-lightbox__nav--next"
          onClick={(event) => {
            event.stopPropagation()
            onNext()
          }}
          aria-label="Imagen siguiente"
          type="button"
        >
          ›
        </button>
      )}
    </div>,
    document.body,
  )
}
