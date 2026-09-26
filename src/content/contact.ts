export type ContactInfoIcon = 'mail' | 'location' | 'branch'

export interface ContactInfoItem {
  id: string
  icon: ContactInfoIcon
  label: string
  value: string
  href?: string
}

export const CONTACT_EMAIL = 'ledesmafranco50@gmail.com'

export const contactInfo: ContactInfoItem[] = [
  { id: 'email', icon: 'mail', label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  // TODO: confirmar ubicación real (el diseño trae un valor de ejemplo).
  { id: 'ubicación', icon: 'location', label: 'Location', value: 'Argentina, Bs As , Tigre' },
  { id: 'availability', icon: 'branch', label: 'Open to', value: 'Remote / Hybrid / On-site' },
]
