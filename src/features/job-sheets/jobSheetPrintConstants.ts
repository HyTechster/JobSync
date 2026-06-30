import type React from 'react'

export const BORDER = '1px solid #D1D5DB'

export const SEC: React.CSSProperties = {
  backgroundColor: '#EA580C', color: 'white', fontWeight: 'bold',
  fontSize: 10, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.08em',
}

export const STATUS_LABEL: Record<string, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

export const PRIORITY_LABEL: Record<string, string> = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
  urgent: 'Urgent',
}

export function getJobTypeLabel(jt: string | null): string {
  if (!jt) return '—'
  const map: Record<string, string> = {
    cctv:  'CCTV / IP Camera',
    alarm: 'Security Alarm',
    door:  'Door Access System',
    gate:  'Automatic Gate',
    smart: 'Smart Home System',
    other: 'Others',
  }
  return map[jt.toLowerCase()] ?? jt
}
