import { describe, expect, it } from 'vitest'

import { createPersonSchema, salaryRecordSchema, updatePersonSchema } from '@/features/people/domain/person.schema'

const validCreateInput = {
  firstName: 'Laura',
  lastName: 'Martín',
  email: 'laura@example.com',
  phone: '',
  positionTitle: 'Growth Lead',
  hireDate: '2026-01-01',
  contractType: 'indefinido' as const,
  grossAnnualSalary: 31000,
  currency: 'EUR',
}

describe('createPersonSchema', () => {
  it('acepta un alta válida', () => {
    const result = createPersonSchema.safeParse(validCreateInput)
    expect(result.success).toBe(true)
  })

  it('rechaza un email inválido', () => {
    const result = createPersonSchema.safeParse({ ...validCreateInput, email: 'no-es-un-email' })
    expect(result.success).toBe(false)
  })

  it('rechaza un salario negativo o cero', () => {
    const result = createPersonSchema.safeParse({ ...validCreateInput, grossAnnualSalary: 0 })
    expect(result.success).toBe(false)
  })

  it('rechaza un tipo de contrato desconocido', () => {
    const result = createPersonSchema.safeParse({ ...validCreateInput, contractType: 'becario' })
    expect(result.success).toBe(false)
  })

  it('exige nombre y apellidos no vacíos', () => {
    expect(createPersonSchema.safeParse({ ...validCreateInput, firstName: '' }).success).toBe(false)
    expect(createPersonSchema.safeParse({ ...validCreateInput, lastName: '   ' }).success).toBe(false)
  })
})

describe('updatePersonSchema', () => {
  const id = '11111111-1111-4111-8111-111111111111'

  it('rechaza que una persona sea su propio responsable', () => {
    const result = updatePersonSchema.safeParse({
      id,
      firstName: 'Laura',
      lastName: 'Martín',
      email: 'laura@example.com',
      positionTitle: 'Growth Lead',
      hireDate: '2026-01-01',
      contractType: 'indefinido',
      managerId: id,
    })
    expect(result.success).toBe(false)
  })

  it('acepta un responsable distinto de sí misma', () => {
    const result = updatePersonSchema.safeParse({
      id,
      firstName: 'Laura',
      lastName: 'Martín',
      email: 'laura@example.com',
      positionTitle: 'Growth Lead',
      hireDate: '2026-01-01',
      contractType: 'indefinido',
      managerId: '22222222-2222-4222-8222-222222222222',
    })
    expect(result.success).toBe(true)
  })
})

describe('salaryRecordSchema', () => {
  it('no permite registrar el motivo "hire" manualmente (solo se crea en el alta)', () => {
    const result = salaryRecordSchema.safeParse({
      personId: '11111111-1111-4111-8111-111111111111',
      effectiveDate: '2026-01-01',
      grossAnnualSalary: 35000,
      currency: 'EUR',
      reason: 'hire',
    })
    expect(result.success).toBe(false)
  })

  it('acepta una revisión válida', () => {
    const result = salaryRecordSchema.safeParse({
      personId: '11111111-1111-4111-8111-111111111111',
      effectiveDate: '2026-01-01',
      grossAnnualSalary: 35000,
      currency: 'EUR',
      reason: 'review',
    })
    expect(result.success).toBe(true)
  })
})
