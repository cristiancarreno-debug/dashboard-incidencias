import { X, Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import {
  useTransitions,
  useExecuteTransition,
} from '@/features/jira/hooks/useTransitions'

/** Props del componente TransitionModal. */
export interface TransitionModalProps {
  /** Clave de la issue a transicionar. */
  issueKey: string
  /** Indica si el modal está abierto. */
  isOpen: boolean
  /** Callback para cerrar el modal. */
  onClose: () => void
  /** Callback ejecutado tras una transición exitosa. */
  onTransitionComplete: () => void
}

/**
 * Modal que muestra las transiciones disponibles para una issue de Jira
 * y permite ejecutar una transición seleccionada.
 *
 * Consulta las transiciones disponibles usando el hook `useTransitions`,
 * muestra un listado de botones y ejecuta la transición seleccionada
 * mediante `useExecuteTransition`.
 *
 * @param props - Issue key, estado de apertura y callbacks.
 */
export function TransitionModal({
  issueKey,
  isOpen,
  onClose,
  onTransitionComplete,
}: TransitionModalProps) {
  const { data: transitions, isLoading, isError } = useTransitions(
    isOpen ? issueKey : null
  )
  const executeTransition = useExecuteTransition()

  if (!isOpen) return null

  /** Ejecuta la transición seleccionada y cierra el modal al completarse. */
  function handleTransition(transitionId: string) {
    executeTransition.mutate(
      { issueKey, transitionId },
      {
        onSuccess: () => {
          onTransitionComplete()
          onClose()
        },
      }
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={`Transiciones para ${issueKey}`}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Transicionar {issueKey}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-500">
              Cargando transiciones…
            </span>
          </div>
        )}

        {/* Error state from fetching transitions */}
        {isError && (
          <div className="flex items-center gap-2 rounded bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>No se pudieron cargar las transiciones disponibles.</span>
          </div>
        )}

        {/* Transition execution error */}
        {executeTransition.isError && (
          <div className="mb-3 flex items-center gap-2 rounded bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              No se pudo cambiar el estado de {issueKey}:{' '}
              {executeTransition.error instanceof Error
                ? executeTransition.error.message
                : 'Error desconocido'}
            </span>
          </div>
        )}

        {/* Transitions list */}
        {transitions && transitions.length > 0 && (
          <ul className="space-y-2">
            {transitions.map((transition) => (
              <li key={transition.id}>
                <button
                  onClick={() => handleTransition(transition.id)}
                  disabled={executeTransition.isPending}
                  className="flex w-full items-center justify-between rounded-md border border-gray-200 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {transition.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      → {transition.to.name}
                    </span>
                  </div>
                  {executeTransition.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {transitions && transitions.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">
            No hay transiciones disponibles para esta issue.
          </p>
        )}
      </div>
    </div>
  )
}
