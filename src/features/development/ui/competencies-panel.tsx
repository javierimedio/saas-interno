import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import type { CompetencyRow, PersonCompetencyRow } from '../infrastructure/competencies.repository'

export function CompetenciesPanel({
  competencies,
  assessments,
  peopleNamesById,
}: {
  competencies: CompetencyRow[]
  assessments: PersonCompetencyRow[]
  peopleNamesById: Map<string, string>
}) {
  if (competencies.length === 0) {
    return <EmptyState title="Sin competencias definidas" description="Crea el catálogo de competencias de tu organización." />
  }

  const latestByPersonCompetency = new Map<string, PersonCompetencyRow>()
  for (const a of assessments) {
    const key = `${a.person_id}:${a.competency_id}`
    const existing = latestByPersonCompetency.get(key)
    if (!existing || a.assessed_at > existing.assessed_at) latestByPersonCompetency.set(key, a)
  }

  const personIds = Array.from(new Set(assessments.map((a) => a.person_id)))

  if (personIds.length === 0) {
    return <EmptyState title="Sin evaluaciones todavía" description="Evalúa el nivel de una persona en una competencia para ver la matriz." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Persona</TableHead>
          {competencies.map((c) => (
            <TableHead key={c.id}>{c.name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {personIds.map((personId) => (
          <TableRow key={personId}>
            <TableCell className="font-semibold">{peopleNamesById.get(personId) ?? '—'}</TableCell>
            {competencies.map((c) => {
              const cell = latestByPersonCompetency.get(`${personId}:${c.id}`)
              return (
                <TableCell key={c.id} className="tabular-nums text-muted-foreground">
                  {cell ? `${cell.level}/5` : '—'}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
