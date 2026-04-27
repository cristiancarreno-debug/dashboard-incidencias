import { RefreshCw } from 'lucide-react'

/** Props del componente RefreshButton. */
export interface RefreshButtonProps {
  /** Callback para invalidar cache de React Query y refrescar datos desde Jira. */
  onRefresh: () => void
  /** Indica si la actualización está en curso. */
  isRefreshing: boolean
}

/**
 * Botón de actualización manual que invalida la cache de React Query
 * y refresca los datos desde Jira.
 *
 * Muestra una animación de giro mientras se actualiza y se deshabilita
 * durante la operación para evitar múltiples peticiones simultáneas.
 *
 * @param props - Callback de refresco y estado de carga.
 */
export function RefreshButton({ onRefresh, isRefreshing }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      title="Actualizar desde Jira"
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
      />
      Actualizar desde Jira
    </button>
  )
}
