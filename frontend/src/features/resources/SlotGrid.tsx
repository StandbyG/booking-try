import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/date'
import type { SlotWithAvailability } from './slot-utils'

export function SlotGrid({ slots }: { slots: SlotWithAvailability[] }) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este dia no tiene disponibilidad configurada para este recurso.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => (
        <Badge
          key={slot.start}
          variant={slot.available ? 'outline' : 'secondary'}
          className={
            slot.available
              ? 'border-green-600/40 text-green-700 dark:text-green-400'
              : 'text-muted-foreground line-through opacity-60'
          }
        >
          {formatTime(slot.start)} - {formatTime(slot.end)}
        </Badge>
      ))}
    </div>
  )
}
