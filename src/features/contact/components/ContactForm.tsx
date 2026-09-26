import { useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CONTACT_FIELDS,
  MESSAGE_MAX_LENGTH,
  contactSchema,
  getFieldIssues,
  type ContactField,
  type ContactFormValues,
} from '../contact.schema'
import type { GitPushTerminal } from '../hooks/useGitPushTerminal'
import { useSpinner } from '../hooks/useSpinner'
import { buildPushSteps, buildRejectedSteps } from '../lib/push-script'
import { sendContactMessage } from '../lib/send-message'
import { ContactIcon } from './ContactIcon'
import { EditorCodePreview } from './EditorCodePreview'
import { EditorField } from './EditorField'

const EMPTY_VALUES: ContactFormValues = { name: '', email: '', message: '' }
const CODE_LINE: Record<ContactField, number> = { name: 3, email: 4, message: 5 }
// Columna donde empieza el literal en cada línea del preview (`  nombre: "`).
const CODE_COLUMN: Record<ContactField, number> = { name: 11, email: 10, message: 12 }
const MOD_KEY = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'

type Attempt = 'rejected' | 'push' | null

interface ContactFormProps {
  /** Lo crea `Contact` porque la terminal se ubica en la grilla de la sección, no dentro del editor. */
  terminal: GitPushTerminal
}

export function ContactForm({ terminal }: ContactFormProps) {
  const { register, handleSubmit, watch, getValues, reset, setFocus } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY_VALUES,
  })
  const [focused, setFocused] = useState<ContactField | null>(null)
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({})
  const [shaking, setShaking] = useState(false)
  const [attempt, setAttempt] = useState<Attempt>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const values = watch()
  const issues = getFieldIssues(values)
  const running = terminal.phase === 'running'
  const done = terminal.phase === 'done'
  const spinner = useSpinner(running)
  const changes = CONTACT_FIELDS.filter((field) => values[field].trim()).length

  const cursor = focused
    ? `Ln ${CODE_LINE[focused]}, Col ${CODE_COLUMN[focused] + (values[focused].split('\n').pop()?.length ?? 0)}`
    : 'Ln 1, Col 1'

  const submit = handleSubmit(
    (valid) => {
      setFocused(null)
      setAttempt('push')
      terminal.run(buildPushSteps(valid, () => sendContactMessage(valid)), 'done')
    },
    () => {
      const current = getFieldIssues(getValues())
      setTouched({ name: true, email: true, message: true })
      setShaking(true)
      setAttempt('rejected')
      terminal.run(
        buildRejectedSteps(CONTACT_FIELDS.flatMap((field) => current[field] ?? [])),
        'error',
      )
    },
  )

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (running || done) {
      event.preventDefault()
      return
    }
    void submit(event)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  // El brillo sigue al puntero vía custom properties: sin re-render por mousemove.
  const onMouseMove = (event: MouseEvent<HTMLFormElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--glow-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--glow-y', `${event.clientY - rect.top}px`)
  }

  const blurField = (field: ContactField) => {
    setFocused(null)
    setTouched((prev) => ({ ...prev, [field]: prev[field] || !!getValues(field) }))
  }

  const startOver = () => {
    terminal.reset()
    reset(EMPTY_VALUES)
    setTouched({})
    setAttempt(null)
    window.setTimeout(() => setFocus('name'), 60)
  }

  const fieldProps = (field: ContactField) => ({
    registration: register(field),
    valid: !issues[field] && !!values[field],
    error: touched[field] ? issues[field] : undefined,
    onFocus: () => setFocused(field),
    onBlur: () => blurField(field),
  })

  const announcement =
    terminal.phase === 'done'
      ? `Mensaje enviado. Gracias, te responderé pronto a ${values.email.trim()}.`
      : terminal.phase === 'error'
        ? attempt === 'rejected'
          ? 'El mensaje no se envió: corrige los campos marcados.'
          : 'No se pudo entregar el mensaje. Vuelve a intentarlo en unos segundos.'
        : running
          ? 'Enviando mensaje…'
          : ''

  return (
      <form
        ref={formRef}
        className={`contact-editor${shaking ? ' is-shaking' : ''}`}
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
        onMouseMove={onMouseMove}
        onAnimationEnd={(event) => {
          if (event.animationName === 'contact-editor-shake') setShaking(false)
        }}
        noValidate
        aria-label="Formulario de contacto"
      >
        <div className="contact-editor__glow" aria-hidden="true" />

        <div className="contact-editor__titlebar" aria-hidden="true">
          <span className="contact-editor__lights">
            <span />
            <span />
            <span />
          </span>
          <span className="contact-editor__tab">
            <ContactIcon name="code" size={14} strokeWidth={2} />
            <span>contact-form.tsx</span>
            <span className={`contact-editor__dirty${changes && !done ? ' is-dirty' : ''}`}>●</span>
          </span>
          <span className="contact-editor__path">~/portfolio</span>
        </div>

        <EditorCodePreview values={values} focused={focused} />

        <div className="contact-editor__fields">
          <EditorField
            id="contact-name"
            label="Nombre"
            icon="user"
            placeholder="Tu nombre completo..."
            autoComplete="name"
            {...fieldProps('name')}
          />
          <EditorField
            id="contact-email"
            label="Email"
            icon="mail"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            {...fieldProps('email')}
          />
          <EditorField
            id="contact-message"
            label="Mensaje"
            icon="message"
            placeholder="Cuéntame sobre tu proyecto..."
            multiline
            maxLength={MESSAGE_MAX_LENGTH}
            counter={{ value: values.message.length, max: MESSAGE_MAX_LENGTH }}
            {...fieldProps('message')}
          />

          <div className="contact-editor__actions">
            {done ? (
              <button type="button" className="contact-btn-new" onClick={startOver}>
                <span className="contact-btn-new__plus" aria-hidden="true">
                  +
                </span>
                <span>git checkout -b nuevo-mensaje</span>
              </button>
            ) : (
              <button type="submit" className="contact-btn-push" disabled={running} aria-busy={running}>
                {running ? (
                  <span className="contact-btn-push__spinner" aria-hidden="true">
                    {spinner}
                  </span>
                ) : (
                  <ContactIcon name="branch" strokeWidth={2} />
                )}
                <span>{running ? 'pushing…' : 'git push'}</span>
                <span className="contact-btn-push__arrow" aria-hidden="true">
                  →
                </span>
              </button>
            )}
            <span className="contact-editor__shortcut" aria-hidden="true">
              <kbd>{MOD_KEY}</kbd>
              <span>+</span>
              <kbd>Enter</kbd>
            </span>
          </div>
        </div>

        <div className="contact-editor__statusbar" aria-hidden="true">
          <span className="contact-editor__branch">
            <ContactIcon name="branch" size={12} strokeWidth={2} />
            main
          </span>
          <span className={`contact-editor__changes${done ? ' is-synced' : changes ? ' is-dirty' : ''}`}>
            {done
              ? '✓ sincronizado con origin'
              : changes
                ? `● ${changes} ${changes === 1 ? 'cambio' : 'cambios'} sin commit`
                : 'sin cambios'}
          </span>
          <span className="contact-editor__cursor">{cursor}</span>
          <span>TSX</span>
        </div>

        <p className="sr-only" role="status">
          {announcement}
        </p>
      </form>
  )
}
