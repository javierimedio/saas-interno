import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Topbar } from '@/components/layout/topbar'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { getNotifications } from '@/features/notifications/application/get-notifications'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCurrentSession()
  const notifications = await getNotifications(session)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Topbar organizationName={session.organizationName} email={session.email} notifications={notifications} />
      <div className="flex min-h-0 flex-1">
        <SidebarNav role={session.role} personId={session.personId} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
