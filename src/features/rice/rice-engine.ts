/**
 * Motor RICE — Función pura de análisis de prioridad para incidencias.
 *
 * Implementa el framework RICE (Reach × Impact × Confidence / Effort)
 * adaptado al contexto de Seguros de Cumplimiento Colombia.
 */

import type { IssueType, RiceInput, RiceResult, RicePriority } from './rice.types'
import { RICE_KEYWORD_RULES } from './rice-keywords'
import { ISSUE_TYPE_MAP } from '@/config/constants'

/** Estados que incrementan confidence en +0.2 (max 1.0). */
const PROGRESS_STATES = new Set(['En Progreso', 'En Pruebas QA', 'En Pruebas UAT'])

/**
 * Mapea un issuetype de Jira al tipo interno de la aplicación.
 * Si no existe mapeo, retorna 'Tarea' como fallback.
 *
 * @param jiraIssuetype - Nombre del tipo de issue en Jira.
 * @returns Tipo interno de incidencia.
 */
export function mapIssueType(jiraIssuetype: string): IssueType {
  return ISSUE_TYPE_MAP[jiraIssuetype] ?? 'Tarea'
}

/**
 * Analiza una incidencia y calcula su score RICE con clasificación de prioridad.
 *
 * Flujo:
 * 1. Identifica riesgo por keywords en el summary (primera coincidencia).
 * 2. Si no hay coincidencia, aplica fallback por tipo de issue.
 * 3. Aplica ajustes por estado (confidence, effort).
 * 4. Calcula score = round((reach × impact × confidence) / effort, 1).
 * 5. Clasifica prioridad según umbrales.
 *
 * @param input - Datos de entrada: summary, tipo y status.
 * @returns Resultado RICE con risk, variables, score y prioridad.
 */
export function riceAnalyze(input: RiceInput): RiceResult {
  const summary = input.summary.toLowerCase()
  const { tipo, status } = input

  // Fase 1: Identificar riesgo por keywords
  let risk: string
  let reach: number
  let impact: number
  let confidence: number
  let effort: number

  const matchedRule = findMatchingRule(summary)

  if (matchedRule) {
    risk = matchedRule.risk
    reach = matchedRule.reach
    impact = matchedRule.impact
    confidence = matchedRule.confidence
    effort = matchedRule.effort
  } else {
    // Fallback por tipo de issue
    const fallback = getTypeFallback(tipo)
    risk = fallback.risk
    reach = fallback.reach
    impact = fallback.impact
    confidence = fallback.confidence
    effort = fallback.effort
  }

  // Fase 2: Ajustes por estado
  if (PROGRESS_STATES.has(status)) {
    confidence = Math.min(confidence + 0.2, 1.0)
  }

  if (status === 'Pendiente PAP') {
    confidence = Math.min(confidence + 0.1, 1.0)
    effort = Math.max(effort * 0.7, 0.5)
  }

  if (status === 'Bloqueado') {
    effort = effort * 1.5
  }

  // Fase 3: Cálculo del score
  const score = round((reach * impact * confidence) / effort, 1)

  // Fase 4: Clasificación de prioridad
  const priority = classifyPriority(score)

  return { risk, reach, impact, confidence, effort, score, priority }
}

/**
 * Busca la primera regla de keywords que coincida con el summary.
 *
 * @param summary - Summary en minúsculas.
 * @returns La regla coincidente o undefined si no hay match.
 */
function findMatchingRule(summary: string) {
  for (const rule of RICE_KEYWORD_RULES) {
    // Caso especial: coincidencia exacta
    if (rule.exactMatch) {
      if (summary.trim() === rule.keywords[0]) {
        return rule
      }
      continue
    }

    // Caso especial: requiere todas las keywords (AND lógico)
    if (rule.requiredAll) {
      const allPresent = rule.requiredAll.every((kw) => summary.includes(kw))
      if (allPresent) {
        return rule
      }
      continue
    }

    // Caso normal: cualquier keyword presente (OR lógico)
    const hasMatch = rule.keywords.some((kw) => summary.includes(kw))
    if (hasMatch) {
      return rule
    }
  }

  return undefined
}

/**
 * Obtiene valores RICE por defecto según el tipo de issue.
 *
 * @param tipo - Tipo interno de incidencia.
 * @returns Valores base de RICE para el tipo.
 */
function getTypeFallback(tipo: IssueType) {
  if (tipo === 'Incidente') {
    return { risk: 'incidente genérico', reach: 30, impact: 1, confidence: 0.5, effort: 1.5 }
  }
  if (tipo === 'Mejora') {
    return { risk: 'mejora funcional', reach: 25, impact: 1, confidence: 0.5, effort: 2 }
  }
  return { risk: 'sin clasificar', reach: 20, impact: 0.5, confidence: 0.5, effort: 2 }
}

/**
 * Clasifica la prioridad según los umbrales de score RICE.
 *
 * @param score - Score RICE calculado.
 * @returns Prioridad: Crítica (≥40), Alta (≥20), Media (≥10), Baja (<10).
 */
function classifyPriority(score: number): RicePriority {
  if (score >= 40) return 'Crítica'
  if (score >= 20) return 'Alta'
  if (score >= 10) return 'Media'
  return 'Baja'
}

/**
 * Redondea un número a N decimales, replicando el comportamiento de Python round().
 *
 * @param value - Valor a redondear.
 * @param decimals - Cantidad de decimales.
 * @returns Valor redondeado.
 */
function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}
