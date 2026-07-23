'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EMPLOYMENT_STATUS_LABELS, PEOPLE_SORT_BY } from '../domain/person.schema'
import type { DepartmentRow } from '../infrastructure/departments.repository'
import type { PersonRow } from '../infrastructure/people.repository'

const ALL = 'all'

const SORT_LABELS: Record<(typeof PEOPLE_SORT_BY)[number], string> = {
  name: 'Nombre',
  salary: 'Salario',
  lastReview: 'Última revisión',
  workingHours: 'Jornada',
  tenure: 'Antigüedad',
  department: 'Departamento',
  manager: 'Responsable',
}

export function PeopleFilters({
  departments,
  managers,
}: {
  departments: DepartmentRow[]
  managers: Pick<PersonRow, 'id' | 'first_name' | 'last_name'>[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = React.useState(searchParams.get('q') ?? '')
  const [minSalary, setMinSalary] = React.useState(searchParams.get('minSalary') ?? '')
  const [maxSalary, setMaxSalary] = React.useState(searchParams.get('maxSalary') ?? '')
  const [minTenureYears, setMinTenureYears] = React.useState(searchParams.get('minTenureYears') ?? '')
  const [maxTenureYears, setMaxTenureYears] = React.useState(searchParams.get('maxTenureYears') ?? '')

  function updateParam(key: string, value: string, options: { keepPage?: boolean } = {}) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    if (!options.keepPage) params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function useDebouncedParam(key: string, value: string) {
    React.useEffect(() => {
      const timeout = setTimeout(() => {
        if (value !== (searchParams.get(key) ?? '')) {
          updateParam(key, value)
        }
      }, 300)
      return () => clearTimeout(timeout)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])
  }

  useDebouncedParam('q', q)
  useDebouncedParam('minSalary', minSalary)
  useDebouncedParam('maxSalary', maxSalary)
  useDebouncedParam('minTenureYears', minTenureYears)
  useDebouncedParam('maxTenureYears', maxTenureYears)

  const sortBy = searchParams.get('sortBy') ?? 'name'
  const sortDir = searchParams.get('sortDir') ?? 'asc'

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Buscar por nombre, email, puesto o código…"
            className="pl-8"
            aria-label="Buscar personas"
          />
        </div>

        <Select defaultValue={searchParams.get('departmentId') ?? ALL} onValueChange={(v) => updateParam('departmentId', v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los departamentos</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.get('managerId') ?? ALL} onValueChange={(v) => updateParam('managerId', v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Responsable" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los responsables</SelectItem>
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                {manager.first_name} {manager.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.get('status') ?? ALL} onValueChange={(v) => updateParam('status', v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los estados</SelectItem>
            {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.get('jornada') ?? ALL} onValueChange={(v) => updateParam('jornada', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Jornada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toda jornada</SelectItem>
            <SelectItem value="completa">Completa</SelectItem>
            <SelectItem value="reducida">Reducida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Salario</span>
          <Input
            type="number"
            min={0}
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder="Mín"
            aria-label="Salario mínimo"
            className="w-24"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            placeholder="Máx"
            aria-label="Salario máximo"
            className="w-24"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Antigüedad (años)</span>
          <Input
            type="number"
            min={0}
            value={minTenureYears}
            onChange={(e) => setMinTenureYears(e.target.value)}
            placeholder="Mín"
            aria-label="Antigüedad mínima en años"
            className="w-20"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            value={maxTenureYears}
            onChange={(e) => setMaxTenureYears(e.target.value)}
            placeholder="Máx"
            aria-label="Antigüedad máxima en años"
            className="w-20"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Ordenar por</span>
          <Select value={sortBy} onValueChange={(v) => updateParam('sortBy', v, { keepPage: true })}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PEOPLE_SORT_BY.map((field) => (
                <SelectItem key={field} value={field}>
                  {SORT_LABELS[field]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={sortDir === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
            onClick={() => updateParam('sortDir', sortDir === 'asc' ? 'desc' : 'asc', { keepPage: true })}
          >
            {sortDir === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
