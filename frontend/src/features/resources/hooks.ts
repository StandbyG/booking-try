import { useQuery } from '@tanstack/react-query'
import { availabilityApi, resourcesApi } from '@/api'

export function useResourcesQuery() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: resourcesApi.listResources,
  })
}

export function useResourceQuery(resourceId: number) {
  return useQuery({
    queryKey: ['resources', resourceId],
    queryFn: () => resourcesApi.getResource(resourceId),
    enabled: Number.isFinite(resourceId),
  })
}

export function useAvailabilityQuery(resourceId: number) {
  return useQuery({
    queryKey: ['availability', resourceId],
    queryFn: () => availabilityApi.listAvailability(resourceId),
    enabled: Number.isFinite(resourceId),
  })
}

export function useAvailableSlotsQuery(resourceId: number, from: string, to: string) {
  return useQuery({
    queryKey: ['slots', resourceId, from, to],
    queryFn: () => availabilityApi.getAvailableSlots(resourceId, from, to),
    enabled: Number.isFinite(resourceId),
  })
}
