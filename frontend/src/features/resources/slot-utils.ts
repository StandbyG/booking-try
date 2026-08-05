import { format } from 'date-fns'
import { dayOfWeekFromDate } from '@/lib/date'
import type { AvailabilityResponse, TimeSlotResponse } from '@/types'

export interface CandidateSlot {
  start: string
  end: string
}

export interface SlotWithAvailability extends CandidateSlot {
  available: boolean
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function atMinutesFromMidnight(date: Date, minutes: number): string {
  const result = new Date(date)
  result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return format(result, "yyyy-MM-dd'T'HH:mm:ss")
}

/**
 * Reconstruye la misma grilla de slots que generaria el backend
 * (SlotServiceImpl.generateSlotsForRule) para un dia puntual, combinando las
 * reglas de Availability con la duracion de slot del resource. El backend
 * solo devuelve los slots LIBRES; esto nos deja calcular tambien los
 * ocupados (candidatos que no aparecen en la respuesta) para el requisito
 * de "slots libres vs ocupados".
 */
export function generateCandidateSlotsForDate(
  date: Date,
  rules: AvailabilityResponse[],
  slotDurationMinutes: number,
): CandidateSlot[] {
  const dayOfWeek = dayOfWeekFromDate(date)
  const slots: CandidateSlot[] = []

  for (const rule of rules) {
    if (rule.dayOfWeek !== dayOfWeek) continue

    const endMinutes = timeToMinutes(rule.endTime)
    let cursor = timeToMinutes(rule.startTime)

    while (cursor + slotDurationMinutes <= endMinutes) {
      slots.push({
        start: atMinutesFromMidnight(date, cursor),
        end: atMinutesFromMidnight(date, cursor + slotDurationMinutes),
      })
      cursor += slotDurationMinutes
    }
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start))
}

export function markAvailability(
  candidates: CandidateSlot[],
  freeSlots: TimeSlotResponse[],
): SlotWithAvailability[] {
  const freeStarts = new Set(freeSlots.map((slot) => slot.start))
  return candidates.map((slot) => ({ ...slot, available: freeStarts.has(slot.start) }))
}
