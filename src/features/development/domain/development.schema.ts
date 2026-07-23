import { z } from 'zod'

const uuid = z.string().uuid('Selecciona una opción válida')

export const TRAINING_STATUS = ['planned', 'in_progress', 'completed', 'cancelled'] as const
export const TRAINING_STATUS_LABELS: Record<(typeof TRAINING_STATUS)[number], string> = {
  planned: 'Planificada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export const createCompetencySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(150),
  description: z.string().trim().max(1000).optional(),
})
export type CreateCompetencyInput = z.infer<typeof createCompetencySchema>

export const assessCompetencySchema = z.object({
  personId: uuid,
  competencyId: uuid,
  level: z.coerce.number().int().min(1).max(5),
  notes: z.string().trim().max(1000).optional(),
})
export type AssessCompetencyInput = z.infer<typeof assessCompetencySchema>

export const createTrainingSchema = z.object({
  personId: uuid,
  title: z.string().trim().min(1, 'El título es obligatorio').max(200),
  provider: z.string().trim().max(150).optional(),
  status: z.enum(TRAINING_STATUS).default('planned'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
export type CreateTrainingInput = z.infer<typeof createTrainingSchema>

export const updateTrainingStatusSchema = z.object({
  id: uuid,
  status: z.enum(TRAINING_STATUS),
})
export type UpdateTrainingStatusInput = z.infer<typeof updateTrainingStatusSchema>

export const createCareerPlanSchema = z.object({
  personId: uuid,
  targetPosition: z.string().trim().min(1, 'El puesto objetivo es obligatorio').max(200),
  notes: z.string().trim().max(2000).optional(),
})
export type CreateCareerPlanInput = z.infer<typeof createCareerPlanSchema>

export const addCareerMilestoneSchema = z.object({
  careerPlanId: uuid,
  title: z.string().trim().min(1, 'El hito no puede estar vacío').max(200),
  targetDate: z.string().optional(),
})
export type AddCareerMilestoneInput = z.infer<typeof addCareerMilestoneSchema>

export const addFeedbackSchema = z.object({
  personId: uuid,
  text: z.string().trim().min(1, 'El feedback no puede estar vacío').max(2000),
  visibility: z.enum(['manager_only', 'shared_with_employee']).default('manager_only'),
})
export type AddFeedbackInput = z.infer<typeof addFeedbackSchema>

export const addEvaluationSchema = z.object({
  personId: uuid,
  period: z.string().trim().min(1, 'El periodo es obligatorio').max(50),
  result: z.string().trim().min(1, 'El resultado es obligatorio').max(200),
  notes: z.string().trim().max(2000).optional(),
})
export type AddEvaluationInput = z.infer<typeof addEvaluationSchema>
