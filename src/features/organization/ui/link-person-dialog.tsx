'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Link2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { linkPersonToUserAction } from '@/features/people/application/link-person-to-user.action'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'

type Candidate = Pick<PersonRow, 'id' | 'first_name' | 'last_name' | 'position_title'>

/**
 * Vincular ficha (Configuración → Miembros): sustituye a editar people.user_id a mano en
 * Supabase por un flujo completamente visual — buscar, seleccionar y confirmar.
 */
export function LinkPersonDialog({ userId, candidates }: { userId: string; candidates: Candidate[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  if (candidates.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">No existen personas pendientes de vincular</span>
        <Button asChild variant="outline" size="sm">
          <Link href="/people/new">
            <Plus />
            Crear ficha
          </Link>
        </Button>
      </div>
    )
  }

  const filtered = candidates.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  async function handleConfirm() {
    if (!selectedId) return
    setIsSubmitting(true)
    const result = await linkPersonToUserAction({ personId: selectedId, userId })
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Ficha vinculada correctamente')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQuery('')
          setSelectedId(undefined)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 />
          Vincular ficha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular ficha</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input placeholder="Buscar por nombre…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          <div className="max-h-64 overflow-y-auto rounded-md border border-border">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin resultados</p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/50',
                        selectedId === c.id && 'bg-secondary',
                      )}
                    >
                      <span>
                        {c.first_name} {c.last_name}
                      </span>
                      <span className="text-text-faint">{c.position_title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedId || isSubmitting}>
            {isSubmitting ? 'Vinculando…' : 'Vincular'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
