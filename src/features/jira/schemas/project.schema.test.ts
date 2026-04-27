import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { validateProjectKey } from '@/features/jira/schemas/project.schema'

describe('project.schema', () => {
  // Feature: dashboard-incidencias-multi-po, Property 15: Validación de formato de clave de proyecto
  // **Validates: Requirements 8.2**
  describe('Property 15: Validación de formato de clave de proyecto', () => {
    const PROJECT_KEY_REGEX = /^[A-Z][A-Z0-9]+$/

    it('accepts only strings matching /^[A-Z][A-Z0-9]+$/', () => {
      fc.assert(
        fc.property(fc.string(), (s) => {
          const expected = PROJECT_KEY_REGEX.test(s)
          const actual = validateProjectKey(s)
          expect(actual).toBe(expected)
        }),
        { numRuns: 100 }
      )
    })

    it('accepts valid project keys', () => {
      const validKeys = ['GD941', 'AB', 'PROJECT123', 'XY', 'ABC', 'GD981', 'JIRA']
      validKeys.forEach((key) => {
        expect(validateProjectKey(key)).toBe(true)
      })
    })

    it('rejects lowercase strings', () => {
      const lowercaseKeys = ['abc', 'gd941', 'project', 'abC']
      lowercaseKeys.forEach((key) => {
        expect(validateProjectKey(key)).toBe(false)
      })
    })

    it('rejects empty strings', () => {
      expect(validateProjectKey('')).toBe(false)
    })

    it('rejects single character strings', () => {
      const singleChars = ['A', 'B', 'Z', '1']
      singleChars.forEach((key) => {
        expect(validateProjectKey(key)).toBe(false)
      })
    })

    it('rejects strings with special characters', () => {
      const specialChars = ['AB-1', 'GD_941', 'AB@C', 'GD 941', 'AB.C']
      specialChars.forEach((key) => {
        expect(validateProjectKey(key)).toBe(false)
      })
    })

    it('rejects strings starting with a digit', () => {
      const digitStart = ['1ABC', '9GD', '0PROJECT']
      digitStart.forEach((key) => {
        expect(validateProjectKey(key)).toBe(false)
      })
    })
  })
})
