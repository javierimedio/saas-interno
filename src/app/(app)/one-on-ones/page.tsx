import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/pagination'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { meetingListFiltersSchema } from '@/features/one-on-ones/domain/one-on-one.schema'
import { listMeetings } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { MeetingFilters } from '@/features/one-on-ones/ui/meeting-filters'
import { MeetingsTable } from '@/features/one-on-ones/ui/meetings-table'

export default async function OneOnOnesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireCurrentSession()
  const supabase = await createClient()

  const rawParams = await searchParams
  const filters = meetingListFiltersSchema.parse({
    personId: rawParams.personId,
    status: rawParams.status,
    page: rawParams.page,
  })

  const [{ meetings, total, page, pageSize }, people] = await Promise.all([
    listMeetings(supabase, session.organizationId, filters),
    listManagerCandidates(supabase, session.organizationId),
  ])

  const peopleNamesById = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name}`]))

  function buildHref(targetPage: number) {
    const params = new URLSearchParams()
    if (filters.personId) params.set('personId', filters.personId)
    if (filters.status) params.set('status', filters.status)
    params.set('page', String(targetPage))
    return `/one-on-ones?${params.toString()}`
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">One2One</h1>
          <p className="text-sm text-muted-foreground">{total} reuniones</p>
        </div>
        <Button asChild>
          <Link href="/one-on-ones/new">
            <Plus />
            Programar 1:1
          </Link>
        </Button>
      </div>

      <MeetingFilters people={people} />
      <MeetingsTable meetings={meetings} peopleNamesById={peopleNamesById} />
      <Pagination page={page} pageSize={pageSize} total={total} buildHref={buildHref} />
    </div>
  )
}
