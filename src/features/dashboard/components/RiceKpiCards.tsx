import { ShieldAlert, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computeKpis } from '../utils/metrics'

/** Props del componente RiceKpiCards. */
export interface RiceKpiCardsProps {
  /** Dataset activo (excluyendo estados terminales). */
  datasetActivo: EnrichedIssue[]
}

/** Configuración visual por prioridad RICE. */
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

/** Orden de prioridades para renderizado consistente. */
const PRIORITY_ORDER = ['Crítica', 'Alta', 'Media', 'Baja'] as const

/**
 * Tarjetas KPI de distribución de prioridad RICE.
 *
 * Muestra la cantidad de issues activas por cada nivel de prioridad RICE
 * con codificación de color: Crítica=#b71c1c, Alta=#e65100, Media=#f9a825, Baja=#2e7d32.
 *
 * @param props - Props con dataset activo.
 */
export function RiceKpiCards({ datasetActivo }: RiceKpiCardsProps) {
  const { byRicePriority } = computeKpis(datasetActivo)

  return (
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
  )
}
