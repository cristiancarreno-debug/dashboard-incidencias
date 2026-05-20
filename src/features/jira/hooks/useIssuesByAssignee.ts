import { useQuery } from '@tanstack/react-query'
import { fetchIssuesByAssignee } from '../api/issues-by-assignee.api'

/**
 * Hook para obtener issues asignadas a un usuario por accountId.
 */
export function useIssuesByAssignee(displayName: string | null) {
  return useQuery({
    queryKey: ['issues-by-assignee', displayName],
    queryFn: () => fetchIssuesByAssignee(displayName!),
    enabled: !!displayName,
  })
}
