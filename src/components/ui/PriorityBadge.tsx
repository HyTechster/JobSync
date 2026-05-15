import type { JobPriority } from '../../types'

interface PriorityConfig {
  bg: string
  text: string
  dot: string
  label: string
}

const PRIORITY_MAP: Record<JobPriority, PriorityConfig> = {
  low:    { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#94A3B8]', label: 'Low' },
  medium: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', dot: 'bg-[#F59E0B]', label: 'Medium' },
  high:   { bg: 'bg-[#FFE4E6]', text: 'text-[#9F1239]', dot: 'bg-[#E11D48]', label: 'High' },
  urgent: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', dot: 'bg-[#DC2626]', label: 'Urgent' },
}

interface PriorityBadgeProps {
  priority: JobPriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const c = PRIORITY_MAP[priority] ?? PRIORITY_MAP.medium
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
