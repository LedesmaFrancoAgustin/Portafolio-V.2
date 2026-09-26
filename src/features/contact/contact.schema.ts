import { z } from 'zod'

export const MESSAGE_MAX_LENGTH = 500

// Los mensajes siguen el formato de la terminal ("campo: motivo") porque se
// muestran tanto debajo de cada campo como en la salida del `git push` fallido.
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'nombre: requerido (mín. 2 caracteres)'),
  email: z
    .string()
    .trim()
    .min(1, 'email: requerido')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'email: formato inválido'),
  message: z
    .string()
    .trim()
    .min(10, 'mensaje: mínimo 10 caracteres')
    .max(MESSAGE_MAX_LENGTH, `mensaje: máximo ${MESSAGE_MAX_LENGTH} caracteres`),
})

export type ContactFormValues = z.infer<typeof contactSchema>
export type ContactField = keyof ContactFormValues

export const CONTACT_FIELDS: readonly ContactField[] = ['name', 'email', 'message']

/** Primer error de cada campo, evaluado en vivo con el mismo schema del resolver. */
export function getFieldIssues(values: ContactFormValues): Partial<Record<ContactField, string>> {
  const result = contactSchema.safeParse(values)
  if (result.success) return {}

  const issues: Partial<Record<ContactField, string>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField
    issues[field] ??= issue.message
  }
  return issues
}
