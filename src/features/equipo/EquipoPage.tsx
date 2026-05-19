import { useState, useMemo } from 'react'
import { useProjects } from '@/features/jira/hooks/useProjects'
import { useIssues } from '@/features/jira/hooks/useIssues'
import { enrichIssue } from '@/features/dashboard/utils/metrics'
import { riceAnalyze } from '@/features/rice/rice-engine'
import { GdSelector } from '@/features/dashboard/components/GdSelector'
import { EquipoFilters } from './components/EquipoFilters'
import { PersonDetailCard } from './components/PersonDetailCard'
import type { EnrichedIssue } from '@/features/rice/rice.types'

interface EquipoFiltersState {
  profesional: string
  mesDesde: string
  mesHasta: string
}

/**
 * Página de resumen de asignaciones y dedicaciones por integrante del equipo.
 */
export function EquipoPage() {
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects()
  const projectKeys = useMemo(() => projects.map((p) => p.key), [projects])

  const [selectedGds, setSelectedGds] = useState<string[]>([])
  const [filters, setFilters] = useState<EquipoFiltersState>({
    profesional: '',
    mesDesde: '',
    mesHasta: '',
  })

  const { data: rawIssues = [], isLoading: isLoadingIssues, dataUpdatedAt } = useIssues(selectedGds)

  const enrichedIssues = useMemo(
    () => rawIssues.map((raw) => enrichIssue(raw, riceAnalyze)),
    [rawIssues]
  )

  // Filtrar por fecha
  const filteredByDate = useMemo(() => {
    return enrichedIssues.filter((issue) => {
      const created = issue.created.slice(0, 7) // YYYY-MM
      if (filters.mesDesde && created < filters.mesDesde) return false
      if (filters.mesHasta && created > filters.mesHasta) return false
      return true
    })
  }, [enrichedIssues, filters.mesDesde, filters.mesHasta])

  // Agrupar por persona
  const personData = useMemo(() => {
    const map = new Map<string, EnrichedIssue[]>()
    for (const issue of filteredByDate) {
      const name = issue.assignee || 'Sin asignar'
      if (filters.profesional && !name.toLowerCase().includes(filters.profesional.toLowerCase())) continue
      const list = map.get(name) ?? []
      list.push(issue)
      map.set(name, list)
    }
    // Ordenar por cantidad de asignaciones (mayor primero)
    return Array.from(map.entries())
      .map(([name, issues]) => ({ name, issues }))
      .sort((a, b) => b.issues.length - a.issues.length)
  }, [filteredByDate, filters.profesional])

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3">
        <GdSelector
          projects={projects}
          selected={selectedGds}
          onSelectionChange={setSelectedGds}
          isLoading={isLoadingProjects}
        />
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Última actualización</p>
          <p className="text-sm font-medium text-gray-600">
            {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString('es-CO') : 'Sin consultar aún'}
          </p>
        </div>
      </header>

      {/* Filtros */}
      <EquipoFilters filters={filters} onFiltersChange={setFilters} />

      {/* Loading */}
      {isLoadingIssues && selectedGds.length > 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500">Cargando datos del equipo...</span>
        </div>
      )}

      {/* Empty state */}
      {selectedGds.length === 0 && !isLoadingProjects && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-gray-500">Selecciona uno o más GDs para ver las asignaciones del equipo.</p>
        </div>
      )}

      {/* Person Cards */}
      {selectedGds.length > 0 && !isLoadingIssues && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Equipo ({personData.length} integrantes — {filteredByDate.length} incidencias)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {personData.map(({ name, issues }) => (
              <PersonDetailCard key={name} name={name} issues={issues} allGds={selectedGds} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
