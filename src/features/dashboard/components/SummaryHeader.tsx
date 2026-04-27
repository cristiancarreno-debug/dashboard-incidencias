import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  Archive,
} from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { TERMINAL_STATES } from '@/config/constants'

/**
 * Props del componente SummaryHeader.
 *
 * Recibe ambos datasets (completo y activo) para mostrar métricas
 * diferenciadas visualmente en el encabezado del dashboard.
 */
export interface SummaryHeaderProps {
  /** Todas las issues incluyendo estados terminales. */
  datasetCompleto: EnrichedIssue[]
  /** Solo issues activas (excluyendo estados terminales). */
  datasetActivo: EnrichedIssue[]
  /** GDs seleccionados para desglose. */
  selectedGds: string[]
}

/**
 * Encabezado con métricas duales del dashboard.
 *
 * Muestra contadores del Dataset_Completo (total general, terminales)
 * y del Dataset_Activo (issues activas), diferenciados visualmente
 * para evitar confusión entre ambos totales.
 *
 * - Fondo azul/indigo: métricas del Dataset_Completo.
 * - Fondo verde: métricas del Dataset_Activo.
 *
 * @param props - Props con datasets dual y GDs seleccionados.
 *
 * Valida: Requisitos 3.5, 11.3, 11.5
 */
export function SummaryHeader({
  datasetCompleto,
  datasetActivo,
  selectedGds,
}: SummaryHeaderProps) {
  const totalGeneral = datasetCompleto.length
  const totalTerminales = datasetCompleto.filter((issue) =>
    TERMINAL_STATES.has(issue.status)
  ).length
  const totalActivas = datasetActivo.length

  return (
    <div className="space-y-2">
      {/* Título con GDs seleccionados */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Resumen</h2>
        {selectedGds.length > 0 && (
          <span className="text-sm text-gray-500">
            ({selectedGds.join(', ')})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Total general — Dataset Completo (fondo indigo claro) */}
        <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
          <LayoutDashboard className="h-6 w-6 text-indigo-600" />
          <div>
            <p className="text-2xl font-bold text-indigo-900">{totalGeneral}</p>
            <p className="text-xs font-medium text-indigo-600">
              Total general (incluye cerradas)
            </p>
          </div>
        </div>

        {/* Terminales — Dataset Completo (fondo gris/slate) */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <Archive className="h-6 w-6 text-slate-600" />
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalTerminales}</p>
            <p className="text-xs font-medium text-slate-600">
              En estados terminales
            </p>
          </div>
        </div>

        {/* Activas — Dataset Activo (fondo verde) */}
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
          <FolderKanban className="h-6 w-6 text-green-600" />
          <div>
            <p className="text-2xl font-bold text-green-900">{totalActivas}</p>
            <p className="text-xs font-medium text-green-600">
              Activas (en curso)
            </p>
          </div>
        </div>
      </div>

      {/* Indicador visual de leyenda */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-indigo-500" />
          Fondo azul = Dataset completo
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          Fondo verde = Solo activas
        </span>
      </div>
    </div>
  )
}
