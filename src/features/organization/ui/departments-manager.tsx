'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { createDepartmentAction } from '@/features/people/application/create-department.action'
import { renameDepartmentAction } from '../application/rename-department.action'
import { deleteDepartmentAction } from '../application/delete-department.action'
import type { DepartmentRow } from '@/features/people/infrastructure/departments.repository'

export function DepartmentsManager({ departments }: { departments: DepartmentRow[] }) {
  const router = useRouter()
  const [newName, setNewName] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState('')

  async function handleCreate() {
    if (newName.trim().length < 2) return
    setIsCreating(true)
    const result = await createDepartmentAction(newName)
    setIsCreating(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setNewName('')
    router.refresh()
  }

  async function handleRename(id: string) {
    if (editingName.trim().length < 2) return
    const result = await renameDepartmentAction({ id, name: editingName })
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setEditingId(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar este departamento? Las personas asignadas quedarán sin departamento.')) return
    const result = await deleteDepartmentAction(id)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nuevo departamento…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleCreate} disabled={isCreating || newName.trim().length < 2}>
          Añadir
        </Button>
      </div>

      {departments.length === 0 ? (
        <EmptyState title="Sin departamentos todavía" />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {departments.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 px-3 py-2">
              {editingId === d.id ? (
                <Input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(d.id)}
                  className="max-w-xs"
                />
              ) : (
                <span className="text-sm">{d.name}</span>
              )}
              <div className="flex items-center gap-1">
                {editingId === d.id ? (
                  <Button size="sm" onClick={() => handleRename(d.id)}>
                    Guardar
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Renombrar"
                    onClick={() => {
                      setEditingId(d.id)
                      setEditingName(d.name)
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => handleDelete(d.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
