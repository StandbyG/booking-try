import type { UserResponse } from '@/types'

/**
 * Fuente de verdad del token/usuario de sesion, deliberadamente fuera de
 * React/Zustand. El cliente axios (este mismo modulo) y el store de Zustand
 * (punto 3) leen y escriben aca; asi el interceptor de axios no depende del
 * store de React y no hay ciclos de importacion entre lib/ y store/.
 */
const TOKEN_KEY = 'booking.accessToken'
const USER_KEY = 'booking.user'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): UserResponse | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserResponse
  } catch {
    return null
  }
}

export function setSession(token: string, user: UserResponse): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
