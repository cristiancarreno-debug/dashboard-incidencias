import { jiraClient } from '@/features/jira/api/jira-client'
import { JiraProjectListSchema } from '@/features/jira/schemas/project.schema'
import type { JiraProject } from '@/features/jira/types/jira.types'

/**
 * Obtiene la lista de proyectos Jira disponibles.
 * Valida la respuesta con JiraProjectListSchema antes de retornar.
 */
export async function fetchProjects(): Promise<JiraProject[]> {
  const response = await jiraClient.get('/rest/api/3/project')
  const parsed = JiraProjectListSchema.parse(response.data)
  return parsed
}
