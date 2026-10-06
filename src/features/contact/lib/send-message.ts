import emailjs from '@emailjs/browser'
import type { ContactFormValues } from '../contact.schema'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// El template de EmailJS debe declarar estas mismas variables ({{name}},
// {{from_email}}, {{time}}, {{message}}) para que el mail llegue con los datos
// del formulario. `reply_to` alimenta el campo "Reply To" de la configuración.
export async function sendContactMessage(values: ContactFormValues): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('EmailJS no está configurado (faltan variables VITE_EMAILJS_*)')
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      name: values.name,
      from_email: values.email,
      reply_to: values.email,
      time: new Date().toLocaleString('es-AR'),
      message: values.message,
    },
    { publicKey: PUBLIC_KEY },
  )
}
