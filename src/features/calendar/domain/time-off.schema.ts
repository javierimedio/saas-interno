import { z } from 'zod'

export const TIME_OFF_TYPE = ['vacation', 'sick_leave', 'other'] as const
export const TIME_OFF_TYPE_LABELS: Record<(typeof TIME_OFF_TYPE)[number], string> = {
  vacation: 'Vacaciones',
  sick_leave: 'Baja médica',
  other: 'Otra ausencia',
}

const uuid = z.string().uuid('Selecciona una opción válida')

export const createTimeOffSchema = z
  .object({
    personId: uuid,
    type: z.enum(TIME_OFF_TYPE).default('vacation'),
    startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
    endDate: z.string().min(1, 'La fecha de fin es obligatoria'),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['endDate'],
  })
export type CreateTimeOffInput = z.infer<typeof createTimeOffSchema>

export const createHolidaySchema = z.object({
  date: z.string().min(1, 'La fecha es obligatoria'),
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(150),
})
export type CreateHolidayInput = z.infer<typeof createHolidaySchema>
