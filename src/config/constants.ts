import type { IssueType } from '@/features/rice/rice.types'

/** Base URL del Cloudflare Worker Proxy hacia Jira. */
export const PROXY_BASE_URL: string = 'https://delicate-morning-e673jira-proxy.cristian-carreno.workers.dev'

/**
 * Templates JQL para consultas de incidencias.
 * No excluyen estados terminales — se traen todas las issues.
 */
export const JQL_TEMPLATES = {
  /** Issues de un proyecto, excluyendo subtareas, épicas e iniciativas. */
  issuesByProject: (projectKey: string): string =>
    `project = "${projectKey}" AND issuetype NOT IN (Sub-task, Epic, Initiative) ORDER BY created DESC`,

  /** Issues de múltiples proyectos. */
  issuesByProjects: (projectKeys: string[]): string => {
    const keys = projectKeys.map((k) => `"${k}"`).join(', ')
    return `project IN (${keys}) AND issuetype NOT IN (Sub-task, Epic, Initiative) ORDER BY created DESC`
  },
} as const

/** Mapeo de issuetype de Jira → tipo interno de la aplicación. */
export const ISSUE_TYPE_MAP: Record<string, IssueType> = {
  'Error Productivo': 'Incidente',
  'Defecto QA': 'Defecto QA',
  'Historia': 'Mejora',
  'Spike': 'Spike',
  'Bug': 'Incidente',
  'Task': 'Tarea',
  'Story': 'Mejora',
  'Service Request': 'Service Request',
}

/**
 * Estados de Jira que representan incidencias finalizadas o en producción.
 * Se usan para particionar Dataset_Completo vs Dataset_Activo.
 */
export const TERMINAL_STATES: ReadonlySet<string> = new Set([
  'Producción',
  'Done',
  'Closed',
  'Cerrado',
  'Hecho',
  'Cancelado',
  'Cancelled',
  'Resolved',
])
