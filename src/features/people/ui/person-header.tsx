import Link from 'next/link'
import { Pencil } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fullName } from '../domain/person.rules'
import { CONTRACT_TYPE_LABELS } from '../domain/person.schema'
import { EmploymentStatusBadge } from './employment-status-badge'
import { OffboardDialog } from './offboard-dialog'
import type { PersonRow } from '../infrastructure/people.repository'

export function PersonHeader({
  person,
  departmentName,
  managerName,
}: {
  person: PersonRow
  departmentName?: string
  managerName?: string
}) {
  const name = fullName({ firstName: person.first_name, lastName: person.last_name })

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <Avatar name={name} size="lg" />
        <div>
          <h1 className="text-base font-semibold">{name}</h1>
          <p className="text-sm text-muted-foreground">
            {person.position_title}
            {departmentName ? ` · ${departmentName}` : ''}
            {managerName ? ` · Responsable: ${managerName}` : ''}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <EmploymentStatusBadge status={person.employment_status} />
            <Badge variant="outline">{CONTRACT_TYPE_LABELS[person.contract_type]}</Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/people/${person.id}/edit`}>
            <Pencil />
            Editar
          </Link>
        </Button>
        {person.employment_status !== 'offboarded' ? (
          <OffboardDialog personId={person.id} personName={name} />
        ) : null}
      </div>
    </div>
  )
}
