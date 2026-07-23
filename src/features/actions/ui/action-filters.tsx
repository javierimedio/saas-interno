'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ACTION_PRIORITY, ACTION_PRIORITY_LABELS } from '../domain/action.schema'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'

const ALL = 'all'

export function ActionFilters({ people }: { people: Pick<PersonRow, 'id' | 'first_name' | 'last_name'>[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL) params.delete(key)
    else params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const overdueActive = searchParams.get('overdueOnly') === 'true'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select defaultValue={searchParams.get('personId') ?? ALL} onValueChange={(v) => updateParam('personId', v)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Persona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas las personas</SelectItem>
          {people.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue={searchParams.get('assigneeId') ?? ALL} onValueChange={(v) => updateParam('assigneeId', v)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Asignatario" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos los asignatarios</SelectItem>
          {people.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue={searchParams.get('priority') ?? ALL} onValueChange={(v) => updateParam('priority', v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Toda prioridad</SelectItem>
          {ACTION_PRIORITY.map((p) => (
            <SelectItem key={p} value={p}>
              {ACTION_PRIORITY_LABELS[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant={overdueActive ? 'default' : 'outline'}
        size="sm"
        onClick={() => updateParam('overdueOnly', overdueActive ? '' : 'true')}
      >
        Solo vencidas
      </Button>
    </div>
  )
}
