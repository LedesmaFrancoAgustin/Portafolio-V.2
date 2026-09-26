import type { ContactFormValues } from '../contact.schema'

export type TermLineType = 'cmd' | 'out' | 'run' | 'ok' | 'success' | 'thanks' | 'err' | 'errsub' | 'hint'

export interface TermLine {
  id: number
  type: TermLineType
  text: string
  caret?: boolean
}

/**
 * Pasos de la "sesión" de terminal. Son datos puros: `useGitPushTerminal` los
 * interpreta con timers, así el guion se puede leer (y cambiar) sin tocar la
 * mecánica de la animación.
 */
export type PushStep =
  | { kind: 'cmd'; text: string }
  | { kind: 'out'; text: string; type?: TermLineType; wait?: number }
  | { kind: 'task'; text: string; duration: number }
  | { kind: 'progress'; format: (percent: number, count: number) => string; total: number; duration: number }
  | { kind: 'remote'; text: string; minDuration: number; action: () => Promise<void> }

const shortHash = () => Math.random().toString(16).slice(2, 9).padEnd(7, '0')

/** Salida de un push rechazado por validación: un `errsub` por campo inválido. */
export function buildRejectedSteps(issues: string[]): PushStep[] {
  return [
    { kind: 'cmd', text: 'git push origin main' },
    { kind: 'out', type: 'err', text: 'error: failed to push some refs — el commit no pasó las validaciones', wait: 120 },
    ...issues.map((issue): PushStep => ({ kind: 'out', type: 'errsub', text: `  ${issue}`, wait: 70 })),
    { kind: 'out', type: 'hint', text: 'hint: corrige los campos marcados y vuelve a ejecutar git push', wait: 0 },
  ]
}

/** Salida de un push exitoso; el paso `remote` espera el envío real del mensaje. */
export function buildPushSteps(values: ContactFormValues, send: () => Promise<void>): PushStep[] {
  const firstName = values.name.split(/\s+/)[0]
  const fromHash = shortHash()
  const toHash = shortHash()
  const bytes = new Blob([values.name + values.email + values.message]).size + 184
  const insertions = 3 + (values.message.match(/\n/g) ?? []).length
  const done = (percent: number, suffix = ', done.') => (percent === 100 ? suffix : '')

  return [
    { kind: 'cmd', text: 'git add contact-form.tsx' },
    { kind: 'cmd', text: `git commit -m "feat: mensaje de ${firstName}"` },
    { kind: 'out', text: `[main ${toHash}] feat: mensaje de ${firstName}`, wait: 90 },
    { kind: 'out', text: ` 1 file changed, ${insertions} insertions(+)`, wait: 200 },
    { kind: 'cmd', text: 'git push origin main' },
    { kind: 'task', text: 'Enumerating objects: 5, done.', duration: 260 },
    { kind: 'progress', total: 5, duration: 420, format: (p, k) => `Counting objects: ${p}% (${k}/5)${done(p)}` },
    { kind: 'task', text: 'Delta compression using up to 8 threads', duration: 240 },
    { kind: 'progress', total: 3, duration: 380, format: (p, k) => `Compressing objects: ${p}% (${k}/3)${done(p)}` },
    {
      kind: 'progress',
      total: 3,
      duration: 620,
      format: (p, k) =>
        `Writing objects: ${p}% (${k}/3)${done(p, `, ${bytes} bytes | ${((bytes / 1024) * 1000).toFixed(2)} KiB/s, done.`)}`,
    },
    { kind: 'task', text: 'Total 3 (delta 1), reused 0 (delta 0)', duration: 220 },
    { kind: 'remote', text: 'remote: Entregando mensaje al inbox...', minDuration: 1100, action: send },
    { kind: 'out', text: 'To github.com/portfolio/contacto.git', wait: 90 },
    { kind: 'out', text: `   ${fromHash}..${toHash}  main -> main`, wait: 260 },
    { kind: 'out', type: 'success', text: '-> Successfully pushed!', wait: 350 },
    { kind: 'out', type: 'thanks', text: `Gracias, ${firstName}. Te responderé pronto a ${values.email}.`, wait: 0 },
  ]
}
