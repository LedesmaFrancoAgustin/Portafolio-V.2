import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NarutoGameDemo } from './NarutoGameDemo'
import '../naruto-game.css'

export function NarutoGameModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    <div className="naruto-game-modal" onClick={onClose} role="presentation">
      <button
        className="naruto-game-modal__close"
        onClick={onClose}
        aria-label="Cerrar juego"
        type="button"
      >
        ×
      </button>
      <div className="naruto-game-modal__content" onClick={(event) => event.stopPropagation()}>
        <NarutoGameDemo />
      </div>
    </div>,
    document.body,
  )
}
