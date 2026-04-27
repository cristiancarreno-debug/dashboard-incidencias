import { useEffect, useRef } from 'react'
import { X, Calculator, ShieldAlert, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import type { RiceResult, RicePriority } from '@/features/rice/rice.types'

/** Props del componente RicePopover. */
export interface RicePopoverProps {
  /** Resultado RICE a mostrar en detalle. */
  rice: RiceResult
  /** Elemento ancla para posicionar el popover. */
  anchor: HTMLElement | null
  /** Callback para cerrar el popover. */
  onClose: () => void
}

/** Configuración visual por prioridad RICE. */
const PRIORITY_STYLE: Record<RicePriority, { bg: string; text: string; icon: React.ReactNode }> = {
  Crítica: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: <ShieldAlert className="h-4 w-4 text-red-700" />,
  },
  Alta: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    icon: <ArrowUp className="h-4 w-4 text-orange-700" />,
  },
  Media: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: <Minus className="h-4 w-4 text-yellow-700" />,
  },
  Baja: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: <ArrowDown className="h-4 w-4 text-green-700" />,
  },
}

/**
 * Popover que muestra el detalle de las variables RICE de una incidencia.
 *
 * Incluye: Reach, Impact, Confidence, Effort, fórmula aplicada,
 * clasificación de riesgo y prioridad con codificación de color.
 *
 * @param props - Rice result, anchor element y callback de cierre.
 */
export function RicePopover({ rice, anchor, onClose }: RicePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera del popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchor &&
        !anchor.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [anchor, onClose])

  if (!anchor) return null

  // Calcular posición relativa al anchor
  const rect = anchor.getBoundingClientRect()
  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + 8,
    left: rect.left,
    zIndex: 50,
  }

  const priorityConfig = PRIORITY_STYLE[rice.priority]

  return (
    <div
      ref={popoverRef}
      style={style}
      className="w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
      role="dialog"
      aria-label="Detalle RICE"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Detalle RICE</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Variables RICE */}
      <div className="mb-3 space-y-1.5">
        <VariableRow label="Reach" value={rice.reach} unit="" />
        <VariableRow label="Impact" value={rice.impact} unit="" />
        <VariableRow label="Confidence" value={rice.confidence} unit="" />
        <VariableRow label="Effort" value={rice.effort} unit="p/m" />
      </div>

      {/* Fórmula */}
      <div className="mb-3 rounded bg-gray-50 px-3 py-2">
        <p className="text-xs text-gray-500">Fórmula</p>
        <p className="font-mono text-xs text-gray-700">
          score = ({rice.reach} × {rice.impact} × {rice.confidence}) / {rice.effort}
        </p>
        <p className="mt-1 text-sm font-bold text-gray-900">= {rice.score}</p>
      </div>

      {/* Clasificación de riesgo */}
      <div className="mb-2">
        <p className="text-xs text-gray-500">Clasificación de riesgo</p>
        <p className="text-sm text-gray-700">{rice.risk}</p>
      </div>

      {/* Prioridad */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-500">Prioridad:</p>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}
        >
          {priorityConfig.icon}
          {rice.priority}
        </span>
      </div>
    </div>
  )
}

/** Fila de variable RICE individual. */
function VariableRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">
        {value}
        {unit && <span className="ml-1 text-xs text-gray-400">{unit}</span>}
      </span>
    </div>
  )
}
