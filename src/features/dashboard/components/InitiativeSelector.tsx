import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { EnrichedIssue } from '@/features/rice/rice.types'

export interface InitiativeSelectorProps {
  issues: EnrichedIssue[]
  selectedGds: string[]
  selectedInitiatives: string[]
  onSelectionChange: (keys: string[]) => void
}

interface Initiative {
  key: string
  gd: string
}

export function InitiativeSelector({
  issues,
  selectedGds,
  selectedInitiatives,
  onSelectionChange,
}: InitiativeSelectorProps) {
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

  const initiativesByGd = useMemo(() => {
    const map = new Map<string, Initiative[]>()
    const seen = new Set<string>()
    for (const issue of issues) {
      if (selectedGds.length > 0 && !selectedGds.includes(issue.project)) continue
      if (issue.epic === 'Sin épica') continue
      const uniqueKey = `${issue.project}::${issue.epic}`
      if (seen.has(uniqueKey)) continue
      seen.add(uniqueKey)
      const list = map.get(issue.project) ?? []
      list.push({ key: issue.epic, gd: issue.project })
      map.set(issue.project, list)
    }
    return map
  }, [issues, selectedGds])

  const filteredByGd = useMemo(() => {
    const result = new Map<string, Initiative[]>()
    for (const [gd, initiatives] of initiativesByGd) {
      const filtered = initiatives.filter((init) => {
        if (!search) return true
        return init.key.toLowerCase().includes(search.toLowerCase())
      })
      if (filtered.length > 0) result.set(gd, filtered)
    }
    return result
  }, [initiativesByGd, search])

  function toggleInitiative(key: string) {
    const next = selectedInitiatives.includes(key)
      ? selectedInitiatives.filter((k) => k !== key)
      : [...selectedInitiatives, key]
    onSelectionChange(next)
  }

  function getTriggerLabel(): string {
    if (selectedInitiatives.length === 0) return 'Seleccionar iniciativas...'
    if (selectedInitiatives.length === 1) return '1 iniciativa'
    return `${selectedInitiatives.length} iniciativas`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-[280px] items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
      >
        <span className="truncate">{getTriggerLabel()}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-[320px] rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center border-b px-3">
            <input
              className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
              placeholder="Buscar iniciativa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredByGd.size === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">No se encontraron iniciativas.</p>
            ) : (
              Array.from(filteredByGd.entries()).map(([gd, initiatives]) => (
                <div key={gd}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">{gd}</div>
                  {initiatives.map((initiative) => {
                    const isSelected = selectedInitiatives.includes(initiative.key)
                    return (
                      <div
                        key={`${gd}-${initiative.key}`}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleInitiative(initiative.key) }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="h-4 w-4 rounded border-gray-300 accent-[hsl(153,100%,32.5%)] pointer-events-none"
                        />
                        <span className="truncate">{initiative.key}</span>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
