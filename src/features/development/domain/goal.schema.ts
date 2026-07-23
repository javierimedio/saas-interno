import { z } from 'zod'

export const GOAL_STATUS = ['on_track', 'at_risk', 'off_track', 'completed', 'cancelled'] as const
export const GOAL_STATUS_LABELS: Record<(typeof GOAL_STATUS)[number], string> = {
  on_track: 'En buen camino',
  at_risk: 'En riesgo',
  off_track: 'Desviado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const uuid = z.string().uuid('Selecciona una opción válida')

export const createGoalSchema = z
  .object({
    personId: uuid,
    title: z.string().trim().min(1, 'El título es obligatorio').max(200),
    description: z.string().trim().max(2000).optional(),
    category: z.string().trim().max(100).optional(),
    year: z.coerce.number().int().min(2000).max(2100),
    startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
    endDate: z.string().min(1, 'La fecha de fin es obligatoria'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['endDate'],
  })
export type CreateGoalInput = z.infer<typeof createGoalSchema>

export const updateGoalStatusSchema = z.object({
  id: uuid,
  status: z.enum(GOAL_STATUS),
})
export type UpdateGoalStatusInput = z.infer<typeof updateGoalStatusSchema>

export const addGoalCheckinSchema = z.object({
  goalId: uuid,
  progressPercent: z.coerce.number().min(0).max(100),
  comment: z.string().trim().max(1000).optional(),
})
export type AddGoalCheckinInput = z.infer<typeof addGoalCheckinSchema>
