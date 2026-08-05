import { create } from 'zustand'
import type { UserResponse } from '@/types'
import { clearSession, getAccessToken, getStoredUser, setSession } from '@/lib/auth-token'

interface AuthState {
  user: UserResponse | null
  accessToken: string | null
  isAuthenticated: boolean
  setSession: (token: string, user: UserResponse) => void
  logout: () => void
}

/**
 * Wrapper reactivo sobre lib/auth-token.ts (la fuente de verdad real, en
 * localStorage). El estado inicial se lee de ahi para que una recarga de
 * pagina no pierda la sesion.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  accessToken: getAccessToken(),
  isAuthenticated: getAccessToken() !== null,

  setSession: (token, user) => {
    setSession(token, user)
    set({ accessToken: token, user, isAuthenticated: true })
  },

  logout: () => {
    clearSession()
    set({ accessToken: null, user: null, isAuthenticated: false })
  },
}))

export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'ADMIN')
