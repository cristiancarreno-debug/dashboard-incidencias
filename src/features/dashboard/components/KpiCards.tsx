import {
  AlertTriangle,
  Bug,
  Lightbulb,
  ClipboardList,
  Zap,
  Headphones,
  LayoutDashboard,
  FolderKanban,
} from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computeKpis } from '../utils/metrics'

/** Props del componente KpiCards (dual dataset, Requisito 11). */
export interface KpiCardsProps {
  /** Dataset completo (todas las issues incluyendo cerradas) — para total general. */
  datasetCompleto: EnrichedIssue[]
  /** Dataset activo (excluyendo estados terminales) — para contadores por tipo y GD. */
  datasetActivo: EnrichedIssue[]
}

/** Mapa de iconos por tipo de incidencia. */
const TYPE_ICONS: Record<string, React.ReactNode> = {
  Incidente: <AlertTriangle className="h-5 w-5 text-red-600" />,
  'Defecto QA': <Bug className="h-5 w-5 text-orange-600" />,
  Mejora: <Lightbulb className="h-5 w-5 text-blue-600" />,
  Tarea: <ClipboardList className="h-5 w-5 text-gray-600" />,
  Spike: <Zap className="h-5 w-5 text-purple-600" />,
  'Service Request': <Headphones className="h-5 w-5 text-teal-600" />,
}

/**
 * Tarjetas KPI del dashboard.
 *
 * Muestra contadores de resumen usando el dataset completo (total general)
 * y contadores de issues activas por tipo y por GD usando el dataset activo.
 *
 * @param props - Props con datasets dual (completo y activo).
 */
export function KpiCards({ datasetCompleto, datasetActivo }: KpiCardsProps) {
  const kpisActivo = computeKpis(datasetActivo)
  const totalGeneral = datasetCompleto.length

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {/* Total general (Dataset Completo) */}
      <div className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm">
        <LayoutDashboard className="h-5 w-5 text-indigo-600" />
        <div>
          <p className="text-2xl font-bold">{totalGeneral}</p>
          <p className="text-xs text-gray-500">Total general</p>
        </div>
      </div>

      {/* Total activas (Dataset Activo) */}
      <div className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm">
        <FolderKanban className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-2xl font-bold">{kpisActivo.total}</p>
          <p className="text-xs text-gray-500">Activas</p>
        </div>
      </div>

      {/* Contadores por tipo (Dataset Activo) */}
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
  )
}
