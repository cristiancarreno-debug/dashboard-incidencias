/**
 * Tests de propiedad para métricas y filtrado del Dashboard.
 *
 * Feature: dashboard-incidencias-multi-po
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import type {
  EnrichedIssue,
  ActiveFilters,
  IssueType,
  RicePriority,
  SortColumn,
} from '@/features/rice/rice.types'
import {
  filterByGds,
  applyFilters,
  searchIssues,
  getInitiativesForGds,
  computeKpis,
  computePersonCards,
  sortIssues,
  partitionIssues,
} from './metrics'
import { TERMINAL_STATES } from '@/config/constants'

/** Tipos de issue válidos. */
const ISSUE_TYPES: IssueType[] = [
  'Incidente',
  'Defecto QA',
  'Mejora',
  'Tarea',
  'Spike',
  'Service Request',
]

/** Prioridades RICE válidas. */
const RICE_PRIORITIES: RicePriority[] = ['Crítica', 'Alta', 'Media', 'Baja']

/** Columnas de ordenamiento válidas. */
const SORT_COLUMNS: SortColumn[] = [
  'key',
  'mdsb',
  'sprint',
  'summary',
  'equipo',
  'tipo',
  'assignee',
  'created',
  'status',
  'riceScore',
]

/**
 * Generador de EnrichedIssue arbitraria usando fc.record.
 * Genera objetos válidos con campos coherentes.
 */
const arbitraryEnrichedIssue: fc.Arbitrary<EnrichedIssue> = fc.record({
  key: fc.tuple(
    fc.stringMatching(/^[A-Z]{2,5}$/),
    fc.integer({ min: 1, max: 9999 })
  ).map(([prefix, num]) => `${prefix}-${num}`),
  summary: fc.string({ minLength: 1, maxLength: 100 }),
  assignee: fc.constantFrom('Juan Pérez', 'María López', 'Carlos García', 'Ana Rodríguez', 'Sin asignar'),
  assigneeAccountId: fc.option(fc.string({ minLength: 24, maxLength: 24 }), { nil: null }),
  created: fc.integer({ min: 1704067200000, max: 1798761600000 }).map((ts) => new Date(ts).toISOString()),
  createdFormatted: fc.integer({ min: 1704067200000, max: 1798761600000 }).map((ts) => {
    const d = new Date(ts)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/${d.getFullYear()}`
  }),
  status: fc.constantFrom('Backlog', 'Por Hacer', 'En Progreso', 'En Pruebas QA', 'Bloqueado', 'Done', 'Producción'),
  issuetype: fc.constantFrom('Bug', 'Story', 'Task', 'Error Productivo'),
  tipo: fc.constantFrom(...ISSUE_TYPES),
  project: fc.constantFrom('GD768', 'GD933', 'GD100', 'GD200', 'GD300'),
  equipo: fc.constantFrom('GD768', 'GD933', 'GD100', 'GD200', 'GD300'),
  epic: fc.constantFrom(
    'GD768-10 - Migración Cloud',
    'GD933-20 - Mejora UX',
    'GD100-5 - Seguridad',
    'GD200-15 - Performance',
    'Sin épica'
  ),
  sprint: fc.constantFrom('Sprint 1', 'Sprint 2', 'Sprint 3', 'Sin sprint'),
  rice: fc.record({
    risk: fc.constantFrom('alto', 'medio', 'bajo', 'sin clasificar'),
    reach: fc.integer({ min: 1, max: 100 }),
    impact: fc.constantFrom(0.25, 0.5, 1, 2, 3),
    confidence: fc.double({ min: 0.5, max: 1.0, noNaN: true }),
    effort: fc.double({ min: 0.5, max: 10, noNaN: true }),
    score: fc.double({ min: 0, max: 200, noNaN: true }),
    priority: fc.constantFrom(...RICE_PRIORITIES),
  }),
  timespentSeconds: fc.integer({ min: 0, max: 360000 }),
  worklogs: fc.array(fc.record({
    author: fc.constantFrom('Juan Pérez', 'María López', 'Carlos García'),
    seconds: fc.integer({ min: 60, max: 28800 }),
    started: fc.integer({ min: 1704067200000, max: 1798761600000 }).map((ts) => new Date(ts).toISOString()),
  }), { minLength: 0, maxLength: 3 }),
  mdsbLinks: fc.array(fc.record({
    key: fc.integer({ min: 1000000, max: 9999999 }).map((n) => `MDSB-${n}`),
    status: fc.constantFrom('Abierto', 'En Progreso', 'Resuelto'),
    daysOpen: fc.integer({ min: 1, max: 30 }),
  }), { minLength: 0, maxLength: 3 }),
})


describe('Métricas y filtrado del Dashboard', () => {
  it('Property 2: Filtrado por GD preserva solo issues del GD seleccionado', () => {
    // Feature: dashboard-incidencias-multi-po, Property 2: Filtrado por GD preserva solo issues del GD seleccionado
    // Validates: Requirements 1.3, 2.2
    const allGds = ['GD768', 'GD933', 'GD100', 'GD200', 'GD300']

    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 1, maxLength: 50 }),
        fc.subarray(allGds, { minLength: 1 }),
        (issues, selectedGds) => {
          const result = filterByGds(issues, selectedGds)
          const selectedSet = new Set(selectedGds)

          // Every visible issue must belong to a selected GD
          for (const issue of result) {
            expect(selectedSet.has(issue.project)).toBe(true)
          }

          // All issues of selected GDs must be present
          const expectedIssues = issues.filter((i) => selectedSet.has(i.project))
          expect(result.length).toBe(expectedIssues.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 3: Filtrado multi-criterio es conjuntivo', () => {
    // Feature: dashboard-incidencias-multi-po, Property 3: Filtrado multi-criterio es conjuntivo
    // Validates: Requirements 5.2, 4.3, 5.5
    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 1, maxLength: 50 }),
        fc.record({
          equipo: fc.subarray(['GD768', 'GD933', 'GD100']).map((arr) => new Set(arr)),
          tipo: fc.subarray(['Incidente', 'Mejora', 'Tarea'] as IssueType[]).map((arr) => new Set(arr)),
          status: fc.subarray(['Backlog', 'En Progreso', 'Done']).map((arr) => new Set(arr)),
          ricePriority: fc.subarray(['Crítica', 'Alta', 'Media', 'Baja'] as RicePriority[]).map((arr) => new Set(arr)),
          assignee: fc.subarray(['Juan Pérez', 'María López', 'Carlos García']).map((arr) => new Set(arr)),
          epic: fc.subarray(['GD768-10 - Migración Cloud', 'Sin épica']).map((arr) => new Set(arr)),
          sprint: fc.subarray(['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sin sprint']).map((arr) => new Set(arr)),
        }),
        (issues, filters: ActiveFilters) => {
          const result = applyFilters(issues, filters)

          // Each visible issue must satisfy ALL active filter criteria simultaneously
          for (const issue of result) {
            if (filters.equipo.size > 0) {
              expect(filters.equipo.has(issue.equipo)).toBe(true)
            }
            if (filters.tipo.size > 0) {
              expect(filters.tipo.has(issue.tipo)).toBe(true)
            }
            if (filters.status.size > 0) {
              expect(filters.status.has(issue.status)).toBe(true)
            }
            if (filters.ricePriority.size > 0) {
              expect(filters.ricePriority.has(issue.rice.priority)).toBe(true)
            }
            if (filters.assignee.size > 0) {
              expect(filters.assignee.has(issue.assignee)).toBe(true)
            }
            if (filters.epic.size > 0) {
              expect(filters.epic.has(issue.epic)).toBe(true)
            }
            if (filters.sprint.size > 0) {
              expect(filters.sprint.has(issue.sprint)).toBe(true)
            }
          }

          // Verify completeness: no issue satisfying all criteria is excluded
          const expected = issues.filter((issue) => {
            if (filters.equipo.size > 0 && !filters.equipo.has(issue.equipo)) return false
            if (filters.tipo.size > 0 && !filters.tipo.has(issue.tipo)) return false
            if (filters.status.size > 0 && !filters.status.has(issue.status)) return false
            if (filters.ricePriority.size > 0 && !filters.ricePriority.has(issue.rice.priority)) return false
            if (filters.assignee.size > 0 && !filters.assignee.has(issue.assignee)) return false
            if (filters.epic.size > 0 && !filters.epic.has(issue.epic)) return false
            if (filters.sprint.size > 0 && !filters.sprint.has(issue.sprint)) return false
            return true
          })
          expect(result.length).toBe(expected.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 4: Búsqueda de texto filtra por campos relevantes', () => {
    // Feature: dashboard-incidencias-multi-po, Property 4: Búsqueda de texto filtra por campos relevantes
    // Validates: Requirement 5.3
    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length > 0),
        (issues, query) => {
          const result = searchIssues(issues, query)
          const lowerQuery = query.toLowerCase()

          // Each visible issue must contain the search string in at least one relevant field
          for (const issue of result) {
            const matchesKey = issue.key.toLowerCase().includes(lowerQuery)
            const matchesSummary = issue.summary.toLowerCase().includes(lowerQuery)
            const matchesAssignee = issue.assignee.toLowerCase().includes(lowerQuery)
            const matchesEpic = issue.epic.toLowerCase().includes(lowerQuery)

            expect(matchesKey || matchesSummary || matchesAssignee || matchesEpic).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 6: Iniciativas mostradas pertenecen a GDs seleccionados', () => {
    // Feature: dashboard-incidencias-multi-po, Property 6: Iniciativas mostradas pertenecen a GDs seleccionados
    // Validates: Requirements 2.1, 2.3
    const allGds = ['GD768', 'GD933', 'GD100', 'GD200', 'GD300']

    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 1, maxLength: 50 }),
        fc.subarray(allGds, { minLength: 1 }),
        (issues, selectedGds) => {
          const initiatives = getInitiativesForGds(issues, selectedGds)
          const selectedSet = new Set(selectedGds)

          // Each initiative must belong to a selected GD
          for (const initiative of initiatives) {
            // getInitiativesForGds filters by issue.project being in selectedGds
            // So all returned initiatives come from issues whose project is in selectedGds
            const issuesWithThisEpic = issues.filter(
              (i) => i.epic === initiative && selectedSet.has(i.project)
            )
            expect(issuesWithThisEpic.length).toBeGreaterThan(0)
          }

          // "Sin épica" should never appear in initiatives
          expect(initiatives).not.toContain('Sin épica')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7: Invariante de partición en métricas', () => {
    // Feature: dashboard-incidencias-multi-po, Property 7: Invariante de partición en métricas
    // Validates: Requirements 3.1, 3.2, 3.3
    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 0, maxLength: 50 }),
        (issues) => {
          const kpis = computeKpis(issues)

          // Sum of counts by GD must equal total
          const sumByGd = Object.values(kpis.byGd).reduce((acc, v) => acc + v, 0)
          expect(sumByGd).toBe(kpis.total)

          // Sum of counts by type must equal total
          const sumByType = Object.values(kpis.byType).reduce((acc, v) => acc + v, 0)
          expect(sumByType).toBe(kpis.total)

          // Sum of counts by RICE priority must equal total
          const sumByRice = Object.values(kpis.byRicePriority).reduce((acc, v) => acc + v, 0)
          expect(sumByRice).toBe(kpis.total)

          // Total must equal the number of issues
          expect(kpis.total).toBe(issues.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 8: Consistencia de tarjetas de persona', () => {
    // Feature: dashboard-incidencias-multi-po, Property 8: Consistencia de tarjetas de persona
    // Validates: Requirements 4.1, 4.2
    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 0, maxLength: 50 }),
        (issues) => {
          const cards = computePersonCards(issues)

          // Exactly one card per unique assignee
          const uniqueAssignees = new Set(issues.map((i) => i.assignee))
          expect(cards.length).toBe(uniqueAssignees.size)

          // For each card, sum of counts by status must equal total assignments
          for (const card of cards) {
            const sumByStatus = Object.values(card.byStatus).reduce((acc, v) => acc + v, 0)
            expect(sumByStatus).toBe(card.total)

            // Total must match actual count of issues for this assignee
            const actualCount = issues.filter((i) => i.assignee === card.name).length
            expect(card.total).toBe(actualCount)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 9: Ordenamiento de tarjetas de persona es descendente', () => {
    // Feature: dashboard-incidencias-multi-po, Property 9: Ordenamiento de tarjetas de persona es descendente
    // Validates: Requirement 4.4
    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 0, maxLength: 50 }),
        (issues) => {
          const cards = computePersonCards(issues)

          // Each card must have total >= next card's total
          for (let i = 0; i < cards.length - 1; i++) {
            expect(cards[i].total).toBeGreaterThanOrEqual(cards[i + 1].total)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 10: Ordenamiento de tabla es correcto', () => {
    // Feature: dashboard-incidencias-multi-po, Property 10: Ordenamiento de tabla es correcto
    // Validates: Requirement 5.4
    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 2, maxLength: 50 }),
        fc.constantFrom(...SORT_COLUMNS),
        fc.constantFrom('asc' as const, 'desc' as const),
        (issues, column, direction) => {
          const sorted = sortIssues(issues, { column, direction })

          // Verify the list is correctly sorted
          for (let i = 0; i < sorted.length - 1; i++) {
            const a = sorted[i]
            const b = sorted[i + 1]

            let valA: string | number
            let valB: string | number

            switch (column) {
              case 'riceScore':
                valA = a.rice.score
                valB = b.rice.score
                break
              case 'key':
                valA = a.key
                valB = b.key
                break
              case 'summary':
                valA = a.summary.toLowerCase()
                valB = b.summary.toLowerCase()
                break
              case 'equipo':
                valA = a.equipo.toLowerCase()
                valB = b.equipo.toLowerCase()
                break
              case 'tipo':
                valA = a.tipo.toLowerCase()
                valB = b.tipo.toLowerCase()
                break
              case 'assignee':
                valA = a.assignee.toLowerCase()
                valB = b.assignee.toLowerCase()
                break
              case 'created':
                valA = a.created
                valB = b.created
                break
              case 'status':
                valA = a.status.toLowerCase()
                valB = b.status.toLowerCase()
                break
              case 'sprint':
                valA = a.sprint.toLowerCase()
                valB = b.sprint.toLowerCase()
                break
              case 'mdsb':
                valA = a.mdsbLinks.length > 0 ? Math.max(...a.mdsbLinks.map((m) => m.daysOpen)) : 0
                valB = b.mdsbLinks.length > 0 ? Math.max(...b.mdsbLinks.map((m) => m.daysOpen)) : 0
                break
              default:
                return
            }

            if (direction === 'asc') {
              expect(valA <= valB).toBe(true)
            } else {
              expect(valA >= valB).toBe(true)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 18: Invariante de partición de datasets (Dataset_Completo / Dataset_Activo)', () => {
    // Feature: dashboard-incidencias-multi-po, Property 18: Invariante de partición de datasets
    // Validates: Requirements 11.2, 11.6
    fc.assert(
      fc.property(
        fc.array(arbitraryEnrichedIssue, { minLength: 0, maxLength: 50 }),
        (issues) => {
          const { datasetCompleto, datasetActivo } = partitionIssues(issues)

          // (1) datasetCompleto contains exactly all original issues
          expect(datasetCompleto).toHaveLength(issues.length)
          expect(datasetCompleto).toEqual(issues)

          // (2) datasetActivo contains no issue in TERMINAL_STATES
          for (const issue of datasetActivo) {
            expect(TERMINAL_STATES.has(issue.status)).toBe(false)
          }

          // Compute terminal issues from the original set
          const terminalIssues = issues.filter((issue) => TERMINAL_STATES.has(issue.status))

          // (3) The union of datasetActivo and terminal issues equals datasetCompleto
          expect(datasetActivo.length + terminalIssues.length).toBe(datasetCompleto.length)

          // (4) datasetActivo and terminal issues are disjoint
          const activoKeys = new Set(datasetActivo.map((i) => i.key))
          for (const terminal of terminalIssues) {
            expect(activoKeys.has(terminal.key)).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
