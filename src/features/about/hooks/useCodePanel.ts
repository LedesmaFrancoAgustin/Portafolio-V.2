import { useEffect, useMemo, useRef, useState } from 'react'
import { CODE, FOLDERS, langFor, tintFor } from '../lib/code-panel-data'
import type { CodeSegment } from '../lib/code-panel-data'

export interface TreeFileItem {
  name: string
  tint: string
  isActive: boolean
  select: () => void
}

export interface TreeFolderItem {
  name: string
  tint: string
  isOpen: boolean
  toggle: () => void
  files: TreeFileItem[]
}

export interface TabItem {
  name: string
  tint: string
  isActive: boolean
  select: () => void
}

const AUTOPLAY_INTERVAL_MS = 4000

const AUTOPLAY_SEQUENCE = FOLDERS.flatMap((f) => f.files.map((name) => ({ folder: f.name, name })))

export function useCodePanel() {
  const [openFolder, setOpenFolder] = useState<string | null>('backend')
  const [file, setFile] = useState('users.service.ts')
  const autoplayRef = useRef(true)
  const [inView, setInView] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '200px 0px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Pausado fuera de vista: sin esto, el intervalo sigue adelantando el
  // archivo mostrado (y re-renderizando el panel) aunque nadie lo vea.
  useEffect(() => {
    if (!inView) return

    const id = setInterval(() => {
      if (!autoplayRef.current) return
      setFile((current) => {
        const idx = AUTOPLAY_SEQUENCE.findIndex((step) => step.name === current)
        const next = AUTOPLAY_SEQUENCE[(idx + 1) % AUTOPLAY_SEQUENCE.length]
        setOpenFolder(next.folder)
        return next.name
      })
    }, AUTOPLAY_INTERVAL_MS)
    return () => clearInterval(id)
  }, [inView])

  function stopAutoplay() {
    autoplayRef.current = false
  }

  function pickFolder(name: string) {
    stopAutoplay()
    if (openFolder === name) {
      setOpenFolder(null)
      return
    }
    const folder = FOLDERS.find((f) => f.name === name)
    setOpenFolder(name)
    if (folder) setFile(folder.files[0])
  }

  function pickFile(name: string) {
    stopAutoplay()
    setFile(name)
  }

  const folder = FOLDERS.find((f) => f.name === openFolder)

  const tree = useMemo<TreeFolderItem[]>(
    () =>
      FOLDERS.map((f) => ({
        name: f.name,
        tint: f.tint,
        isOpen: openFolder === f.name,
        toggle: () => pickFolder(f.name),
        files: f.files.map((name) => ({
          name,
          tint: tintFor(name),
          isActive: name === file,
          select: () => pickFile(name),
        })),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openFolder, file],
  )

  const tabs = useMemo<TabItem[]>(
    () =>
      (folder ? folder.files : []).map((name) => ({
        name,
        tint: tintFor(name),
        isActive: name === file,
        select: () => pickFile(name),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openFolder, file],
  )

  const lines: CodeSegment[][] = CODE[file] ?? []

  return {
    tree,
    tabs,
    file,
    lines,
    lang: langFor(file),
    containerRef,
  }
}
