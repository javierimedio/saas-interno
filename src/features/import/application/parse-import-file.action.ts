'use server'

import { read, utils } from 'xlsx'

import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { mapHeaders, validateImportRow, type ParsedImportRow } from '../domain/import.rules'

export type ImportPreview = {
  headers: string[]
  mapping: Partial<Record<string, string>>
  rows: ParsedImportRow[]
}

const MAX_ROWS = 500

export async function parseImportFileAction(formData: FormData): Promise<Result<ImportPreview>> {
  await requireCurrentSession()

  const file = formData.get('file')
  if (!(file instanceof File)) return err('No se ha recibido ningún archivo')

  try {
    const buffer = await file.arrayBuffer()
    const workbook = read(buffer, { type: 'array', cellDates: true })
    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) return err('El archivo no contiene ninguna hoja')

    const sheet = workbook.Sheets[firstSheetName]
    const rawRows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
    if (rawRows.length === 0) return err('El archivo no contiene filas de datos')
    if (rawRows.length > MAX_ROWS) return err(`El archivo supera el máximo de ${MAX_ROWS} filas por importación`)

    const headers = Object.keys(rawRows[0])
    const mapping = mapHeaders(headers)

    if (!mapping.firstName || !mapping.lastName || !mapping.email || !mapping.hireDate) {
      return err(
        'No se han reconocido las columnas obligatorias (Nombre, Apellidos, Email, Fecha de alta). Revisa las cabeceras del archivo.',
      )
    }

    const rows = rawRows.map((raw, index) => validateImportRow(index, raw, mapping))

    return ok({ headers, mapping, rows })
  } catch (error) {
    return err(error instanceof Error ? `No se pudo leer el archivo: ${error.message}` : 'No se pudo leer el archivo')
  }
}
