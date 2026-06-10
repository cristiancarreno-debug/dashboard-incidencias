/**
 * Utilidades de métricas y transformación de datos para el Dashboard.
 *
 * Todas las funciones son puras (sin efectos secundarios).
 * Se usan para filtrado, búsqueda, agregación y transformación de issues.
 */

import type {
  EnrichedIssue,
  ActiveFilters,
  SortConfig,
  RiceInput,
  RiceResult,
} from '@/features/rice/rice.types'
import type { RawJiraIssue, DatasetPartition } from '@/features/jira/types/jira.types'
import { TERMINAL_STATES } from '@/config/constants'
import { mapIssueType } from '@/features/rice/rice-engine'

/** Tarjeta de asignación por profesional. */
export interface PersonCard {
  name: string
  total: number
  byStatus: Record<string, number>
}

/**
 * Filtra issues por GDs seleccionados.
 *
 * @param issues - Lista de issues enriquecidas.
 * @param gdKeys - Claves de proyecto (GD) seleccionadas.
 * @returns Issues que pertenecen a los GDs indicados.
 */
export function filterByGds(issues: EnrichedIssue[], gdKeys: string[]): EnrichedIssue[] {
  if (gdKeys.length === 0) return []
  const keySet = new Set(gdKeys)
  return issues.filter((issue) => keySet.has(issue.project))
}

/**
 * Filtra issues por iniciativas (épicas) seleccionadas.
 * Si initiativeKeys está vacío, retorna todas las issues.
 *
 * @param issues - Lista de issues enriquecidas.
 * @param initiativeKeys - Claves de iniciativas seleccionadas.
 * @returns Issues filtradas por iniciativa, o todas si no hay filtro.
 */
export function filterByInitiatives(
  issues: EnrichedIssue[],
  initiativeKeys: string[]
): EnrichedIssue[] {
  if (initiativeKeys.length === 0) return issues
  const keySet = new Set(initiativeKeys)
  return issues.filter((issue) => keySet.has(issue.epic))
}


/**
 * Aplica filtros multi-criterio conjuntivos sobre las issues.
 * Una issue debe cumplir TODOS los criterios activos simultáneamente.
 * Si un filtro Set está vacío, ese criterio se omite.
 *
 * @param issues - Lista de issues enriquecidas.
 * @param filters - Filtros activos (equipo, tipo, status, ricePriority, assignee, epic).
 * @returns Issues que cumplen todos los criterios activos.
 */
export function applyFilters(issues: EnrichedIssue[], filters: ActiveFilters): EnrichedIssue[] {
  return issues.filter((issue) => {
    if (filters.equipo.size > 0 && !filters.equipo.has(issue.equipo)) return false
    if (filters.tipo.size > 0 && !filters.tipo.has(issue.tipo)) return false
    if (filters.status.size > 0 && !filters.status.has(issue.status)) return false
    if (filters.ricePriority.size > 0 && !filters.ricePriority.has(issue.rice.priority))
      return false
    if (filters.assignee.size > 0 && !filters.assignee.has(issue.assignee)) return false
    if (filters.epic.size > 0 && !filters.epic.has(issue.epic)) return false
    if (filters.sprint.size > 0 && !filters.sprint.has(issue.sprint)) return false
    return true
  })
}

/**
 * Búsqueda de texto (case-insensitive) en key, summary, assignee y epic.
 * Si query está vacío, retorna todas las issues.
 *
 * @param issues - Lista de issues enriquecidas.
 * @param query - Texto de búsqueda.
 * @returns Issues que contienen el texto en al menos uno de los campos.
 */
export function searchIssues(issues: EnrichedIssue[], query: string): EnrichedIssue[] {
  if (!query.trim()) return issues
  const lowerQuery = query.toLowerCase()
  return issues.filter(
    (issue) =>
      issue.key.toLowerCase().includes(lowerQuery) ||
      issue.summary.toLowerCase().includes(lowerQuery) ||
      issue.assignee.toLowerCase().includes(lowerQuery) ||
      issue.epic.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Obtiene las iniciativas (épicas) únicas disponibles para los GDs seleccionados.
 * Excluye "Sin épica" del resultado.
 *
 * @param issues - Lista de issues enriquecidas.
 * @param gdKeys - Claves de GD seleccionadas.
 * @returns Lista de valores de epic únicos para los GDs indicados.
 */
export function getInitiativesForGds(issues: EnrichedIssue[], gdKeys: string[]): string[] {
  const keySet = new Set(gdKeys)
  const initiatives = new Set<string>()
  for (const issue of issues) {
    if (keySet.has(issue.project) && issue.epic !== 'Sin épica') {
      initiatives.add(issue.epic)
    }
  }
  return Array.from(initiatives)
}

/**
 * Calcula KPIs: conteos por GD, por tipo y por prioridad RICE.
 *
 * @param issues - Lista de issues enriquecidas.
 * @returns Objeto con conteos agrupados y total.
 */
export function computeKpis(issues: EnrichedIssue[]): {
  byGd: Record<string, number>
  byType: Record<string, number>
  byRicePriority: Record<string, number>
  total: number
} {
  const byGd: Record<string, number> = {}
  const byType: Record<string, number> = {}
  const byRicePriority: Record<string, number> = {}

  for (const issue of issues) {
    byGd[issue.project] = (byGd[issue.project] ?? 0) + 1
    byType[issue.tipo] = (byType[issue.tipo] ?? 0) + 1
    byRicePriority[issue.rice.priority] = (byRicePriority[issue.rice.priority] ?? 0) + 1
  }

  return { byGd, byType, byRicePriority, total: issues.length }
}


/**
 * Genera tarjetas por profesional con desglose por estado.
 * Ordenadas de mayor a menor cantidad de asignaciones.
 *
 * @param issues - Lista de issues enriquecidas.
 * @returns Lista de PersonCard ordenada descendentemente por total.
 */
export function computePersonCards(issues: EnrichedIssue[]): PersonCard[] {
  const map = new Map<string, PersonCard>()

  for (const issue of issues) {
    const name = issue.assignee
    let card = map.get(name)
    if (!card) {
      card = { name, total: 0, byStatus: {} }
      map.set(name, card)
    }
    card.total += 1
    card.byStatus[issue.status] = (card.byStatus[issue.status] ?? 0) + 1
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

/**
 * Ordena issues por columna y dirección.
 * Para 'riceScore', ordena por issue.rice.score.
 *
 * @param issues - Lista de issues enriquecidas.
 * @param sortConfig - Configuración de ordenamiento (columna y dirección).
 * @returns Nueva lista de issues ordenada.
 */
export function sortIssues(issues: EnrichedIssue[], sortConfig: SortConfig): EnrichedIssue[] {
  const { column, direction } = sortConfig
  const multiplier = direction === 'asc' ? 1 : -1

  return [...issues].sort((a, b) => {
    let valA: string | number
    let valB: string | number

    switch (column) {
      case 'riceScore':
        valA = a.rice.score
        valB = b.rice.score
        break
      case 'key':
        valA = a.key
        valB = b.key
        break
      case 'summary':
        valA = a.summary.toLowerCase()
        valB = b.summary.toLowerCase()
        break
      case 'equipo':
        valA = a.equipo.toLowerCase()
        valB = b.equipo.toLowerCase()
        break
      case 'tipo':
        valA = a.tipo.toLowerCase()
        valB = b.tipo.toLowerCase()
        break
      case 'assignee':
        valA = a.assignee.toLowerCase()
        valB = b.assignee.toLowerCase()
        break
      case 'created':
        valA = a.created
        valB = b.created
        break
      case 'status':
        valA = a.status.toLowerCase()
        valB = b.status.toLowerCase()
        break
      case 'sprint':
        valA = a.sprint.toLowerCase()
        valB = b.sprint.toLowerCase()
        break
      default:
        return 0
    }

    if (valA < valB) return -1 * multiplier
    if (valA > valB) return 1 * multiplier
    return 0
  })
}

/**
 * Particiona issues en Dataset_Completo (todas) y Dataset_Activo
 * (excluyendo estados terminales).
 *
 * @param issues - Lista de issues enriquecidas.
 * @returns Objeto con datasetCompleto y datasetActivo.
 */
export function partitionIssues(issues: EnrichedIssue[]): DatasetPartition {
  const datasetActivo = issues.filter((issue) => !TERMINAL_STATES.has(issue.status))
  return {
    datasetCompleto: issues,
    datasetActivo,
  }
}

/**
 * Extrae los links MDSB vinculados a una issue.
 * Calcula días abiertos desde la fecha de creación de la propia issue
 * (como proxy, ya que la API de búsqueda no incluye created del linked issue).
 *
 * @param raw - Issue cruda de Jira.
 * @returns Array de MDSB con clave, estado y días abierto.
 */
function extractMdsbLinks(raw: RawJiraIssue): Array<{ key: string; status: string; daysOpen: number }> {
  const links = raw.fields.issuelinks
  if (!links || links.length === 0) return []

  const now = Date.now()
  const issueCreated = new Date(raw.fields.created).getTime()
  const msPerDay = 86_400_000

  const mdsbItems: Array<{ key: string; status: string; daysOpen: number }> = []

  for (const link of links) {
    const linked = link.outwardIssue ?? link.inwardIssue
    if (!linked) continue
    if (!linked.key.startsWith('MDSB-')) continue

    const daysOpen = Math.max(1, Math.ceil((now - issueCreated) / msPerDay))
    mdsbItems.push({
      key: linked.key,
      status: linked.fields.status.name,
      daysOpen,
    })
  }

  return mdsbItems
}

/**
 * Transforma una RawJiraIssue en EnrichedIssue con RICE calculado.
 * Formatea la fecha de creación como dd/MM/yyyy.
 *
 * @param raw - Issue cruda de Jira (post-validación Zod).
 * @param riceAnalyzeFn - Función de análisis RICE.
 * @returns Issue enriquecida con campos derivados y score RICE.
 */
export function enrichIssue(
  raw: RawJiraIssue,
  riceAnalyzeFn: (input: RiceInput) => RiceResult
): EnrichedIssue {
  const tipo = mapIssueType(raw.fields.issuetype.name)
  const status = raw.fields.status.name
  const summary = raw.fields.summary

  const riceInput: RiceInput = { summary, tipo, status }
  const rice = riceAnalyzeFn(riceInput)

  const project = raw.key.split('-')[0]
  const assignee = raw.fields.assignee?.displayName ?? 'Sin asignar'
  const assigneeAccountId = raw.fields.assignee?.accountId ?? null

  const epic = raw.fields.parent
    ? `${raw.fields.parent.key} - ${raw.fields.parent.fields.summary}`
    : 'Sin épica'

  const sprint = (() => {
    const sprints = raw.fields.customfield_10101
    if (!sprints || sprints.length === 0) return 'Sin sprint'
    const active = sprints.find((s) => s.state === 'active')
    return active?.name ?? sprints[sprints.length - 1].name
  })()

  const createdDate = new Date(raw.fields.created)
  const day = String(createdDate.getDate()).padStart(2, '0')
  const month = String(createdDate.getMonth() + 1).padStart(2, '0')
  const year = createdDate.getFullYear()
  const createdFormatted = `${day}/${month}/${year}`

  return {
    key: raw.key,
    summary,
    assignee,
    assigneeAccountId,
    created: raw.fields.created,
    createdFormatted,
    status,
    issuetype: raw.fields.issuetype.name,
    tipo,
    project,
    equipo: project,
    epic,
    sprint,
    rice,
    timespentSeconds: raw.fields.timespent ?? 0,
    worklogs: (raw.fields.worklog?.worklogs ?? []).map(w => ({ author: w.author.displayName, seconds: w.timeSpentSeconds, started: w.started })),
    mdsbLinks: extractMdsbLinks(raw),
  }
}
