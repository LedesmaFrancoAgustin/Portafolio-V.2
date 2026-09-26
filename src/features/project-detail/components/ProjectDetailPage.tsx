import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { PROJECTS } from '../../../content/projects'
import { DetailArchitecture } from './DetailArchitecture'
import { DetailChallenges } from './DetailChallenges'
import { DetailFeatures } from './DetailFeatures'
import { DetailGallery } from './DetailGallery'
import { DetailHero } from './DetailHero'
import { DetailNav } from './DetailNav'
import { DetailPlayableDemo } from './DetailPlayableDemo'
import { DetailProblem } from './DetailProblem'
import '../project-detail.css'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const index = PROJECTS.findIndex((project) => project.slug === slug)

  // El detalle vive en la misma ruta al navegar entre proyectos (Anterior/
  // Siguiente en DetailNav), así que React solo actualiza el contenido y
  // conserva el scroll donde estaba — sin esto, abrís un proyecto nuevo a la
  // mitad de la página anterior en vez de arrancar por su inicio.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [slug])

  if (index === -1) {
    return <Navigate to="/" replace />
  }

  const project = PROJECTS[index]
  const detail = project.detail

  const hasArchitecture = Boolean(
    detail?.architectureSummary || (detail?.architecturePoints && detail.architecturePoints.length > 0),
  )
  const hasGallery = Boolean(
    (project.galleryItems && project.galleryItems.length > 0) ||
      (project.images && project.images.length > 0) ||
      project.image,
  )
  const hasChallenges = Boolean(
    (detail?.challenges && detail.challenges.length > 0) ||
      (detail?.improvements && detail.improvements.length > 0),
  )

  return (
    <article className="project-detail">
      <div className="project-detail__content section-text-scrim">
        <DetailHero project={project} />

        {detail?.hasPlayableDemo && <DetailPlayableDemo />}

        {detail?.problem && <DetailProblem problem={detail.problem} />}

        {hasGallery && (
          <DetailGallery
            galleryItems={project.galleryItems}
            image={project.image}
            images={project.images}
            name={project.name}
          />
        )}

        {detail?.features && detail.features.length > 0 && (
          <DetailFeatures features={detail.features} />
        )}

        {hasArchitecture && (
          <DetailArchitecture points={detail?.architecturePoints} summary={detail?.architectureSummary} />
        )}

        {hasChallenges && (
          <DetailChallenges challenges={detail?.challenges} improvements={detail?.improvements} />
        )}

        <DetailNav next={PROJECTS[index + 1]} previous={PROJECTS[index - 1]} />
      </div>
    </article>
  )
}
