import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { dayOfWeekFromDate, formatDateLong, toDateParam } from '@/lib/date'
import { getApiErrorMessage } from '@/lib/api-error'
import { useAvailabilityQuery, useAvailableSlotsQuery, useResourceQuery } from './hooks'
import { generateCandidateSlotsForDate, markAvailability } from './slot-utils'
import { SlotGrid } from './SlotGrid'

const MAX_DAYS_AHEAD = 90

function startOfToday(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

export function ResourceDetailPage() {
  const params = useParams<{ id: string }>()
  const resourceId = Number(params.id)

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())

  const resourceQuery = useResourceQuery(resourceId)
  const availabilityQuery = useAvailabilityQuery(resourceId)
  const dateParam = toDateParam(selectedDate)
  const slotsQuery = useAvailableSlotsQuery(resourceId, dateParam, dateParam)

  const allowedDaysOfWeek = useMemo(
    () => new Set((availabilityQuery.data ?? []).map((rule) => rule.dayOfWeek)),
    [availabilityQuery.data],
  )

  const slotsWithAvailability = useMemo(() => {
    if (!resourceQuery.data || !availabilityQuery.data || !slotsQuery.data) return []
    const candidates = generateCandidateSlotsForDate(
      selectedDate,
      availabilityQuery.data,
      resourceQuery.data.slotDurationMinutes,
    )
    return markAvailability(candidates, slotsQuery.data)
  }, [resourceQuery.data, availabilityQuery.data, slotsQuery.data, selectedDate])

  if (resourceQuery.isPending || availabilityQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    )
  }

  if (resourceQuery.isError) {
    return <p className="text-destructive">{getApiErrorMessage(resourceQuery.error)}</p>
  }

  const resource = resourceQuery.data
  const today = startOfToday()
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{resource.name}</h1>
          {resource.category && <Badge variant="secondary">{resource.category}</Badge>}
        </div>
        {resource.description && (
          <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Slots de {resource.slotDurationMinutes} min · cancelacion con{' '}
          {resource.cancellationWindowHours}h de anticipacion
        </p>
      </div>

      {allowedDaysOfWeek.size === 0 ? (
        <p className="text-muted-foreground">
          Este recurso todavia no tiene disponibilidad configurada.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) =>
              date < today || date > maxDate || !allowedDaysOfWeek.has(dayOfWeekFromDate(date))
            }
            className="rounded-lg border"
          />
          <div>
            <h2 className="mb-3 font-medium capitalize">{formatDateLong(selectedDate)}</h2>
            {slotsQuery.isPending ? (
              <Skeleton className="h-24 w-full" />
            ) : slotsQuery.isError ? (
              <p className="text-destructive">{getApiErrorMessage(slotsQuery.error)}</p>
            ) : (
              <SlotGrid slots={slotsWithAvailability} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
