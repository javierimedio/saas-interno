'use client'

import * as React from 'react'
import { Columns3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const PEOPLE_COLUMNS = [
  { key: 'code', label: 'Código' },
  { key: 'position', label: 'Puesto' },
  { key: 'department', label: 'Departamento' },
  { key: 'manager', label: 'Responsable' },
  { key: 'status', label: 'Estado' },
  { key: 'tenure', label: 'Antigüedad' },
  { key: 'salary', label: 'Salario' },
  { key: 'lastReview', label: 'Última revisión' },
  { key: 'workingHours', label: 'Jornada' },
] as const
export type PeopleColumnKey = (typeof PEOPLE_COLUMNS)[number]['key']

const DEFAULT_VISIBLE_COLUMNS: PeopleColumnKey[] = PEOPLE_COLUMNS.map((c) => c.key)

function storageKey(userKey: string): string {
  return `nexo:people:columns:${userKey}`
}

function loadVisibleColumns(userKey: string): Set<PeopleColumnKey> {
  if (typeof window === 'undefined') return new Set(DEFAULT_VISIBLE_COLUMNS)
  try {
    const raw = window.localStorage.getItem(storageKey(userKey))
    if (!raw) return new Set(DEFAULT_VISIBLE_COLUMNS)
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set(DEFAULT_VISIBLE_COLUMNS)
    return new Set(parsed.filter((k): k is PeopleColumnKey => DEFAULT_VISIBLE_COLUMNS.includes(k as PeopleColumnKey)))
  } catch {
    return new Set(DEFAULT_VISIBLE_COLUMNS)
  }
}

function saveVisibleColumns(userKey: string, columns: Set<PeopleColumnKey>) {
  try {
    window.localStorage.setItem(storageKey(userKey), JSON.stringify([...columns]))
  } catch {
    // Almacenamiento no disponible (modo privado, cuota...): la preferencia simplemente no persiste.
  }
}

/** Preferencia de columnas visibles del listado de Personas, persistida por usuario en localStorage. */
export function usePeopleColumns(userKey: string) {
  const [visible, setVisible] = React.useState<Set<PeopleColumnKey>>(() => new Set(DEFAULT_VISIBLE_COLUMNS))

  React.useEffect(() => {
    setVisible(loadVisibleColumns(userKey))
  }, [userKey])

  function toggle(key: PeopleColumnKey) {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      saveVisibleColumns(userKey, next)
      return next
    })
  }

  return { visible, toggle }
}

export function PeopleColumnPicker({
  visible,
  onToggle,
}: {
  visible: Set<PeopleColumnKey>
  onToggle: (key: PeopleColumnKey) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns3 />
          Columnas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PEOPLE_COLUMNS.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key}
            checked={visible.has(column.key)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => onToggle(column.key)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
