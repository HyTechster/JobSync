import type { JobStatus } from '../../types'

interface StatusConfig {
  bg: string
  text: string
  dot: string
  label: string
}

const STATUS_MAP: Record<JobStatus, StatusConfig> = {
  pending:     { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', dot: 'bg-[#D97706]', label: 'Pending' },
  in_progress: { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]', dot: 'bg-[#2563EB]', label: 'In Progress' },
  completed:   { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', dot: 'bg-[#059669]', label: 'Completed' },
  cancelled:   { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#94A3B8]', label: 'Cancelled' },
}

interface StatusBadgeProps {
  status: JobStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = STATUS_MAP[status] ?? STATUS_MAP.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
