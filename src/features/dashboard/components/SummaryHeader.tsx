import { FolderKanban, LayoutDashboard } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'

export interface SummaryHeaderProps {
  datasetCompleto: EnrichedIssue[]
  datasetActivo: EnrichedIssue[]
  selectedGds: string[]
}

export function SummaryHeader({
  datasetCompleto,
  datasetActivo,
  selectedGds,
}: SummaryHeaderProps) {
  const totalGeneral = datasetCompleto.length
  const totalActivas = datasetActivo.length

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Resumen</h2>
        {selectedGds.length > 0 && (
          <span className="text-sm text-gray-500">({selectedGds.join(', ')})</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-md">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <LayoutDashboard className="h-6 w-6 text-gray-600" />
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalGeneral}</p>
            <p className="text-xs font-medium text-gray-500">Total incidencias</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <FolderKanban className="h-6 w-6 text-amber-600" />
          <div>
            <p className="text-2xl font-bold text-amber-900">{totalActivas}</p>
            <p className="text-xs font-medium text-amber-600">Activas (en curso)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
