import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { ImportWizard } from '@/features/import/ui/import-wizard'

export default async function ImportPage() {
  await requireAdmin()

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h1 className="text-nexo-title">Importar personas</h1>
        <p className="text-sm text-muted-foreground">Alta masiva desde Excel o CSV</p>
      </div>
      <ImportWizard />
    </div>
  )
}
