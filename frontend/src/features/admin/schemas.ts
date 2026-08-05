import { z } from 'zod'

export const resourceFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  category: z.string().optional(),
  slotDurationMinutes: z.number().int('Debe ser un numero entero').min(1, 'Debe ser mayor a 0'),
  cancellationWindowHours: z
    .number()
    .int('Debe ser un numero entero')
    .min(0, 'No puede ser negativo'),
  active: z.boolean(),
})

export type ResourceFormValues = z.infer<typeof resourceFormSchema>

export const DAY_OF_WEEK_OPTIONS = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miercoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sabado' },
  { value: 'SUNDAY', label: 'Domingo' },
] as const

export const availabilityFormSchema = z
  .object({
    dayOfWeek: z.enum([
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ]),
    startTime: z.string().min(1, 'Obligatorio'),
    endTime: z.string().min(1, 'Obligatorio'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Debe ser posterior al inicio',
    path: ['endTime'],
  })

export type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>
