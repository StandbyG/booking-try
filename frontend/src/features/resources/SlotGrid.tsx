import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/date'
import type { SlotWithAvailability } from './slot-utils'

interface SlotGridProps {
  slots: SlotWithAvailability[]
  onSelectSlot?: (slot: SlotWithAvailability) => void
}

export function SlotGrid({ slots, onSelectSlot }: SlotGridProps) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este dia no tiene disponibilidad configurada para este recurso.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) =>
        slot.available && onSelectSlot ? (
          <button
            key={slot.start}
            type="button"
            onClick={() => onSelectSlot(slot)}
            className={cn(
              'rounded-full border border-green-600/40 px-2.5 py-0.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-600/10 dark:text-green-400',
            )}
          >
            {formatTime(slot.start)} - {formatTime(slot.end)}
          </button>
        ) : (
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
        ),
      )}
    </div>
  )
}
