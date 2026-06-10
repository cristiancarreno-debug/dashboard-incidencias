import { useState, useCallback } from 'react'
import type { ActiveFilters } from '@/features/rice/rice.types'

/**
 * Hook que gestiona el estado de filtros activos del dashboard.
 * Estado inicial: todos los Sets vacíos (sin filtro activo).
 * @returns Objeto con filtros actuales, setter y función de reset.
 */
export function useFilters() {
  const [filters, setFilters] = useState<ActiveFilters>({
    equipo: new Set<string>(),
    tipo: new Set<string>(),
    status: new Set<string>(),
    ricePriority: new Set<string>(),
    assignee: new Set<string>(),
    epic: new Set<string>(),
    sprint: new Set<string>(),
  })

  /** Restablece todos los filtros a su estado inicial (vacío). */
  const resetFilters = useCallback(() => {
    setFilters({
      equipo: new Set<string>(),
      tipo: new Set<string>(),
      status: new Set<string>(),
      ricePriority: new Set<string>(),
      assignee: new Set<string>(),
      epic: new Set<string>(),
      sprint: new Set<string>(),
    })
  }, [])

  return { filters, setFilters, resetFilters }
}
