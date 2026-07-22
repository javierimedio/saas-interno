'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PersonRow } from '../infrastructure/people.repository'

const NONE = '__none__'

export function ManagerField({
  value,
  onChange,
  candidates,
}: {
  value?: string
  onChange: (value: string | undefined) => void
  candidates: Pick<PersonRow, 'id' | 'first_name' | 'last_name' | 'position_title'>[]
}) {
  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? undefined : v)}>
      <SelectTrigger>
        <SelectValue placeholder="Sin responsable" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Sin responsable</SelectItem>
        {candidates.map((candidate) => (
          <SelectItem key={candidate.id} value={candidate.id}>
            {candidate.first_name} {candidate.last_name} · {candidate.position_title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
