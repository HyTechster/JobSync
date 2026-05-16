import { Link } from 'react-router-dom'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import type { RecentJobRow } from './hooks'

interface TechnicianJobCardProps {
  job: RecentJobRow
}

export function TechnicianJobCard({ job }: TechnicianJobCardProps) {
  return (
    <Link
      to={`/technician/jobs/${job.id}`}
      className="block bg-white rounded-2xl border border-slate-200 px-4 py-3.5 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-text-base truncate">{job.title}</p>
          <p className="text-[12.5px] text-text-muted mt-0.5 truncate">{job.customer_name}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted min-w-0">
          <Icons.pin size={12} className="flex-shrink-0" />
          <span className="truncate max-w-[130px]">{job.location}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.calendar size={12} className="flex-shrink-0" />
          {job.scheduled_date}
          {job.scheduled_time && (
            <span className="ml-0.5">· {job.scheduled_time.slice(0, 5)}</span>
          )}
        </span>
        <PriorityBadge priority={job.priority} />
      </div>
    </Link>
  )
}
