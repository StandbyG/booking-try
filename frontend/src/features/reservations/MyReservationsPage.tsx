import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateLong, formatTime } from '@/lib/date'
import { getApiErrorMessage } from '@/lib/api-error'
import type { ReservationResponse } from '@/types'
import { CancelReservationDialog } from './CancelReservationDialog'
import { useMyReservationsQuery } from './hooks'
import { ReservationStatusBadge } from './ReservationStatusBadge'

const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED'])

export function MyReservationsPage() {
  const { data: reservations, isPending, isError, error } = useMyReservationsQuery()
  const [reservationToCancel, setReservationToCancel] = useState<ReservationResponse | null>(null)

  if (isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-destructive">{getApiErrorMessage(error)}</p>
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Mis reservas</h1>

      {reservations.length === 0 ? (
        <p className="text-muted-foreground">Todavia no tenes reservas.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{reservation.resourceName}</p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {formatDateLong(new Date(reservation.startTime))},{' '}
                    {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                  </p>
                  {reservation.status === 'CANCELLED' && reservation.cancellationReason && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Motivo: {reservation.cancellationReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ReservationStatusBadge status={reservation.status} />
                  {CANCELLABLE_STATUSES.has(reservation.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReservationToCancel(reservation)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CancelReservationDialog
        reservation={reservationToCancel}
        onOpenChange={(open) => !open && setReservationToCancel(null)}
      />
    </div>
  )
}
