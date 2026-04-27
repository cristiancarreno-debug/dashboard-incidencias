import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Hook genérico para sincronizar estado con URL query params.
 * Usa `useSearchParams` de react-router-dom para leer y escribir parámetros
 * en la URL sin provocar navegación (modo replace).
 *
 * @param key - Nombre del query param en la URL
 * @param serialize - Función para convertir el valor a string de query param
 * @param deserialize - Función para convertir el string de query param al valor tipado
 * @returns Tupla [valor actual deserializado, setter para actualizar el valor]
 */
export function useUrlParams<T>(
  key: string,
  serialize: (value: T) => string,
  deserialize: (param: string) => T
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawValue = searchParams.get(key) ?? ''
  const value = deserialize(rawValue)

  const setValue = useCallback(
    (newValue: T) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const serialized = serialize(newValue)

          if (serialized) {
            next.set(key, serialized)
          } else {
            next.delete(key)
          }

          return next
        },
        { replace: true }
      )
    },
    [key, serialize, setSearchParams]
  )

  return [value, setValue]
}
