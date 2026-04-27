import { useState, useCallback } from 'react'
import type { SortConfig, SortColumn } from '@/features/rice/rice.types'

/**
 * Hook que gestiona el estado de ordenamiento de la tabla.
 *
 * @param defaultColumn - Columna de ordenamiento inicial (por defecto 'riceScore').
 * @returns Objeto con la configuración de ordenamiento actual y función para alternar.
 */
export function useSorting(defaultColumn: SortColumn = 'riceScore') {
  const [sorting, setSorting] = useState<SortConfig>({
    column: defaultColumn,
    direction: 'desc',
  })

  /**
   * Alterna el ordenamiento: si es la misma columna, invierte la dirección;
   * si es una columna diferente, establece dirección ascendente.
   *
   * @param column - Columna sobre la cual ordenar.
   */
  const toggleSort = useCallback((column: SortColumn) => {
    setSorting((prev) => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { column, direction: 'asc' }
    })
  }, [])

  return { sorting, toggleSort }
}
