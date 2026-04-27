import { Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/** Props for SearchInput component. */
export interface SearchInputProps {
  /** Current search value. */
  value: string
  /** Callback when value changes. */
  onChange: (value: string) => void
  /** Placeholder text for the input. */
  placeholder?: string
}

/**
 * Text search input field with search icon and clear button.
 * Provides immediate filtering (no debounce).
 */
export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-md border border-gray-300 py-1.5 pl-8 text-sm outline-none',
          'focus:border-blue-400 focus:ring-1 focus:ring-blue-400',
          value ? 'pr-8' : 'pr-3'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
