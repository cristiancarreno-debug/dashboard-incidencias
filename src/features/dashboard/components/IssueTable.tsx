import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'
import type { EnrichedIssue, SortConfig, SortColumn } from '@/features/rice/rice.types'

/** Props del componente IssueTable. */
export interface IssueTableProps {
  /** Issues enriquecidas con RICE calculado. */
  issues: EnrichedIssue[]
  /** Configuración de ordenamiento actual. */
  sorting: SortConfig
  /** Callback al cambiar columna de ordenamiento. */
  onSortChange: (column: SortColumn) => void
  /** Callback para acción sobre una issue (botón de acciones por fila). */
  onIssueAction: (issueKey: string) => void
  /** Claves de issues seleccionadas para acciones masivas. */
  selectedKeys: Set<string>
  /** Callback al cambiar la selección de issues. */
  onSelectionChange: (keys: Set<string>) => void
  /** Callback al hacer clic en el score RICE (abre popover de detalle). */
  onRiceClick: (issue: EnrichedIssue, anchor: HTMLElement) => void
  /** Total de issues antes de filtrado (para mostrar "X de Y"). */
  totalCount: number
}

/** Colores de badge según prioridad RICE. */
const RICE_PRIORITY_COLORS: Record<string, string> = {
  Crítica: 'bg-red-100 text-red-800',
  Alta: 'bg-orange-100 text-orange-800',
  Media: 'bg-yellow-100 text-yellow-800',
  Baja: 'bg-green-100 text-green-800',
}

/** URL base de Jira para enlaces a issues. */
const JIRA_BASE_URL = 'https://jirasegurosbolivar.atlassian.net/browse'

/** Definición de columnas ordenables. */
const SORTABLE_COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'key', label: 'Clave' },
  { key: 'summary', label: 'Resumen' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'status', label: 'Estado' },
  { key: 'assignee', label: 'Responsable' },
  { key: 'created', label: 'Creado' },
  { key: 'riceScore', label: 'RICE' },
]

/**
 * Renderiza el ícono de ordenamiento según el estado actual de la columna.
 *
 * @param column - Columna a evaluar.
 * @param sorting - Configuración de ordenamiento actual.
 * @returns Ícono correspondiente al estado de ordenamiento.
 */
function SortIcon({ column, sorting }: { column: SortColumn; sorting: SortConfig }) {
  if (sorting.column !== column) {
    return <ArrowUpDown className="ml-1 inline h-3 w-3 text-gray-400" />
  }
  return sorting.direction === 'asc' ? (
    <ArrowUp className="ml-1 inline h-3 w-3 text-indigo-600" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3 text-indigo-600" />
  )
}

/**
 * Tabla principal de incidencias con ordenamiento, selección y acciones.
 *
 * Muestra las issues enriquecidas con columnas para: checkbox de selección,
 * clave (enlace a Jira), resumen, tipo, estado, responsable, épica,
 * score RICE (clickeable), fecha de creación y botón de acciones.
 *
 * @param props - Props con issues, ordenamiento, selección y callbacks.
 */
export function IssueTable({
  issues,
  sorting,
  onSortChange,
  onIssueAction,
  selectedKeys,
  onSelectionChange,
  onRiceClick,
  totalCount,
}: IssueTableProps) {
  const allSelected = issues.length > 0 && issues.every((i) => selectedKeys.has(i.key))

  /** Alterna la selección de todas las issues visibles. */
  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(issues.map((i) => i.key)))
    }
  }

  /** Alterna la selección de una issue individual. */
  const handleSelectOne = (key: string) => {
    const next = new Set(selectedKeys)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    onSelectionChange(next)
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm text-gray-600">
          Mostrando <span className="font-semibold">{issues.length}</span> de{' '}
          <span className="font-semibold">{totalCount}</span> incidencias
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  aria-label="Seleccionar todas las incidencias"
                />
              </th>
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="cursor-pointer px-3 py-3 hover:bg-gray-100"
                  onClick={() => onSortChange(col.key)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortIcon column={col.key} sorting={sorting} />
                  </span>
                </th>
              ))}
              <th className="px-3 py-3">Épica</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {issues.map((issue) => (
              <tr
                key={issue.key}
                className={`hover:bg-gray-50 ${selectedKeys.has(issue.key) ? 'bg-indigo-50' : ''}`}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedKeys.has(issue.key)}
                    onChange={() => handleSelectOne(issue.key)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    aria-label={`Seleccionar ${issue.key}`}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <a
                    href={`${JIRA_BASE_URL}/${issue.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {issue.key}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="max-w-xs truncate px-3 py-2" title={issue.summary}>
                  {issue.summary}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{issue.tipo}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                    {issue.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2">{issue.assignee}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <button
                    type="button"
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${RICE_PRIORITY_COLORS[issue.rice.priority] ?? 'bg-gray-100 text-gray-700'}`}
                    onClick={(e) => onRiceClick(issue, e.currentTarget)}
                    title={`Score: ${issue.rice.score}`}
                  >
                    {issue.rice.score}
                  </button>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                  {issue.createdFormatted}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 text-xs text-gray-500" title={issue.epic}>
                  {issue.epic}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onIssueAction(issue.key)}
                    className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label={`Acciones para ${issue.key}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron incidencias con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
