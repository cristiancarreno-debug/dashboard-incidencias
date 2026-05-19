import { ShieldAlert, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computeKpis } from '../utils/metrics'

export interface RiceKpiCardsProps {
  datasetActivo: EnrichedIssue[]
}

const PRIORITY_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Crítica: {
    color: '#b71c1c',
    icon: <ShieldAlert className="h-5 w-5" style={{ color: '#b71c1c' }} />,
  },
  Alta: {
    color: '#e65100',
    icon: <ArrowUp className="h-5 w-5" style={{ color: '#e65100' }} />,
  },
  Media: {
    color: '#f9a825',
    icon: <Minus className="h-5 w-5" style={{ color: '#f9a825' }} />,
  },
  Baja: {
    color: '#2e7d32',
    icon: <ArrowDown className="h-5 w-5" style={{ color: '#2e7d32' }} />,
  },
}

const PRIORITY_ORDER = ['Crítica', 'Alta', 'Media', 'Baja'] as const

/**
 * Tarjetas KPI de distribución de prioridad RICE con título de sección.
 */
export function RiceKpiCards({ datasetActivo }: RiceKpiCardsProps) {
  const { byRicePriority } = computeKpis(datasetActivo)

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Clasificación Matriz RICE</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRIORITY_ORDER.map((priority) => {
          const config = PRIORITY_CONFIG[priority]
          const count = byRicePriority[priority] ?? 0
          return (
            <div
              key={priority}
              className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm"
              style={{ borderLeftWidth: '4px', borderLeftColor: config.color }}
            >
              {config.icon}
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-gray-500">{priority}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
