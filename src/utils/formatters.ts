export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`
}

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

export function formatDate(iso: string, fmt: DateFormat = 'DD/MM/YYYY'): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const dd   = String(d.getDate()).padStart(2, '0')
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  switch (fmt) {
    case 'DD/MM/YYYY': return `${dd}/${mm}/${yyyy}`
    case 'MM/DD/YYYY': return `${mm}/${dd}/${yyyy}`
    case 'YYYY-MM-DD': return `${yyyy}-${mm}-${dd}`
  }
}

export function formatDateTime(iso: string, fmt: DateFormat = 'DD/MM/YYYY'): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const time = d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${formatDate(iso, fmt)}, ${time}`
}
