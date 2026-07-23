import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Topbar } from '@/components/layout/topbar'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCurrentSession()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav role={session.role} personId={session.personId} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar organizationName={session.organizationName} email={session.email} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
