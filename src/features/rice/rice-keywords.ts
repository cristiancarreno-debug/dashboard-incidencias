/**
 * Mapa de keywords → clasificación de riesgo para el Motor RICE.
 *
 * Cada regla define un conjunto de keywords que, al encontrarse en el summary
 * de una incidencia (lowercased), asignan valores base de RICE.
 * Las reglas se evalúan en orden de prioridad (primera coincidencia gana).
 */

/** Valores base RICE asignados por una regla de keywords. */
export interface RiceKeywordRule {
  /** Etiqueta de riesgo identificada. */
  risk: string
  /** Keywords que activan esta regla (evaluadas con `includes` sobre el summary). */
  keywords: string[]
  /** Reach: usuarios/pólizas afectadas por periodo [1-100]. */
  reach: number
  /** Impact: 3=Masivo, 2=Alto, 1=Medio, 0.5=Bajo, 0.25=Mínimo. */
  impact: number
  /** Confidence: 1.0=Alta, 0.8=Media, 0.5=Baja. */
  confidence: number
  /** Effort: personas-mes (mayor = menor score). */
  effort: number
  /**
   * Si es true, se requiere coincidencia exacta del summary completo (trimmed).
   * Usado para el caso "test".
   */
  exactMatch?: boolean
  /**
   * Keywords adicionales que TODAS deben estar presentes (AND lógico).
   * Usado para "simon web" + "cumplimiento".
   */
  requiredAll?: string[]
}

/**
 * Reglas de keywords ordenadas por prioridad.
 * La primera regla que coincida se aplica.
 */
export const RICE_KEYWORD_RULES: readonly RiceKeywordRule[] = [
  {
    risk: 'emisión',
    keywords: ['emisión', 'emision', 'cliente restringido'],
    reach: 60,
    impact: 2,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'anulación',
    keywords: ['anulacion', 'anulación'],
    reach: 40,
    impact: 2,
    confidence: 0.8,
    effort: 1.5,
  },
  {
    risk: 'reaseguro',
    keywords: ['reaseguro'],
    reach: 30,
    impact: 3,
    confidence: 0.8,
    effort: 3,
  },
  {
    risk: 'SARLAFT/cumplimiento normativo',
    keywords: ['sarlaft', 'lavado', 'laft'],
    reach: 80,
    impact: 3,
    confidence: 0.8,
    effort: 3,
  },
  {
    risk: 'primas/tasas',
    keywords: ['prima', 'tasa', 'facturación', 'facturacion', 'cruce', 'recálculo', 'recalculo'],
    reach: 50,
    impact: 2,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'devolución prima',
    keywords: ['devolución', 'devolucion'],
    reach: 35,
    impact: 2,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'documentación',
    keywords: ['impresión', 'impresion', 'pdf', 'certificado'],
    reach: 45,
    impact: 1,
    confidence: 0.8,
    effort: 1,
  },
  {
    risk: 'gestión documental',
    keywords: ['documento', 'adjunt', 'carga de archivo', 'lectura'],
    reach: 35,
    impact: 1,
    confidence: 0.8,
    effort: 1.5,
  },
  {
    risk: 'endosos',
    keywords: ['endoso', 'modificacion', 'vigencia', 'traslado'],
    reach: 40,
    impact: 2,
    confidence: 0.8,
    effort: 2.5,
  },
  {
    risk: 'cobertura',
    keywords: ['deducible', 'valor asegurado'],
    reach: 35,
    impact: 2,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'retroactividad',
    keywords: ['retroactiv'],
    reach: 50,
    impact: 2,
    confidence: 0.8,
    effort: 3,
  },
  {
    risk: 'cotización',
    keywords: ['cotización', 'cotizacion', 'cotizar'],
    reach: 55,
    impact: 1,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'gestión pólizas',
    keywords: ['póliza', 'poliza'],
    reach: 50,
    impact: 2,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'comisiones/intermediarios',
    keywords: ['comisión', 'comision', 'sobrecomisión', 'sobrecomision', 'intermediario'],
    reach: 30,
    impact: 1,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'parametrización',
    keywords: ['parametri', 'parámetro', 'autogestión', 'autogestion', 'config'],
    reach: 30,
    impact: 1,
    confidence: 0.8,
    effort: 1.5,
  },
  {
    risk: 'controles',
    keywords: ['control', 'levantamiento'],
    reach: 25,
    impact: 1,
    confidence: 0.8,
    effort: 1.5,
  },
  {
    risk: 'intermediarios',
    keywords: ['grupo', 'delima'],
    reach: 20,
    impact: 1,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'clausulados',
    keywords: ['clausulado'],
    reach: 30,
    impact: 2,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'contratos',
    keywords: ['contrato', 'obligatoriedad'],
    reach: 35,
    impact: 2,
    confidence: 0.8,
    effort: 2.5,
  },
  {
    risk: 'migración/integración',
    keywords: ['migra', 'integra'],
    reach: 25,
    impact: 1,
    confidence: 0.5,
    effort: 3,
  },
  {
    risk: 'reportes/trazabilidad',
    keywords: ['reporte', 'informe', 'consulta', 'trazabilidad'],
    reach: 30,
    impact: 1,
    confidence: 0.8,
    effort: 1.5,
  },
  {
    risk: 'canal digital',
    keywords: ['portal', 'web', 'online', 'link', 'url'],
    reach: 40,
    impact: 1,
    confidence: 0.5,
    effort: 1.5,
  },
  {
    risk: 'permisos/autorización',
    keywords: ['permiso', 'delegación', 'delegacion', 'rol', 'autorización'],
    reach: 35,
    impact: 1,
    confidence: 0.8,
    effort: 1.5,
  },
  {
    risk: 'notificaciones',
    keywords: ['notificación', 'notificacion', 'correo', 'email', 'envío', 'envio'],
    reach: 30,
    impact: 0.5,
    confidence: 0.8,
    effort: 1,
  },
  {
    risk: 'validaciones/reglas',
    keywords: ['validación', 'validacion', 'regla', 'restricción'],
    reach: 35,
    impact: 1,
    confidence: 0.8,
    effort: 2,
  },
  {
    risk: 'error técnico',
    keywords: ['error', '401', '404', '500', 'fallo', 'bug'],
    reach: 40,
    impact: 1,
    confidence: 0.5,
    effort: 1.5,
  },
  {
    risk: 'automatización',
    keywords: ['automatización', 'automatizacion', 'lineamiento'],
    reach: 15,
    impact: 0.5,
    confidence: 0.5,
    effort: 2,
  },
  {
    risk: 'plataforma core',
    keywords: ['tronador'],
    reach: 50,
    impact: 2,
    confidence: 0.5,
    effort: 2,
  },
  {
    risk: 'canal online cumplimiento',
    keywords: ['simon web'],
    requiredAll: ['simon web', 'cumplimiento'],
    reach: 40,
    impact: 1,
    confidence: 0.5,
    effort: 1.5,
  },
  {
    risk: 'canal web',
    keywords: ['simon web'],
    reach: 35,
    impact: 1,
    confidence: 0.5,
    effort: 1.5,
  },
  {
    risk: 'test',
    keywords: ['test'],
    exactMatch: true,
    reach: 1,
    impact: 0.25,
    confidence: 0.5,
    effort: 0.5,
  },
] as const
