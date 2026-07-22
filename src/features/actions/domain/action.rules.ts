export function isActionOverdue(dueDate: string | null, status: string, now: Date): boolean {
  if (!dueDate) return false
  if (status === 'completed' || status === 'cancelled') return false
  return new Date(dueDate) < now
}
