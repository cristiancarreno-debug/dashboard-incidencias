import { FolderKanban, LayoutDashboard } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'

export interface SummaryHeaderProps {
  datasetCompleto: EnrichedIssue[]
  datasetActivo: EnrichedIssue[]
  selectedGds: string[]
}

export function SummaryHeader({ datasetCompleto, datasetActivo, selectedGds }: SummaryHeaderProps) {
  const totalGeneral = datasetCompleto.length
  const totalActivas = datasetActivo.length

  return (
    <div className="shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-semibold text-gray-800">Resumen</h2>
        {selectedGds.length > 0 && <span className="text-xs text-gray-500">({selectedGds.join(', ')})</span>}
      </div>
      <div className="flex gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <LayoutDashboard className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-xl font-bold text-gray-900">{totalGeneral}</p>
            <p className="text-[10px] text-gray-500">Total incidencias</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm">
          <FolderKanban className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-xl font-bold text-amber-900">{totalActivas}</p>
            <p className="text-[10px] text-amber-600">Activas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
