/* Small hand-drawn pictograms for the category cards (monitor, server,
   database, wrench) — generic concepts, not brand marks, so unlike
   tech-logos.ts these are plain currentColor shapes. */
import type { CategoryId } from './tech-data'

const ICONS: Record<CategoryId, () => JSX.Element> = {
  frontend: () => (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 20.5h6M12 17v3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  backend: () => (
    <>
      <rect x="3" y="4" width="18" height="6.5" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13.5" width="18" height="6.5" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="7.25" r="1" fill="currentColor" />
      <circle cx="7" cy="16.75" r="1" fill="currentColor" />
    </>
  ),
  data: () => (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" fill="currentColor" />
      <path
        d="M5 5.5V18.5C5 19.88 8.13 21 12 21C15.87 21 19 19.88 19 18.5V5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M5 10.9C5 12.28 8.13 13.4 12 13.4C15.87 13.4 19 12.28 19 10.9" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 15.7C5 17.08 8.13 18.2 12 18.2C15.87 18.2 19 17.08 19 15.7" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </>
  ),
  tooling: () => (
    <path d="M22.7 19 13.6 9.9c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6l-3 3-4.3-4.3C.6 7.1 1 10.1 3 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1 0-1.4z" />
  ),
}

export function CategoryIconGlyph({ id }: { id: CategoryId }) {
  const Glyph = ICONS[id]
  return <Glyph />
}
