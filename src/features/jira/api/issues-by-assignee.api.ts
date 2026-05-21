import { jiraClient } from './jira-client'
import { JiraSearchResponseSchema } from '../schemas/issue.schema'
import type { RawJiraIssue } from '../types/jira.types'

const PAGE_SIZE = 50

/**
 * Busca todas las issues (incluyendo subtareas) donde un usuario
 * tiene worklogs registrados, opcionalmente filtrado por rango de fechas.
 */
export async function fetchIssuesByAssignee(
  displayName: string,
  dateFrom?: string,
  dateTo?: string
): Promise<RawJiraIssue[]> {
  if (!displayName) return []

  let jql = `worklogAuthor = "${displayName}"`
  if (dateFrom) jql += ` AND worklogDate >= "${dateFrom}"`
  if (dateTo) jql += ` AND worklogDate <= "${dateTo}"`
  jql += ' ORDER BY created DESC'

  const allIssues: RawJiraIssue[] = []
  let nextPageToken: string | null | undefined = undefined
  let isLast = false

  while (!isLast) {
    const params: Record<string, string | number> = {
      jql,
      maxResults: PAGE_SIZE,
      fields: 'summary,assignee,status,created,issuetype,parent,timespent,worklog',
    }
    if (nextPageToken) params.nextPageToken = nextPageToken

    const response = await jiraClient.get('/rest/api/3/search/jql', { params })
    const parsed = JiraSearchResponseSchema.parse(response.data)
    allIssues.push(...(parsed.issues as RawJiraIssue[]))
    nextPageToken = parsed.nextPageToken ?? null
    isLast = parsed.isLast ?? !nextPageToken
  }

  return allIssues
}
