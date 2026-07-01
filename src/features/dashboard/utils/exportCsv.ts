/**
 * Utilidad para exportar la tabla de incidencias a CSV.
 *
 * Los campos Clave y MDSB se exportan como hipervínculos
 * en formato compatible con Excel/Google Sheets:
 * =HYPERLINK("url","label")
 *
 * @module exportCsv
 */

import type { EnrichedIssue } from '@/features/rice/rice.types'

/** URL base de Jira para construir enlaces. */
const JIRA_BASE_URL = 'https://jirasegurosbolivar.atlassian.net/browse'

/**
 * Escapa un valor para incluirlo de forma segura en una celda CSV.
 * Envuelve en comillas si contiene comas, comillas o saltos de línea.
 *
 * @param value - Valor a escapar.
 * @returns Valor seguro para CSV.
 */
function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('=')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Genera un hipervínculo en formato Excel/Sheets.
 *
 * @param url - URL destino del enlace.
 * @param label - Texto visible del enlace.
 * @returns Fórmula HYPERLINK para CSV.
 */
function buildHyperlink(url: string, label: string): string {
  return `"=HYPERLINK(""${url}"",""${label}"")"`
}

/**
 * Construye los enlaces MDSB como fórmulas HYPERLINK separadas por " | ".
 *
 * @param mdsbLinks - Array de links MDSB de la issue.
 * @returns Celda CSV con los hipervínculos MDSB concatenados, o "—" si no hay.
 */
function buildMdsbCell(mdsbLinks: EnrichedIssue['mdsbLinks']): string {
  if (mdsbLinks.length === 0) return '—'

  const links = mdsbLinks.map(
    (mdsb) => `=HYPERLINK("${JIRA_BASE_URL}/${mdsb.key}","${mdsb.key} - ${mdsb.daysOpen}d")`
  )

  if (links.length === 1) {
    return `"${links[0].replace(/"/g, '""')}"`
  }

  // Múltiples MDSB: listar keys con días, enlazados individualmente
  const labels = mdsbLinks.map((m) => `${m.key} (${m.daysOpen}d)`)
  const firstUrl = `${JIRA_BASE_URL}/${mdsbLinks[0].key}`
  return buildHyperlink(firstUrl, labels.join(' | '))
}

/**
 * Genera contenido CSV a partir de las issues de la tabla.
 *
 * Columnas: Clave, MDSB, Sprint, Resumen, Tipo, Estado, Responsable, RICE, Creado
 * - Clave: hipervínculo a Jira
 * - MDSB: hipervínculo(s) a Jira
 *
 * @param issues - Issues enriquecidas a exportar.
 * @returns String con el contenido CSV completo (BOM + headers + filas).
 */
export function generateCsvContent(issues: EnrichedIssue[]): string {
  const headers = ['Clave', 'MDSB', 'Sprint', 'Resumen', 'Tipo', 'Estado', 'Responsable', 'RICE', 'Prioridad RICE', 'Creado']
  const headerRow = headers.join(',')

  const rows = issues.map((issue) => {
    const claveCell = buildHyperlink(`${JIRA_BASE_URL}/${issue.key}`, issue.key)
    const mdsbCell = buildMdsbCell(issue.mdsbLinks)
    const sprintCell = escapeCsvValue(issue.sprint || 'Sin sprint')
    const resumenCell = escapeCsvValue(issue.summary)
    const tipoCell = escapeCsvValue(issue.tipo)
    const estadoCell = escapeCsvValue(issue.status)
    const responsableCell = escapeCsvValue(issue.assignee || 'Sin asignar')
    const riceCell = String(issue.rice.score)
    const ricePriorityCell = escapeCsvValue(issue.rice.priority)
    const creadoCell = issue.created.slice(0, 10)

    return [claveCell, mdsbCell, sprintCell, resumenCell, tipoCell, estadoCell, responsableCell, riceCell, ricePriorityCell, creadoCell].join(',')
  })

  // BOM UTF-8 para compatibilidad con Excel
  const BOM = '\uFEFF'
  return BOM + [headerRow, ...rows].join('\r\n')
}

/**
 * Descarga un archivo CSV con las issues proporcionadas.
 *
 * @param issues - Issues a exportar.
 * @param filename - Nombre del archivo (sin extensión).
 */
export function downloadCsv(issues: EnrichedIssue[], filename: string = 'incidencias'): void {
  const csvContent = generateCsvContent(issues)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
