import { z } from 'zod'

/** Schema Zod para una transición de Jira. */
export const JiraTransitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  to: z.object({
    name: z.string(),
  }),
})

/** Schema Zod para la respuesta de transiciones disponibles de Jira. */
export const JiraTransitionsResponseSchema = z.object({
  transitions: z.array(JiraTransitionSchema),
})
