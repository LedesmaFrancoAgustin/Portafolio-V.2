import { Link } from 'react-router-dom'
import type { Project } from '../../../content/projects'

export function DetailNav({ previous, next }: { previous?: Project; next?: Project }) {
  if (!previous && !next) return null

  return (
    <nav className="project-detail__nav" aria-label="Navegación entre proyectos">
      {previous ? (
        <Link
          className="project-detail__nav-link project-detail__nav-link--prev"
          to={`/projects/${previous.slug}`}
        >
          <span className="project-detail__nav-label">
            <span aria-hidden="true">←</span> Anterior
          </span>
          <span className="project-detail__nav-name">{previous.name}</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      {next ? (
        <Link
          className="project-detail__nav-link project-detail__nav-link--next"
          to={`/projects/${next.slug}`}
        >
          <span className="project-detail__nav-label">
            Siguiente <span aria-hidden="true">→</span>
          </span>
          <span className="project-detail__nav-name">{next.name}</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  )
}
