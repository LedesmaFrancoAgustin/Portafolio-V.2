import { NarutoGameDemo } from '../../naruto-game/components/NarutoGameDemo'

export function DetailPlayableDemo() {
  return (
    <section className="project-detail__section" aria-labelledby="project-detail-demo-heading">
      <h2 className="project-detail__section-heading" id="project-detail-demo-heading">
        Probalo vos mismo
      </h2>
      <p className="project-detail__section-text">
        Versión mínima del juego original portada a Canvas y TypeScript: movete con las
        flechas o WASD y esquivá a los ninjas.
      </p>
      <NarutoGameDemo />
    </section>
  )
}
