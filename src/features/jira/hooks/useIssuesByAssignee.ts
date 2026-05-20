import { useQuery } from '@tanstack/react-query'
import { fetchIssuesByAssignee } from '../api/issues-by-assignee.api'

/**
 * Hook para obtener issues asignadas a un usuario por accountId.
 */
export function useIssuesByAssignee(accountId: string | null) {
  return useQuery({
    queryKey: ['issues-by-assignee', accountId],
    queryFn: () => fetchIssuesByAssignee(accountId!),
    enabled: !!accountId,
  })
}
