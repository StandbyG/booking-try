import type { UserResponse } from './user'

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  user: UserResponse
}
