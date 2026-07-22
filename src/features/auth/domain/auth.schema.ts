import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().trim().min(1, 'El email es obligatorio').email('Introduce un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})
export type SignInInput = z.infer<typeof signInSchema>

export const signUpSchema = z.object({
  organizationName: z.string().trim().min(2, 'El nombre de la organización es obligatorio'),
  email: z.string().trim().min(1, 'El email es obligatorio').email('Introduce un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})
export type SignUpInput = z.infer<typeof signUpSchema>
