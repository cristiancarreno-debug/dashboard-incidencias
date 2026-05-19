import { useState, useCallback } from 'react'
import type { SortConfig, SortColumn } from '@/features/rice/rice.types'

const DESC_BY_DEFAULT: Set<SortColumn> = new Set(['riceScore', 'created'])

export function useSorting(defaultColumn: SortColumn = 'riceScore') {
  const [sorting, setSorting] = useState<SortConfig>({
    column: defaultColumn,
    direction: 'desc',
  })

  const toggleSort = useCallback((column: SortColumn) => {
    setSorting((prev) => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      // New column: desc for numeric/date, asc for text
      return { column, direction: DESC_BY_DEFAULT.has(column) ? 'desc' : 'asc' }
    })
  }, [])

  return { sorting, toggleSort }
}
