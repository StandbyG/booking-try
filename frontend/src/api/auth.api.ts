import { apiClient } from '@/lib/axios'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
  return data
}
