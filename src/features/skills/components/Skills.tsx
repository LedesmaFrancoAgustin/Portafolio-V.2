import { useState, type CSSProperties } from 'react'
import '../skills.css'
import { CATEGORY_DETAILS, type CategoryId } from '../lib/tech-data'
import { CategoryIconGlyph } from '../lib/category-icons'
import { TechEcosystemScene } from './TechEcosystemScene'

export function Skills() {
  // Tile hover (in the 3D scene) → highlights the matching card.
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null)
  // Card hover → highlights every tile in that category — the reverse.
  const [hoveredCardCategory, setHoveredCardCategory] = useState<CategoryId | null>(null)

  return (
    <section id="skills" className="skills-section">
      <div className="skills-content">
        <div className="section-text-scrim">
          <p className="skills-eyebrow">Habilidades</p>
          <h2 className="skills-heading">Herramientas que uso a diario.</h2>
          <p className="skills-paragraph">
            Un conjunto de tecnologías que uso día a día, desde la interfaz hasta la base de
            datos.
          </p>
        </div>

        <div className="skills-layout">
          <ul className="skills-categories">
            {CATEGORY_DETAILS.map((category) => (
              <li
                key={category.id}
                className={`skills-category-card${category.id === activeCategory ? ' is-active' : ''}`}
                style={{ '--category-color': category.color } as CSSProperties}
                onMouseEnter={() => setHoveredCardCategory(category.id)}
                onMouseLeave={() => setHoveredCardCategory((current) => (current === category.id ? null : current))}
              >
                <div className="skills-category-card__header">
                  <span className="skills-category-card__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <CategoryIconGlyph id={category.id} />
                    </svg>
                  </span>
                  <h3 className="skills-category-card__title">{category.label}</h3>
                </div>
                <p className="skills-category-card__description">
                  {category.description.map((segment, index) =>
                    typeof segment === 'string' ? (
                      segment
                    ) : (
                      <strong key={index}>{segment.bold}</strong>
                    ),
                  )}
                </p>
              </li>
            ))}
          </ul>

          <TechEcosystemScene onCategoryHover={setActiveCategory} highlightCategory={hoveredCardCategory} />
        </div>
      </div>
    </section>
  )
}
