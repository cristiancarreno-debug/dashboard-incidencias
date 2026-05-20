import { useState, useRef, useEffect } from 'react'
import { ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { JiraProject } from '@/features/jira/types/jira.types'

export interface GdSelectorProps {
  projects: JiraProject[]
  selected: string[]
  onSelectionChange: (keys: string[]) => void
  isLoading: boolean
}

/**
 * Selector multi-GD con búsqueda — implementación nativa sin Radix UI.
 */
export function GdSelector({
  projects,
  selected,
  onSelectionChange,
  isLoading,
}: GdSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredProjects = projects.filter((project) => {
    if (!search) return true
    const query = search.toLowerCase()
    return (
      project.name.toLowerCase().includes(query) ||
      project.key.toLowerCase().includes(query)
    )
  })

  function toggleProject(key: string) {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key]
    onSelectionChange(next)
  }

  function getTriggerLabel(): string {
    if (selected.length === 0) return 'Seleccionar GDs...'
    if (selected.length === 1) return '1 GD seleccionado'
    return `${selected.length} GDs seleccionados`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isLoading}
        className={cn(
          'flex h-10 w-[280px] items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
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

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-[280px] rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center border-b px-3">
            <input
              className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
              placeholder="Buscar GD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex border-b px-2 py-1.5">
            <button onClick={() => onSelectionChange([])} className="flex-1 text-xs text-gray-500 hover:bg-gray-50 rounded px-2 py-1">✗ Ninguno</button>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredProjects.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">No se encontraron GDs.</p>
            ) : (
              filteredProjects.map((project) => {
                const isSelected = selected.includes(project.key)
                return (
                  <label
                    key={project.key}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProject(project.key)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 accent-[hsl(153,100%,32.5%)]"
                    />
                    <span className="font-medium">{project.key}</span>
                    <span className="ml-2 truncate text-gray-500">{project.name}</span>
                  </label>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
