import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, Sparkles, FolderKanban, Mail, Moon, Sun } from 'lucide-react'
import './Header.css'

const SECTIONS = [
  { id: 'about', label: 'Sobre mí', icon: User },
  { id: 'skills', label: 'Habilidades', icon: Sparkles },
  { id: 'projects', label: 'Proyectos', icon: FolderKanban },
  { id: 'contact', label: 'Contacto', icon: Mail },
] as const

const ALL_SECTION_IDS = ['home', ...SECTIONS.map((section) => section.id)]

interface HeaderProps {
  isNight: boolean
  onToggleNight: () => void
}

export function Header({ isNight, onToggleNight }: HeaderProps) {
  const [active, setActive] = useState<string>('home')
  const headerRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const isProjectDetail = pathname.startsWith('/projects/')

  // El header vive fuera de <Routes> (ver App.tsx) y no se desmonta al entrar
  // al detalle de un proyecto, así que el IntersectionObserver de más abajo
  // (que solo observa las secciones del home) se queda con el último activo
  // que vio antes de salir. Como el detalle es, conceptualmente, parte de la
  // sección de proyectos, lo forzamos acá para que el nav no muestre un
  // estado activo viejo o inconsistente mientras estás ahí.
  useEffect(() => {
    if (isProjectDetail) setActive('projects')
  }, [isProjectDetail])

  // Publica la altura real del header (fijo, cambia con el viewport por el
  // clamp() de su padding) como variable CSS, para que cada <section> pueda
  // usarla en su scroll-margin-top y no quede tapada por el header al saltar
  // a un anchor (#skills, etc.). Ver globals.css.
  useEffect(() => {
    const headerEl = headerRef.current
    if (!headerEl) return

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${headerEl.offsetHeight}px`)
    }

    updateHeaderHeight()

    const resizeObserver = new ResizeObserver(updateHeaderHeight)
    resizeObserver.observe(headerEl)

    return () => resizeObserver.disconnect()
  }, [])

  // Sincroniza el link activo del header con la sección que está realmente
  // en pantalla y le agrega un resalte breve (.is-active-section, ver
  // globals.css) para que se note el cambio al scrollear, no solo al clickear.
  useEffect(() => {
    const elements = ALL_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    )

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!current) return

        setActive(current.target.id)
        elements.forEach((el) => {
          el.classList.toggle('is-active-section', el === current.target)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <header className="site-header" ref={headerRef}>
      <nav className="site-nav" aria-label="Secciones principales">
        <Link
          to="/#home"
          className={
            active === 'home' ? 'site-nav__home site-nav__home--active' : 'site-nav__home'
          }
          aria-current={active === 'home' ? 'true' : undefined}
          aria-label="Inicio"
          onClick={() => setActive('home')}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5.5 9.5V20h13V9.5" />
          </svg>
        </Link>

        {SECTIONS.map((section) => (
          <Link
            key={section.id}
            to={`/#${section.id}`}
            className={
              section.id === active ? 'site-nav__link site-nav__link--active' : 'site-nav__link'
            }
            aria-current={section.id === active ? 'true' : undefined}
            aria-label={section.label}
            onClick={() => setActive(section.id)}
          >
            <section.icon className="site-nav__link-icon" aria-hidden="true" />
            <span className="site-nav__link-label">{section.label}</span>
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className={`header-night-toggle${isNight ? ' is-night' : ''}`}
        onClick={onToggleNight}
        role="switch"
        aria-checked={isNight}
        aria-label={isNight ? 'Cambiar a día' : 'Cambiar a noche'}
      >
        <span className="header-night-toggle__thumb">
          {isNight ? (
            <Moon className="header-night-toggle__icon" strokeWidth={1.5} />
          ) : (
            <Sun className="header-night-toggle__icon" strokeWidth={1.5} />
          )}
        </span>
        <Sun
          className="header-night-toggle__track-icon header-night-toggle__track-icon--sun"
          strokeWidth={1.5}
        />
        <Moon
          className="header-night-toggle__track-icon header-night-toggle__track-icon--moon"
          strokeWidth={1.5}
        />
      </button>
    </header>
  )
}
