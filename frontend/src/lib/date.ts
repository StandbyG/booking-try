import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DayOfWeek } from '@/types'

const JS_DAY_TO_DAY_OF_WEEK: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

/** java.time.DayOfWeek equivalente al Date.getDay() de JS (0=domingo). */
export function dayOfWeekFromDate(date: Date): DayOfWeek {
  return JS_DAY_TO_DAY_OF_WEEK[date.getDay()]
}

/** "yyyy-MM-dd", el formato que espera el query param from/to del backend. */
export function toDateParam(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Hora legible a partir de un LocalDateTime o LocalTime ISO ("...T10:00:00" o "10:00:00"). */
export function formatTime(isoDateTimeOrTime: string): string {
  const timePart = isoDateTimeOrTime.includes('T')
    ? isoDateTimeOrTime.split('T')[1]
    : isoDateTimeOrTime
  return timePart.slice(0, 5)
}

export function formatDateLong(date: Date): string {
  return format(date, "EEEE d 'de' MMMM", { locale: es })
}
