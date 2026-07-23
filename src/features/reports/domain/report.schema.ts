import { z } from 'zod'

export const EMPLOYEE_REPORT_TYPE = ['employee_summary', 'employee_annual', 'employee_full'] as const
export const REPORT_TYPE_LABELS: Record<string, string> = {
  one_on_one_pdf: 'Acta de One2One',
  employee_summary: 'Resumen de empleado',
  employee_annual: 'Informe anual',
  employee_full: 'Informe completo',
}

const uuid = z.string().uuid('Selecciona una opción válida')

export const generateOneOnOneReportSchema = z.object({
  oneOnOneId: uuid,
})
export type GenerateOneOnOneReportInput = z.infer<typeof generateOneOnOneReportSchema>

export const generateEmployeeReportSchema = z.object({
  personId: uuid,
  type: z.enum(EMPLOYEE_REPORT_TYPE),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
})
export type GenerateEmployeeReportInput = z.infer<typeof generateEmployeeReportSchema>
