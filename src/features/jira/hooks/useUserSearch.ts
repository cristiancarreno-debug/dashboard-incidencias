import { useQuery } from '@tanstack/react-query'
import { searchJiraUsers } from '../api/users.api'

/**
 * Hook para buscar usuarios de Jira con debounce implícito via staleTime.
 */
export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['jira-users', query],
    queryFn: () => searchJiraUsers(query),
    enabled: query.length >= 3,
    staleTime: 60_000,
  })
}
