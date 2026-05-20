import { useState, useMemo, useRef, useEffect } from 'react'
import { useProjects } from '@/features/jira/hooks/useProjects'
import { useIssues } from '@/features/jira/hooks/useIssues'
import { useIssuesByAssignee } from '@/features/jira/hooks/useIssuesByAssignee'
import { useUserSearch } from '@/features/jira/hooks/useUserSearch'
import { enrichIssue } from '@/features/dashboard/utils/metrics'
import { riceAnalyze } from '@/features/rice/rice-engine'
import { PersonDetailCard } from './components/PersonDetailCard'
import { X, ChevronsUpDown, Square } from 'lucide-react'
import type { EnrichedIssue } from '@/features/rice/rice.types'
import type { JiraProject } from '@/features/jira/types/jira.types'

/** GD Selector */
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
      <button onClick={() => setOpen(!open)} disabled={isLoading}
        className="flex h-10 w-[180px] items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
        <span className="truncate">{isLoading ? 'Cargando...' : label}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-[260px] rounded-md border border-gray-200 bg-white shadow-lg">
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
                <input type="checkbox" checked={selected.includes(p.key)} readOnly className="h-4 w-4 rounded border-gray-300 pointer-events-none" />
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
  const [selectedGds, setSelectedGds] = useState<string[]>([])
  const [profesionalInput, setProfesionalInput] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<'abiertas' | 'cerradas' | null>(null)

  // Autocomplete: buscar usuarios en Jira
  const { data: userSuggestions = [] } = useUserSearch(selectedAccountId ? '' : profesionalInput)

  // Modo 1: por GD
  const { data: rawIssuesByGd = [], isLoading: isLoadingByGd, dataUpdatedAt: updatedGd } = useIssues(selectedGds)

  // Modo 2: por profesional (accountId)
  const { data: rawIssuesByUser = [], isLoading: isLoadingByUser, dataUpdatedAt: updatedUser } = useIssuesByAssignee(selectedName)

  // Combinar resultados: si hay GD usa esos, si hay usuario usa esos, si ambos combina
  const rawIssues = useMemo(() => {
    if (selectedGds.length > 0 && selectedName) {
      // Ambos: issues del GD filtradas por el usuario
      return rawIssuesByGd
    }
    if (selectedGds.length > 0) return rawIssuesByGd
    if (selectedName) return rawIssuesByUser
    return []
  }, [rawIssuesByGd, rawIssuesByUser, selectedGds, selectedAccountId])

  const isLoading = isLoadingByGd || isLoadingByUser
  const dataUpdatedAt = updatedGd || updatedUser

  const enrichedIssues = useMemo(() => rawIssues.map((raw) => enrichIssue(raw, riceAnalyze)), [rawIssues])

  // Filtrar por fecha
  const filteredByDate = useMemo(() => {
    return enrichedIssues.filter((issue) => {
      const created = issue.created.slice(0, 10)
      if (fechaDesde && created < fechaDesde) return false
      if (fechaHasta && created > fechaHasta) return false
      return true
    })
  }, [enrichedIssues, fechaDesde, fechaHasta])

  // Filtrar por nombre (solo si hay GD seleccionado y se escribió nombre)
  const personData = useMemo(() => {
    const map = new Map<string, EnrichedIssue[]>()
    for (const issue of filteredByDate) {
      const name = issue.assignee || 'Sin asignar'
      // Si se seleccionó un usuario específico y estamos en modo GD, filtrar
      if (selectedGds.length > 0 && selectedName) {
        if (!name.toLowerCase().includes(selectedName.toLowerCase())) continue
      }
      const list = map.get(name) ?? []
      list.push(issue)
      map.set(name, list)
    }
    return Array.from(map.entries()).map(([name, issues]) => ({ name, issues })).sort((a, b) => b.issues.length - a.issues.length)
  }, [filteredByDate, selectedGds, selectedName])

  const hasFilters = selectedGds.length > 0 || selectedAccountId || fechaDesde || fechaHasta
  const hasData = selectedGds.length > 0 || selectedAccountId

  const clearAll = () => {
    setSelectedGds([]); setProfesionalInput(''); setSelectedAccountId(null)
    setSelectedName(null); setFechaDesde(''); setFechaHasta('')
  }

  const handleSelectUser = (accountId: string, displayName: string) => {
    setSelectedAccountId(accountId)
    setSelectedName(displayName)
    setProfesionalInput(displayName)
  }

  const handleProfesionalChange = (value: string) => {
    setProfesionalInput(value)
    if (selectedAccountId) {
      setSelectedAccountId(null)
      setSelectedName(null)
    }
  }

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Filtros */}
      <div className="flex items-end gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">GD</label>
          <GdMultiSelect projects={projects} selected={selectedGds} onChange={setSelectedGds} isLoading={isLoadingProjects} />
        </div>
        <div className="relative">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Profesional</label>
          <input type="text" placeholder="Min 3 letras..." value={profesionalInput}
            onChange={(e) => handleProfesionalChange(e.target.value)}
            className="h-10 w-[240px] rounded-md border border-gray-300 px-3 text-sm" />
          {profesionalInput.length >= 3 && !selectedAccountId && userSuggestions.length > 0 && (
            <div className="absolute top-full left-0 z-50 mt-1 w-[300px] rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
              {userSuggestions.map((user) => (
                <div key={user.accountId} className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectUser(user.accountId, user.displayName)}>
                  {user.displayName}
                </div>
              ))}
            </div>
          )}
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
          <p className="text-[10px] text-gray-400">Última actualización</p>
          <p className="text-xs font-medium text-gray-600">{dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString('es-CO') : 'Sin consultar aún'}</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && hasData && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(153,100%,32.5%)] border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500">Cargando...</span>
        </div>
      )}

      {/* Empty state */}
      {!hasData && !isLoadingProjects && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-gray-500">Selecciona un GD o busca un profesional para ver las asignaciones.</p>
        </div>
      )}

      {/* Cards */}
      {hasData && !isLoading && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Equipo ({personData.length} integrantes — {filteredByDate.length} incidencias)
          </h3>
          {personData.length === 0 ? (
            <p className="text-gray-500 text-sm">No se encontraron resultados.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {personData.map(({ name, issues }) => (
                <PersonDetailCard key={name} name={name} issues={issues}
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
          )}
        </div>
      )}
    </div>
  )
}
