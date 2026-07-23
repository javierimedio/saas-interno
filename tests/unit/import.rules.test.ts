import { describe, expect, it } from 'vitest'

import {
  mapHeaders,
  parseContractType,
  parseImportDate,
  parseSalary,
  validateImportRow,
} from '@/features/import/domain/import.rules'

describe('mapHeaders', () => {
  it('empareja cabeceras en español sin importar mayúsculas ni acentos', () => {
    const mapping = mapHeaders(['Nombre', 'Apellidos', 'Email', 'Puesto', 'Fecha de Alta', 'Salario Bruto Anual'])
    expect(mapping.firstName).toBe('Nombre')
    expect(mapping.lastName).toBe('Apellidos')
    expect(mapping.email).toBe('Email')
    expect(mapping.positionTitle).toBe('Puesto')
    expect(mapping.hireDate).toBe('Fecha de Alta')
    expect(mapping.grossAnnualSalary).toBe('Salario Bruto Anual')
  })

  it('no empareja columnas sin alias reconocido', () => {
    const mapping = mapHeaders(['Columna rara'])
    expect(mapping.firstName).toBeUndefined()
  })
})

describe('parseContractType', () => {
  it('acepta la clave del enum', () => {
    expect(parseContractType('indefinido')).toBe('indefinido')
  })

  it('acepta la etiqueta en español sin importar mayúsculas', () => {
    expect(parseContractType('Indefinido')).toBe('indefinido')
    expect(parseContractType('PRÁCTICAS')).toBe('practicas')
  })

  it('devuelve null para un valor desconocido', () => {
    expect(parseContractType('inventado')).toBeNull()
  })
})

describe('parseImportDate', () => {
  it('acepta formato ISO', () => {
    expect(parseImportDate('2024-06-01')).toBe('2024-06-01')
  })

  it('acepta formato español DD/MM/YYYY', () => {
    expect(parseImportDate('01/06/2024')).toBe('2024-06-01')
  })

  it('acepta un objeto Date de celdas de Excel', () => {
    expect(parseImportDate(new Date('2024-06-01T00:00:00Z'))).toBe('2024-06-01')
  })

  it('devuelve null para texto vacío o inválido', () => {
    expect(parseImportDate('')).toBeNull()
    expect(parseImportDate('no es una fecha')).toBeNull()
  })
})

describe('parseSalary', () => {
  it('acepta números', () => {
    expect(parseSalary(30000)).toBe(30000)
  })

  it('acepta texto con separador de miles y decimales en formato español', () => {
    expect(parseSalary('30.000,50 €')).toBeCloseTo(30000.5)
  })

  it('rechaza valores no positivos', () => {
    expect(parseSalary('0')).toBeNull()
    expect(parseSalary('-100')).toBeNull()
  })
})

describe('validateImportRow', () => {
  it('valida una fila completa correctamente', () => {
    const mapping = mapHeaders(['Nombre', 'Apellidos', 'Email', 'Puesto', 'Fecha de Alta', 'Salario'])
    const row = validateImportRow(
      0,
      {
        Nombre: 'Ana',
        Apellidos: 'García',
        Email: 'ana@empresa.com',
        Puesto: 'Growth Marketer',
        'Fecha de Alta': '2024-06-01',
        Salario: '30000',
      },
      mapping,
    )
    expect(row.errors).toEqual([])
    expect(row.contractType).toBe('indefinido')
  })

  it('reconoce el código de empleado y la fecha de nacimiento cuando existen', () => {
    const mapping = mapHeaders(['Nombre', 'Apellidos', 'Email', 'Puesto', 'Fecha de Alta', 'Salario', 'Código empleado', 'Fecha de nacimiento'])
    const row = validateImportRow(
      0,
      {
        Nombre: 'Ana',
        Apellidos: 'García',
        Email: 'ana@empresa.com',
        Puesto: 'Growth Marketer',
        'Fecha de Alta': '2024-06-01',
        Salario: '30000',
        'Código empleado': 'EMP-042',
        'Fecha de nacimiento': '1990-05-10',
      },
      mapping,
    )
    expect(row.errors).toEqual([])
    expect(row.employeeCode).toBe('EMP-042')
    expect(row.birthDate).toBe('1990-05-10')
  })

  it('acumula errores por cada campo obligatorio ausente', () => {
    const mapping = mapHeaders(['Nombre'])
    const row = validateImportRow(0, { Nombre: '' }, mapping)
    expect(row.errors.length).toBeGreaterThan(0)
    expect(row.errors).toContain('Falta el nombre')
    expect(row.errors).toContain('Falta el email')
  })
})
