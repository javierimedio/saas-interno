import { z } from 'zod'

import { ONE_ON_ONE_TEMPLATE } from './one-on-one-templates'

export const ONE_ON_ONE_STATUS = ['scheduled', 'preparing', 'in_progress', 'completed', 'cancelled'] as const
export const MEETING_MODE = ['in_person', 'video', 'phone'] as const
export const BLOCK_STATUS = ['pending', 'in_progress', 'completed'] as const

export const BLOCK_STATUS_LABELS: Record<(typeof BLOCK_STATUS)[number], string> = {
  pending: 'Pendiente',
  in_progress: 'En edición',
  completed: 'Completado',
}

export const ONE_ON_ONE_STATUS_LABELS: Record<(typeof ONE_ON_ONE_STATUS)[number], string> = {
  scheduled: 'Programado',
  preparing: 'Preparación',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export const MEETING_MODE_LABELS: Record<(typeof MEETING_MODE)[number], string> = {
  in_person: 'Presencial',
  video: 'Videollamada',
  phone: 'Teléfono',
}

const uuid = z.string().uuid('Selecciona una opción válida')

export const scheduleOneOnOneSchema = z.object({
  personId: uuid,
  scheduledAt: z.string().min(1, 'La fecha es obligatoria'),
  mode: z.enum(MEETING_MODE),
  templateKey: z.enum(ONE_ON_ONE_TEMPLATE),
  customBlockKeys: z.array(z.string()).optional(),
})
export type ScheduleOneOnOneInput = z.infer<typeof scheduleOneOnOneSchema>

export const updateOneOnOneSchema = z.object({
  id: uuid,
  scheduledAt: z.string().min(1, 'La fecha es obligatoria'),
  mode: z.enum(MEETING_MODE),
})
export type UpdateOneOnOneInput = z.infer<typeof updateOneOnOneSchema>

export const closeOneOnOneSchema = z.object({
  id: uuid,
  managerComments: z.string().trim().max(4000).optional(),
  overallRating: z.coerce.number().int().min(1).max(5).optional(),
  nextMeetingSuggestedAt: z.string().optional(),
})
export type CloseOneOnOneInput = z.infer<typeof closeOneOnOneSchema>

export const cancelOneOnOneSchema = z.object({
  id: uuid,
})
export type CancelOneOnOneInput = z.infer<typeof cancelOneOnOneSchema>

export const addAgendaItemSchema = z.object({
  oneOnOneId: uuid,
  topic: z.string().trim().min(1, 'El tema no puede estar vacío').max(300),
})
export type AddAgendaItemInput = z.infer<typeof addAgendaItemSchema>

export const toggleAgendaItemSchema = z.object({
  id: uuid,
  discussed: z.boolean(),
})
export type ToggleAgendaItemInput = z.infer<typeof toggleAgendaItemSchema>

export const removeAgendaItemSchema = z.object({
  id: uuid,
})
export type RemoveAgendaItemInput = z.infer<typeof removeAgendaItemSchema>

export const addAgreementSchema = z.object({
  oneOnOneId: uuid,
  description: z.string().trim().min(1, 'El acuerdo no puede estar vacío').max(1000),
})
export type AddAgreementInput = z.infer<typeof addAgreementSchema>

/** Contenido narrativo del One2One (docs/product-design/02-user-experience.md §2.4): un bloque por
 * `block_key` resuelto al crear la reunión; el resto de datos (acciones, valoración...) sigue en
 * sus propias columnas/tablas. `version` facilita evolucionar la forma sin migrar el histórico. */
export const blockDataSchema = z.object({
  status: z.enum(BLOCK_STATUS),
  fields: z.record(z.string(), z.string()),
})
export type BlockData = z.infer<typeof blockDataSchema>

export const meetingDataSchema = z.object({
  version: z.literal(1),
  blocks: z.record(z.string(), blockDataSchema),
})
export type MeetingData = z.infer<typeof meetingDataSchema>

export const updateMeetingDataSchema = z.object({
  id: uuid,
  meetingData: meetingDataSchema,
})
export type UpdateMeetingDataInput = z.infer<typeof updateMeetingDataSchema>

export const updateFeedbackSchema = z.object({
  id: uuid,
  managerComments: z.string().trim().max(4000).optional(),
  employeeComments: z.string().trim().max(4000).optional(),
})
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>

export const updateNextMeetingSchema = z.object({
  id: uuid,
  nextMeetingSuggestedAt: z.string().optional(),
})
export type UpdateNextMeetingInput = z.infer<typeof updateNextMeetingSchema>

export const meetingListFiltersSchema = z.object({
  personId: z.string().uuid().optional(),
  status: z.enum(ONE_ON_ONE_STATUS).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
})
export type MeetingListFilters = z.infer<typeof meetingListFiltersSchema>
