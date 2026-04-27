/**
 * Utilidades de serialización para sincronizar estado con URL query params.
 * Permite persistir la selección de GDs en la URL para compartir vistas entre POs.
 */

/**
 * Serializa un array de claves de GD a un string de query param separado por comas.
 * Ordena las claves alfabéticamente para output determinístico y elimina duplicados.
 *
 * @param keys - Array de claves de proyecto (ej: ["GD941", "GD981"])
 * @returns String serializado separado por comas (ej: "GD941,GD981")
 */
export function serializeGdSelection(keys: string[]): string {
  const unique = [...new Set(keys)]
  unique.sort()
  return unique.join(',')
}

/**
 * Deserializa un string de query param a un array de claves de GD válidas.
 * Filtra claves que no existen en la lista de proyectos disponibles.
 *
 * @param params - String de query param separado por comas (ej: "GD941,GD981,INVALID")
 * @param availableProjects - Lista de claves de proyecto válidas disponibles
 * @returns Array de claves válidas presentes en availableProjects
 */
export function deserializeGdSelection(
  params: string,
  availableProjects: string[]
): string[] {
  if (!params.trim()) {
    return []
  }

  const availableSet = new Set(availableProjects)
  const keys = params.split(',').map((k) => k.trim()).filter(Boolean)
  const unique = [...new Set(keys)]

  return unique.filter((key) => availableSet.has(key))
}
