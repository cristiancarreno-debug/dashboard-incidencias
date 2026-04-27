import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import type { EnrichedIssue } from '@/features/rice/rice.types'

/** Props del selector de iniciativas (épicas) agrupadas por GD. */
export interface InitiativeSelectorProps {
  /** Todas las issues enriquecidas para extraer iniciativas. */
  issues: EnrichedIssue[]
  /** GDs actualmente seleccionados. */
  selectedGds: string[]
  /** Claves de iniciativas actualmente seleccionadas. */
  selectedInitiatives: string[]
  /** Callback cuando cambia la selección de iniciativas. */
  onSelectionChange: (keys: string[]) => void
}

/** Representa una iniciativa (épica) extraída de las issues. */
interface Initiative {
  /** Valor del campo epic (ej: "KEY-123 - Summary"). */
  key: string
  /** GD (proyecto) al que pertenece. */
  gd: string
}

/**
 * Selector de iniciativas (épicas) agrupadas por GD.
 *
 * Extrae las épicas únicas de las issues, las agrupa por GD y permite
 * selección múltiple con búsqueda de texto. Si no se selecciona ninguna
 * iniciativa, se muestran todas las incidencias (sin filtro).
 */
export function InitiativeSelector({
  issues,
  selectedGds,
  selectedInitiatives,
  onSelectionChange,
}: InitiativeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  /** Extrae iniciativas únicas agrupadas por GD, filtrando "Sin épica". */
  const initiativesByGd = useMemo(() => {
    const map = new Map<string, Initiative[]>()

    const seen = new Set<string>()

    for (const issue of issues) {
      // Solo considerar issues de GDs seleccionados
      if (selectedGds.length > 0 && !selectedGds.includes(issue.project)) {
        continue
      }

      // Filtrar "Sin épica"
      if (issue.epic === 'Sin épica') continue

      const uniqueKey = `${issue.project}::${issue.epic}`
      if (seen.has(uniqueKey)) continue
      seen.add(uniqueKey)

      const initiative: Initiative = { key: issue.epic, gd: issue.project }
      const list = map.get(issue.project) ?? []
      list.push(initiative)
      map.set(issue.project, list)
    }

    return map
  }, [issues, selectedGds])

  /** Filtra iniciativas por texto de búsqueda. */
  const filteredByGd = useMemo(() => {
    const result = new Map<string, Initiative[]>()

    for (const [gd, initiatives] of initiativesByGd) {
      const filtered = initiatives.filter((init) => {
        if (!search) return true
        const query = search.toLowerCase()
        return init.key.toLowerCase().includes(query)
      })
      if (filtered.length > 0) {
        result.set(gd, filtered)
      }
    }

    return result
  }, [initiativesByGd, search])

  /** Alterna la selección de una iniciativa. */
  function toggleInitiative(key: string) {
    const next = selectedInitiatives.includes(key)
      ? selectedInitiatives.filter((k) => k !== key)
      : [...selectedInitiatives, key]
    onSelectionChange(next)
  }

  /** Texto del botón trigger según la cantidad de iniciativas seleccionadas. */
  function getTriggerLabel(): string {
    if (selectedInitiatives.length === 0) return 'Seleccionar iniciativas...'
    if (selectedInitiatives.length === 1) return '1 iniciativa seleccionada'
    return `${selectedInitiatives.length} iniciativas seleccionadas`
  }

  /** Verifica si hay resultados visibles. */
  const hasResults = filteredByGd.size > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar Iniciativas"
          className={cn(
            'flex h-10 w-[280px] items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          <span className="truncate">{getTriggerLabel()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar iniciativa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommandList>
            {!hasResults ? (
              <CommandEmpty>No se encontraron iniciativas.</CommandEmpty>
            ) : (
              Array.from(filteredByGd.entries()).map(([gd, initiatives]) => (
                <CommandGroup key={gd}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                    {gd}
                  </div>
                  {initiatives.map((initiative) => {
                    const isSelected = selectedInitiatives.includes(initiative.key)
                    return (
                      <CommandItem
                        key={`${gd}-${initiative.key}`}
                        onClick={() => toggleInitiative(initiative.key)}
                        aria-selected={isSelected}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span className="truncate">{initiative.key}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
