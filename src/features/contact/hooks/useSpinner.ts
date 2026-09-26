import { useEffect, useState } from 'react'

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/** Frame actual de un spinner braille; solo corre el intervalo mientras `active`. */
export function useSpinner(active: boolean) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 80)
    return () => clearInterval(id)
  }, [active])
  return FRAMES[frame]
}
