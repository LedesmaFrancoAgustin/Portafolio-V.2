import type { FocusEvent } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { ContactIcon, type ContactIconName } from './ContactIcon'

interface EditorFieldProps {
  id: string
  label: string
  icon: ContactIconName
  placeholder: string
  registration: UseFormRegisterReturn
  /** Campo con valor y válido: muestra el check verde. */
  valid: boolean
  /** Error visible (solo cuando el campo ya fue tocado). */
  error?: string
  type?: 'text' | 'email'
  autoComplete?: string
  multiline?: boolean
  maxLength?: number
  counter?: { value: number; max: number }
  onFocus: () => void
  onBlur: () => void
}

export function EditorField({
  id,
  label,
  icon,
  placeholder,
  registration,
  valid,
  error,
  type = 'text',
  autoComplete,
  multiline = false,
  maxLength,
  counter,
  onFocus,
  onBlur,
}: EditorFieldProps) {
  const errorId = `${id}-error`
  const labelId = `${id}-label`
  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    void registration.onBlur(event)
    onBlur()
  }
  const controlProps = {
    ...registration,
    id,
    className: `contact-field__control${multiline ? ' contact-field__control--multiline' : ''}`,
    placeholder,
    maxLength,
    'aria-labelledby': labelId,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    onFocus,
    onBlur: handleBlur,
  }

  return (
    <div className="contact-field">
      <label
        htmlFor={id}
        className={`contact-field__box${error ? ' is-error' : ''}${valid ? ' is-valid' : ''}`}
      >
        <span className="contact-field__prompt" aria-hidden="true">
          ›
        </span>
        <span className="contact-field__main">
          <span className="contact-field__label">
            <span id={labelId}>{label}</span>
            {counter && (
              <span
                className={`contact-field__counter${counter.value > counter.max * 0.9 ? ' is-near-limit' : ''}`}
                aria-hidden="true"
              >
                {counter.value}/{counter.max}
              </span>
            )}
          </span>
          {multiline ? (
            <textarea rows={4} {...controlProps} />
          ) : (
            <input type={type} autoComplete={autoComplete} {...controlProps} />
          )}
        </span>
        <span className="contact-field__icon">
          <ContactIcon name={valid ? 'check' : icon} strokeWidth={valid ? 2 : 1.8} />
        </span>
      </label>
      {error && (
        <p className="contact-field__error" id={errorId}>
          ✗ {error}
        </p>
      )}
    </div>
  )
}
