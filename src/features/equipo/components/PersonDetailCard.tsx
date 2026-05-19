import { User, Clock, LayoutDashboard, AlertTriangle } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'

interface Props {
  name: string
  issues: EnrichedIssue[]
  allGds: string[]
}

const TYPE_COLORS: Record<string, string> = {
  Incidente: 'bg-red-100 text-red-700',
  'Defecto QA': 'bg-orange-100 text-orange-700',
  Mejora: 'bg-blue-100 text-blue-700',
  Tarea: 'bg-gray-100 text-gray-700',
  Spike: 'bg-purple-100 text-purple-700',
  'Service Request': 'bg-teal-100 text-teal-700',
}

/**
 * Card detallada de un integrante del equipo con métricas de asignación.
 */
export function PersonDetailCard({ name, issues, allGds }: Props) {
  // Tableros (GDs) en los que tiene asignaciones
  const tablerosAsignados = new Set(issues.map((i) => i.project))

  // Conteo por tipo
  const byType: Record<string, number> = {}
  for (const issue of issues) {
    byType[issue.tipo] = (byType[issue.tipo] || 0) + 1
  }

  // Estimación de horas (8h por incidencia activa como proxy)
  const horasEstimadas = issues.length * 8

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 truncate">{name}</h4>
          <p className="text-xs text-gray-500">{issues.length} incidencias asignadas</p>
        </div>
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
          <p className="text-lg font-bold text-gray-800">{tablerosAsignados.size}</p>
          <p className="text-[10px] text-gray-500">Tableros</p>
        </div>
        <div className="text-center p-2 rounded bg-gray-50">
          <AlertTriangle className="h-4 w-4 mx-auto text-gray-500 mb-1" />
          <p className="text-lg font-bold text-gray-800">{issues.length}</p>
          <p className="text-[10px] text-gray-500">Incidencias</p>
        </div>
      </div>

      {/* Desglose por tipo */}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(byType)
          .sort(([, a], [, b]) => b - a)
          .map(([tipo, count]) => (
            <span
              key={tipo}
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[tipo] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {tipo}: {count}
            </span>
          ))}
      </div>
    </div>
  )
}
