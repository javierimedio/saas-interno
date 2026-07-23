import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { LinkPersonDialog } from './link-person-dialog'
import type { MembershipRow } from '../infrastructure/organizations.repository'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Administrador',
  employee: 'Empleado',
}

export type LinkedPersonSummary = {
  name: string
  positionTitle: string
  departmentName?: string
}

export function MembersList({
  memberships,
  personByUserId,
  unlinkedPeople,
}: {
  memberships: MembershipRow[]
  personByUserId: Map<string, LinkedPersonSummary>
  unlinkedPeople: Pick<PersonRow, 'id' | 'first_name' | 'last_name' | 'position_title'>[]
}) {
  if (memberships.length === 0) {
    return <EmptyState title="Sin miembros" />
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {memberships.map((m) => {
        const person = personByUserId.get(m.user_id)
        return (
          <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
            <div className="min-w-0">
              {person ? (
                <>
                  <p className="font-semibold text-foreground">{person.name}</p>
                  <p className="truncate text-muted-foreground">
                    {[person.positionTitle, person.departmentName].filter(Boolean).join(' · ')}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Sin ficha vinculada</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!person ? <LinkPersonDialog userId={m.user_id} candidates={unlinkedPeople} /> : null}
              <Badge variant={m.role === 'admin' ? 'accent' : 'neutral'}>{ROLE_LABELS[m.role] ?? m.role}</Badge>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
