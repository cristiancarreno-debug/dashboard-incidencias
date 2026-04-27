import { useCallback, useMemo } from 'react'
import { useUrlParams } from '@/shared/hooks/useUrlParams'
import {
  serializeGdSelection,
  deserializeGdSelection,
} from '@/shared/lib/url-state'

/**
 * Resultado del hook useGdSelection.
 */
interface UseGdSelectionResult {
  /** Claves de GD actualmente seleccionadas (validadas contra proyectos disponibles) */
  selectedGds: string[]
  /** Actualiza la selección de GDs y persiste en URL query params */
  setSelectedGds: (keys: string[]) => void
  /** Indica si se descartaron GDs inválidos de la URL (para mostrar mensaje informativo) */
  invalidGdsDiscarded: boolean
}

/**
 * Hook para gestionar la selección de Grupos de Desarrollo (GDs) sincronizada
 * con URL query params. Permite compartir vistas entre POs mediante URL.
 *
 * - Persiste la selección en el query param `gds` de la URL.
 * - Filtra automáticamente claves inválidas que no existen en la lista de proyectos disponibles.
 * - Señaliza cuando se descartaron GDs inválidos para mostrar un mensaje informativo al PO.
 *
 * @param availableProjects - Array de claves de proyecto válidas disponibles desde Jira
 * @returns Objeto con la selección actual, setter y flag de GDs descartados
 *
 * @example
 * ```tsx
 * const { selectedGds, setSelectedGds, invalidGdsDiscarded } = useGdSelection(['GD941', 'GD981'])
 *
 * if (invalidGdsDiscarded) {
 *   showToast('Se descartaron GDs inválidos de la URL')
 * }
 * ```
 */
export function useGdSelection(
  availableProjects: string[]
): UseGdSelectionResult {
  const deserialize = useCallback(
    (param: string): string[] =>
      deserializeGdSelection(param, availableProjects),
    [availableProjects]
  )

  const [selectedGds, setSelectedGds] = useUrlParams<string[]>(
    'gds',
    serializeGdSelection,
    deserialize
  )

  const invalidGdsDiscarded = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }

    const rawParam = new URLSearchParams(window.location.search).get('gds')

    if (!rawParam || !rawParam.trim()) {
      return false
    }

    const rawKeys = rawParam
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    const uniqueRawKeys = [...new Set(rawKeys)]

    return uniqueRawKeys.length > selectedGds.length
  }, [selectedGds])

  return { selectedGds, setSelectedGds, invalidGdsDiscarded }
}
