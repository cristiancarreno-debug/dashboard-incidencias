import { useState, useCallback } from 'react'

/**
 * Hook que gestiona el estado de selección masiva de issues (checkboxes).
 * Permite seleccionar, deseleccionar, seleccionar todas y limpiar la selección.
 * @returns Objeto con el Set de claves seleccionadas y funciones de control.
 */
export function useBulkActions() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  /** Alterna la selección de una issue por su clave. */
  const toggleKey = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  /** Selecciona todas las claves proporcionadas. */
  const selectAll = useCallback((keys: string[]) => {
    setSelectedKeys(new Set(keys))
  }, [])

  /** Limpia toda la selección. */
  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set())
  }, [])

  /** Verifica si una clave está seleccionada. */
  const isSelected = useCallback(
    (key: string) => selectedKeys.has(key),
    [selectedKeys]
  )

  return { selectedKeys, toggleKey, selectAll, clearSelection, isSelected }
}
