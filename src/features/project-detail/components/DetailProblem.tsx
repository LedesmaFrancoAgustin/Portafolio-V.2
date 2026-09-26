export function DetailProblem({ problem }: { problem: string | readonly string[] }) {
  const paragraphs = Array.isArray(problem) ? problem : [problem as string]

  return (
    <section
      className="project-detail__section section-text-scrim"
      aria-labelledby="project-detail-problem-heading"
    >
      <h2 className="project-detail__section-heading" id="project-detail-problem-heading">
        El desafío
      </h2>
      {paragraphs.map((paragraph) => (
        <p className="project-detail__section-text" key={paragraph}>
          {paragraph}
        </p>
      ))}
    </section>
  )
}
