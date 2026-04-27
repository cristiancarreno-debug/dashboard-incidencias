import axios from 'axios'
import { PROXY_BASE_URL } from '@/config/constants'

/**
 * Instancia Axios preconfigurada para comunicarse con Jira
 * a través del Cloudflare Worker Proxy.
 */
export const jiraClient = axios.create({
  baseURL: PROXY_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Tipo de error estructurado retornado por el proxy. */
export interface ProxyErrorResponse {
  type: string
  status: number
  message: string
}

/**
 * Interceptor de respuesta: transforma errores HTTP en mensajes
 * estructurados sin exponer credenciales ni detalles internos.
 */
jiraClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0
      const data = error.response?.data as ProxyErrorResponse | undefined

      if (data?.message) {
        return Promise.reject(new Error(data.message))
      }

      if (status >= 500) {
        return Promise.reject(
          new Error('Error temporal del servidor. Intenta de nuevo en unos minutos.')
        )
      }

      if (status >= 400) {
        return Promise.reject(
          new Error('Error al consultar Jira. Verifica que los GDs seleccionados existen.')
        )
      }

      return Promise.reject(
        new Error('No se pudo conectar con Jira. Verifica tu conexión e intenta de nuevo.')
      )
    }

    return Promise.reject(error)
  }
)
