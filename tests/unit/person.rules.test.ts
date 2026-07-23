import { describe, expect, it } from 'vitest'

import {
  calculateAge,
  calculateTenure,
  fullName,
  initials,
  isSalaryReviewOverdue,
  workingHoursLabel,
} from '@/features/people/domain/person.rules'

describe('fullName / initials', () => {
  it('combina nombre y apellidos', () => {
    expect(fullName({ firstName: 'Laura', lastName: 'Martín' })).toBe('Laura Martín')
  })

  it('calcula iniciales en mayúsculas', () => {
    expect(initials({ firstName: 'Laura', lastName: 'Martín' })).toBe('LM')
  })
})

describe('calculateTenure', () => {
  it('devuelve solo meses cuando hay menos de un año', () => {
    expect(calculateTenure('2026-01-15', new Date('2026-07-15'))).toBe('6m')
  })

  it('devuelve años y meses combinados', () => {
    expect(calculateTenure('2023-01-01', new Date('2026-07-22'))).toBe('3a 6m')
  })

  it('devuelve solo años cuando el mes coincide exactamente', () => {
    expect(calculateTenure('2024-07-22', new Date('2026-07-22'))).toBe('2a')
  })

  it('usa la fecha de baja en vez de la fecha de referencia si existe', () => {
    expect(calculateTenure('2023-01-01', new Date('2026-07-22'), '2024-01-01')).toBe('1a')
  })

  it('no da antigüedad negativa si aún no se ha cumplido el día del mes', () => {
    expect(calculateTenure('2026-07-20', new Date('2026-07-22'))).toBe('0m')
  })
})

describe('isSalaryReviewOverdue', () => {
  it('es true cuando han pasado más meses que el umbral', () => {
    expect(isSalaryReviewOverdue('2024-01-01', new Date('2026-07-22'), 18)).toBe(true)
  })

  it('es false cuando no ha pasado el umbral', () => {
    expect(isSalaryReviewOverdue('2025-06-01', new Date('2026-07-22'), 18)).toBe(false)
  })

  it('usa 18 meses como umbral por defecto', () => {
    expect(isSalaryReviewOverdue('2025-06-01', new Date('2026-07-22'))).toBe(false)
    expect(isSalaryReviewOverdue('2024-01-01', new Date('2026-07-22'))).toBe(true)
  })

  it('considera vencido justo al alcanzar el umbral (inclusive)', () => {
    expect(isSalaryReviewOverdue('2025-01-22', new Date('2026-07-22'), 18)).toBe(true)
  })
})

describe('calculateAge', () => {
  it('calcula la edad cuando ya se ha cumplido años este año', () => {
    expect(calculateAge('1990-01-15', new Date('2026-07-22'))).toBe(36)
  })

  it('no suma el año todavía si el cumpleaños no ha llegado', () => {
    expect(calculateAge('1990-12-25', new Date('2026-07-22'))).toBe(35)
  })

  it('suma el año exactamente el día del cumpleaños', () => {
    expect(calculateAge('1990-07-22', new Date('2026-07-22'))).toBe(36)
  })
})

describe('workingHoursLabel', () => {
  it('considera jornada completa a partir de 40h/semana', () => {
    expect(workingHoursLabel(40)).toBe('Jornada completa')
    expect(workingHoursLabel(37.5)).toBe('Jornada reducida')
  })

  it('considera jornada reducida por debajo de 40h/semana', () => {
    expect(workingHoursLabel(30)).toBe('Jornada reducida')
  })
})
