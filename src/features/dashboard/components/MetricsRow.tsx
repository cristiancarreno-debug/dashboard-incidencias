import { LayoutDashboard, FolderKanban, AlertTriangle, Bug, Lightbulb, ClipboardList, Zap, Headphones, ShieldAlert, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { computeKpis } from '../utils/metrics'

interface Props {
  datasetCompleto: EnrichedIssue[]
  datasetActivo: EnrichedIssue[]
  selectedGds: string[]
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Incidente: <AlertTriangle className="h-4 w-4 text-red-600" />,
  'Defecto QA': <Bug className="h-4 w-4 text-orange-600" />,
  Mejora: <Lightbulb className="h-4 w-4 text-blue-600" />,
  Tarea: <ClipboardList className="h-4 w-4 text-gray-600" />,
  Spike: <Zap className="h-4 w-4 text-purple-600" />,
  'Service Request': <Headphones className="h-4 w-4 text-teal-600" />,
}

const RICE_CONFIG = [
  { key: 'Crítica', color: '#b71c1c', icon: <ShieldAlert className="h-4 w-4" style={{ color: '#b71c1c' }} /> },
  { key: 'Alta', color: '#e65100', icon: <ArrowUp className="h-4 w-4" style={{ color: '#e65100' }} /> },
  { key: 'Media', color: '#f9a825', icon: <Minus className="h-4 w-4" style={{ color: '#f9a825' }} /> },
  { key: 'Baja', color: '#2e7d32', icon: <ArrowDown className="h-4 w-4" style={{ color: '#2e7d32' }} /> },
] as const

/**
 * Fila única con Resumen + Tipología + RICE en una línea horizontal.
 */
export function MetricsRow({ datasetCompleto, datasetActivo, selectedGds }: Props) {
  const kpis = computeKpis(datasetActivo)

  return (
    <div className="flex items-end gap-4 overflow-x-auto pb-1">
      {/* RESUMEN */}
      <div className="shrink-0">
        <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Resumen <span className="normal-case font-normal">({selectedGds.join(', ')})</span></p>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
            <LayoutDashboard className="h-4 w-4 text-gray-600" />
            <div><p className="text-lg font-bold">{datasetCompleto.length}</p><p className="text-[9px] text-gray-500">Total</p></div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm">
            <FolderKanban className="h-4 w-4 text-amber-600" />
            <div><p className="text-lg font-bold text-amber-900">{datasetActivo.length}</p><p className="text-[9px] text-amber-600">Activas</p></div>
          </div>
        </div>
      </div>

      {/* SEPARADOR */}
      <div className="w-px h-12 bg-gray-200 shrink-0" />

      {/* TIPOLOGÍA */}
      <div className="shrink-0">
        <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Tipología</p>
        <div className="flex gap-2">
          {Object.entries(kpis.byType).map(([tipo, count]) => (
            <div key={tipo} className="flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-2 shadow-sm">
              {TYPE_ICONS[tipo] ?? <ClipboardList className="h-4 w-4 text-gray-400" />}
              <div><p className="text-lg font-bold">{count}</p><p className="text-[9px] text-gray-500">{tipo}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* SEPARADOR */}
      <div className="w-px h-12 bg-gray-200 shrink-0" />

      {/* RICE */}
      <div className="shrink-0">
        <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Matriz RICE</p>
        <div className="flex gap-2">
          {RICE_CONFIG.map(({ key, color, icon }) => (
            <div key={key} className="flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-2 shadow-sm" style={{ borderLeftWidth: '3px', borderLeftColor: color }}>
              {icon}
              <div><p className="text-lg font-bold">{kpis.byRicePriority[key] ?? 0}</p><p className="text-[9px] text-gray-500">{key}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
