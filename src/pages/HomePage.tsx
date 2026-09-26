import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Home } from '../features/home/components/Home'

const About = lazy(() => import('../features/about/components/About').then((m) => ({ default: m.About })))
const Skills = lazy(() => import('../features/skills/components/Skills').then((m) => ({ default: m.Skills })))
const Projects = lazy(() => import('../features/projects/components/Projects').then((m) => ({ default: m.Projects })))
const Contact = lazy(() => import('../features/contact/components/Contact').then((m) => ({ default: m.Contact })))

export function HomePage() {
  const { hash } = useLocation()

  // Al volver desde /projects/:slug con un hash (ej. "#projects"), el navegador
  // no puede saltar a la sección porque todavía no existía en el DOM — y ahora,
  // al ser lazy, puede tardar en aparecer hasta que su chunk termine de cargar.
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)

    const existing = document.getElementById(id)
    if (existing) {
      existing.scrollIntoView()
      return
    }

    const observer = new MutationObserver(() => {
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView()
        observer.disconnect()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [hash])

  return (
    <>
      <Home />
      {/* Un boundary por sección: si comparten uno solo, ninguna aparece hasta
          que termina de bajar el chunk más lento de las cuatro. */}
      <Suspense fallback={null}>
        <About />
      </Suspense>
      <Suspense fallback={null}>
        <Skills />
      </Suspense>
      <Suspense fallback={null}>
        <Projects />
      </Suspense>
      <Suspense fallback={null}>
        <Contact />
      </Suspense>
    </>
  )
}
