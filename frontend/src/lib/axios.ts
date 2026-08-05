import axios from 'axios'
import { clearSession, getAccessToken } from './auth-token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Sin refresh token (decision tomada explicitamente: el backend actual solo
 * emite un accessToken de corta duracion, sin endpoint de refresh). Ante un
 * 401 -no importa si es "no autenticado" o "token vencido"- se limpia la
 * sesion y se fuerza un hard-redirect a /login. Es un redirect de pagina
 * completa (no useNavigate) a proposito: este interceptor corre fuera del
 * arbol de React y no tiene acceso al router.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      clearSession()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
