import { AlertTriangle, Bug, Lightbulb, ClipboardList, Zap, Headphones } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computeKpis } from '../utils/metrics'

export interface KpiCardsProps {
  datasetCompleto: EnrichedIssue[]
  datasetActivo: EnrichedIssue[]
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Incidente: <AlertTriangle className="h-4 w-4 text-red-600" />,
  'Defecto QA': <Bug className="h-4 w-4 text-orange-600" />,
  Mejora: <Lightbulb className="h-4 w-4 text-blue-600" />,
  Tarea: <ClipboardList className="h-4 w-4 text-gray-600" />,
  Spike: <Zap className="h-4 w-4 text-purple-600" />,
  'Service Request': <Headphones className="h-4 w-4 text-teal-600" />,
}

export function KpiCards({ datasetActivo }: KpiCardsProps) {
  const kpisActivo = computeKpis(datasetActivo)

  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Clasificación por Tipología</h3>
      <div className="flex gap-2">
        {Object.entries(kpisActivo.byType).map(([tipo, count]) => (
          <div key={tipo} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
            {TYPE_ICONS[tipo] ?? <ClipboardList className="h-4 w-4 text-gray-400" />}
            <div>
              <p className="text-xl font-bold">{count}</p>
              <p className="text-[10px] text-gray-500">{tipo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
