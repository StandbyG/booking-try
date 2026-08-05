export interface ResourceResponse {
  id: number
  name: string
  description: string | null
  category: string | null
  slotDurationMinutes: number
  cancellationWindowHours: number
  active: boolean
  managedByUserId: number
}

export interface CreateResourceRequest {
  name: string
  description?: string
  category?: string
  slotDurationMinutes: number
  cancellationWindowHours: number
}

export interface UpdateResourceRequest {
  name: string
  description?: string
  category?: string
  slotDurationMinutes: number
  cancellationWindowHours: number
  active: boolean
}
