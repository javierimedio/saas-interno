import { z } from 'zod'

export const renameOrganizationSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(150),
})
export type RenameOrganizationInput = z.infer<typeof renameOrganizationSchema>

export const renameDepartmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, 'El nombre es obligatorio').max(150),
})
export type RenameDepartmentInput = z.infer<typeof renameDepartmentSchema>
