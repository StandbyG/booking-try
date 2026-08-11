import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateLong, formatTime } from '@/lib/date'
import { getApiErrorMessage } from '@/lib/api-error'
import { ReservationStatusBadge } from '@/features/reservations/ReservationStatusBadge'
import { useAdminCancelReservationMutation, useResourceReservationsQuery } from './hooks'

const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED'])

export function ResourceReservationsTable({ resourceId }: { resourceId: number }) {
  const { data: reservations, isPending, isError, error } = useResourceReservationsQuery(resourceId)
  const cancelMutation = useAdminCancelReservationMutation()

  function handleCancel(id: number) {
    cancelMutation.mutate(
      { id, resourceId },
      {
        onSuccess: () => toast.success('Reserva cancelada'),
        onError: (err) => toast.error(getApiErrorMessage(err)),
      },
    )
  }

  if (isPending) return <Skeleton className="h-32 w-full" />
  if (isError) return <p className="text-destructive">{getApiErrorMessage(error)}</p>
  if (reservations.length === 0) {
    return <p className="text-sm text-muted-foreground">Este recurso todavia no tiene reservas.</p>
  }

  return (
    <>
      {/* Mobile: cards apiladas. Desktop (sm+): tabla. Mismo motivo que en
          AdminResourceListPage: en una tabla angosta el boton "Cancelar" queda
          fuera de pantalla y solo accesible con scroll horizontal. */}
      <div className="space-y-3 sm:hidden">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{reservation.clientFullName}</p>
                <p className="text-sm capitalize text-muted-foreground">
                  {formatDateLong(new Date(reservation.startTime))},{' '}
                  {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <ReservationStatusBadge status={reservation.status} />
                {CANCELLABLE_STATUSES.has(reservation.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(reservation.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.clientFullName}</TableCell>
                <TableCell className="capitalize">
                  {formatDateLong(new Date(reservation.startTime))}, {formatTime(reservation.startTime)}{' '}
                  - {formatTime(reservation.endTime)}
                </TableCell>
                <TableCell>
                  <ReservationStatusBadge status={reservation.status} />
                </TableCell>
                <TableCell className="text-right">
                  {CANCELLABLE_STATUSES.has(reservation.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(reservation.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
