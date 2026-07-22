'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ONE_ON_ONE_STATUS_LABELS } from '../domain/one-on-one.schema'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'

const ALL = 'all'

export function MeetingFilters({ people }: { people: Pick<PersonRow, 'id' | 'first_name' | 'last_name'>[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select defaultValue={searchParams.get('personId') ?? ALL} onValueChange={(v) => updateParam('personId', v)}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Persona" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas las personas</SelectItem>
          {people.map((person) => (
            <SelectItem key={person.id} value={person.id}>
              {person.first_name} {person.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue={searchParams.get('status') ?? ALL} onValueChange={(v) => updateParam('status', v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos los estados</SelectItem>
          {Object.entries(ONE_ON_ONE_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
