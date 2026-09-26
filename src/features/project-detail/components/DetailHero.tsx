import { Link } from 'react-router-dom'
import type { Project } from '../../../content/projects'

export function DetailHero({ project }: { project: Project }) {
  const { detail } = project
  const hasLinks = Boolean(project.liveUrl || project.repoUrl)
  const hasMeta = Boolean(detail?.role || detail?.period)

  return (
    <header className="project-detail__hero section-text-scrim">
      <Link className="project-detail__back" to="/#projects">
        <span aria-hidden="true">←</span> Volver a proyectos
      </Link>

      <h1 className="project-detail__title">
        {project.titleIcon && (
          <img alt="" className="project-detail__title-icon" src={project.titleIcon} />
        )}
        {project.name}
      </h1>

      {hasMeta && (
        <p className="project-detail__meta">
          {detail?.role}
          {detail?.role && detail?.period && <span aria-hidden="true"> · </span>}
          {detail?.period}
        </p>
      )}

      <p className="project-detail__summary">{project.summary}</p>

      <ul className="project-detail__tech">
        {project.tech.map((tech) => (
          <li className="project-detail__tech-tag" key={tech}>
            {tech}
          </li>
        ))}
      </ul>

      {hasLinks && (
        <div className="project-detail__links">
          {project.liveUrl && (
            <a
              className="project-detail__link"
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver sitio en vivo <span aria-hidden="true">↗</span>
            </a>
          )}
          {project.repoUrl && (
            <a
              className="project-detail__link"
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver código <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}
    </header>
  )
}
