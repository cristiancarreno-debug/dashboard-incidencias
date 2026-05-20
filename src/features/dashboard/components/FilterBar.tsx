import { useMemo } from 'react'
import type { EnrichedIssue, ActiveFilters } from '@/features/rice/rice.types'
import { MultiCheckboxDropdown, type MultiCheckboxOption } from '@/shared/components/MultiCheckboxDropdown'
import { SearchInput } from '@/shared/components/SearchInput'

export interface FilterBarProps {
  issues: EnrichedIssue[]
  filters: ActiveFilters
  onFiltersChange: (filters: ActiveFilters) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

function computeOptions(values: string[]): MultiCheckboxOption[] {
  const counts = new Map<string, number>()
  for (const v of values) { counts.set(v, (counts.get(v) ?? 0) + 1) }
  return Array.from(counts.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value))
}

export function FilterBar({ issues, filters, onFiltersChange, searchQuery, onSearchChange }: FilterBarProps) {
  const equipoOptions = useMemo(() => computeOptions(issues.map((i) => i.equipo)), [issues])
  const tipoOptions = useMemo(() => computeOptions(issues.map((i) => i.tipo)), [issues])
  const statusOptions = useMemo(() => computeOptions(issues.map((i) => i.status)), [issues])
  const ricePriorityOptions = useMemo(() => computeOptions(issues.map((i) => i.rice.priority)), [issues])
  const assigneeOptions = useMemo(() => computeOptions(issues.map((i) => i.assignee)), [issues])
  const epicOptions = useMemo(() => computeOptions(issues.map((i) => i.epic)), [issues])

  const handleFilterChange = (key: keyof ActiveFilters, selected: Set<string>) => {
    onFiltersChange({ ...filters, [key]: selected })
  }

  return (
    <div className="grid grid-cols-7 gap-2 flex-1">
      <MultiCheckboxDropdown label="Equipo" options={equipoOptions} selected={filters.equipo} onSelectionChange={(s) => handleFilterChange('equipo', s)} />
      <MultiCheckboxDropdown label="Tipo" options={tipoOptions} selected={filters.tipo} onSelectionChange={(s) => handleFilterChange('tipo', s)} />
      <MultiCheckboxDropdown label="Estado" options={statusOptions} selected={filters.status} onSelectionChange={(s) => handleFilterChange('status', s)} />
      <MultiCheckboxDropdown label="Prioridad RICE" options={ricePriorityOptions} selected={filters.ricePriority} onSelectionChange={(s) => handleFilterChange('ricePriority', s)} />
      <MultiCheckboxDropdown label="Responsable" options={assigneeOptions} selected={filters.assignee} onSelectionChange={(s) => handleFilterChange('assignee', s)} />
      <MultiCheckboxDropdown label="Épica" options={epicOptions} selected={filters.epic} onSelectionChange={(s) => handleFilterChange('epic', s)} />
      <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Buscar clave, resumen, resp..." />
    </div>
  )
}
