import { Skeleton } from '@/components/ui/skeleton'

/** Esqueleto de carga genérico para páginas con cabecera + listado (docs: pulido UX/UI). */
export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}

/** Variante para páginas con tarjetas KPI arriba (Dashboard). */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-6">
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  )
}
