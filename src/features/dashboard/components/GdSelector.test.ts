import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import type { JiraProject } from '@/features/jira/types/jira.types'

/**
 * Lógica de filtrado del GdSelector extraída como función pura.
 * Replica exactamente el filtro inline del componente GdSelector.tsx.
 */
function filterProjects(projects: JiraProject[], search: string): JiraProject[] {
  return projects.filter((project) => {
    if (!search) return true
    const query = search.toLowerCase()
    return (
      project.name.toLowerCase().includes(query) ||
      project.key.toLowerCase().includes(query)
    )
  })
}

/** Arbitrary para generar un JiraProject válido. */
const arbitraryJiraProject: fc.Arbitrary<JiraProject> = fc.record({
  key: fc.string({ minLength: 2, maxLength: 8, unit: fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')) }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  id: fc.string({ minLength: 1, maxLength: 6, unit: fc.constantFrom(...'0123456789'.split('')) }),
})

describe('GdSelector — Filtrado de proyectos', () => {
  // Feature: dashboard-incidencias-multi-po, Property 5: Búsqueda en selector de GDs filtra correctamente
  it('Property 5: Búsqueda en selector de GDs filtra correctamente', () => {
    /** Validates: Requirements 1.4 */
    fc.assert(
      fc.property(
        fc.array(arbitraryJiraProject, { minLength: 0, maxLength: 30 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (projects, search) => {
          const result = filterProjects(projects, search)
          const query = search.toLowerCase()

          // Todos los proyectos retornados deben contener el substring en name o key
          for (const project of result) {
            const matchesName = project.name.toLowerCase().includes(query)
            const matchesKey = project.key.toLowerCase().includes(query)
            expect(matchesName || matchesKey).toBe(true)
          }

          // Ningún proyecto excluido debería haber coincidido
          const excluded = projects.filter((p) => !result.includes(p))
          for (const project of excluded) {
            const matchesName = project.name.toLowerCase().includes(query)
            const matchesKey = project.key.toLowerCase().includes(query)
            expect(matchesName || matchesKey).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 5 (complemento): búsqueda vacía retorna todos los proyectos', () => {
    /** Validates: Requirements 1.4 */
    fc.assert(
      fc.property(
        fc.array(arbitraryJiraProject, { minLength: 0, maxLength: 30 }),
        (projects) => {
          const result = filterProjects(projects, '')
          expect(result).toHaveLength(projects.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})
