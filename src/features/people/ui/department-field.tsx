'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createDepartmentAction } from '../application/create-department.action'
import type { DepartmentRow } from '../infrastructure/departments.repository'

const CREATE_NEW = '__create_new__'
const NONE = '__none__'

export function DepartmentField({
  value,
  onChange,
  departments,
}: {
  value?: string
  onChange: (value: string | undefined) => void
  departments: DepartmentRow[]
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newName, setNewName] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)
  const [localDepartments, setLocalDepartments] = React.useState(departments)

  async function handleCreate() {
    setIsCreating(true)
    const result = await createDepartmentAction(newName)
    setIsCreating(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setLocalDepartments((prev) => [...prev, result.data].sort((a, b) => a.name.localeCompare(b.name)))
    onChange(result.data.id)
    setNewName('')
    setDialogOpen(false)
  }

  return (
    <>
      <Select
        value={value ?? NONE}
        onValueChange={(v) => {
          if (v === CREATE_NEW) {
            setDialogOpen(true)
            return
          }
          onChange(v === NONE ? undefined : v)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sin departamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>Sin departamento</SelectItem>
          {localDepartments.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
            </SelectItem>
          ))}
          <SelectItem value={CREATE_NEW}>+ Nuevo departamento…</SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo departamento</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Nombre del departamento"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || newName.trim().length < 2}>
              {isCreating ? 'Creando…' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
