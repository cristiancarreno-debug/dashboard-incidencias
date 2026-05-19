import { ShieldAlert, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computeKpis } from '../utils/metrics'

export interface RiceKpiCardsProps {
  datasetActivo: EnrichedIssue[]
}

const PRIORITY_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  Crítica: { color: '#b71c1c', icon: <ShieldAlert className="h-4 w-4" style={{ color: '#b71c1c' }} /> },
  Alta: { color: '#e65100', icon: <ArrowUp className="h-4 w-4" style={{ color: '#e65100' }} /> },
  Media: { color: '#f9a825', icon: <Minus className="h-4 w-4" style={{ color: '#f9a825' }} /> },
  Baja: { color: '#2e7d32', icon: <ArrowDown className="h-4 w-4" style={{ color: '#2e7d32' }} /> },
}

const PRIORITY_ORDER = ['Crítica', 'Alta', 'Media', 'Baja'] as const

export function RiceKpiCards({ datasetActivo }: RiceKpiCardsProps) {
  const { byRicePriority } = computeKpis(datasetActivo)

  return (
    <div className="shrink-0">
      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Clasificación Matriz RICE</h3>
      <div className="flex gap-2">
        {PRIORITY_ORDER.map((priority) => {
          const config = PRIORITY_CONFIG[priority]
          const count = byRicePriority[priority] ?? 0
          return (
            <div key={priority} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm" style={{ borderLeftWidth: '3px', borderLeftColor: config.color }}>
              {config.icon}
              <div>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-[10px] text-gray-500">{priority}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
