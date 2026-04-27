import { User } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computePersonCards } from '../utils/metrics'

/** Props del componente PersonCards. */
export interface PersonCardsProps {
  /** Dataset_Activo, ya filtrado por los filtros activos del dashboard. */
  issues: EnrichedIssue[]
}

/** Configuración de color por estado para los badges. */
const STATUS_COLORS: Record<string, string> = {
  Backlog: 'bg-gray-100 text-gray-700',
  'Por Hacer': 'bg-blue-100 text-blue-700',
  'En Progreso': 'bg-yellow-100 text-yellow-800',
  'En Pruebas QA': 'bg-purple-100 text-purple-700',
  'En Pruebas UAT': 'bg-indigo-100 text-indigo-700',
  'Pendiente PAP': 'bg-orange-100 text-orange-700',
  Bloqueado: 'bg-red-100 text-red-700',
}

/**
 * Tarjetas de asignación por profesional.
 *
 * Muestra una tarjeta por cada profesional con asignaciones,
 * incluyendo nombre, total de asignaciones y desglose por estado
 * con badges codificados por color. Las tarjetas se ordenan de
 * mayor a menor cantidad de asignaciones.
 *
 * Se recalcula automáticamente cuando los filtros cambian, ya que
 * el componente padre pasa las issues ya filtradas.
 *
 * @param props - Props con issues del Dataset_Activo filtradas.
 */
export function PersonCards({ issues }: PersonCardsProps) {
  const cards = computePersonCards(issues)

  if (cards.length === 0) {
    return (
      <p className="text-sm text-gray-500">No hay asignaciones para mostrar.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.name}
          className="rounded-lg border bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <h3 className="truncate text-sm font-semibold text-gray-800">
              {card.name}
            </h3>
            <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
              {card.total}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(card.byStatus).map(([status, count]) => (
              <span
                key={status}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {status}: {count}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
