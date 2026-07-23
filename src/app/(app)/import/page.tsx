import { ImportWizard } from '@/features/import/ui/import-wizard'

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h1 className="text-lg font-semibold">Importar personas</h1>
        <p className="text-sm text-muted-foreground">Alta masiva desde Excel o CSV</p>
      </div>
      <ImportWizard />
    </div>
  )
}
