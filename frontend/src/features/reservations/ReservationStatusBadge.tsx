import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReservationStatus } from '@/types'

const STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
}

const STATUS_CLASS: Record<ReservationStatus, string> = {
  PENDING: 'border-amber-600/40 text-amber-700 dark:text-amber-400',
  CONFIRMED: 'border-green-600/40 text-green-700 dark:text-green-400',
  CANCELLED: 'text-muted-foreground line-through opacity-60',
  COMPLETED: 'border-blue-600/40 text-blue-700 dark:text-blue-400',
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
