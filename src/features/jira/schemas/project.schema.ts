import { z } from 'zod'

/** Schema Zod para un proyecto Jira. */
export const JiraProjectSchema = z.object({
  key: z.string(),
  name: z.string(),
  id: z.string(),
})

/** Schema Zod para la lista de proyectos Jira. */
export const JiraProjectListSchema = z.array(JiraProjectSchema)

/** Regex para validar formato de clave de proyecto Jira. */
const PROJECT_KEY_REGEX = /^[A-Z][A-Z0-9]+$/

/**
 * Valida que una clave de proyecto cumple el formato esperado.
 * Acepta strings que inician con letra mayúscula seguida de una o más
 * letras mayúsculas o dígitos.
 */
export function validateProjectKey(key: string): boolean {
  return PROJECT_KEY_REGEX.test(key)
}
