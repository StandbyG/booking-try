import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reservationsApi } from '@/api'
import type { CreateReservationRequest } from '@/types'

export function useMyReservationsQuery() {
  return useQuery({
    queryKey: ['reservations', 'me'],
    queryFn: reservationsApi.listMyReservations,
  })
}

export function useCreateReservationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReservationRequest) => reservationsApi.createReservation(payload),
    onSettled: (_data, _error, variables) => {
      // Se invalida tanto en exito como en error: un 409 significa que OTRO
      // usuario tomo el slot justo antes, asi que el cache de slots de este
      // resource quedo stale de cualquier manera y hay que refrescarlo para
      // que la grilla muestre ese slot como ocupado.
      queryClient.invalidateQueries({ queryKey: ['slots', variables.resourceId] })
      queryClient.invalidateQueries({ queryKey: ['reservations', 'me'] })
    },
  })
}

export function useCancelReservationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      reservationsApi.cancelReservation(id, { reason }),
    onSuccess: (reservation) => {
      queryClient.invalidateQueries({ queryKey: ['reservations', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['slots', reservation.resourceId] })
    },
  })
}
