export type Role = 'ADMIN' | 'CLIENT'

export interface UserResponse {
  id: number
  email: string
  fullName: string
  phone: string | null
  role: Role
}
