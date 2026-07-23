'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import {
  createPersonWithInitialSalary,
  listAllPeople,
  updatePerson,
} from '@/features/people/infrastructure/people.repository'
import { createDepartment, listDepartments } from '@/features/people/infrastructure/departments.repository'
import type { ParsedImportRow } from '../domain/import.rules'

export type ImportSummary = {
  created: number
  failed: { row: number; name: string; reason: string }[]
}

export async function importPeopleAction(rows: ParsedImportRow[]): Promise<Result<ImportSummary>> {
  const session = await requireCurrentSession()
  const supabase = await createClient()

  const validRows = rows.filter((r) => r.errors.length === 0)
  const failed: ImportSummary['failed'] = rows
    .filter((r) => r.errors.length > 0)
    .map((r) => ({ row: r.index + 1, name: `${r.firstName} ${r.lastName}`.trim() || '(sin nombre)', reason: r.errors.join('; ') }))

  if (validRows.length === 0) {
    return ok({ created: 0, failed })
  }

  try {
    const departments = await listDepartments(supabase, session.organizationId)
    const departmentIdByName = new Map(departments.map((d) => [d.name.toLowerCase(), d.id]))

    async function resolveDepartmentId(name: string | null): Promise<string | undefined> {
      if (!name) return undefined
      const existing = departmentIdByName.get(name.toLowerCase())
      if (existing) return existing
      const created = await createDepartment(supabase, session.organizationId, name)
      departmentIdByName.set(name.toLowerCase(), created.id)
      return created.id
    }

    const createdRows: { row: ParsedImportRow; personId: string }[] = []

    for (const row of validRows) {
      try {
        const departmentId = await resolveDepartmentId(row.departmentName)
        const person = await createPersonWithInitialSalary(supabase, session.organizationId, {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone || undefined,
          positionTitle: row.positionTitle,
          departmentId,
          managerId: undefined,
          contractType: row.contractType ?? 'indefinido',
          hireDate: row.hireDate as string,
          grossAnnualSalary: row.grossAnnualSalary as number,
          currency: row.currency,
          employeeCode: row.employeeCode || undefined,
          birthDate: row.birthDate || undefined,
        })

        createdRows.push({ row, personId: person.id })
      } catch (error) {
        failed.push({
          row: row.index + 1,
          name: `${row.firstName} ${row.lastName}`,
          reason: error instanceof Error ? error.message : 'Error desconocido al crear la persona',
        })
      }
    }

    // Segunda pasada: enlazar managers por email, ahora que todas las personas del fichero existen.
    const rowsWithManager = createdRows.filter((c) => c.row.managerEmail)
    if (rowsWithManager.length > 0) {
      const allPeople = await listAllPeople(supabase, session.organizationId)
      const personIdByEmail = new Map(allPeople.map((p) => [p.email.toLowerCase(), p]))

      for (const { row, personId } of rowsWithManager) {
        const manager = personIdByEmail.get((row.managerEmail as string).toLowerCase())
        if (!manager || manager.id === personId) continue
        const person = allPeople.find((p) => p.id === personId)
        if (!person) continue
        try {
          await updatePerson(supabase, {
            id: personId,
            firstName: person.first_name,
            lastName: person.last_name,
            email: person.email,
            phone: person.phone ?? undefined,
            positionTitle: person.position_title,
            departmentId: person.department_id ?? undefined,
            managerId: manager.id,
            contractType: person.contract_type,
            hireDate: person.hire_date,
            employeeCode: person.employee_code ?? undefined,
            birthDate: person.birth_date ?? undefined,
          })
        } catch {
          // El enlace de manager es un "nice to have": si falla, la persona queda creada sin manager.
        }
      }
    }

    revalidatePath('/people')
    revalidatePath('/import')
    return ok({ created: createdRows.length, failed })
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo completar la importación')
  }
}
