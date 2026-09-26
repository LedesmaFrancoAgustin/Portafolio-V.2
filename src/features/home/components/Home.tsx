import portrait from '../../../assets/images/home/franco-portrait.png'
import { useParticlePortrait } from '../hooks/useParticlePortrait'
import '../home.css'

export function Home() {
  const { wrapRef, canvasRef, ready } = useParticlePortrait(portrait)

  return (
    <section id="home" className="home-hero">
      <div className="home-hero__photo">
        <div className="home-hero__glow" aria-hidden="true" />
        <div
          className="home-hero__portrait-wrap"
          ref={wrapRef}
          data-particles={ready ? 'ready' : undefined}
        >
          <div className="home-hero__portrait-shadow">
            <img className="home-hero__portrait" src={portrait} alt="Franco Ledesma" />
          </div>
          <canvas
            ref={canvasRef}
            className="home-hero__portrait-sparkles"
            aria-hidden="true"
          />
          <div
            className="home-hero__portrait-tint"
            aria-hidden="true"
            style={{ maskImage: `url(${portrait})`, WebkitMaskImage: `url(${portrait})` }}
          />
        </div>
      </div>

      <div className="home-hero__content">
        <p className="home-hero__greeting">Hola, soy</p>
        <h1 className="home-hero__name">
          Franco <span className="home-hero__name-accent">Ledesma</span>
        </h1>
        <p className="home-hero__role">Software Developer · Profesor de Informática</p>
        <p className="home-hero__description section-text-scrim">
          Soy un apasionado del{' '}
          <span className="home-hero__highlight">desarrollo de software</span>, tanto en
          construirlo como en enseñarlo. Tengo un fuerte interés por el{' '}
          <span className="home-hero__highlight">backend</span>, donde trabajo con{' '}
          <span className="home-hero__highlight">Node.js</span>,{' '}
          <span className="home-hero__highlight">TypeScript</span>,{' '}
          <span className="home-hero__highlight">PostgreSQL</span> o{' '}
          <span className="home-hero__highlight">MongoDB</span>, combinado con React en
          el frontend — y gran parte de mis proyectos están pensados para el mundo{' '}
          <span className="home-hero__highlight">EdTech</span>.
        </p>
        <div className="home-hero__actions">
          <a href="#projects" className="home-hero__btn home-hero__btn--solid">
            Ver Proyectos <span aria-hidden="true">→</span>
          </a>
          <a href="#contact" className="home-hero__btn home-hero__btn--glass">
            Contacto
          </a>
        </div>
      </div>
    </section>
  )
}
