import emailjs from '@emailjs/browser'
import type { ContactFormValues } from '../contact.schema'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// El template de EmailJS debe declarar estas mismas variables ({{from_name}},
// {{reply_to}}, {{message}}) para que el mail llegue con los datos del formulario.
export async function sendContactMessage(values: ContactFormValues): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error('EmailJS no está configurado (faltan variables VITE_EMAILJS_*)')
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      from_name: values.name,
      reply_to: values.email,
      message: values.message,
    },
    { publicKey: PUBLIC_KEY },
  )
}
