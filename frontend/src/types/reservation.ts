export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface ReservationResponse {
  id: number
  resourceId: number
  resourceName: string
  clientId: number
  clientFullName: string
  /** ISO LocalDateTime, ej. "2026-08-12T10:00:00" */
  startTime: string
  endTime: string
  status: ReservationStatus
  cancelledAt: string | null
  cancellationReason: string | null
}

export interface CreateReservationRequest {
  resourceId: number
  startTime: string
}

export interface CancelReservationRequest {
  reason?: string
}
