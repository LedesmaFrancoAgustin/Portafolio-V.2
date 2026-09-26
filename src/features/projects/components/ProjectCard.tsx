import { useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../../content/projects'
import { NarutoGameModal } from '../../naruto-game/components/NarutoGameModal'
import { ProjectCardCarousel } from './ProjectCardCarousel'
import { ProjectImageLightbox } from './ProjectImageLightbox'

function FileIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  )
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function BranchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M6 8.5v7" />
      <path d="M18 10.5c0 4-6 3-11 6" />
    </svg>
  )
}

export function ProjectCard({
  project,
  featured = false,
}: {
  project: Project
  featured?: boolean
}) {
  const hasLinks = Boolean(project.liveUrl || project.repoUrl)
  const hasPlayableDemo = Boolean(project.detail?.hasPlayableDemo)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isGameOpen, setIsGameOpen] = useState(false)

  const images = project.images && project.images.length > 0 ? project.images : undefined
  const activeImage = images ? images[activeIndex] : project.image
  const canEnlarge = !featured && Boolean(activeImage)
  const hasMultipleImages = Boolean(images && images.length > 1)

  const openLightbox = () => {
    if (canEnlarge) setIsLightboxOpen(true)
  }

  const showPrevImage = () => {
    if (!images) return
    setActiveIndex((current) => (current - 1 + images.length) % images.length)
  }

  const showNextImage = () => {
    if (!images) return
    setActiveIndex((current) => (current + 1) % images.length)
  }

  const handleMediaKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    openLightbox()
  }

  return (
    <article className={featured ? 'project-card project-card--featured' : 'project-card'}>
      {!featured && (
        <div className="project-card__titlebar" aria-hidden="true">
          <span className="project-card__lights">
            <span />
            <span />
            <span />
          </span>
          <span className="project-card__tab">
            <FileIcon />
            <span>
              {project.slug}.{project.codeExt ?? 'tsx'}
            </span>
          </span>
        </div>
      )}

      <div
        className="project-card__media"
        onClick={canEnlarge ? openLightbox : undefined}
        onKeyDown={canEnlarge ? handleMediaKeyDown : undefined}
        role={canEnlarge ? 'button' : undefined}
        tabIndex={canEnlarge ? 0 : undefined}
        aria-label={canEnlarge ? `Ampliar imagen de ${project.name}` : undefined}
      >
        {images ? (
          <ProjectCardCarousel
            alt={project.name}
            images={images}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            slowRotation={isLightboxOpen}
          />
        ) : project.image ? (
          <img
            className="project-card__image"
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="project-card__placeholder" aria-hidden="true">
            {project.name}
          </span>
        )}
      </div>

      {isLightboxOpen && activeImage && (
        <ProjectImageLightbox
          src={activeImage}
          alt={project.name}
          onClose={() => setIsLightboxOpen(false)}
          onPrev={hasMultipleImages ? showPrevImage : undefined}
          onNext={hasMultipleImages ? showNextImage : undefined}
        />
      )}

      {isGameOpen && <NarutoGameModal onClose={() => setIsGameOpen(false)} />}

      <div className="project-card__body">
        {featured ? (
          <div className="project-card__description section-text-scrim">
            <h3 className="project-card__title">
              {project.titleIcon && (
                <img alt="" className="project-card__title-icon" src={project.titleIcon} />
              )}
              {project.name}
            </h3>
            <p className="project-card__summary">{project.summary}</p>
            {project.problemSummary && (
              <p className="project-card__problem">{project.problemSummary}</p>
            )}
            {project.metric && <p className="project-card__problem">{project.metric}</p>}

            <ul className="project-card__tech">
              {project.tech.map((tech) => (
                <li className="project-card__tech-tag" key={tech}>
                  {tech}
                </li>
              ))}
            </ul>

            <div className="project-card__links">
              <Link className="project-card__link" to={`/projects/${project.slug}`}>
                Ver detalle <span aria-hidden="true">→</span>
              </Link>
              {hasLinks && project.liveUrl && (
                <a
                  className="project-card__link"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver sitio <span aria-hidden="true">↗</span>
                </a>
              )}
              {hasLinks && project.repoUrl && (
                <a
                  className="project-card__link project-card__link--primary"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Código</span>
                  <span className="project-card__link-arrow" aria-hidden="true">↗</span>
                </a>
              )}
              {hasPlayableDemo && (
                <button
                  className="project-card__link project-card__link--play"
                  onClick={() => setIsGameOpen(true)}
                  type="button"
                >
                  <PlayIcon size={14} />
                  <span>Jugar</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <h3 className="project-card__title">
              {project.titleIcon && (
                <img alt="" className="project-card__title-icon" src={project.titleIcon} />
              )}
              {project.name}
            </h3>
            <p className="project-card__summary">{project.summary}</p>
            {project.problemSummary && (
              <p className="project-card__problem">{project.problemSummary}</p>
            )}
            {project.metric && <p className="project-card__problem">{project.metric}</p>}

            <ul className="project-card__tech">
              {project.tech.map((tech) => (
                <li className="project-card__tech-tag" key={tech}>
                  {tech}
                </li>
              ))}
            </ul>

            <div className="project-card__links">
              <Link className="project-card__link" to={`/projects/${project.slug}`}>
                Ver detalle <span aria-hidden="true">→</span>
              </Link>
              {hasLinks && project.liveUrl && (
                <a
                  className="project-card__link"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver sitio <span aria-hidden="true">↗</span>
                </a>
              )}
              {hasLinks && project.repoUrl && (
                <a
                  className="project-card__link project-card__link--primary"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <BranchIcon size={14} />
                  <span>Código</span>
                  <span className="project-card__link-arrow" aria-hidden="true">↗</span>
                </a>
              )}
              {hasPlayableDemo && (
                <button
                  className="project-card__link project-card__link--play"
                  onClick={() => setIsGameOpen(true)}
                  type="button"
                >
                  <PlayIcon size={14} />
                  <span>Jugar</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {!featured && (
        <div className="project-card__statusbar" aria-hidden="true">
          <span className="project-card__branch">
            <BranchIcon size={12} />
            main
          </span>
          <span className="project-card__filetype">{(project.codeExt ?? 'tsx').toUpperCase()}</span>
        </div>
      )}
    </article>
  )
}
