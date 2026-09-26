import { useState } from 'react'
import { contactInfo } from '../../../content/contact'
import { useGitPushTerminal } from '../hooks/useGitPushTerminal'
import { ContactForm } from './ContactForm'
import { ContactIcon } from './ContactIcon'
import { PushTerminal } from './PushTerminal'
import '../contact.css'

export function Contact() {
  const terminal = useGitPushTerminal()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    setCopiedId(id)
    window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1600)
  }

  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-heading">
      <div className="contact-layout">
        <div className="contact-intro section-text-scrim">
          <header className="contact-header">
            <p className="contact-eyebrow">Contacto</p>
            <h2 id="contact-heading" className="contact-heading">
              Construyamos algo.
            </h2>
            <p className="contact-paragraph">
              ¿Tienes un proyecto en mente o solo quieres saludar? Envíame un mensaje y te responderé.
            </p>
          </header>

          <ul className="contact-info">
            {contactInfo.map((item) => (
              <li key={item.id} className="contact-info__item">
                <ContactIcon name={item.icon} size={24} strokeWidth={1.7} className="contact-info__icon" />
                <div className="contact-info__body">
                  <span className="contact-info__label">{item.label}</span>
                  <div className="contact-info__value-row">
                    {item.href ? (
                      <a className="contact-info__value contact-info__value--link" href={item.href}>
                        {item.value}
                      </a>
                    ) : (
                      <span className="contact-info__value">{item.value}</span>
                    )}
                    {item.href?.startsWith('mailto:') && (
                      <span className="contact-info__copy-wrap">
                        <button
                          type="button"
                          className="contact-info__copy"
                          onClick={() => handleCopy(item.id, item.value)}
                          aria-label={copiedId === item.id ? 'Email copiado' : 'Copiar email'}
                          title={copiedId === item.id ? 'Copiado' : 'Copiar email'}
                        >
                          <ContactIcon name={copiedId === item.id ? 'check' : 'copy'} size={14} strokeWidth={2} />
                        </button>
                        <span
                          className={`contact-info__copy-tip${
                            copiedId === item.id ? ' contact-info__copy-tip--visible' : ''
                          }`}
                          role="status"
                          aria-live="polite"
                        >
                          {copiedId === item.id ? '¡Email copiado!' : ''}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ContactForm terminal={terminal} />

        {terminal.mounted && (
          <PushTerminal
            lines={terminal.lines}
            phase={terminal.phase}
            elapsed={terminal.elapsed}
            entered={terminal.entered}
          />
        )}
      </div>
    </section>
  )
}
