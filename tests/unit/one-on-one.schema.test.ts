import { describe, expect, it } from 'vitest'

import { closeOneOnOneSchema } from '@/features/one-on-ones/domain/one-on-one.schema'

const baseInput = { id: '123e4567-e89b-12d3-a456-426614174000' }

describe('closeOneOnOneSchema: overallRating opcional', () => {
  it('acepta el cierre sin ninguna valoración (campo ausente)', () => {
    const result = closeOneOnOneSchema.safeParse(baseInput)
    expect(result.success).toBe(true)
  })

  it('acepta una valoración vacía (campo tocado y luego borrado en el formulario)', () => {
    const result = closeOneOnOneSchema.safeParse({ ...baseInput, overallRating: '' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.overallRating).toBeUndefined()
  })

  it('acepta una valoración válida entre 1 y 5', () => {
    const result = closeOneOnOneSchema.safeParse({ ...baseInput, overallRating: 4 })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.overallRating).toBe(4)
  })

  it('rechaza una valoración fuera de rango', () => {
    expect(closeOneOnOneSchema.safeParse({ ...baseInput, overallRating: 0 }).success).toBe(false)
    expect(closeOneOnOneSchema.safeParse({ ...baseInput, overallRating: 6 }).success).toBe(false)
  })
})
