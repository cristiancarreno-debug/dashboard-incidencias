import { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/lib/utils'

/** Option for the multi-checkbox dropdown. */
export interface MultiCheckboxOption {
  value: string
  count: number
}

/** Props for MultiCheckboxDropdown component. */
export interface MultiCheckboxDropdownProps {
  /** Display label for the dropdown trigger. */
  label: string
  /** Available options with counts. */
  options: MultiCheckboxOption[]
  /** Currently selected values. */
  selected: Set<string>
  /** Callback when selection changes. */
  onSelectionChange: (selected: Set<string>) => void
}

/**
 * Dropdown with multi-checkbox selection, internal search, and quick actions.
 * Supports "Todos", "Ninguno", and "Solo visibles" quick-select buttons.
 */
export function MultiCheckboxDropdown({
  label,
  options,
  selected,
  onSelectionChange,
}: MultiCheckboxDropdownProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    const term = search.toLowerCase()
    return options.filter((opt) => opt.value.toLowerCase().includes(term))
  }, [options, search])

  const handleToggle = (value: string) => {
    const next = new Set(selected)
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }
    onSelectionChange(next)
  }

  const handleSelectAll = () => {
    onSelectionChange(new Set(options.map((o) => o.value)))
  }

  const handleSelectNone = () => {
    onSelectionChange(new Set())
  }

  const handleSelectVisible = () => {
    onSelectionChange(new Set(filteredOptions.map((o) => o.value)))
  }

  const selectedCount = selected.size

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm',
            'hover:bg-gray-50 transition-colors',
            selectedCount > 0 ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'
          )}
        >
          {label}
          {selectedCount > 0 && (
            <span className="rounded-full bg-blue-600 px-1.5 text-xs text-white">
              {selectedCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        {/* Search input */}
        <div className="border-b p-2">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-gray-200 px-2 py-1 text-sm outline-none focus:border-blue-400"
          />
        </div>

        {/* Quick actions */}
        <div className="flex gap-1 border-b px-2 py-1.5">
          <button
            type="button"
            onClick={handleSelectAll}
            className="rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
          >
            Todos
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            className="rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
          >
            Ninguno
          </button>
          <button
            type="button"
            onClick={handleSelectVisible}
            className="rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
          >
            Solo visibles
          </button>
        </div>

        {/* Options list */}
        <div className="max-h-56 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-gray-400">Sin resultados</p>
          ) : (
            filteredOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(opt.value)}
                  onChange={() => handleToggle(opt.value)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                />
                <span className="flex-1 truncate">{opt.value}</span>
                <span className="text-xs text-gray-400">{opt.count}</span>
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
