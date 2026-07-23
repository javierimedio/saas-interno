import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { ScheduleMeetingForm } from '@/features/one-on-ones/ui/schedule-meeting-form'

export default async function NewMeetingPage() {
  const session = await requireAdmin()
  const supabase = await createClient()
  const people = await listManagerCandidates(supabase, session.organizationId)

  return (
    <div className="flex flex-col gap-5 p-6">
      <h1 className="text-lg font-semibold">Programar 1:1</h1>
      <ScheduleMeetingForm people={people} />
    </div>
  )
}
