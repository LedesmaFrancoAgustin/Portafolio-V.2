import { useCallback, useEffect, useRef, useState } from 'react'
import type { Direction } from '../lib/naruto-game-constants'
import type { NarutoGameController } from '../lib/naruto-game-engine'

export function useNarutoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controllerRef = useRef<NarutoGameController | null>(null)
  // El motor se importa de forma dinámica y puede no estar montado todavía cuando el
  // usuario toca "Jugar" — este ref guarda esa intención para aplicarla apenas el
  // controller esté listo, sin depender del estado de React (que es async).
  const startedRef = useRef(false)
  const [started, setStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let controller: NarutoGameController | null = null

    import('../lib/naruto-game-engine').then(({ mountNarutoGame }) => {
      if (cancelled) return
      controller = mountNarutoGame(canvas, { onGameOver: () => setGameOver(true) })
      controllerRef.current = controller
      if (startedRef.current) controller.start()
    })

    return () => {
      cancelled = true
      controllerRef.current = null
      controller?.destroy()
    }
  }, [])

  const play = useCallback(() => {
    startedRef.current = true
    setGameOver(false)
    setStarted(true)
    controllerRef.current?.start()
  }, [])

  const restart = useCallback(() => {
    setGameOver(false)
    controllerRef.current?.restart()
  }, [])

  const setDirectionPressed = useCallback((direction: Direction, pressed: boolean) => {
    controllerRef.current?.setDirectionPressed(direction, pressed)
  }, [])

  return { canvasRef, started, gameOver, play, restart, setDirectionPressed }
}
