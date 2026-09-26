import { useCallback, useEffect, useRef, useState } from 'react'
import type { PushStep, TermLine, TermLineType } from '../lib/push-script'

export type PushPhase = 'idle' | 'running' | 'done' | 'error'
export type GitPushTerminal = ReturnType<typeof useGitPushTerminal>

const ENTER_DELAY = 30
const EXIT_DURATION = 350

/**
 * Reproduce un guion de `PushStep` como si fuera una terminal real: tipea los
 * comandos, anima spinners/progresos y espera el paso `remote`. Cada `run`
 * invalida el anterior (runId), así un reset en medio de la animación no deja
 * timers escribiendo líneas viejas.
 */
export function useGitPushTerminal() {
  const [lines, setLines] = useState<TermLine[]>([])
  const [phase, setPhase] = useState<PushPhase>('idle')
  const [elapsed, setElapsed] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [entered, setEntered] = useState(false)

  const timers = useRef<number[]>([])
  const buffer = useRef<TermLine[]>([])
  const runId = useRef(0)
  const lineId = useRef(0)

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    runId.current++
  }, [])

  useEffect(() => clear, [clear])

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  const flush = useCallback(() => setLines(buffer.current.map((line) => ({ ...line }))), [])

  const run = useCallback(
    (steps: PushStep[], outcome: Extract<PushPhase, 'done' | 'error'>) => {
      clear()
      const id = runId.current
      const alive = () => id === runId.current
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const wait = (fn: () => void, ms: number) => later(fn, reduced ? ms / 4 : ms)

      const push = (type: TermLineType, text: string, caret = false) => {
        const line: TermLine = { id: lineId.current++, type, text, caret }
        buffer.current.push(line)
        flush()
        return line
      }

      buffer.current = []
      flush()
      setPhase('running')
      setElapsed(null)
      setMounted(true)
      later(() => setEntered(true), ENTER_DELAY)

      const startedAt = performance.now()
      let index = 0

      const next = () => {
        if (!alive()) return
        const step = steps[index++]
        if (!step) {
          setPhase(outcome)
          setElapsed(((performance.now() - startedAt) / 1000).toFixed(1))
          return
        }

        switch (step.kind) {
          case 'cmd': {
            const line = push('cmd', reduced ? step.text : '', true)
            let typed = reduced ? step.text.length : 0
            const tick = () => {
              typed = Math.min(step.text.length, typed + 1 + (Math.random() < 0.3 ? 1 : 0))
              line.text = step.text.slice(0, typed)
              flush()
              if (typed < step.text.length) wait(tick, 20 + Math.random() * 25)
              else wait(finish, 260)
            }
            const finish = () => {
              line.caret = false
              flush()
              next()
            }
            if (reduced) wait(finish, 260)
            else wait(tick, 120)
            break
          }
          case 'out':
            push(step.type ?? 'out', step.text)
            wait(next, step.wait ?? 110)
            break
          case 'task': {
            const line = push('run', step.text)
            wait(() => {
              line.type = 'ok'
              flush()
              next()
            }, step.duration)
            break
          }
          case 'progress': {
            const line = push('run', step.format(0, 0))
            const ticks = 10
            let tickCount = 0
            const tick = () => {
              tickCount++
              line.text = step.format(Math.round((tickCount / ticks) * 100), Math.round((tickCount / ticks) * step.total))
              flush()
              if (tickCount < ticks) wait(tick, step.duration / ticks)
              else
                wait(() => {
                  line.type = 'ok'
                  flush()
                  next()
                }, 90)
            }
            wait(tick, step.duration / ticks)
            break
          }
          case 'remote': {
            const line = push('run', step.text)
            const minDelay = new Promise<void>((resolve) => wait(resolve, step.minDuration))
            Promise.all([step.action(), minDelay]).then(
              () => {
                if (!alive()) return
                line.type = 'ok'
                flush()
                next()
              },
              () => {
                if (!alive()) return
                line.type = 'err'
                push('err', 'error: failed to push — no se pudo entregar el mensaje')
                push('hint', 'hint: vuelve a intentarlo en unos segundos')
                setPhase('error')
              },
            )
            break
          }
        }
      }

      next()
    },
    [clear, flush, later],
  )

  const reset = useCallback(() => {
    clear()
    buffer.current = []
    flush()
    setPhase('idle')
    setElapsed(null)
    setEntered(false)
    later(() => setMounted(false), EXIT_DURATION)
  }, [clear, flush, later])

  return { lines, phase, elapsed, mounted, entered, run, reset }
}
