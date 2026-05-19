import { FolderKanban } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'

export interface SummaryHeaderProps {
  datasetCompleto: EnrichedIssue[]
  datasetActivo: EnrichedIssue[]
  selectedGds: string[]
}

/**
 * Encabezado con contador de issues activas.
 */
export function SummaryHeader({
  datasetActivo,
  selectedGds,
}: SummaryHeaderProps) {
  const totalActivas = datasetActivo.length

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">Resumen</h2>
        {selectedGds.length > 0 && (
          <span className="text-sm text-gray-500">
            ({selectedGds.join(', ')})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 max-w-xs">
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <FolderKanban className="h-6 w-6 text-amber-600" />
          <div>
            <p className="text-2xl font-bold text-amber-900">{totalActivas}</p>
            <p className="text-xs font-medium text-amber-600">
              Activas (en curso)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
