/**
 * Tests de propiedad para el Motor RICE.
 *
 * Feature: dashboard-incidencias-multi-po
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { riceAnalyze } from './rice-engine'
import type { RiceInput, IssueType, RicePriority } from './rice.types'

/** Tipos de issue válidos para generar inputs arbitrarios. */
const ISSUE_TYPES: IssueType[] = [
  'Incidente',
  'Defecto QA',
  'Mejora',
  'Tarea',
  'Spike',
  'Service Request',
]

/**
 * Replica la función round del motor RICE para verificación independiente.
 * Redondea un número a N decimales.
 */
function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/**
 * Generador de RiceInput arbitrario usando fc.record.
 */
const arbitraryRiceInput = fc.record({
  summary: fc.string({ minLength: 0, maxLength: 200 }),
  tipo: fc.constantFrom(...ISSUE_TYPES),
  status: fc.string({ minLength: 1, maxLength: 50 }),
})

describe('Motor RICE', () => {
  it('Property 11: Fórmula RICE y clasificación de prioridad', () => {
    // Feature: dashboard-incidencias-multi-po, Property 11: Fórmula RICE y clasificación de prioridad
    // Validates: Requirements 6.1, 6.3
    fc.assert(
      fc.property(
        arbitraryRiceInput,
        (input: RiceInput) => {
          const result = riceAnalyze(input)

          // 1. Verificar que score === round((reach × impact × confidence) / effort, 1)
          const expectedScore = round(
            (result.reach * result.impact * result.confidence) / result.effort,
            1
          )
          expect(result.score).toBe(expectedScore)

          // 2. Verificar clasificación de prioridad según umbrales
          let expectedPriority: RicePriority
          if (result.score >= 40) {
            expectedPriority = 'Crítica'
          } else if (result.score >= 20) {
            expectedPriority = 'Alta'
          } else if (result.score >= 10) {
            expectedPriority = 'Media'
          } else {
            expectedPriority = 'Baja'
          }
          expect(result.priority).toBe(expectedPriority)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 12: Rangos válidos de variables RICE', () => {
    // Feature: dashboard-incidencias-multi-po, Property 12: Rangos válidos de variables RICE
    // Validates: Requirement 6.2
    fc.assert(
      fc.property(
        arbitraryRiceInput,
        (input: RiceInput) => {
          const result = riceAnalyze(input)

          // reach ∈ [1, 100]
          expect(result.reach).toBeGreaterThanOrEqual(1)
          expect(result.reach).toBeLessThanOrEqual(100)

          // impact ∈ [0.25, 3]
          expect(result.impact).toBeGreaterThanOrEqual(0.25)
          expect(result.impact).toBeLessThanOrEqual(3)

          // confidence ∈ [0.5, 1.0]
          expect(result.confidence).toBeGreaterThanOrEqual(0.5)
          expect(result.confidence).toBeLessThanOrEqual(1.0)

          // effort > 0
          expect(result.effort).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 13: Ajustes RICE por estado', () => {
    // Feature: dashboard-incidencias-multi-po, Property 13: Ajustes RICE por estado
    // Validates: Requirement 6.4

    const NEUTRAL_STATUS = 'Backlog'
    const PROGRESS_STATES = ['En Progreso', 'En Pruebas QA', 'En Pruebas UAT'] as const

    // Generador base: summary y tipo arbitrarios
    const arbitraryBase = fc.record({
      summary: fc.string({ minLength: 0, maxLength: 200 }),
      tipo: fc.constantFrom(...ISSUE_TYPES),
    })

    // Sub-property: estados de progreso incrementan confidence en +0.2 (max 1.0)
    fc.assert(
      fc.property(
        arbitraryBase,
        fc.constantFrom(...PROGRESS_STATES),
        ({ summary, tipo }, targetStatus) => {
          const baseResult = riceAnalyze({ summary, tipo, status: NEUTRAL_STATUS })
          const targetResult = riceAnalyze({ summary, tipo, status: targetStatus })

          const expectedConfidence = Math.min(baseResult.confidence + 0.2, 1.0)
          expect(targetResult.confidence).toBeCloseTo(expectedConfidence, 10)

          // Effort should remain the same
          expect(targetResult.effort).toBeCloseTo(baseResult.effort, 10)
        }
      ),
      { numRuns: 100 }
    )

    // Sub-property: "Bloqueado" multiplica effort por 1.5
    fc.assert(
      fc.property(
        arbitraryBase,
        ({ summary, tipo }) => {
          const baseResult = riceAnalyze({ summary, tipo, status: NEUTRAL_STATUS })
          const blockedResult = riceAnalyze({ summary, tipo, status: 'Bloqueado' })

          const expectedEffort = baseResult.effort * 1.5
          expect(blockedResult.effort).toBeCloseTo(expectedEffort, 10)

          // Confidence should remain the same
          expect(blockedResult.confidence).toBeCloseTo(baseResult.confidence, 10)
        }
      ),
      { numRuns: 100 }
    )

    // Sub-property: "Pendiente PAP" incrementa confidence +0.1 (max 1.0) y reduce effort ×0.7 (min 0.5)
    fc.assert(
      fc.property(
        arbitraryBase,
        ({ summary, tipo }) => {
          const baseResult = riceAnalyze({ summary, tipo, status: NEUTRAL_STATUS })
          const papResult = riceAnalyze({ summary, tipo, status: 'Pendiente PAP' })

          const expectedConfidence = Math.min(baseResult.confidence + 0.1, 1.0)
          const expectedEffort = Math.max(baseResult.effort * 0.7, 0.5)

          expect(papResult.confidence).toBeCloseTo(expectedConfidence, 10)
          expect(papResult.effort).toBeCloseTo(expectedEffort, 10)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 14: Round-trip de serialización RICE', () => {
    // Feature: dashboard-incidencias-multi-po, Property 14: Round-trip de serialización RICE
    // Validates: Requirement 6.5
    fc.assert(
      fc.property(
        arbitraryRiceInput,
        (input: RiceInput) => {
          const result = riceAnalyze(input)

          // Serialize to JSON and deserialize back
          const serialized = JSON.stringify(result)
          const deserialized = JSON.parse(serialized)

          // Verify deep equality between original and round-tripped result
          expect(deserialized).toEqual(result)
        }
      ),
      { numRuns: 100 }
    )
  })
})
