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
import { formatDateLong, formatTime } from '@/lib/date'
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api-error'
import type { CandidateSlot } from '@/features/resources/slot-utils'
import { useCreateReservationMutation } from './hooks'

interface ReserveSlotDialogProps {
  resourceId: number
  slot: CandidateSlot | null
  onOpenChange: (open: boolean) => void
}

export function ReserveSlotDialog({ resourceId, slot, onOpenChange }: ReserveSlotDialogProps) {
  const mutation = useCreateReservationMutation()

  function handleConfirm() {
    if (!slot) return
    mutation.mutate(
      { resourceId, startTime: slot.start },
      {
        onSuccess: () => toast.success('Reserva confirmada'),
        onError: (error) => {
          if (getApiErrorStatus(error) === 409) {
            toast.error('Este horario ya fue reservado por otra persona. Elegi otro horario.')
          } else {
            toast.error(getApiErrorMessage(error))
          }
        },
      },
    )
  }

  return (
    <AlertDialog open={slot !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar reserva</AlertDialogTitle>
          <AlertDialogDescription>
            {slot && (
              <span className="capitalize">
                {formatDateLong(new Date(slot.start))}, {formatTime(slot.start)} -{' '}
                {formatTime(slot.end)}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={mutation.isPending}>
            {mutation.isPending ? 'Reservando...' : 'Confirmar reserva'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
