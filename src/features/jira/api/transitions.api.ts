import { jiraClient } from '@/features/jira/api/jira-client'
import { JiraTransitionsResponseSchema } from '@/features/jira/schemas/transition.schema'
import type { JiraTransition } from '@/features/jira/types/jira.types'

/**
 * Obtiene las transiciones disponibles para una issue de Jira.
 * Valida la respuesta con JiraTransitionsResponseSchema.
 */
export async function fetchTransitions(issueKey: string): Promise<JiraTransition[]> {
  const response = await jiraClient.get(
    `/rest/api/3/issue/${issueKey}/transitions`
  )
  const parsed = JiraTransitionsResponseSchema.parse(response.data)
  return parsed.transitions
}

/**
 * Ejecuta una transición sobre una issue de Jira.
 * @param issueKey - Clave de la issue (ej: GD941-123)
 * @param transitionId - ID de la transición a ejecutar
 */
export async function executeTransition(
  issueKey: string,
  transitionId: string
): Promise<void> {
  await jiraClient.post(`/rest/api/3/issue/${issueKey}/transitions`, {
    transition: { id: transitionId },
  })
}

/**
 * Reasigna una issue de Jira a otro usuario.
 * @param issueKey - Clave de la issue (ej: GD941-123)
 * @param accountId - Account ID del nuevo responsable
 */
export async function reassignIssue(
  issueKey: string,
  accountId: string
): Promise<void> {
  await jiraClient.put(`/rest/api/3/issue/${issueKey}/assignee`, {
    accountId,
  })
}
