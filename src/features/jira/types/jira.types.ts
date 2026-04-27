import type { EnrichedIssue } from '@/features/rice/rice.types'
import { TERMINAL_STATES } from '@/config/constants'

/** Proyecto Jira (GD). */
export interface JiraProject {
  key: string
  name: string
  id: string
}

/** Issue cruda tal como llega de la API de Jira (post-validación Zod). */
export interface RawJiraIssue {
  key: string
  fields: {
    summary: string
    assignee: { displayName: string; accountId: string } | null
    status: { name: string }
    created: string
    issuetype: { name: string }
    parent?: { key: string; fields: { summary: string } } | null
  }
}

/** Transición disponible para una issue de Jira. */
export interface JiraTransition {
  id: string
  name: string
  to: { name: string }
}

/** Resultado de particionar las issues obtenidas de Jira. */
export interface DatasetPartition {
  /** Todas las issues incluyendo estados terminales — solo para métricas de resumen. */
  datasetCompleto: EnrichedIssue[]
  /** Issues excluyendo estados terminales — para filtros, tabla, tarjetas, interacción. */
  datasetActivo: EnrichedIssue[]
}

/**
 * Particiona un conjunto de issues en Dataset_Completo y Dataset_Activo.
 *
 * Dataset_Completo = todas las issues.
 * Dataset_Activo = issues cuyo estado NO pertenece a TERMINAL_STATES.
 *
 * Invariante: datasetCompleto = datasetActivo ∪ issuesTerminales,
 * y datasetActivo ∩ issuesTerminales = ∅.
 */
export function partitionIssues(issues: EnrichedIssue[]): DatasetPartition {
  const datasetActivo = issues.filter(
    (issue) => !TERMINAL_STATES.has(issue.status)
  )
  return {
    datasetCompleto: issues,
    datasetActivo,
  }
}
