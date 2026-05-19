interface EquipoFiltersState {
  profesional: string
  mesDesde: string
  mesHasta: string
}

interface Props {
  filters: EquipoFiltersState
  onFiltersChange: (filters: EquipoFiltersState) => void
}

/**
 * Barra de filtros para la vista de equipo.
 */
export function EquipoFilters({ filters, onFiltersChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4 shadow-sm">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Profesional</label>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filters.profesional}
          onChange={(e) => onFiltersChange({ ...filters, profesional: e.target.value })}
          className="w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Mes desde</label>
        <input
          type="month"
          value={filters.mesDesde}
          onChange={(e) => onFiltersChange({ ...filters, mesDesde: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Mes hasta</label>
        <input
          type="month"
          value={filters.mesHasta}
          onChange={(e) => onFiltersChange({ ...filters, mesHasta: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      {(filters.profesional || filters.mesDesde || filters.mesHasta) && (
        <button
          onClick={() => onFiltersChange({ profesional: '', mesDesde: '', mesHasta: '' })}
          className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
