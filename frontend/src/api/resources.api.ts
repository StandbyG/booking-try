import { apiClient } from '@/lib/axios'
import type { CreateResourceRequest, ResourceResponse, UpdateResourceRequest } from '@/types'

export async function listResources(): Promise<ResourceResponse[]> {
  const { data } = await apiClient.get<ResourceResponse[]>('/resources')
  return data
}

export async function getResource(id: number): Promise<ResourceResponse> {
  const { data } = await apiClient.get<ResourceResponse>(`/resources/${id}`)
  return data
}

export async function createResource(payload: CreateResourceRequest): Promise<ResourceResponse> {
  const { data } = await apiClient.post<ResourceResponse>('/resources', payload)
  return data
}

export async function updateResource(
  id: number,
  payload: UpdateResourceRequest,
): Promise<ResourceResponse> {
  const { data } = await apiClient.put<ResourceResponse>(`/resources/${id}`, payload)
  return data
}

export async function deactivateResource(id: number): Promise<void> {
  await apiClient.delete(`/resources/${id}`)
}
