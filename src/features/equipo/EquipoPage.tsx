import { useState, useMemo, useRef, useEffect } from 'react'
import { useProjects } from '@/features/jira/hooks/useProjects'
import { useIssues } from '@/features/jira/hooks/useIssues'
import { enrichIssue } from '@/features/dashboard/utils/metrics'
import { riceAnalyze } from '@/features/rice/rice-engine'
import { PersonDetailCard } from './components/PersonDetailCard'
import { TERMINAL_STATES } from '@/config/constants'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import { X, ChevronsUpDown, Square } from 'lucide-react'
import type { JiraProject } from '@/features/jira/types/jira.types'

/** GD Selector con Ninguno */
function GdMultiSelect({ projects, selected, onChange, isLoading }: {
  projects: JiraProject[]; selected: string[]; onChange: (v: string[]) => void; isLoading: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = projects.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)
  })

  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  }

  const label = selected.length === 0 ? 'Seleccionar GDs...' : selected.length === 1 ? '1 GD' : `${selected.length} GDs`

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className="flex h-10 w-[220px] items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        <span className="truncate">{isLoading ? 'Cargando...' : label}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-[260px] rounded-md border border-gray-200 bg-white shadow-lg">
          {/* Ninguno */}
          <div className="flex border-b px-2 py-1.5">
            <button onClick={() => onChange([])} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 rounded">
              <Square className="h-3 w-3" /> Ninguno
            </button>
          </div>
          <div className="border-b px-3 py-1.5">
            <input className="w-full text-sm outline-none placeholder:text-gray-400" placeholder="Buscar GD..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="max-h-[250px] overflow-y-auto p-1">
            {filtered.map((p) => (
              <div key={p.key} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer" onClick={() => toggle(p.key)}>
                <input type="checkbox" checked={selected.includes(p.key)} readOnly className="h-4 w-4 rounded border-gray-300 accent-[hsl(153,100%,32.5%)] pointer-events-none" />
                <span className="font-medium">{p.key}</span>
                <span className="truncate text-gray-500 text-xs">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function EquipoPage() {
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects()
  const projectKeys = useMemo(() => projects.map((p) => p.key), [projects])
  const [selectedGds, setSelectedGds] = useState<string[]>([])
  const [profesional, setProfesional] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<'abiertas' | 'cerradas' | null>(null)

  // Si hay profesional pero no GD, buscar en todos los proyectos
  const queryGds = selectedGds.length > 0 ? selectedGds : (profesional.length >= 3 ? projectKeys : [])
  const { data: rawIssues = [], isLoading: isLoadingIssues, dataUpdatedAt } = useIssues(queryGds)

  const enrichedIssues = useMemo(() => rawIssues.map((raw) => enrichIssue(raw, riceAnalyze)), [rawIssues])

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
    return Array.from(map.entries()).map(([name, issues]) => ({ name, issues })).sort((a, b) => b.issues.length - a.issues.length)
  }, [filteredByDate, profesional])

  const hasFilters = profesional || fechaDesde || fechaHasta || selectedGds.length > 0
  const clearAll = () => { setProfesional(''); setFechaDesde(''); setFechaHasta(''); setSelectedGds([]) }

  return (
    <div className="w-full space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">GD</label>
          <GdMultiSelect projects={projects} selected={selectedGds} onChange={setSelectedGds} isLoading={isLoadingProjects} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Profesional</label>
          <input type="text" placeholder="Buscar..." value={profesional} onChange={(e) => setProfesional(e.target.value)}
            className="h-10 w-[180px] rounded-md border border-gray-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Desde</label>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Hasta</label>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm" />
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="h-10 flex items-center gap-1 rounded-md border border-red-300 px-3 text-sm text-red-600 hover:bg-red-50">
            <X className="h-4 w-4" /> Limpiar
          </button>
        )}
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Última actualización</p>
          <p className="text-sm font-medium text-gray-600">{dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString('es-CO') : 'Sin consultar aún'}</p>
        </div>
      </div>

      {isLoadingIssues && queryGds.length > 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(153,100%,32.5%)] border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500">Cargando...</span>
        </div>
      )}

      {selectedGds.length === 0 && profesional.length < 3 && !isLoadingProjects && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-gray-500">Selecciona uno o más GDs o escribe al menos 3 caracteres del nombre del profesional.</p>
        </div>
      )}

      {queryGds.length > 0 && !isLoadingIssues && (
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
                expandedSection={expandedPerson === name ? expandedSection : null}
                onToggleSection={(section) => {
                  if (expandedPerson === name && expandedSection === section) {
                    setExpandedPerson(null); setExpandedSection(null)
                  } else {
                    setExpandedPerson(name); setExpandedSection(section)
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
