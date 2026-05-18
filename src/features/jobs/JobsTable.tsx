import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import type { RecentJobRow } from './hooks'

interface JobsTableProps {
  jobs: RecentJobRow[]
  isLoading?: boolean
  onEdit: (job: RecentJobRow) => void
  onDelete: (job: RecentJobRow) => void
}

const HEADERS = ['Job', 'Customer', 'Priority', 'Schedule', 'Technicians', 'Status', '']

function SkeletonRow() {
  return (
    <tr>
      {HEADERS.map((_, i) => (
        <td key={i} className="px-4 py-[14px] border-b border-slate-100">
          <div
            className="h-4 bg-slate-200 rounded animate-pulse"
            style={{ width: `${55 + ((i * 17) % 35)}%` }}
          />
        </td>
      ))}
    </tr>
  )
}

export function JobsTable({ jobs, isLoading, onEdit, onDelete }: JobsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-surface-2 text-text-muted">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] font-semibold tracking-wide uppercase border-b border-slate-200 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : jobs.map((job, i) => {
                const isLast = i === jobs.length - 1
                const border = isLast ? '' : 'border-b border-slate-100'
                const shortId = job.id.slice(0, 8).toUpperCase()
                const assignees = job.job_assignments

                return (
                  <tr key={job.id} className="hover:bg-surface-2 transition-colors group">
                    <td className={`px-4 py-[14px] ${border}`}>
                      <div className="text-[11px] text-text-muted font-semibold tracking-wide">
                        {shortId}
                      </div>
                      <div className="text-[13.5px] font-semibold text-text-base mt-0.5">
                        {job.title}
                      </div>
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      <div className="font-medium text-text-base">{job.customer_name}</div>
                      <div className="text-[11.5px] text-text-muted mt-0.5 truncate max-w-[160px]">
                        {job.location}
                      </div>
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      <PriorityBadge priority={job.priority} />
                    </td>
                    <td className={`px-4 py-[14px] ${border} text-text-muted whitespace-nowrap`}>
                      {job.scheduled_date}
                      {job.scheduled_time && (
                        <span className="ml-1">· {job.scheduled_time.slice(0, 5)}</span>
                      )}
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      {assignees.length > 0 ? (
                        <div className="flex items-center">
                          {assignees.slice(0, 3).map((a, idx) => (
                            <div
                              key={a.technician_id}
                              style={{ marginLeft: idx ? -6 : 0 }}
                              title={a.profiles ? (a.profiles.display_name ?? a.profiles.full_name) : ''}
                            >
                              <Avatar
                                name={a.profiles?.full_name ?? '?'}
                                size={24}
                                src={a.profiles?.avatar_url}
                              />
                            </div>
                          ))}
                          {assignees.length > 3 && (
                            <div
                              className="w-6 h-6 rounded-full bg-surface-2 border-2 border-white text-[10px] font-semibold text-text-muted flex items-center justify-center"
                              style={{ marginLeft: -6 }}
                            >
                              +{assignees.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[12px] text-text-muted italic">Unassigned</span>
                      )}
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(job)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-base transition-colors"
                          aria-label={`Edit ${job.title}`}
                        >
                          <Icons.edit size={15} />
                        </button>
                        <button
                          onClick={() => onDelete(job)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-[#FFE4E6] hover:text-danger transition-colors"
                          aria-label={`Delete ${job.title}`}
                        >
                          <Icons.trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
        </tbody>
      </table>

      {!isLoading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Icons.jobs size={40} color="#94A3B8" />
          <p className="text-sm font-medium text-text-muted">No jobs found</p>
          <p className="text-xs text-text-subtle">
            Try adjusting your filters or create a new job order.
          </p>
        </div>
      )}
    </div>
  )
}
