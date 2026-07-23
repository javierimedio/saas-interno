import { z } from 'zod'

/**
 * Espejo de los enums de supabase/migrations/20260722120000_extensions_and_enums.sql.
 * Si el esquema cambia, este archivo y database.types.ts deben actualizarse juntos.
 */
export const EMPLOYMENT_STATUS = ['active', 'on_leave', 'offboarded'] as const
export const CONTRACT_TYPE = ['indefinido', 'temporal', 'practicas', 'freelance', 'obra_y_servicio'] as const
export const SALARY_CHANGE_REASON = ['hire', 'review', 'promotion', 'market_adjustment', 'correction'] as const
export const DOCUMENT_CATEGORY = ['contract', 'id_document', 'review', 'certificate', 'other'] as const
export const NOTE_VISIBILITY = ['manager_only', 'admin_only'] as const

export const CONTRACT_TYPE_LABELS: Record<(typeof CONTRACT_TYPE)[number], string> = {
  indefinido: 'Indefinido',
  temporal: 'Temporal',
  practicas: 'Prácticas',
  freelance: 'Freelance',
  obra_y_servicio: 'Obra y servicio',
}

export const EMPLOYMENT_STATUS_LABELS: Record<(typeof EMPLOYMENT_STATUS)[number], string> = {
  active: 'Activo',
  on_leave: 'Excedencia',
  offboarded: 'Baja',
}

const uuid = z.string().uuid('Selecciona una opción válida')

/**
 * Nota de implementación: se evita `.transform()` y `.default()` en los campos usados con
 * react-hook-form + zodResolver — con @hookform/resolvers v5, un esquema cuyo tipo de
 * entrada difiere del de salida (transform/default) rompe la inferencia genérica de
 * `Control`/`Resolver` a menos que el formulario declare explícitamente `z.input`/`z.output`.
 * Los campos "vacíos" (select en blanco, teléfono sin rellenar) se normalizan a `null` en el
 * repositorio, no en el esquema.
 */
const basePersonFields = {
  firstName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  lastName: z.string().trim().min(1, 'Los apellidos son obligatorios').max(100),
  email: z.string().trim().min(1, 'El email es obligatorio').email('Introduce un email válido'),
  phone: z.string().trim().max(30).optional(),
  positionTitle: z.string().trim().min(1, 'El puesto es obligatorio').max(150),
  departmentId: uuid.optional(),
  managerId: uuid.optional(),
  contractType: z.enum(CONTRACT_TYPE, { message: 'Selecciona un tipo de contrato' }),
  employeeCode: z.string().trim().max(50).optional(),
  birthDate: z.string().optional(),
}

export const createPersonSchema = z.object({
  ...basePersonFields,
  hireDate: z.string().min(1, 'La fecha de incorporación es obligatoria'),
  grossAnnualSalary: z.coerce
    .number({ message: 'Introduce un salario válido' })
    .positive('El salario debe ser mayor que 0'),
  currency: z.string().trim().length(3, 'Usa el código de 3 letras (EUR, USD…)'),
})

export type CreatePersonInput = z.infer<typeof createPersonSchema>

export const updatePersonSchema = z
  .object({
    id: uuid,
    ...basePersonFields,
    hireDate: z.string().min(1, 'La fecha de incorporación es obligatoria'),
  })
  .refine((data) => data.managerId !== data.id, {
    message: 'Una persona no puede ser su propio responsable',
    path: ['managerId'],
  })

export type UpdatePersonInput = z.infer<typeof updatePersonSchema>

export const offboardPersonSchema = z.object({
  id: uuid,
  terminationDate: z.string().min(1, 'La fecha de baja es obligatoria'),
})
export type OffboardPersonInput = z.infer<typeof offboardPersonSchema>

export const linkPersonToUserSchema = z.object({
  personId: uuid,
  userId: z.string().uuid('Selecciona un miembro válido'),
})
export type LinkPersonToUserInput = z.infer<typeof linkPersonToUserSchema>

export const salaryRecordSchema = z.object({
  personId: uuid,
  effectiveDate: z.string().min(1, 'La fecha de efecto es obligatoria'),
  grossAnnualSalary: z.coerce.number().positive('El salario debe ser mayor que 0'),
  currency: z.string().trim().length(3, 'Usa el código de 3 letras (EUR, USD…)'),
  reason: z.enum(['review', 'promotion', 'market_adjustment', 'correction'], {
    message: 'Selecciona un motivo',
  }),
  notes: z.string().trim().max(500).optional(),
})
export type SalaryRecordInput = z.infer<typeof salaryRecordSchema>

export const workingHoursRecordSchema = z.object({
  personId: uuid,
  effectiveDate: z.string().min(1, 'La fecha de efecto es obligatoria'),
  weeklyHours: z.coerce.number().positive('Indica las horas semanales').max(80, 'Revisa las horas semanales'),
  workingPercentage: z.coerce.number().positive().max(100, 'El porcentaje debe estar entre 0 y 100').optional(),
  reason: z.string().trim().min(1, 'Indica el motivo del cambio').max(200),
  notes: z.string().trim().max(500).optional(),
})
export type WorkingHoursRecordInput = z.infer<typeof workingHoursRecordSchema>

export const privateNoteSchema = z.object({
  personId: uuid,
  note: z.string().trim().min(1, 'La nota no puede estar vacía').max(2000),
  visibility: z.enum(NOTE_VISIBILITY),
})
export type PrivateNoteInput = z.infer<typeof privateNoteSchema>

export const documentMetadataSchema = z.object({
  personId: uuid,
  category: z.enum(DOCUMENT_CATEGORY),
})
export type DocumentMetadataInput = z.infer<typeof documentMetadataSchema>

export const peopleListFiltersSchema = z.object({
  q: z.string().trim().optional(),
  departmentId: z.string().uuid().optional(),
  status: z.enum(EMPLOYMENT_STATUS).optional(),
  page: z.coerce.number().int().min(1).default(1),
})
export type PeopleListFilters = z.infer<typeof peopleListFiltersSchema>
