import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import './SocialSidebar.css'

const LINKS = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/francoledesmaagustin',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.6a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.45 20h-3.37v-5.87c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V20H9.5V8.5h3.24v1.57h.05c.45-.86 1.56-1.77 3.21-1.77 3.44 0 4.07 2.26 4.07 5.2V20Z" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/LedesmaFrancoAgustin',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.03a9.4 9.4 0 0 1 5 0c1.9-1.3 2.75-1.03 2.75-1.03.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:#', // TODO: reemplazar por la dirección real de email
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
      </svg>
    ),
  },
] as const

// Mismo breakpoint que .social-sidebar en SocialSidebar.css.
const MOBILE_BREAKPOINT = 640

export function SocialSidebar() {
  const [open, setOpen] = useState(() => window.innerWidth > MOBILE_BREAKPOINT)

  return (
    <aside
      className={`social-sidebar${open ? '' : ' is-collapsed'}`}
      aria-label="Redes sociales"
    >
      <button
        type="button"
        className="social-sidebar__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Ocultar redes sociales' : 'Mostrar redes sociales'}
        aria-expanded={open}
      >
        <ChevronLeft className="social-sidebar__toggle-icon" aria-hidden="true" />
      </button>
      <nav className="social-sidebar__nav" aria-hidden={!open}>
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className="social-sidebar__link"
            aria-label={link.label}
            tabIndex={open ? undefined : -1}
            target={link.href.startsWith('#') ? undefined : '_blank'}
            rel={link.href.startsWith('#') ? undefined : 'noreferrer'}
          >
            {link.icon}
          </a>
        ))}
      </nav>
    </aside>
  )
}
