import type { ContactField, ContactFormValues } from '../contact.schema'

const CODE_FIELDS: { field: ContactField; key: string; placeholder: string; max: number }[] = [
  { field: 'name', key: 'nombre', placeholder: 'Nombre', max: 34 },
  { field: 'email', key: 'email', placeholder: 'Email', max: 34 },
  { field: 'message', key: 'mensaje', placeholder: 'Mensaje', max: 30 },
]

function toLiteral(value: string, placeholder: string, max: number) {
  if (!value) return { text: `"${placeholder}"`, empty: true }
  let text = value.replace(/\n/g, '\\n')
  if (text.length > max) text = `${text.slice(0, max)}…`
  return { text: `"${text}"`, empty: false }
}

interface EditorCodePreviewProps {
  values: ContactFormValues
  focused: ContactField | null
}

/** Espejo decorativo del formulario como objeto TS; los lectores de pantalla ya tienen los campos. */
export function EditorCodePreview({ values, focused }: EditorCodePreviewProps) {
  return (
    <div className="contact-code" aria-hidden="true">
      <div className="contact-code__line">
        <span className="contact-code__num">1</span>
        <span className="tok-comment">// Envíame un mensaje</span>
      </div>
      <div className="contact-code__line">
        <span className="contact-code__num">2</span>
        <span>
          <span className="tok-keyword">const</span> <span className="tok-ident">mensaje</span>{' '}
          <span className="tok-operator">=</span> <span className="tok-punct">{'{'}</span>
        </span>
      </div>
      {CODE_FIELDS.map(({ field, key, placeholder, max }, index) => {
        const active = focused === field
        const literal = toLiteral(values[field], placeholder, max)
        return (
          <div key={field} className={`contact-code__line${active ? ' is-active' : ''}`}>
            <span className="contact-code__num">{index + 3}</span>
            <span className="contact-code__prop">
              <span className="tok-key">{key}</span>
              <span className="tok-punct">: </span>
              <span className={literal.empty ? 'tok-placeholder' : 'tok-string'}>{literal.text}</span>
              {active && <span className="contact-caret" />}
              <span className="tok-punct">,</span>
            </span>
          </div>
        )
      })}
      <div className="contact-code__line">
        <span className="contact-code__num">6</span>
        <span className="tok-punct">{'};'}</span>
      </div>
    </div>
  )
}
