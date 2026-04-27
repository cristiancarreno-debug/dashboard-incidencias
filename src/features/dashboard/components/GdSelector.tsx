import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import type { JiraProject } from '@/features/jira/types/jira.types'

/** Props del selector multi-GD. */
export interface GdSelectorProps {
  /** Lista de proyectos disponibles. */
  projects: JiraProject[]
  /** Claves de proyecto actualmente seleccionadas. */
  selected: string[]
  /** Callback cuando cambia la selección. */
  onSelectionChange: (keys: string[]) => void
  /** Estado de carga mientras se obtienen proyectos. */
  isLoading: boolean
}

/**
 * Selector multi-GD con búsqueda.
 *
 * Permite al PO seleccionar uno o más Grupos de Desarrollo (GDs)
 * para visualizar sus incidencias en el dashboard. Incluye filtro
 * de texto case-insensitive por nombre o clave de proyecto.
 */
export function GdSelector({
  projects,
  selected,
  onSelectionChange,
  isLoading,
}: GdSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredProjects = projects.filter((project) => {
    if (!search) return true
    const query = search.toLowerCase()
    return (
      project.name.toLowerCase().includes(query) ||
      project.key.toLowerCase().includes(query)
    )
  })

  /** Alterna la selección de un proyecto individual. */
  function toggleProject(key: string) {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key]
    onSelectionChange(next)
  }

  /** Texto del botón trigger según la cantidad de GDs seleccionados. */
  function getTriggerLabel(): string {
    if (selected.length === 0) return 'Seleccionar GDs...'
    if (selected.length === 1) return `1 GD seleccionado`
    return `${selected.length} GDs seleccionados`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar Grupos de Desarrollo"
          className={cn(
            'flex h-10 w-[280px] items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando proyectos...
            </span>
          ) : (
            <span className="truncate">{getTriggerLabel()}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar GD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommandList>
            {filteredProjects.length === 0 ? (
              <CommandEmpty>No se encontraron GDs.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredProjects.map((project) => {
                  const isSelected = selected.includes(project.key)
                  return (
                    <CommandItem
                      key={project.key}
                      onClick={() => toggleProject(project.key)}
                      aria-selected={isSelected}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="font-medium">{project.key}</span>
                      <span className="ml-2 truncate text-gray-500">
                        {project.name}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
