import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { serializeGdSelection, deserializeGdSelection } from './url-state'

describe('url-state', () => {
  it('Property 1: Round-trip de serialización de estado en URL', () => {
    // Feature: dashboard-incidencias-multi-po, Property 1: Round-trip de serialización de estado en URL
    // Validates: Requirements 1.5, 7.2, 7.4
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[A-Z][A-Z0-9]{1,8}$/), { minLength: 0, maxLength: 20 }),
        (keys) => {
          // Use the same keys as availableProjects so all are considered valid
          const availableProjects = [...new Set(keys)]

          const serialized = serializeGdSelection(keys)
          const deserialized = deserializeGdSelection(serialized, availableProjects)

          // After round-trip, the result should contain exactly the same unique keys (order doesn't matter)
          const expectedSet = new Set(keys)
          const resultSet = new Set(deserialized)

          expect(resultSet).toEqual(expectedSet)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 17: Filtrado de GDs inválidos en URL', () => {
    // Feature: dashboard-incidencias-multi-po, Property 17: Filtrado de GDs inválidos en URL
    // Validates: Requirement 7.5
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.stringMatching(/^[A-Z][A-Z0-9]{1,8}$/), { minLength: 1, maxLength: 15 }),
        fc.uniqueArray(fc.stringMatching(/^[A-Z][A-Z0-9]{1,8}$/), { minLength: 1, maxLength: 15 }),
        (validKeys, candidateInvalidKeys) => {
          // Ensure invalidKeys are guaranteed NOT to be in availableProjects
          const availableSet = new Set(validKeys)
          const invalidKeys = candidateInvalidKeys.filter((k) => !availableSet.has(k))

          // Mix valid and invalid keys together
          const mixedKeys = [...validKeys, ...invalidKeys]

          // Serialize the mixed keys and deserialize with only validKeys as available
          const serialized = serializeGdSelection(mixedKeys)
          const deserialized = deserializeGdSelection(serialized, validKeys)

          const resultSet = new Set(deserialized)
          const expectedValidSet = new Set(validKeys)

          // All deserialized keys must be valid (subset of availableProjects)
          for (const key of deserialized) {
            expect(availableSet.has(key)).toBe(true)
          }

          // All valid keys must be preserved in the result
          expect(resultSet).toEqual(expectedValidSet)

          // No invalid key should appear in the result
          for (const key of invalidKeys) {
            expect(resultSet.has(key)).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
