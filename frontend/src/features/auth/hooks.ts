import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api'
import { useAuthStore } from '@/store/auth.store'
import type { LoginRequest, RegisterRequest } from '@/types'

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => setSession(data.accessToken, data.user),
  })
}

export function useRegisterMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    onSuccess: (data) => setSession(data.accessToken, data.user),
  })
}
