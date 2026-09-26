export function DetailFeatures({ features }: { features: readonly string[] }) {
  return (
    <section
      className="project-detail__section section-text-scrim"
      aria-labelledby="project-detail-features-heading"
    >
      <h2 className="project-detail__section-heading" id="project-detail-features-heading">
        Funcionalidades clave
      </h2>
      <ul className="project-detail__feature-list">
        {features.map((feature) => (
          <li className="project-detail__feature-item" key={feature}>
            {feature}
          </li>
        ))}
      </ul>
    </section>
  )
}
