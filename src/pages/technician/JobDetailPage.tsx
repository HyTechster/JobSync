import { Link, useNavigate, useParams } from 'react-router-dom'
import { useJob } from '../../features/jobs/hooks'
import { UpdateStatusButton } from '../../features/jobs/UpdateStatusButton'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'

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

  const scheduleValue = job.scheduled_time
    ? `${job.scheduled_date} at ${job.scheduled_time.slice(0, 5)}`
    : job.scheduled_date

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
        <p className="flex-1 min-w-0 text-[15px] font-semibold text-text-base truncate">
          {job.title}
        </p>
        <StatusBadge status={job.status} />
      </header>

      <div className="px-4 py-5 space-y-4">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={job.priority} />
          <span className="text-[12px] text-text-muted">·</span>
          <span className="text-[12px] text-text-muted">#{job.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 px-4">
          <InfoRow icon={<Icons.user size={15} color="var(--color-brand-700)" />} label="Customer" value={job.customer_name + (job.customer_phone ? ` · ${job.customer_phone}` : '')} />
          <InfoRow icon={<Icons.pin size={15} color="var(--color-brand-700)" />}  label="Location" value={job.location} />
          <InfoRow icon={<Icons.calendar size={15} color="var(--color-brand-700)" />} label="Schedule" value={scheduleValue} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">
            Description
          </p>
          <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        <UpdateStatusButton jobId={job.id} currentStatus={job.status} />

        {job.status === 'in_progress' && (
          <Link
            to={`/technician/jobs/${job.id}/submit`}
            className="flex items-center justify-center gap-2 w-full h-[48px] rounded-xl border-2 border-brand-700 text-brand-700 text-[14px] font-semibold transition-colors hover:bg-brand-50 active:bg-brand-100"
          >
            <Icons.sheets size={17} />
            Submit Job Sheet
          </Link>
        )}
      </div>
    </div>
  )
}
