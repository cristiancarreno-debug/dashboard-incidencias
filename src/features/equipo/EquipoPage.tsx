import { useState, useMemo } from 'react'
import { useProjects } from '@/features/jira/hooks/useProjects'
import { useIssues } from '@/features/jira/hooks/useIssues'
import { enrichIssue } from '@/features/dashboard/utils/metrics'
import { riceAnalyze } from '@/features/rice/rice-engine'
import { GdSelector } from '@/features/dashboard/components/GdSelector'
import { PersonDetailCard } from './components/PersonDetailCard'
import { TERMINAL_STATES } from '@/config/constants'
import { X } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'

export function EquipoPage() {
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects()
  const projectKeys = useMemo(() => projects.map((p) => p.key), [projects])

  const [selectedGds, setSelectedGds] = useState<string[]>([])
  const [profesional, setProfesional] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null)

  const { data: rawIssues = [], isLoading: isLoadingIssues, dataUpdatedAt } = useIssues(selectedGds)

  const enrichedIssues = useMemo(
    () => rawIssues.map((raw) => enrichIssue(raw, riceAnalyze)),
    [rawIssues]
  )

  const filteredByDate = useMemo(() => {
    return enrichedIssues.filter((issue) => {
      const created = issue.created.slice(0, 10)
      if (fechaDesde && created < fechaDesde) return false
      if (fechaHasta && created > fechaHasta) return false
      return true
    })
  }, [enrichedIssues, fechaDesde, fechaHasta])

  const personData = useMemo(() => {
    const map = new Map<string, EnrichedIssue[]>()
    for (const issue of filteredByDate) {
      const name = issue.assignee || 'Sin asignar'
      if (profesional && !name.toLowerCase().includes(profesional.toLowerCase())) continue
      const list = map.get(name) ?? []
      list.push(issue)
      map.set(name, list)
    }
    return Array.from(map.entries())
      .map(([name, issues]) => ({ name, issues }))
      .sort((a, b) => b.issues.length - a.issues.length)
  }, [filteredByDate, profesional])

  const hasFilters = profesional || fechaDesde || fechaHasta
  const clearFilters = () => { setProfesional(''); setFechaDesde(''); setFechaHasta('') }

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Filtros - todos al mismo nivel */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">GD</label>
          <GdSelector
            projects={projects}
            selected={selectedGds}
            onSelectionChange={setSelectedGds}
            isLoading={isLoadingProjects}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Profesional</label>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={profesional}
            onChange={(e) => setProfesional(e.target.value)}
            className="h-10 w-[200px] rounded-md border border-gray-300 px-3 text-sm focus:border-[hsl(153,100%,32.5%)] focus:ring-1 focus:ring-[hsl(153,100%,32.5%)]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-[hsl(153,100%,32.5%)] focus:ring-1 focus:ring-[hsl(153,100%,32.5%)]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-[hsl(153,100%,32.5%)] focus:ring-1 focus:ring-[hsl(153,100%,32.5%)]"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-10 flex items-center gap-1 rounded-md border border-red-300 px-3 text-sm text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" /> Limpiar
          </button>
        )}
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Última actualización</p>
          <p className="text-sm font-medium text-gray-600">
            {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString('es-CO') : 'Sin consultar aún'}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoadingIssues && selectedGds.length > 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(153,100%,32.5%)] border-t-transparent" />
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
              <PersonDetailCard
                key={name}
                name={name}
                issues={issues}
                isExpanded={expandedPerson === name}
                onToggleExpand={() => setExpandedPerson(expandedPerson === name ? null : name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
