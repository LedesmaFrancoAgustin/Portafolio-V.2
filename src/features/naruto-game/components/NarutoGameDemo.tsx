import { useEffect } from 'react'
import type { PointerEvent } from 'react'
import { useNarutoGame } from '../hooks/useNarutoGame'
import type { Direction } from '../lib/naruto-game-constants'
import '../naruto-game.css'

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
}

const DPAD_BUTTONS: { direction: Direction; label: string; symbol: string }[] = [
  { direction: 'up', label: 'Mover arriba', symbol: '↑' },
  { direction: 'left', label: 'Mover a la izquierda', symbol: '←' },
  { direction: 'down', label: 'Mover abajo', symbol: '↓' },
  { direction: 'right', label: 'Mover a la derecha', symbol: '→' },
]

function NarutoGameCanvas() {
  const { canvasRef, started, gameOver, play, restart, setDirectionPressed } = useNarutoGame()

  useEffect(() => {
    if (!started || gameOver) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[event.key]
      if (!direction) return
      event.preventDefault()
      setDirectionPressed(direction, true)
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[event.key]
      if (direction) setDirectionPressed(direction, false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [started, gameOver, setDirectionPressed])

  const bindDirection = (direction: Direction, pressed: boolean) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDirectionPressed(direction, pressed)
  }

  return (
    <div className="naruto-game">
      <div className="naruto-game__stage">
        <canvas className="naruto-game__canvas" ref={canvasRef} />

        {!started && (
          <button className="naruto-game__overlay" onClick={play} type="button">
            <span className="naruto-game__overlay-title">Jugar</span>
            <span className="naruto-game__overlay-hint">
              Esquivá a los ninjas con las flechas o WASD
            </span>
          </button>
        )}

        {gameOver && (
          <div className="naruto-game__overlay naruto-game__overlay--gameover">
            <span className="naruto-game__overlay-title">Te atraparon</span>
            <button className="naruto-game__retry" onClick={restart} type="button">
              Reintentar
            </button>
          </div>
        )}
      </div>

      {started && (
        <div className="naruto-game__dpad">
          {DPAD_BUTTONS.map(({ direction, label, symbol }) => (
            <button
              key={direction}
              className={`naruto-game__dpad-btn naruto-game__dpad-btn--${direction}`}
              aria-label={label}
              onPointerDown={bindDirection(direction, true)}
              onPointerUp={bindDirection(direction, false)}
              onPointerLeave={bindDirection(direction, false)}
              type="button"
            >
              {symbol}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function NarutoGameDemo() {
  return (
    <div className="naruto-game__wrap">
      <NarutoGameCanvas />
    </div>
  )
}
