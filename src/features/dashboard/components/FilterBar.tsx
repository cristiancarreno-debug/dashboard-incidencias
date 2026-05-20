import { useMemo } from 'react'
import type { EnrichedIssue, ActiveFilters } from '@/features/rice/rice.types'
import { MultiCheckboxDropdown, type MultiCheckboxOption } from '@/shared/components/MultiCheckboxDropdown'
import { SearchInput } from '@/shared/components/SearchInput'

/** Props para el componente FilterBar. */
export interface FilterBarProps {
  /** Dataset_Activo — para calcular opciones y conteos disponibles. */
  issues: EnrichedIssue[]
  /** Filtros activos actuales. */
  filters: ActiveFilters
  /** Callback cuando cambian los filtros. */
  onFiltersChange: (filters: ActiveFilters) => void
  /** Texto de búsqueda actual. */
  searchQuery: string
  /** Callback cuando cambia el texto de búsqueda. */
  onSearchChange: (query: string) => void
}

/**
 * Calcula opciones con conteo a partir de un array de valores.
 * @param values - Array de strings a agrupar y contar.
 * @returns Array de opciones ordenadas alfabéticamente con su conteo.
 */
function computeOptions(values: string[]): MultiCheckboxOption[] {
  const counts = new Map<string, number>()
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

/**
 * Barra de filtros multi-checkbox con búsqueda de texto.
 * Incluye filtros para: Equipo (GD), Tipo, Estado, Prioridad RICE, Responsable y Épica.
 */
export function FilterBar({
  issues,
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  const equipoOptions = useMemo(
    () => computeOptions(issues.map((i) => i.equipo)),
    [issues]
  )

  const tipoOptions = useMemo(
    () => computeOptions(issues.map((i) => i.tipo)),
    [issues]
  )

  const statusOptions = useMemo(
    () => computeOptions(issues.map((i) => i.status)),
    [issues]
  )

  const ricePriorityOptions = useMemo(
    () => computeOptions(issues.map((i) => i.rice.priority)),
    [issues]
  )

  const assigneeOptions = useMemo(
    () => computeOptions(issues.map((i) => i.assignee)),
    [issues]
  )

  const epicOptions = useMemo(
    () => computeOptions(issues.map((i) => i.epic)),
    [issues]
  )

  /** Actualiza un filtro específico manteniendo los demás intactos. */
  const handleFilterChange = (key: keyof ActiveFilters, selected: Set<string>) => {
    onFiltersChange({ ...filters, [key]: selected })
  }

  return (
    <div className="flex items-center gap-2 flex-1">
      <MultiCheckboxDropdown
        label="Equipo"
        options={equipoOptions}
        selected={filters.equipo}
        onSelectionChange={(s) => handleFilterChange('equipo', s)}
      />
      <MultiCheckboxDropdown
        label="Tipo"
        options={tipoOptions}
        selected={filters.tipo}
        onSelectionChange={(s) => handleFilterChange('tipo', s)}
      />
      <MultiCheckboxDropdown
        label="Estado"
        options={statusOptions}
        selected={filters.status}
        onSelectionChange={(s) => handleFilterChange('status', s)}
      />
      <MultiCheckboxDropdown
        label="Prioridad RICE"
        options={ricePriorityOptions}
        selected={filters.ricePriority}
        onSelectionChange={(s) => handleFilterChange('ricePriority', s)}
      />
      <MultiCheckboxDropdown
        label="Responsable"
        options={assigneeOptions}
        selected={filters.assignee}
        onSelectionChange={(s) => handleFilterChange('assignee', s)}
      />
      <MultiCheckboxDropdown
        label="Épica"
        options={epicOptions}
        selected={filters.epic}
        onSelectionChange={(s) => handleFilterChange('epic', s)}
      />
      <div className="w-56">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Buscar clave, resumen, responsable..."
        />
      </div>
    </div>
  )
}
