import { useQuery } from '@tanstack/react-query'
import { fetchIssuesByGds } from '@/features/jira/api/issues.api'

/**
 * Hook para obtener las incidencias de los GDs seleccionados.
 * Solo ejecuta la consulta cuando hay al menos un GD seleccionado.
 * Las claves se ordenan en el queryKey para consistencia de cache.
 */
export function useIssues(gdKeys: string[]) {
  return useQuery({
    queryKey: ['issues', ...gdKeys.slice().sort()],
    queryFn: () => fetchIssuesByGds(gdKeys),
    enabled: gdKeys.length > 0,
  })
}
