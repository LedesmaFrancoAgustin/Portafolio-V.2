import type { PushPhase } from '../hooks/useGitPushTerminal'
import { useSpinner } from '../hooks/useSpinner'
import type { TermLine, TermLineType } from '../lib/push-script'

const PREFIX: Record<TermLineType, string | null> = {
  cmd: '$',
  out: '',
  run: null, // spinner
  ok: '✓',
  success: '✓',
  thanks: '',
  err: '✗',
  errsub: '',
  hint: '!',
}

interface PushTerminalProps {
  lines: TermLine[]
  phase: PushPhase
  elapsed: string | null
  entered: boolean
}

export function PushTerminal({ lines, phase, elapsed, entered }: PushTerminalProps) {
  const spinner = useSpinner(phase === 'running')
  const status =
    phase === 'running' ? 'ejecutando…' : phase === 'done' ? `completado en ${elapsed}s` : phase === 'error' ? 'exit 1' : 'listo'

  return (
    // La salida se anima carácter a carácter; el resultado se anuncia aparte
    // (ContactForm) para no saturar a los lectores de pantalla.
    <div className={`contact-terminal is-${phase}${entered ? ' is-entered' : ''}`} aria-hidden="true">
      <div className="contact-terminal__bar">
        <span className="contact-terminal__dot" />
        <span className="contact-terminal__title">&gt;_ git push origin main</span>
        <span className="contact-terminal__status">{status}</span>
      </div>
      <div className="contact-terminal__body">
        {lines.map((line) => (
          <div key={line.id} className={`contact-terminal__line line-${line.type}`}>
            <span className="contact-terminal__prefix">{PREFIX[line.type] ?? spinner}</span>
            <span className="contact-terminal__text">
              {line.text}
              {line.caret && <span className="contact-caret contact-caret--block" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
