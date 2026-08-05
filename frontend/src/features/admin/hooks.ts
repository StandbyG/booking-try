import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { availabilityApi, reservationsApi, resourcesApi } from '@/api'
import type { CreateAvailabilityRequest, CreateResourceRequest, UpdateResourceRequest } from '@/types'

export function useAllResourcesQuery() {
  return useQuery({
    queryKey: ['admin', 'resources'],
    queryFn: resourcesApi.listAllResources,
  })
}

function useInvalidateResourceQueries() {
  const queryClient = useQueryClient()
  return (resourceId?: number) => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
    queryClient.invalidateQueries({ queryKey: ['resources'] })
    if (resourceId) queryClient.invalidateQueries({ queryKey: ['resources', resourceId] })
  }
}

export function useCreateResourceMutation() {
  const invalidate = useInvalidateResourceQueries()
  return useMutation({
    mutationFn: (payload: CreateResourceRequest) => resourcesApi.createResource(payload),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateResourceMutation() {
  const invalidate = useInvalidateResourceQueries()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateResourceRequest }) =>
      resourcesApi.updateResource(id, payload),
    onSuccess: (resource) => invalidate(resource.id),
  })
}

export function useDeactivateResourceMutation() {
  const invalidate = useInvalidateResourceQueries()
  return useMutation({
    mutationFn: (id: number) => resourcesApi.deactivateResource(id),
    onSuccess: (_data, id) => invalidate(id),
  })
}

export function useCreateAvailabilityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      resourceId,
      payload,
    }: {
      resourceId: number
      payload: CreateAvailabilityRequest
    }) => availabilityApi.createAvailability(resourceId, payload),
    onSuccess: (availability) => {
      queryClient.invalidateQueries({ queryKey: ['availability', availability.resourceId] })
    },
  })
}

export function useDeleteAvailabilityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; resourceId: number }) =>
      availabilityApi.deleteAvailability(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['availability', variables.resourceId] })
    },
  })
}

export function useResourceReservationsQuery(resourceId: number) {
  return useQuery({
    queryKey: ['admin', 'reservations', resourceId],
    queryFn: () => reservationsApi.listReservationsByResource(resourceId),
    enabled: Number.isFinite(resourceId),
  })
}

export function useAdminCancelReservationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; resourceId: number }) =>
      reservationsApi.cancelReservation(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations', variables.resourceId] })
    },
  })
}
