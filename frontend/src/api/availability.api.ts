import { apiClient } from '@/lib/axios'
import type { AvailabilityResponse, CreateAvailabilityRequest, TimeSlotResponse } from '@/types'

export async function listAvailability(resourceId: number): Promise<AvailabilityResponse[]> {
  const { data } = await apiClient.get<AvailabilityResponse[]>(
    `/resources/${resourceId}/availabilities`,
  )
  return data
}

export async function createAvailability(
  resourceId: number,
  payload: CreateAvailabilityRequest,
): Promise<AvailabilityResponse> {
  const { data } = await apiClient.post<AvailabilityResponse>(
    `/resources/${resourceId}/availabilities`,
    payload,
  )
  return data
}

export async function deleteAvailability(id: number): Promise<void> {
  await apiClient.delete(`/availabilities/${id}`)
}

/** from/to en formato "yyyy-MM-dd". */
export async function getAvailableSlots(
  resourceId: number,
  from: string,
  to: string,
): Promise<TimeSlotResponse[]> {
  const { data } = await apiClient.get<TimeSlotResponse[]>(`/resources/${resourceId}/slots`, {
    params: { from, to },
  })
  return data
}
