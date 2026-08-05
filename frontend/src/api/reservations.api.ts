import { apiClient } from '@/lib/axios'
import type { CancelReservationRequest, CreateReservationRequest, ReservationResponse } from '@/types'

export async function createReservation(
  payload: CreateReservationRequest,
): Promise<ReservationResponse> {
  const { data } = await apiClient.post<ReservationResponse>('/reservations', payload)
  return data
}

export async function cancelReservation(
  id: number,
  payload: CancelReservationRequest = {},
): Promise<ReservationResponse> {
  const { data } = await apiClient.post<ReservationResponse>(
    `/reservations/${id}/cancel`,
    payload,
  )
  return data
}

export async function listMyReservations(): Promise<ReservationResponse[]> {
  const { data } = await apiClient.get<ReservationResponse[]>('/reservations/me')
  return data
}

export async function listReservationsByResource(
  resourceId: number,
): Promise<ReservationResponse[]> {
  const { data } = await apiClient.get<ReservationResponse[]>(
    `/resources/${resourceId}/reservations`,
  )
  return data
}
