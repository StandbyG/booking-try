export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface AvailabilityResponse {
  id: number
  resourceId: number
  dayOfWeek: DayOfWeek
  /** "HH:mm:ss", tal como lo serializa java.time.LocalTime */
  startTime: string
  endTime: string
}

export interface CreateAvailabilityRequest {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

export interface TimeSlotResponse {
  /** ISO LocalDateTime, ej. "2026-08-12T10:00:00" */
  start: string
  end: string
}
