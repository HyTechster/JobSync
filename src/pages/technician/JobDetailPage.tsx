import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useJob } from '../../features/jobs/hooks'
import { useUpdateJobStatus } from '../../features/jobs/mutations'
import { useJobSheet } from '../../features/job-sheets/hooks'
import { JobSheetDetailModal } from '../../features/job-sheets/JobSheetDetailModal'
import { StatusBadge } from '../../components/ui/StatusBadge'
import type { DisplayStatus } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'

function SheetViewer({ sheetId, onClose }: { sheetId: string; onClose: () => void }) {
  const { data: sheet, isLoading } = useJobSheet(sheetId)
  if (isLoading) return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,23,42,0.55)]">
      <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
    </div>
  )
  return <JobSheetDetailModal sheet={sheet ?? null} onClose={onClose} />
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{label}</p>
        <p className="text-[13.5px] text-text-base mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { data: job, isLoading, isError } = useJob(jobId ?? '')
  const { mutate: updateStatus, isPending } = useUpdateJobStatus()
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto text-center py-20">
        <p className="text-[14px] font-semibold text-text-base mb-1">Job not found</p>
        <p className="text-[12.5px] text-text-muted mb-5">
          This job may have been removed or you don't have access.
        </p>
        <button onClick={() => navigate(-1)} className="text-[13px] text-brand-700 font-semibold">
          ← Go back
        </button>
      </div>
    )
  }

  const hasSheet = (job.job_sheets ?? []).length > 0
  const displayStatus: DisplayStatus =
    job.status === 'completed' && !hasSheet ? 'completed_no_sheet' : job.status

  const scheduleValue = job.scheduled_time
    ? `${job.scheduled_date ?? 'TBD'} at ${job.scheduled_time.slice(0, 5)}`
    : (job.scheduled_date ?? 'To be scheduled')

  function handleStartJob() {
    updateStatus({ id: job!.id, status: 'in_progress' })
  }

  function handleComplete() {
    updateStatus({ id: job!.id, status: 'completed' }, { onSuccess: () => setShowCompleteConfirm(false) })
  }

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors"
          aria-label="Go back"
        >
          <Icons.arrowL size={20} />
        </button>
        <p className="flex-1 min-w-0 text-[15px] font-semibold text-text-base truncate">{job.title}</p>
        <StatusBadge status={displayStatus} />
      </header>

      <div className="px-4 py-5 space-y-4">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={job.priority} />
          <span className="text-[12px] text-text-muted">·</span>
          <span className="text-[12px] text-text-muted">#{job.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 px-4">
          <InfoRow icon={<Icons.user size={15} color="var(--color-brand-700)" />} label="Customer"
            value={job.customer_name + (job.customer_phone ? ` · ${job.customer_phone}` : '')} />
          <InfoRow icon={<Icons.pin size={15} color="var(--color-brand-700)" />} label="Location" value={job.location} />
          <InfoRow icon={<Icons.calendar size={15} color="var(--color-brand-700)" />} label="Schedule" value={scheduleValue} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Description</p>
          <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* ── Action buttons ──────────────────────────────────── */}

        {job.status === 'pending' && (
          <button
            type="button"
            onClick={handleStartJob}
            disabled={isPending}
            className="w-full h-[48px] rounded-xl bg-blue-600 text-white text-[14px] font-semibold disabled:opacity-50 transition-colors hover:bg-blue-700"
          >
            {isPending ? 'Updating…' : 'Start Job'}
          </button>
        )}

        {job.status === 'in_progress' && (
          <>
            {showCompleteConfirm ? (
              <div className="bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icons.check size={16} color="#059669" />
                  <p className="text-[14px] font-semibold text-text-base">Mark as completed?</p>
                </div>
                <p className="text-[12.5px] text-text-muted mb-4 leading-relaxed">
                  This marks the job complete. You can still submit a job sheet afterwards.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCompleteConfirm(false)}
                    className="flex-1 h-[44px] rounded-xl border border-slate-300 text-[13.5px] font-semibold text-text-base bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={isPending}
                    className="flex-1 h-[44px] rounded-xl bg-emerald-600 text-white text-[13.5px] font-semibold disabled:opacity-50"
                  >
                    {isPending ? 'Completing…' : 'Yes, complete'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCompleteConfirm(true)}
                  className="flex-1 h-[48px] rounded-xl border-2 border-emerald-600 text-emerald-700 text-[13.5px] font-semibold transition-colors hover:bg-emerald-50"
                >
                  Mark as Completed
                </button>
                <Link
                  to={`/technician/jobs/${job.id}/submit`}
                  className="flex-1 h-[48px] rounded-xl bg-brand-700 text-white text-[13.5px] font-semibold transition-colors hover:bg-brand-800 flex items-center justify-center gap-1.5"
                >
                  <Icons.sheets size={15} />
                  Submit Sheet
                </Link>
              </div>
            )}
          </>
        )}

        {job.status === 'completed' && !hasSheet && (
          <div className="space-y-2.5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-[12.5px] text-amber-800 font-medium">
                Job complete — a job sheet is still required as evidence.
              </p>
            </div>
            <Link
              to={`/technician/jobs/${job.id}/submit`}
              className="flex items-center justify-center gap-2 w-full h-[48px] rounded-xl bg-brand-700 text-white text-[14px] font-semibold transition-colors hover:bg-brand-800"
            >
              <Icons.sheets size={17} />
              Submit Job Sheet
            </Link>
          </div>
        )}

        {job.status === 'completed' && hasSheet && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <Icons.check size={16} color="#059669" />
            <p className="text-[13px] text-emerald-800 font-medium flex-1">Job and job sheet complete.</p>
            {job.job_sheets?.[0]?.id && (
              <button
                type="button"
                onClick={() => setSelectedSheetId(job.job_sheets![0].id)}
                className="flex-shrink-0 h-7 px-3 rounded-lg bg-emerald-600 text-white text-[11.5px] font-semibold hover:bg-emerald-700 transition-colors"
              >
                View Sheet
              </button>
            )}
          </div>
        )}
      </div>

      {selectedSheetId && (
        <SheetViewer sheetId={selectedSheetId} onClose={() => setSelectedSheetId(null)} />
      )}
    </div>
  )
}
