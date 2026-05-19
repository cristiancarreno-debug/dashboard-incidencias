import {
  AlertTriangle,
  Bug,
  Lightbulb,
  ClipboardList,
  Zap,
  Headphones,
} from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computeKpis } from '../utils/metrics'

export interface KpiCardsProps {
  datasetCompleto: EnrichedIssue[]
  datasetActivo: EnrichedIssue[]
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Incidente: <AlertTriangle className="h-5 w-5 text-red-600" />,
  'Defecto QA': <Bug className="h-5 w-5 text-orange-600" />,
  Mejora: <Lightbulb className="h-5 w-5 text-blue-600" />,
  Tarea: <ClipboardList className="h-5 w-5 text-gray-600" />,
  Spike: <Zap className="h-5 w-5 text-purple-600" />,
  'Service Request': <Headphones className="h-5 w-5 text-teal-600" />,
}

/**
 * Tarjetas KPI por tipología (solo dataset activo, sin total general ni activas).
 */
export function KpiCards({ datasetActivo }: KpiCardsProps) {
  const kpisActivo = computeKpis(datasetActivo)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Clasificación por Tipología</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Object.entries(kpisActivo.byType).map(([tipo, count]) => (
          <div
            key={tipo}
            className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm"
          >
            {TYPE_ICONS[tipo] ?? <ClipboardList className="h-5 w-5 text-gray-400" />}
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-gray-500">{tipo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
