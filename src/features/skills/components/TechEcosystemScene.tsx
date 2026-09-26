import { useEffect } from 'react'
import { useTechEcosystem } from '../hooks/useTechEcosystem'
import { categoryIdForTech, TECH, type CategoryId } from '../lib/tech-data'

interface TechEcosystemSceneProps {
  onCategoryHover?: (category: CategoryId | null) => void
  /** Set from outside (hovering a category card) to highlight every tile in
   *  that category — the reverse of the scene's own tile hover. */
  highlightCategory?: CategoryId | null
}

export function TechEcosystemScene({ onCategoryHover, highlightCategory = null }: TechEcosystemSceneProps) {
  const { containerRef, setHighlightCategory } = useTechEcosystem({
    onHoverChange: (techId) => onCategoryHover?.(techId ? categoryIdForTech(techId) : null),
  })

  useEffect(() => {
    setHighlightCategory(highlightCategory)
  }, [highlightCategory, setHighlightCategory])

  return (
    <div className="tech-ecosystem">
      <div className="tech-ecosystem__stage" ref={containerRef} />

      <div className="tech-ecosystem__hint" aria-hidden="true">
        Descubrí las tecnologías
      </div>

      <ul className="sr-only">
        {TECH.map((tech) => (
          <li key={tech.id}>
            {tech.label} — {tech.cluster}
          </li>
        ))}
      </ul>
    </div>
  )
}
