import { User } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computePersonCards } from '../utils/metrics'

export interface PersonCardsProps {
  issues: EnrichedIssue[]
}

const STATUS_COLORS: Record<string, string> = {
  Backlog: 'bg-gray-700 text-white',
  'Por Hacer': 'bg-gray-200 text-gray-700',
  'En Progreso': 'bg-yellow-300 text-yellow-900',
  'En Pruebas QA': 'bg-blue-200 text-blue-800',
  'En Pruebas UAT': 'bg-green-200 text-green-800',
  'Pendiente PAP': 'bg-green-700 text-white',
  Bloqueado: 'bg-red-600 text-white',
}

export function PersonCards({ issues }: PersonCardsProps) {
  const cards = computePersonCards(issues)
  if (cards.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Asignaciones</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.name} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <h3 className="truncate text-sm font-semibold text-gray-800">{card.name}</h3>
              <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">{card.total}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(card.byStatus).map(([status, count]) => (
                <span key={status} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {status}: {count}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
