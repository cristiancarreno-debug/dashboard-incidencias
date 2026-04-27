import { describe, it, expect } from 'vitest'
import { TERMINAL_STATES, ISSUE_TYPE_MAP, PROXY_BASE_URL, JQL_TEMPLATES } from './constants'

describe('constants', () => {
  it('TERMINAL_STATES contains all expected terminal states', () => {
    const expected = [
      'Producción', 'Done', 'Closed', 'Cerrado',
      'Hecho', 'Cancelado', 'Cancelled', 'Resolved',
    ]
    expected.forEach((state) => {
      expect(TERMINAL_STATES.has(state)).toBe(true)
    })
    expect(TERMINAL_STATES.size).toBe(8)
  })

  it('ISSUE_TYPE_MAP maps Jira types to internal types', () => {
    expect(ISSUE_TYPE_MAP['Bug']).toBe('Incidente')
    expect(ISSUE_TYPE_MAP['Story']).toBe('Mejora')
    expect(ISSUE_TYPE_MAP['Task']).toBe('Tarea')
    expect(ISSUE_TYPE_MAP['Spike']).toBe('Spike')
    expect(ISSUE_TYPE_MAP['Service Request']).toBe('Service Request')
    expect(ISSUE_TYPE_MAP['Defecto QA']).toBe('Defecto QA')
    expect(ISSUE_TYPE_MAP['Error Productivo']).toBe('Incidente')
    expect(ISSUE_TYPE_MAP['Historia']).toBe('Mejora')
  })

  it('PROXY_BASE_URL is a string', () => {
    expect(typeof PROXY_BASE_URL).toBe('string')
  })

  it('JQL_TEMPLATES generates valid JQL for single project', () => {
    const jql = JQL_TEMPLATES.issuesByProject('GD941')
    expect(jql).toContain('project = "GD941"')
    expect(jql).toContain('issuetype NOT IN')
  })

  it('JQL_TEMPLATES generates valid JQL for multiple projects', () => {
    const jql = JQL_TEMPLATES.issuesByProjects(['GD941', 'GD981'])
    expect(jql).toContain('project IN ("GD941", "GD981")')
  })
})
