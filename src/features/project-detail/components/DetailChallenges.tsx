export function DetailChallenges({
  challenges,
  improvements,
}: {
  challenges?: readonly string[]
  improvements?: readonly string[]
}) {
  const hasChallenges = Boolean(challenges && challenges.length > 0)
  const hasImprovements = Boolean(improvements && improvements.length > 0)
  const heading =
    hasChallenges && hasImprovements ? 'Desafíos y mejoras' : hasImprovements ? 'Mejoras' : 'Desafíos'

  return (
    <section
      className="project-detail__section section-text-scrim"
      aria-labelledby="project-detail-challenges-heading"
    >
      <h2 className="project-detail__section-heading" id="project-detail-challenges-heading">
        {heading}
      </h2>

      {challenges && challenges.length > 0 && (
        <div className="project-detail__subsection">
          <h3 className="project-detail__subheading">Desafíos técnicos</h3>
          <ul className="project-detail__feature-list">
            {challenges.map((item) => (
              <li className="project-detail__feature-item" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {improvements && improvements.length > 0 && (
        <div className="project-detail__subsection">
          <h3 className="project-detail__subheading">Próximos pasos</h3>
          <ul className="project-detail__feature-list">
            {improvements.map((item) => (
              <li className="project-detail__feature-item" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
