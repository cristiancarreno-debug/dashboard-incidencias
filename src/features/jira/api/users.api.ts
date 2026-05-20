import { jiraClient } from './jira-client'

export interface JiraUser {
  accountId: string
  displayName: string
  active: boolean
}

/**
 * Busca usuarios en Jira por texto (nombre o email).
 * Usa el endpoint /rest/api/3/user/search
 */
export async function searchJiraUsers(query: string): Promise<JiraUser[]> {
  if (query.length < 3) return []
  const response = await jiraClient.get('/rest/api/3/user/search', {
    params: { query, maxResults: 10 }
  })
  return (response.data as JiraUser[]).filter(u => u.active)
}
