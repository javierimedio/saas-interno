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
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-2 text-left font-medium">Persona</th>
            {competencies.map((c) => (
              <th key={c.id} className="px-3 py-2 text-left font-medium">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {personIds.map((personId) => (
            <tr key={personId} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-medium">{peopleNamesById.get(personId) ?? '—'}</td>
              {competencies.map((c) => {
                const cell = latestByPersonCompetency.get(`${personId}:${c.id}`)
                return (
                  <td key={c.id} className="px-3 py-2 tabular-nums">
                    {cell ? `${cell.level}/5` : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
