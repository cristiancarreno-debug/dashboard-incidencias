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
function escapeCsvValue(value: string | null | undefined): string {
  const str = value ?? ''
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('=')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Genera un hipervínculo en formato Google Sheets (locale español: separador ;).
 *
 * @param url - URL destino del enlace.
 * @param label - Texto visible del enlace.
 * @returns Fórmula HYPERLINK para CSV con separador punto y coma.
 */
function buildHyperlink(url: string, label: string): string {
  return `"=HYPERLINK(""${url}"";""${label}"")"`
}

/**
 * Construye los enlaces MDSB como fórmulas HYPERLINK.
 *
 * @param mdsbLinks - Array de links MDSB de la issue.
 * @returns Celda CSV con los hipervínculos MDSB, o "—" si no hay.
 */
function buildMdsbCell(mdsbLinks: EnrichedIssue['mdsbLinks']): string {
  if (mdsbLinks.length === 0) return '—'

  if (mdsbLinks.length === 1) {
    const mdsb = mdsbLinks[0]
    return `"=HYPERLINK(""${JIRA_BASE_URL}/${mdsb.key}"";""${mdsb.key} - ${mdsb.daysOpen}d"")"`
  }

  // Múltiples MDSB: mostrar el primero como link y los demás como texto
  const mdsb = mdsbLinks[0]
  const others = mdsbLinks.slice(1).map((m) => `${m.key}(${m.daysOpen}d)`).join(' ')
  return `"=HYPERLINK(""${JIRA_BASE_URL}/${mdsb.key}"";""${mdsb.key} - ${mdsb.daysOpen}d | ${others}"")"`
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
    const claveCell = `"=HYPERLINK(""${JIRA_BASE_URL}/${issue.key}"";""${issue.key}"")"`
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
 * Usa window.top para escapar del sandbox del iframe corporativo.
 *
 * @param issues - Issues a exportar.
 * @param filename - Nombre del archivo (sin extensión).
 */
export function downloadCsv(issues: EnrichedIssue[], filename: string = 'incidencias'): void {
  if (!issues || issues.length === 0) return

  try {
    const csvContent = generateCsvContent(issues)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const fullFilename = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`

    // Intentar con window.top (escapa del iframe sandbox)
    const topWindow = window.top || window.parent || window
    const link = topWindow.document.createElement('a')
    link.href = url
    link.download = fullFilename
    link.style.display = 'none'
    topWindow.document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      topWindow.document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 200)
  } catch {
    // Si window.top falla por CORS, fallback con window actual
    try {
      const csvContent = generateCsvContent(issues)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 200)
    } catch (error) {
      console.error('[exportCsv] Error al generar CSV:', error)
    }
  }
}
