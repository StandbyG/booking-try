import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatDateLong, formatTime } from '@/lib/date'
import { getApiErrorMessage } from '@/lib/api-error'
import type { ReservationResponse } from '@/types'
import { useCancelReservationMutation } from './hooks'

interface CancelReservationDialogProps {
  reservation: ReservationResponse | null
  onOpenChange: (open: boolean) => void
}

export function CancelReservationDialog({
  reservation,
  onOpenChange,
}: CancelReservationDialogProps) {
  const [reason, setReason] = useState('')
  const mutation = useCancelReservationMutation()

  function handleConfirm() {
    if (!reservation) return
    mutation.mutate(
      { id: reservation.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Reserva cancelada')
          setReason('')
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <AlertDialog
      open={reservation !== null}
      onOpenChange={(open) => {
        if (!open) setReason('')
        onOpenChange(open)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {reservation && (
                <p className="capitalize">
                  {reservation.resourceName} · {formatDateLong(new Date(reservation.startTime))},{' '}
                  {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                </p>
              )}
              <Textarea
                placeholder="Motivo (opcional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={mutation.isPending}>
            {mutation.isPending ? 'Cancelando...' : 'Confirmar cancelacion'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
