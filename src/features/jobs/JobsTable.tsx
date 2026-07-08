import { useState } from 'react'
import { createPortal } from 'react-dom'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { SortableTh } from '../../components/ui/SortIndicator'
import { SheetPendingBadge } from '../../components/ui/SheetPendingBadge'
import { useSort } from '../../hooks/useSort'
import type { RecentJobRow } from './hooks'

interface JobsTableProps {
  jobs: RecentJobRow[]
  totalUnfiltered?: number
  isLoading?: boolean
  onEdit: (job: RecentJobRow) => void
  onCancel: (job: RecentJobRow) => void
  onDelete: (job: RecentJobRow) => void
  onCreateFirst?: () => void
}

type SortKey = 'title' | 'customer' | 'priority' | 'schedule'

interface TooltipState {
  x: number
  y: number
  assignees: RecentJobRow['job_assignments']
}

const PRIORITY_ORDER: Record<string, number> = { low: 0, medium: 1, high: 2, urgent: 3 }

const COMPARATORS: Record<SortKey, (a: RecentJobRow, b: RecentJobRow) => number> = {
  title:    (a, b) => a.title.localeCompare(b.title),
  customer: (a, b) => a.customer_name.localeCompare(b.customer_name),
  priority: (a, b) => (PRIORITY_ORDER[a.priority] ?? 0) - (PRIORITY_ORDER[b.priority] ?? 0),
  schedule: (a, b) => (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''),
}

const COLS: { label: string; sortKey?: SortKey }[] = [
  { label: 'Job',          sortKey: 'title' },
  { label: 'Customer',     sortKey: 'customer' },
  { label: 'Priority',     sortKey: 'priority' },
  { label: 'Schedule',     sortKey: 'schedule' },
  { label: 'Technicians' },
  { label: 'Status' },
  { label: '' },
]

function SkeletonRow() {
  return (
    <tr>
      {COLS.map((_, i) => (
        <td key={i} className="px-4 py-[14px] border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${55 + ((i * 17) % 35)}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function JobsTable({ jobs, totalUnfiltered, isLoading, onEdit, onCancel, onDelete, onCreateFirst }: JobsTableProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const { sortKey, sortDir, handleSort, sorted: sortedJobs } = useSort(jobs, COMPARATORS)

  function showTooltip(e: React.MouseEvent, assignees: RecentJobRow['job_assignments']) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltip({ x: rect.left, y: rect.bottom + 8, assignees })
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-surface-2 text-text-muted">
              {COLS.map(({ label, sortKey: sk }) => (
                <SortableTh
                  key={label || 'actions'}
                  label={label}
                  sortable={!!sk}
                  active={sortKey === sk}
                  dir={sortKey === sk ? sortDir : 'asc'}
                  onClick={sk ? () => handleSort(sk) : undefined}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : sortedJobs.map((job, i) => {
                  const isLast    = i === sortedJobs.length - 1
                  const border    = isLast ? '' : 'border-b border-slate-100'
                  const shortId   = job.id.slice(0, 8).toUpperCase()
                  const assignees = job.job_assignments
                  const shown     = assignees.slice(0, 3)
                  const overflow  = assignees.length - 3

                  return (
                    <tr key={job.id} className="hover:bg-surface-2 transition-colors group">
                      {/* Job */}
                      <td className={`px-4 py-[14px] ${border}`}>
                        <div className="text-[11px] text-text-muted font-semibold tracking-wide">{shortId}</div>
                        <div className="text-[13.5px] font-semibold text-text-base mt-0.5">{job.title}</div>
                      </td>

                      {/* Customer */}
                      <td className={`px-4 py-[14px] ${border}`}>
                        <div className="font-medium text-text-base">{job.customer_name}</div>
                        <div className="text-[11.5px] text-text-muted mt-0.5 truncate max-w-[160px]">{job.location}</div>
                      </td>

                      {/* Priority */}
                      <td className={`px-4 py-[14px] ${border}`}>
                        <PriorityBadge priority={job.priority} />
                      </td>

                      {/* Schedule */}
                      <td className={`px-4 py-[14px] ${border} text-text-muted whitespace-nowrap`}>
                        {job.scheduled_date}
                        {job.scheduled_time && <span className="ml-1">· {job.scheduled_time.slice(0, 5)}</span>}
                      </td>

                      {/* Technicians — portal tooltip on hover */}
                      <td className={`px-4 py-[14px] ${border}`}>
                        {assignees.length > 0 ? (
                          <div
                            className="inline-flex items-center cursor-default"
                            onMouseEnter={(e) => showTooltip(e, assignees)}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            {shown.map((a, idx) => (
                              <div key={a.technician_id} style={{ marginLeft: idx ? -6 : 0 }}>
                                <Avatar name={a.profiles?.full_name ?? '?'} size={24} src={a.profiles?.avatar_url} />
                              </div>
                            ))}
                            {overflow > 0 && (
                              <div
                                className="w-6 h-6 rounded-full bg-surface-2 border-2 border-white text-[10px] font-semibold text-text-muted flex items-center justify-center"
                                style={{ marginLeft: -6 }}
                              >
                                +{overflow}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-text-muted italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className={`px-4 py-[14px] ${border}`}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StatusBadge status={job.status} />
                          {job.status === 'completed' && (job.job_sheets?.length ?? 0) === 0 && <SheetPendingBadge />}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className={`px-4 py-[14px] ${border}`}>
                        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(job)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-base transition-colors"
                            aria-label={`Edit ${job.title}`}
                          >
                            <Icons.edit size={15} />
                          </button>
                          {job.status !== 'completed' && job.status !== 'cancelled' && (
                            <button
                              onClick={() => onCancel(job)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-amber-50 hover:text-amber-600 transition-colors"
                              aria-label={`Cancel ${job.title}`}
                            >
                              <Icons.ban size={15} />
                            </button>
                          )}
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

        {!isLoading && sortedJobs.length === 0 && (
          totalUnfiltered === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                <Icons.jobs size={26} color="#1E3A5F" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-text-base mb-1">No job orders yet</p>
                <p className="text-[13px] text-text-muted max-w-[280px]">
                  Create your first job order to assign work to your team and start tracking progress.
                </p>
              </div>
              {onCreateFirst && (
                <button
                  onClick={onCreateFirst}
                  className="inline-flex items-center gap-2 h-[38px] px-5 bg-brand-700 hover:bg-brand-800 text-white text-[13.5px] font-semibold rounded-xl transition-colors"
                >
                  <Icons.plus size={14} color="white" />
                  Create first job order
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Icons.jobs size={40} color="#94A3B8" />
              <p className="text-sm font-medium text-text-muted">No jobs match your filters</p>
              <p className="text-xs text-text-subtle">Try adjusting the status, technician, or date range.</p>
            </div>
          )
        )}
      </div>

      {/* Portal tooltip — renders into document.body, escapes all overflow clipping */}
      {tooltip && createPortal(
        <div
          style={{ position: 'fixed', left: tooltip.x, top: tooltip.y, zIndex: 9999 }}
          className="pointer-events-none"
        >
          {/* upward caret */}
          <div className="w-0 h-0 ml-4 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent border-b-slate-800" />
          <div className="bg-slate-800 text-white text-[11.5px] rounded-xl px-3 py-2.5 shadow-xl min-w-[150px] max-w-[220px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">All Technicians</p>
            {tooltip.assignees.map((a) => (
              <p key={a.technician_id} className="py-[2px] truncate">
                {a.profiles?.display_name ?? a.profiles?.full_name ?? '—'}
              </p>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
