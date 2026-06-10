import { jiraClient } from '@/features/jira/api/jira-client'
import { JiraSearchResponseSchema } from '@/features/jira/schemas/issue.schema'
import { JQL_TEMPLATES } from '@/config/constants'
import type { RawJiraIssue } from '@/features/jira/types/jira.types'

/** Máximo de resultados por página en la API de Jira. */
const PAGE_SIZE = 50

/**
 * Obtiene todas las incidencias de los GDs indicados, paginando
 * automáticamente hasta obtener todos los resultados.
 *
 * La consulta JQL NO excluye estados terminales — se traen todas
 * las incidencias para construir Dataset_Completo y Dataset_Activo.
 */
export async function fetchIssuesByGds(gdKeys: string[]): Promise<RawJiraIssue[]> {
  if (gdKeys.length === 0) return []

  const jql =
    gdKeys.length === 1
      ? JQL_TEMPLATES.issuesByProject(gdKeys[0])
      : JQL_TEMPLATES.issuesByProjects(gdKeys)

  const allIssues: RawJiraIssue[] = []
  let nextPageToken: string | null | undefined = undefined
  let isLast = false

  while (!isLast) {
    const params: Record<string, string | number> = {
      jql,
      maxResults: PAGE_SIZE,
      fields: 'summary,assignee,status,created,issuetype,parent,timespent,worklog,customfield_10101',
    }

    if (nextPageToken) {
      params.nextPageToken = nextPageToken
    }

    const response = await jiraClient.get('/rest/api/3/search/jql', { params })
    const parsed = JiraSearchResponseSchema.parse(response.data)

    allIssues.push(...(parsed.issues as RawJiraIssue[]))

    nextPageToken = parsed.nextPageToken ?? null
    isLast = parsed.isLast ?? !nextPageToken
  }

  return allIssues
}
