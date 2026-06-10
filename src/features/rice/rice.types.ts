/** Input para el Motor RICE. */
export interface RiceInput {
  summary: string
  tipo: IssueType
  status: string
}

/** Resultado del cálculo RICE para una incidencia. */
export interface RiceResult {
  risk: string
  reach: number
  impact: number
  confidence: number
  effort: number
  score: number
  priority: RicePriority
}

/** Clasificación de prioridad RICE. */
export type RicePriority = 'Crítica' | 'Alta' | 'Media' | 'Baja'

/** Tipos internos de incidencia. */
export type IssueType =
  | 'Incidente'
  | 'Defecto QA'
  | 'Mejora'
  | 'Tarea'
  | 'Spike'
  | 'Service Request'

/** Modelo enriquecido: issue + RICE + campos derivados. */
export interface EnrichedIssue {
  key: string
  summary: string
  assignee: string
  assigneeAccountId: string | null
  created: string
  createdFormatted: string
  status: string
  issuetype: string
  tipo: IssueType
  project: string
  equipo: string
  epic: string
  sprint: string
  rice: RiceResult
  timespentSeconds: number
  worklogs: Array<{ author: string; seconds: number; started: string }>
  mdsbLinks: Array<{ key: string; status: string; daysOpen: number }>
}

/** Estado de filtros activos. */
export interface ActiveFilters {
  equipo: Set<string>
  tipo: Set<string>
  status: Set<string>
  ricePriority: Set<string>
  assignee: Set<string>
  epic: Set<string>
  sprint: Set<string>
}

/** Configuración de ordenamiento de tabla. */
export interface SortConfig {
  column: SortColumn
  direction: 'asc' | 'desc'
}

/** Columnas disponibles para ordenamiento. */
export type SortColumn =
  | 'key'
  | 'mdsb'
  | 'sprint'
  | 'summary'
  | 'equipo'
  | 'tipo'
  | 'assignee'
  | 'created'
  | 'status'
  | 'riceScore'
