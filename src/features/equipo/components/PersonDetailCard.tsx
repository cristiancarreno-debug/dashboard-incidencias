import { User, Clock, LayoutDashboard, AlertTriangle, ExternalLink } from 'lucide-react'
import { TERMINAL_STATES } from '@/config/constants'
import type { EnrichedIssue } from '@/features/rice/rice.types'

interface Props {
  name: string
  issues: EnrichedIssue[]
  isExpanded: boolean
  onToggleExpand: () => void
}

const TYPE_COLORS: Record<string, string> = {
  Incidente: 'bg-red-100 text-red-700',
  'Defecto QA': 'bg-orange-100 text-orange-700',
  Mejora: 'bg-blue-100 text-blue-700',
  Tarea: 'bg-gray-100 text-gray-700',
  Spike: 'bg-purple-100 text-purple-700',
  'Service Request': 'bg-teal-100 text-teal-700',
}

export function PersonDetailCard({ name, issues, isExpanded, onToggleExpand }: Props) {
  const tablerosAsignados = [...new Set(issues.map((i) => i.project))]
  const abiertas = issues.filter((i) => !TERMINAL_STATES.has(i.status))
  const cerradas = issues.filter((i) => TERMINAL_STATES.has(i.status))
  const horasEstimadas = issues.length * 8

  const byType: Record<string, number> = {}
  for (const issue of issues) {
    byType[issue.tipo] = (byType[issue.tipo] || 0) + 1
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header - sin subtítulo de incidencias */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(153,100%,32.5%)]/10">
          <User className="h-5 w-5 text-[hsl(153,100%,32.5%)]" />
        </div>
        <h4 className="text-sm font-semibold text-gray-800 truncate flex-1">{name}</h4>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded bg-gray-50">
          <Clock className="h-4 w-4 mx-auto text-gray-500 mb-1" />
          <p className="text-lg font-bold text-gray-800">{horasEstimadas}h</p>
          <p className="text-[10px] text-gray-500">Horas est.</p>
        </div>
        <div className="text-center p-2 rounded bg-gray-50">
          <LayoutDashboard className="h-4 w-4 mx-auto text-gray-500 mb-1" />
          <p className="text-lg font-bold text-gray-800">{tablerosAsignados.length}</p>
          <p className="text-[10px] text-gray-500">Tableros</p>
        </div>
        <div className="text-center p-2 rounded bg-gray-50">
          <AlertTriangle className="h-4 w-4 mx-auto text-gray-500 mb-1" />
          <p className="text-lg font-bold text-gray-800">{issues.length}</p>
          <p className="text-[10px] text-gray-500">Incidencias</p>
        </div>
      </div>

      {/* Tableros detalle */}
      <div className="mb-2">
        <p className="text-[10px] text-gray-500 uppercase mb-1">Tableros:</p>
        <div className="flex flex-wrap gap-1">
          {tablerosAsignados.map((t) => (
            <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-700">{t}</span>
          ))}
        </div>
      </div>

      {/* Abiertas / Cerradas */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={onToggleExpand}
          className="flex-1 rounded bg-amber-50 border border-amber-200 px-2 py-1.5 text-center hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <p className="text-sm font-bold text-amber-700">{abiertas.length}</p>
          <p className="text-[10px] text-amber-600">Abiertas</p>
        </button>
        <div className="flex-1 rounded bg-green-50 border border-green-200 px-2 py-1.5 text-center">
          <p className="text-sm font-bold text-green-700">{cerradas.length}</p>
          <p className="text-[10px] text-green-600">Cerradas</p>
        </div>
      </div>

      {/* Desglose por tipo */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(byType)
          .sort(([, a], [, b]) => b - a)
          .map(([tipo, count]) => (
            <span key={tipo} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[tipo] ?? 'bg-gray-100 text-gray-600'}`}>
              {tipo}: {count}
            </span>
          ))}
      </div>

      {/* Expandible: lista de incidencias abiertas */}
      {isExpanded && abiertas.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 max-h-48 overflow-y-auto">
          <p className="text-[10px] text-gray-500 uppercase mb-2">Incidencias abiertas:</p>
          {abiertas.map((issue) => (
            <a
              key={issue.key}
              href={`https://jirasegurosbolivar.atlassian.net/browse/${issue.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">{issue.key}</span>
              <span className="truncate text-gray-500">{issue.summary}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
