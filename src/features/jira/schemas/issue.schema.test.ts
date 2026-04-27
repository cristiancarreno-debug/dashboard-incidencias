import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { JiraIssueSchema } from '@/features/jira/schemas/issue.schema'

describe('issue.schema', () => {
  // Feature: dashboard-incidencias-multi-po, Property 16: Validación Zod rechaza datos inválidos
  // **Validates: Requirements 10.4**
  describe('Property 16: Validación Zod rechaza datos inválidos', () => {
    /** Arbitrary for uppercase letters A-Z */
    const upperAlpha = fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))

    /** Arbitrary for uppercase letters + digits */
    const upperAlphaNum = fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''))

    /**
     * Arbitrary that generates valid objects conforming to JiraIssueSchema.
     * - key: /^[A-Z][A-Z0-9]+-\d+$/ format
     * - fields.summary: string
     * - fields.assignee: null or {displayName, accountId}
     * - fields.status.name: string
     * - fields.created: ISO datetime with offset
     * - fields.issuetype.name: string
     * - fields.parent: null/undefined or {key, fields.summary}
     */
    const validJiraIssueArb = fc
      .record({
        keyPrefix: fc.array(upperAlpha, { minLength: 1, maxLength: 5 }).map((arr) => arr.join('')),
        keyRest: fc.array(upperAlphaNum, { minLength: 1, maxLength: 4 }).map((arr) => arr.join('')),
        keyNum: fc.nat({ max: 9999 }).map((n) => n + 1),
        summary: fc.string({ minLength: 1, maxLength: 200 }),
        assignee: fc.option(
          fc.record({
            displayName: fc.string({ minLength: 1, maxLength: 100 }),
            accountId: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          { nil: null }
        ),
        statusName: fc.string({ minLength: 1, maxLength: 50 }),
        year: fc.integer({ min: 2000, max: 2030 }),
        month: fc.integer({ min: 1, max: 12 }),
        day: fc.integer({ min: 1, max: 28 }),
        hour: fc.integer({ min: 0, max: 23 }),
        minute: fc.integer({ min: 0, max: 59 }),
        second: fc.integer({ min: 0, max: 59 }),
        issuetypeName: fc.string({ minLength: 1, maxLength: 50 }),
        parent: fc.option(
          fc.record({
            parentPrefix: fc.array(upperAlpha, { minLength: 1, maxLength: 5 }).map((arr) => arr.join('')),
            parentNum: fc.nat({ max: 999 }).map((n) => n + 1),
            parentSummary: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          { nil: undefined }
        ),
      })
      .map(({ keyPrefix, keyRest, keyNum, summary, assignee, statusName, year, month, day, hour, minute, second, issuetypeName, parent }) => ({
        key: `${keyPrefix}${keyRest}-${keyNum}`,
        fields: {
          summary,
          assignee,
          status: { name: statusName },
          created: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.000+0000`,
          issuetype: { name: issuetypeName },
          ...(parent !== undefined
            ? { parent: { key: `${parent.parentPrefix}-${parent.parentNum}`, fields: { summary: parent.parentSummary } } }
            : {}),
        },
      }))

    it('accepts valid objects that conform to JiraIssueSchema', () => {
      fc.assert(
        fc.property(validJiraIssueArb, (issue) => {
          const result = JiraIssueSchema.safeParse(issue)
          expect(result.success).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('rejects arbitrary JSON objects that do NOT conform to JiraIssueSchema', () => {
      fc.assert(
        fc.property(
          fc.anything().filter((obj) => {
            // Ensure it's not accidentally valid
            const result = JiraIssueSchema.safeParse(obj)
            return !result.success
          }),
          (invalidObj) => {
            const result = JiraIssueSchema.safeParse(invalidObj)
            expect(result.success).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
