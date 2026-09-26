import type { ReactNode } from 'react'
import './MainLayout.css'

export function MainLayout({ children }: { children: ReactNode }) {
  return <main className="app-main">{children}</main>
}
