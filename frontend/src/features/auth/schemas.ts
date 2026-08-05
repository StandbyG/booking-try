import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('El email no tiene un formato valido'),
  password: z.string().min(1, 'La contrasena es obligatoria'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('El email no tiene un formato valido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  fullName: z.string().min(1, 'El nombre completo es obligatorio'),
  phone: z.string().optional(),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
