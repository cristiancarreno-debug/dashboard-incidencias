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

export function MetricsRow({ datasetCompleto, datasetActivo, selectedGds }: Props) {
  const kpis = computeKpis(datasetActivo)

  return (
    <div className="flex items-start gap-4 w-full">
      {/* Resumen */}
      <div className="shrink-0">
        <p className="text-xs font-semibold text-gray-600 mb-2">Resumen <span className="font-normal text-gray-400">({selectedGds.join(', ')})</span></p>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 shadow-sm">
            <LayoutDashboard className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-2xl font-bold">{datasetCompleto.length}</p>
              <p className="text-[10px] text-gray-500">Total incidentes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
            <FolderKanban className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-900">{datasetActivo.length}</p>
              <p className="text-[10px] text-amber-600">Abiertos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="w-px self-stretch bg-gray-200 shrink-0" />

      {/* Clasificación de incidencias abiertas */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-600 mb-2">Clasificación de incidencias abiertas</p>
        <div className="flex gap-2">
          {Object.entries(kpis.byType).map(([tipo, count]) => (
            <div key={tipo} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-3 shadow-sm flex-1">
              {TYPE_ICONS[tipo] ?? <ClipboardList className="h-4 w-4 text-gray-400" />}
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-[10px] text-gray-500">{tipo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Separador */}
      <div className="w-px self-stretch bg-gray-200 shrink-0" />

      {/* Clasificación por priorización RICE */}
      <div className="shrink-0">
        <p className="text-xs font-semibold text-gray-600 mb-2">Clasificación por priorización RICE</p>
        <div className="flex gap-2">
          {RICE_CONFIG.map(({ key, color, icon }) => (
            <div key={key} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-3 shadow-sm" style={{ borderLeftWidth: '3px', borderLeftColor: color }}>
              {icon}
              <div>
                <p className="text-2xl font-bold">{kpis.byRicePriority[key] ?? 0}</p>
                <p className="text-[10px] text-gray-500">{key}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
