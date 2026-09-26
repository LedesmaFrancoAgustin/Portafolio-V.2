import { Link } from 'react-router-dom'
import './not-found.css'

export function NotFoundPage() {
  return (
    <section className="not-found-section">
      <div className="not-found-content section-text-scrim">
        <p className="not-found-eyebrow">404</p>
        <h1 className="not-found-heading">Esta página no existe.</h1>
        <p className="not-found-paragraph">
          Puede que el enlace esté roto o que la página se haya movido.
        </p>
        <Link className="not-found-link" to="/">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
