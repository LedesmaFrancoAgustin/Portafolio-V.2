import { useEffect, useRef, useState } from 'react'
import '../about.css'
import { CodePanel } from './CodePanel'
import { PetMascot } from './PetMascot'
import { ProjectionBeam } from './ProjectionBeam'

// mismo corte que useProjectionBeam (el beam se apaga acá porque las
// columnas se apilan): abajo de 900px la mascota pasa a ir después del
// panel de código en vez de después del texto, así que necesitamos saber
// en qué layout estamos para decidir dónde montarla.
const STACKED_COLUMNS_QUERY = '(max-width: 900px)'

function useStackedColumns() {
  const [stacked, setStacked] = useState(() => window.matchMedia(STACKED_COLUMNS_QUERY).matches)

  useEffect(() => {
    const mql = window.matchMedia(STACKED_COLUMNS_QUERY)
    const onChange = (e: MediaQueryListEvent) => setStacked(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return stacked
}

export function About() {
  const columnsRef = useRef<HTMLDivElement>(null)
  const mascotEyeRef = useRef<HTMLSpanElement>(null)
  const panelAnchorRef = useRef<HTMLSpanElement>(null)
  const [beamPaused, setBeamPaused] = useState(false)
  const stackedColumns = useStackedColumns()
  const mascot = <PetMascot eyeRef={mascotEyeRef} onPausedChange={setBeamPaused} />

  return (
    <section id="about" className="about-section">
      <div className="about-content section-text-scrim">
        <div className="about-top">
          <p className="about-eyebrow">SOBRE MÍ</p>
          <p className="about-heading ">
            Me gusta construir software aplicando buenas prácticas, con foco en el aprendizaje continuo y la mejora constante.
          </p>
        </div>

        <div className="about-divider" role="presentation" />

        <div className="about-columns" ref={columnsRef}>
          <div className="about-col about-col--text section-text-scrim">
            <h3 className="about-subheading">¡Conoceme un poco más!</h3>
            <p className="about-paragraph">
              Soy <strong className="about-highlight">desarrollador de software</strong> atraído por el backend, con formación en sistemas y una pasión particular por unir tecnología y educación. <strong className="about-highlight">Diseño APIs</strong>, arquitecturas de datos y sistemas pensados para escalar, principalmente con <strong className="about-highlight">Node.js, TypeScript, PostgreSQL y Prisma</strong>.
            </p>
            <p className="about-paragraph">
              En paralelo a mi trabajo como profesor de informática y en soporte IT dentro del sistema educativo, vengo desarrollando software real. Esa experiencia docente me dio una base sólida en comunicación, análisis y resolución de problemas que hoy aplico directamente al diseño de software. Actualmente curso la <strong className="about-highlight">Licenciatura en Sistemas</strong> en la Universidad Nacional de General Sarmiento (UNGS), y completé el curso de <strong className="about-highlight">Desarrollo Web Full Stack</strong> en Coderhouse, donde consolidé buenas prácticas de programación.
            </p>
            <p className="about-paragraph">
              Me interesan las oportunidades donde pueda seguir profundizando en backend y aportar esa mirada educativa al desarrollo de producto. Si te parece que mi perfil encaja con lo que buscás, escribime.
            </p>

            {!stackedColumns && mascot}
          </div>

          <div className="about-col about-col--focus">
            <CodePanel beamTargetRef={panelAnchorRef} />
          </div>

          {stackedColumns && mascot}

          <ProjectionBeam
            containerRef={columnsRef}
            sourceRef={mascotEyeRef}
            targetRef={panelAnchorRef}
            paused={beamPaused}
          />
        </div>

        <div className="about-actions">
          <a href="#projects" className="about-btn about-btn--solid">
            Ver mis proyectos <span aria-hidden="true">→</span>
          </a>
          <a href="#contact" className="about-btn about-btn--glass">
            Contactame <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
