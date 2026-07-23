import { CONTRACT_TYPE, CONTRACT_TYPE_LABELS } from '@/features/people/domain/person.schema'

export const CANONICAL_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'positionTitle',
  'departmentName',
  'managerEmail',
  'hireDate',
  'contractType',
  'birthDate',
  'employeeCode',
  'grossAnnualSalary',
  'currency',
] as const
export type CanonicalField = (typeof CANONICAL_FIELDS)[number]

const HEADER_ALIASES: Record<CanonicalField, string[]> = {
  firstName: ['nombre', 'first name', 'firstname'],
  lastName: ['apellidos', 'apellido', 'last name', 'lastname'],
  email: ['email', 'correo', 'correo electronico', 'correo electrónico'],
  phone: ['telefono', 'teléfono', 'phone', 'móvil', 'movil'],
  positionTitle: ['puesto', 'cargo', 'position', 'job title', 'position title'],
  departmentName: ['departamento', 'department'],
  managerEmail: ['manager', 'responsable', 'jefe', 'manager email', 'email responsable'],
  hireDate: ['fecha alta', 'fecha de alta', 'hire date', 'fecha incorporacion', 'fecha incorporación', 'fecha de incorporacion'],
  contractType: ['tipo contrato', 'tipo de contrato', 'contrato', 'contract type'],
  birthDate: ['fecha nacimiento', 'fecha de nacimiento', 'birth date'],
  employeeCode: ['codigo empleado', 'código empleado', 'codigo de empleado', 'código de empleado', 'employee code', 'codigo', 'código'],
  grossAnnualSalary: ['salario', 'salario bruto', 'salario bruto anual', 'salary', 'salario anual'],
  currency: ['moneda', 'currency'],
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** Empareja las cabeceras del fichero subido con los campos canónicos, sin importar acentos/mayúsculas. */
export function mapHeaders(headers: string[]): Partial<Record<CanonicalField, string>> {
  const mapping: Partial<Record<CanonicalField, string>> = {}
  const normalizedHeaders = headers.map((h) => ({ original: h, normalized: normalizeHeader(h) }))

  for (const field of CANONICAL_FIELDS) {
    const aliases = HEADER_ALIASES[field].map(normalizeHeader)
    const match = normalizedHeaders.find((h) => aliases.includes(h.normalized))
    if (match) mapping[field] = match.original
  }

  return mapping
}

const CONTRACT_TYPE_LABEL_TO_KEY = new Map(
  CONTRACT_TYPE.map((key) => [normalizeHeader(CONTRACT_TYPE_LABELS[key]), key]),
)

/** Acepta tanto la clave del enum (indefinido) como su etiqueta en español (Indefinido). */
export function parseContractType(raw: string): (typeof CONTRACT_TYPE)[number] | null {
  const normalized = normalizeHeader(raw)
  const directMatch = CONTRACT_TYPE.find((key) => key === normalized)
  if (directMatch) return directMatch
  return CONTRACT_TYPE_LABEL_TO_KEY.get(normalized) ?? null
}

/** Admite Date (celdas de Excel), ISO (YYYY-MM-DD) y formato español (DD/MM/YYYY). */
export function parseImportDate(raw: unknown): string | null {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString().slice(0, 10)
  }
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (trimmed === '') return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  const spanishMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (spanishMatch) {
    const [, day, month, year] = spanishMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)
}

export function parseSalary(raw: unknown): number | null {
  if (typeof raw === 'number') return raw
  if (typeof raw !== 'string') return null
  const cleaned = raw.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3},)/g, '').replace(',', '.')
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
}

export type ParsedImportRow = {
  index: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  positionTitle: string
  departmentName: string | null
  managerEmail: string | null
  hireDate: string | null
  contractType: (typeof CONTRACT_TYPE)[number] | null
  birthDate: string | null
  employeeCode: string | null
  grossAnnualSalary: number | null
  currency: string
  errors: string[]
}

function cell(row: Record<string, unknown>, header: string | undefined): unknown {
  if (!header) return undefined
  return row[header]
}

function textCell(row: Record<string, unknown>, header: string | undefined): string {
  const value = cell(row, header)
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

/** Valida y normaliza una fila cruda del fichero según el mapeo de cabeceras detectado. */
export function validateImportRow(
  index: number,
  raw: Record<string, unknown>,
  mapping: Partial<Record<CanonicalField, string>>,
): ParsedImportRow {
  const errors: string[] = []

  const firstName = textCell(raw, mapping.firstName)
  const lastName = textCell(raw, mapping.lastName)
  const email = textCell(raw, mapping.email)
  const positionTitle = textCell(raw, mapping.positionTitle)
  const phone = textCell(raw, mapping.phone) || null
  const departmentName = textCell(raw, mapping.departmentName) || null
  const managerEmail = textCell(raw, mapping.managerEmail) || null
  const currency = textCell(raw, mapping.currency) || 'EUR'

  if (!firstName) errors.push('Falta el nombre')
  if (!lastName) errors.push('Faltan los apellidos')
  if (!email) errors.push('Falta el email')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email no válido')
  if (!positionTitle) errors.push('Falta el puesto')

  const hireDateRaw = cell(raw, mapping.hireDate)
  const hireDate = parseImportDate(hireDateRaw)
  if (!hireDate) errors.push('Fecha de alta no válida o ausente')

  const birthDateRaw = cell(raw, mapping.birthDate)
  const birthDate = birthDateRaw ? parseImportDate(birthDateRaw) : null

  const employeeCode = textCell(raw, mapping.employeeCode) || null

  const contractTypeRaw = textCell(raw, mapping.contractType)
  const contractType = contractTypeRaw ? parseContractType(contractTypeRaw) : 'indefinido'
  if (contractTypeRaw && !contractType) errors.push(`Tipo de contrato desconocido: "${contractTypeRaw}"`)

  const salaryRaw = cell(raw, mapping.grossAnnualSalary)
  const grossAnnualSalary = salaryRaw !== undefined ? parseSalary(salaryRaw) : null
  if (!grossAnnualSalary) errors.push('Salario bruto anual no válido o ausente')

  return {
    index,
    firstName,
    lastName,
    email,
    phone,
    positionTitle,
    departmentName,
    managerEmail,
    hireDate,
    contractType: contractType ?? 'indefinido',
    birthDate,
    employeeCode,
    grossAnnualSalary,
    currency,
    errors,
  }
}
