import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '@/features/jira/api/projects.api'

/**
 * Hook para obtener la lista de proyectos Jira disponibles.
 * Usa React Query para cache y deduplicación automática.
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })
}
