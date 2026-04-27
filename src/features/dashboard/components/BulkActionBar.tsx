import { useState } from 'react'
import { Users, X, Loader2, AlertCircle } from 'lucide-react'
import { useReassignIssue } from '@/features/jira/hooks/useTransitions'
import type { EnrichedIssue } from '@/features/rice/rice.types'

/** Props del componente BulkActionBar. */
export interface BulkActionBarProps {
  /** Claves de issues seleccionadas. */
  selectedKeys: Set<string>
  /** Todas las issues (para obtener assignees únicos). */
  issues: EnrichedIssue[]
  /** Callback para limpiar la selección. */
  onClearSelection: () => void
  /** Callback ejecutado tras completar la reasignación masiva. */
  onReassignComplete: () => void
}

/** Resultado individual de una reasignación. */
interface ReassignError {
  issueKey: string
  message: string
}

/**
 * Barra de acciones masivas que se muestra cuando hay issues seleccionadas.
 *
 * Permite cambiar el responsable de múltiples issues simultáneamente.
 * Maneja fallos parciales mostrando errores individuales sin revertir
 * las operaciones exitosas.
 *
 * @param props - Claves seleccionadas, issues, y callbacks.
 */
export function BulkActionBar({
  selectedKeys,
  issues,
  onClearSelection,
  onReassignComplete,
}: BulkActionBarProps) {
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const [isReassigning, setIsReassigning] = useState(false)
  const [errors, setErrors] = useState<ReassignError[]>([])

  const reassignMutation = useReassignIssue()

  if (selectedKeys.size === 0) return null

  /** Obtiene la lista de assignees únicos con accountId válido. */
  const uniqueAssignees = Array.from(
    new Map(
      issues
        .filter((issue) => issue.assigneeAccountId !== null)
        .map((issue) => [issue.assigneeAccountId!, issue.assignee])
    ).entries()
  ).map(([accountId, displayName]) => ({ accountId, displayName }))

  /**
   * Ejecuta la reasignación masiva para todas las issues seleccionadas.
   * Maneja fallos parciales: acumula errores individuales sin revertir éxitos.
   */
  async function handleReassign(accountId: string) {
    setShowAssigneeDropdown(false)
    setIsReassigning(true)
    setErrors([])

    const issueKeys = Array.from(selectedKeys)
    const failedOps: ReassignError[] = []

    for (const issueKey of issueKeys) {
      try {
        await reassignMutation.mutateAsync({ issueKey, accountId })
      } catch (error) {
        failedOps.push({
          issueKey,
          message:
            error instanceof Error ? error.message : 'Error desconocido',
        })
      }
    }

    setIsReassigning(false)
    setErrors(failedOps)

    if (failedOps.length < issueKeys.length) {
      onReassignComplete()
    }
  }

  return (
    <div className="sticky bottom-4 z-40 mx-auto w-fit">
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 shadow-lg">
        {/* Conteo de seleccionadas */}
        <span className="text-sm font-medium text-blue-800">
          {selectedKeys.size} seleccionada{selectedKeys.size > 1 ? 's' : ''}
        </span>

        {/* Botón cambiar responsable */}
        <div className="relative">
          <button
            onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            disabled={isReassigning}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isReassigning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            Cambiar responsable
          </button>

          {/* Dropdown de assignees */}
          {showAssigneeDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-64 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              {uniqueAssignees.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">
                  No hay responsables disponibles.
                </p>
              ) : (
                <ul className="max-h-48 overflow-y-auto">
                  {uniqueAssignees.map(({ accountId, displayName }) => (
                    <li key={accountId}>
                      <button
                        onClick={() => handleReassign(accountId)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {displayName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Botón limpiar selección */}
        <button
          onClick={onClearSelection}
          disabled={isReassigning}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Limpiar selección
        </button>
      </div>

      {/* Errores parciales */}
      {errors.length > 0 && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-red-800">
            <AlertCircle className="h-4 w-4" />
            Se reasignaron {selectedKeys.size - errors.length}/{selectedKeys.size}{' '}
            incidencias. Fallaron:
          </div>
          <ul className="mt-1 space-y-0.5 pl-5 text-xs text-red-700">
            {errors.map(({ issueKey, message }) => (
              <li key={issueKey}>
                {issueKey}: {message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
