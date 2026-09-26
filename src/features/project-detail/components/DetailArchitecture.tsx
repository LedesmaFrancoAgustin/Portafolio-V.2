import type { ProjectArchitecturePoint } from '../../../content/projects'

export function DetailArchitecture({
  summary,
  points,
}: {
  summary?: string
  points?: readonly ProjectArchitecturePoint[]
}) {
  return (
    <section
      className="project-detail__section section-text-scrim"
      aria-labelledby="project-detail-architecture-heading"
    >
      <h2 className="project-detail__section-heading" id="project-detail-architecture-heading">
        Arquitectura y stack
      </h2>

      {summary && <p className="project-detail__section-text">{summary}</p>}

      {points && points.length > 0 && (
        <dl className="project-detail__architecture-list">
          {points.map((point) => (
            <div className="project-detail__architecture-item" key={point.title}>
              <dt className="project-detail__architecture-title">{point.title}</dt>
              <dd className="project-detail__architecture-description">{point.description}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
