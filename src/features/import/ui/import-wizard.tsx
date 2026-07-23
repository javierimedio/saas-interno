'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { parseImportFileAction, type ImportPreview } from '../application/parse-import-file.action'
import { importPeopleAction, type ImportSummary } from '../application/import-people.action'

export function ImportWizard() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<ImportPreview | null>(null)
  const [summary, setSummary] = React.useState<ImportSummary | null>(null)
  const [isParsing, setIsParsing] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)

  async function handleAnalyze() {
    if (!file) return
    setIsParsing(true)
    setSummary(null)
    const formData = new FormData()
    formData.set('file', file)
    const result = await parseImportFileAction(formData)
    setIsParsing(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setPreview(result.data)
  }

  async function handleConfirm() {
    if (!preview) return
    setIsImporting(true)
    const result = await importPeopleAction(preview.rows)
    setIsImporting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setSummary(result.data)
    setPreview(null)
    setFile(null)
  }

  const validCount = preview?.rows.filter((r) => r.errors.length === 0).length ?? 0
  const invalidCount = (preview?.rows.length ?? 0) - validCount

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">Formato esperado</p>
        <p>
          Archivo .xlsx o .csv con una fila de cabecera. Columnas reconocidas: Nombre, Apellidos, Email, Teléfono,
          Puesto, Departamento, Manager (email), Fecha de alta, Tipo de contrato, Fecha de nacimiento, Salario bruto
          anual, Moneda. Las columnas Nombre, Apellidos, Email, Puesto y Fecha de alta son obligatorias.
        </p>
      </div>

      {!preview && !summary ? (
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <Button onClick={handleAnalyze} disabled={!file || isParsing}>
            <Upload />
            {isParsing ? 'Analizando…' : 'Analizar archivo'}
          </Button>
        </div>
      ) : null}

      {preview ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="success">{validCount} válidas</Badge>
            {invalidCount > 0 ? <Badge variant="danger">{invalidCount} con errores</Badge> : null}
            <Button size="sm" onClick={handleConfirm} disabled={isImporting || validCount === 0}>
              {isImporting ? 'Importando…' : `Confirmar importación (${validCount})`}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPreview(null)
                setFile(null)
              }}
            >
              Cancelar
            </Button>
          </div>
          <div className="max-h-[480px] overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader className="sticky top-0">
                <TableRow>
                  <TableHead>Fila</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Alta</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.map((row) => (
                  <TableRow key={row.index}>
                    <TableCell className="tabular-nums text-text-faint">{row.index + 1}</TableCell>
                    <TableCell>
                      {row.firstName} {row.lastName}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.positionTitle}</TableCell>
                    <TableCell>{row.hireDate ?? '—'}</TableCell>
                    <TableCell>
                      {row.errors.length === 0 ? (
                        <Badge variant="success">Válida</Badge>
                      ) : (
                        <span className="text-xs text-destructive">{row.errors.join('; ')}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}

      {summary ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">
              {summary.created} persona{summary.created === 1 ? '' : 's'} importada{summary.created === 1 ? '' : 's'}{' '}
              correctamente.
            </p>
            {summary.failed.length > 0 ? (
              <div className="mt-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">
                  {summary.failed.length} filas no importadas
                </p>
                <ul className="flex flex-col gap-1 text-sm">
                  {summary.failed.map((f) => (
                    <li key={f.row}>
                      Fila {f.row} ({f.name}): {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => setSummary(null)} className="self-start">
            Importar otro archivo
          </Button>
        </div>
      ) : null}
    </div>
  )
}
