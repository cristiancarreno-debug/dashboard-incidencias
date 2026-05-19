/**
 * Página principal del Dashboard Multi-Tenant de Incidencias.
 *
 * Integra todos los componentes del dashboard: selectores, métricas,
 * filtros, tabla de datos y acciones. Orquesta el flujo de datos
 * desde la selección de GDs hasta la visualización final.
 *
 * Flujo de datos:
 * 1. useProjects() → proyectos disponibles
 * 2. useGdSelection(projectKeys) → GDs seleccionados desde URL
 * 3. useIssues(selectedGds) → issues crudas de Jira
 * 4. enrichIssue(raw, riceAnalyze) → EnrichedIssue[]
 * 5. partitionIssues(enriched) → { datasetCompleto, datasetActivo }
 * 6. applyFilters → searchIssues → sortIssues → tabla
 *
 * @module DashboardPage
 * Valida: Requisitos 1.1, 1.2, 3.4, 7.1, 7.3, 11.3, 11.4, 11.5, 11.6
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useProjects } from '@/features/jira/hooks/useProjects'
import { useIssues } from '@/features/jira/hooks/useIssues'
import { useGdSelection } from '../hooks/useGdSelection'
import { useFilters } from '../hooks/useFilters'
import { useSorting } from '../hooks/useSorting'
import { useBulkActions } from '../hooks/useBulkActions'

import {
  enrichIssue,
  partitionIssues,
  applyFilters,
  searchIssues,
  sortIssues,
} from '../utils/metrics'
import { riceAnalyze } from '@/features/rice/rice-engine'

import { GdSelector } from '../components/GdSelector'
import { InitiativeSelector } from '../components/InitiativeSelector'
import { RefreshButton } from '../components/RefreshButton'
import { SummaryHeader } from '../components/SummaryHeader'
import { KpiCards } from '../components/KpiCards'
import { RiceKpiCards } from '../components/RiceKpiCards'
import { PersonCards } from '../components/PersonCards'
import { FilterBar } from '../components/FilterBar'
import { IssueTable } from '../components/IssueTable'
import { BulkActionBar } from '../components/BulkActionBar'
import { RicePopover } from '../components/RicePopover'
import { TransitionModal } from '../components/TransitionModal'

import type { EnrichedIssue } from '@/features/rice/rice.types'

/**
 * Página principal del dashboard de incidencias multi-PO.
 *
 * Orquesta la carga de datos, enriquecimiento RICE, partición de datasets,
 * filtrado, búsqueda, ordenamiento y renderizado de todos los componentes.
 */
export function DashboardPage() {
  const queryClient = useQueryClient()

  // --- Hooks de datos ---
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects()
  const projectKeys = useMemo(() => projects.map((p) => p.key), [projects])

  const { selectedGds, setSelectedGds, invalidGdsDiscarded } =
    useGdSelection(projectKeys)

  const {
    data: rawIssues = [],
    isLoading: isLoadingIssues,
    isFetching,
  } = useIssues(selectedGds)

  // --- Hooks de estado ---
  const { filters, setFilters } = useFilters()
  const { sorting, toggleSort } = useSorting()
  const { selectedKeys, selectAll, clearSelection } = useBulkActions()

  // --- Estado local ---
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInitiatives, setSelectedInitiatives] = useState<string[]>([])
  const [ricePopover, setRicePopover] = useState<{
    issue: EnrichedIssue
    anchor: HTMLElement
  } | null>(null)
  const [transitionModal, setTransitionModal] = useState<{
    issueKey: string
  } | null>(null)

  // --- Enriquecimiento y partición (memoizado) ---
  const enrichedIssues = useMemo(
    () => rawIssues.map((raw) => enrichIssue(raw, riceAnalyze)),
    [rawIssues]
  )

  const { datasetCompleto, datasetActivo } = useMemo(
    () => partitionIssues(enrichedIssues),
    [enrichedIssues]
  )

  // --- Filtrado, búsqueda y ordenamiento (memoizado) ---
  const filteredByInitiatives = useMemo(() => {
    if (selectedInitiatives.length === 0) return datasetActivo
    const keySet = new Set(selectedInitiatives)
    return datasetActivo.filter((issue) => keySet.has(issue.epic))
  }, [datasetActivo, selectedInitiatives])

  const filteredIssues = useMemo(
    () => applyFilters(filteredByInitiatives, filters),
    [filteredByInitiatives, filters]
  )

  const searchedIssues = useMemo(
    () => searchIssues(filteredIssues, searchQuery),
    [filteredIssues, searchQuery]
  )

  const sortedIssues = useMemo(
    () => sortIssues(searchedIssues, sorting),
    [searchedIssues, sorting]
  )

  // --- Callbacks ---
  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries()
  }, [queryClient])

  const handleRiceClick = useCallback(
    (issue: EnrichedIssue, anchor: HTMLElement) => {
      setRicePopover({ issue, anchor })
    },
    []
  )

  const handleIssueAction = useCallback((issueKey: string) => {
    setTransitionModal({ issueKey })
  }, [])

  const handleTransitionComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['issues'] })
  }, [queryClient])

  const handleReassignComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['issues'] })
    clearSelection()
  }, [queryClient, clearSelection])

  // --- Efecto: toast de GDs inválidos descartados ---
  useEffect(() => {
    if (invalidGdsDiscarded) {
      // Mostrar alerta informativa (se podría reemplazar por un toast library)
      console.warn(
        '[Dashboard] Se descartaron GDs inválidos de la URL. Solo se muestran GDs válidos.'
      )
    }
  }, [invalidGdsDiscarded])

  // --- Limpiar iniciativas cuando cambian los GDs ---
  useEffect(() => {
    setSelectedInitiatives([])
  }, [selectedGds])

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Header: Selectores + Refresh */}
      <header className="flex flex-wrap items-center gap-3">
        <GdSelector
          projects={projects}
          selected={selectedGds}
          onSelectionChange={setSelectedGds}
          isLoading={isLoadingProjects}
        />
        <InitiativeSelector
          issues={enrichedIssues}
          selectedGds={selectedGds}
          selectedInitiatives={selectedInitiatives}
          onSelectionChange={setSelectedInitiatives}
        />
        <RefreshButton
          onRefresh={onRefresh}
          isRefreshing={isFetching}
        />
      </header>

      {/* Alerta de GDs inválidos descartados */}
      {invalidGdsDiscarded && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Se descartaron GDs inválidos de la URL. Solo se muestran los GDs
          disponibles.
        </div>
      )}

      {/* Loading state */}
      {isLoadingIssues && selectedGds.length > 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500">
            Cargando incidencias...
          </span>
        </div>
      )}

      {/* Empty state: no GDs selected */}
      {selectedGds.length === 0 && !isLoadingProjects && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-gray-500">
            Selecciona uno o más Grupos de Desarrollo para ver sus incidencias.
          </p>
        </div>
      )}

      {/* Dashboard content */}
      {selectedGds.length > 0 && !isLoadingIssues && (
        <>
          {/* Summary Header */}
          <SummaryHeader
            datasetCompleto={datasetCompleto}
            datasetActivo={datasetActivo}
            selectedGds={selectedGds}
          />

          {/* KPI Cards */}
          <KpiCards
            datasetCompleto={datasetCompleto}
            datasetActivo={datasetActivo}
          />

          {/* RICE KPI Cards */}
          <RiceKpiCards datasetActivo={datasetActivo} />

          {/* Person Cards */}
          <PersonCards issues={filteredByInitiatives} />

          {/* Filter Bar + Search */}
          <FilterBar
            issues={filteredByInitiatives}
            filters={filters}
            onFiltersChange={setFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Issue Table */}
          <IssueTable
            issues={sortedIssues}
            sorting={sorting}
            onSortChange={toggleSort}
            onIssueAction={handleIssueAction}
            selectedKeys={selectedKeys}
            onSelectionChange={(keys) => {
              if (keys.size === 0) {
                clearSelection()
              } else {
                selectAll(Array.from(keys))
              }
            }}
            onRiceClick={handleRiceClick}
            totalCount={filteredByInitiatives.length}
          />
        </>
      )}

      {/* Bulk Action Bar (sticky bottom) */}
      <BulkActionBar
        selectedKeys={selectedKeys}
        issues={sortedIssues}
        onClearSelection={clearSelection}
        onReassignComplete={handleReassignComplete}
      />

      {/* RICE Popover */}
      {ricePopover && (
        <RicePopover
          rice={ricePopover.issue.rice}
          anchor={ricePopover.anchor}
          onClose={() => setRicePopover(null)}
        />
      )}

      {/* Transition Modal */}
      {transitionModal && (
        <TransitionModal
          issueKey={transitionModal.issueKey}
          isOpen={true}
          onClose={() => setTransitionModal(null)}
          onTransitionComplete={handleTransitionComplete}
        />
      )}
    </div>
  )
}
