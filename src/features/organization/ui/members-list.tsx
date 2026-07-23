import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import type { MembershipRow } from '../infrastructure/organizations.repository'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Administrador',
  employee: 'Empleado',
}

export function MembersList({
  memberships,
  personByUserId,
}: {
  memberships: MembershipRow[]
  personByUserId: Map<string, { name: string; email: string }>
}) {
  if (memberships.length === 0) {
    return <EmptyState title="Sin miembros" />
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {memberships.map((m) => {
        const person = personByUserId.get(m.user_id)
        return (
          <li key={m.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
            <span>{person ? `${person.name} · ${person.email}` : 'Sin ficha vinculada'}</span>
            <Badge variant={m.role === 'admin' ? 'accent' : 'neutral'}>{ROLE_LABELS[m.role] ?? m.role}</Badge>
          </li>
        )
      })}
    </ul>
  )
}
