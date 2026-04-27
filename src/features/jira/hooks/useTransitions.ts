import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTransitions,
  executeTransition,
  reassignIssue,
} from '@/features/jira/api/transitions.api'

/**
 * Hook para obtener las transiciones disponibles de una issue.
 * Solo ejecuta la consulta cuando se proporciona una issueKey.
 */
export function useTransitions(issueKey: string | null) {
  return useQuery({
    queryKey: ['transitions', issueKey],
    queryFn: () => fetchTransitions(issueKey!),
    enabled: issueKey !== null,
  })
}

/**
 * Hook para ejecutar una transición sobre una issue de Jira.
 * Invalida las queries de issues y transiciones al completarse.
 */
export function useExecuteTransition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      issueKey,
      transitionId,
    }: {
      issueKey: string
      transitionId: string
    }) => executeTransition(issueKey, transitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      queryClient.invalidateQueries({ queryKey: ['transitions'] })
    },
  })
}

/**
 * Hook para reasignar una issue de Jira a otro usuario.
 * Invalida las queries de issues al completarse.
 */
export function useReassignIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      issueKey,
      accountId,
    }: {
      issueKey: string
      accountId: string
    }) => reassignIssue(issueKey, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })
}
