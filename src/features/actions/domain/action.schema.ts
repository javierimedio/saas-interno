import { z } from 'zod'

export const ACTION_STATUS = ['pending', 'in_progress', 'blocked', 'completed', 'cancelled'] as const
export const ACTION_PRIORITY = ['low', 'medium', 'high', 'urgent'] as const

export const ACTION_STATUS_LABELS: Record<(typeof ACTION_STATUS)[number], string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  blocked: 'Bloqueada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export const ACTION_PRIORITY_LABELS: Record<(typeof ACTION_PRIORITY)[number], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

const uuid = z.string().uuid('Selecciona una opción válida')

export const createActionSchema = z.object({
  personId: uuid,
  assigneeId: uuid,
  oneOnOneId: uuid.optional(),
  title: z.string().trim().min(1, 'El título es obligatorio').max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(ACTION_PRIORITY),
  dueDate: z.string().optional(),
})
export type CreateActionInput = z.infer<typeof createActionSchema>

export const changeActionStatusSchema = z
  .object({
    id: uuid,
    status: z.enum(ACTION_STATUS),
    blockedReason: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.status !== 'blocked' || !!data.blockedReason, {
    message: 'Indica el motivo del bloqueo',
    path: ['blockedReason'],
  })
export type ChangeActionStatusInput = z.infer<typeof changeActionStatusSchema>

export const updateActionSchema = z.object({
  id: uuid,
  title: z.string().trim().min(1, 'El título es obligatorio').max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(ACTION_PRIORITY),
  dueDate: z.string().optional(),
  assigneeId: uuid,
})
export type UpdateActionInput = z.infer<typeof updateActionSchema>

export const addActionCommentSchema = z.object({
  actionId: uuid,
  comment: z.string().trim().min(1, 'El comentario no puede estar vacío').max(2000),
})
export type AddActionCommentInput = z.infer<typeof addActionCommentSchema>

export const actionListFiltersSchema = z.object({
  personId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(ACTION_PRIORITY).optional(),
  overdueOnly: z.coerce.boolean().optional(),
})
export type ActionListFilters = z.infer<typeof actionListFiltersSchema>
