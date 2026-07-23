export function latestProgress(checkins: { progress_percent: number; checkin_date: string }[]): number {
  if (checkins.length === 0) return 0
  return checkins.reduce((latest, c) => (c.checkin_date > latest.checkin_date ? c : latest)).progress_percent
}
