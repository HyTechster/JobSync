import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyJobs, useOpenJobs, useRealtimeTechnicianJobs } from '../../features/jobs/hooks'
import { useClaimJob } from '../../features/jobs/mutations'
import { useOrganization } from '../../context/OrganizationContext'
import { TechnicianJobCard } from '../../features/jobs/TechnicianJobCard'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import type { RecentJobRow } from '../../features/jobs/hooks'

interface JobGroupProps {
  title: string
  jobs: RecentJobRow[]
}

function JobGroup({ title, jobs }: JobGroupProps) {
  if (jobs.length === 0) return null
  return (
    <div className="mb-5">
      <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
        {title} · {jobs.length}
      </p>
      <div className="flex flex-col gap-2.5">
        {jobs.map((job) => (
          <TechnicianJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}

function OpenJobCard({ job }: { job: RecentJobRow }) {
  const { mutate: claim, isPending } = useClaimJob()
  const [claimError, setClaimError] = useState<string | null>(null)

  function handleClaim() {
    setClaimError(null)
    claim(job.id, {
      onError: (err) => setClaimError(err.message),
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-200 px-4 py-3.5 shadow-sm">
      {/* header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-text-base truncate">{job.title}</p>
          <p className="text-[12.5px] text-text-muted mt-0.5 truncate">{job.customer_name}</p>
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Open
        </span>
      </div>

      {/* meta */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-3">
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted min-w-0">
          <Icons.pin size={12} className="flex-shrink-0" />
          <span className="truncate max-w-[130px]">{job.location}</span>
        </span>
        {job.scheduled_date && (
          <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
            <Icons.calendar size={12} className="flex-shrink-0" />
            {job.scheduled_date}
          </span>
        )}
        <PriorityBadge priority={job.priority} />
      </div>

      {/* error */}
      {claimError && (
        <p className="text-[12px] text-danger bg-[#FFF1F2] border border-[#FFD6DB] rounded-lg px-3 py-2 mb-2.5">
          {claimError}
        </p>
      )}

      {/* actions */}
      <div className="flex gap-2">
        <Link
          to={`/technician/jobs/${job.id}`}
          className="flex-1 h-[40px] rounded-xl border border-slate-200 text-[13px] font-semibold text-text-base hover:bg-surface-2 transition-colors flex items-center justify-center"
        >
          View Details
        </Link>
        <button
          type="button"
          onClick={handleClaim}
          disabled={isPending}
          className="flex-1 h-[40px] rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icons.spark size={13} color="white" />
              Claim &amp; Start
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 animate-pulse">
      <div className="flex items-start gap-2 mb-2.5">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-44 bg-slate-100 rounded" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
        <div className="h-5 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-28 bg-slate-100 rounded" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export default function TechnicianJobsPage() {
  useRealtimeTechnicianJobs()
  const { activeOrgId } = useOrganization()
  const { data: jobs = [], isLoading, isError } = useMyJobs(activeOrgId)
  const { data: openJobs = [], isLoading: openLoading } = useOpenJobs(activeOrgId)

  const groups = useMemo(
    () => ({
      inProgress: jobs.filter((j) => j.status === 'in_progress'),
      pending:    jobs.filter((j) => j.status === 'pending'),
      done:       jobs.filter((j) => j.status === 'completed' || j.status === 'cancelled'),
    }),
    [jobs]
  )

  const hasMyJobs = jobs.length > 0
  const hasOpenJobs = openJobs.length > 0

  return (
    <div className="px-4 pt-6 pb-2 max-w-lg mx-auto">
      <h1 className="text-[22px] font-bold text-text-base mb-5">Jobs</h1>

      {isError && (
        <div className="bg-[#FFF1F2] border border-[#FFD6DB] rounded-xl px-4 py-3 mb-4">
          <p className="text-[13px] text-danger">Failed to load jobs. Please refresh.</p>
        </div>
      )}

      {/* ── Open Jobs ─────────────────────────────────────────── */}
      {(openLoading || hasOpenJobs) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 px-0.5">
            <p className="text-[11.5px] font-semibold text-amber-700 uppercase tracking-wide">
              Open Jobs{!openLoading && ` · ${openJobs.length}`}
            </p>
            <span className="text-[10.5px] text-text-muted">(available to claim)</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {openLoading
              ? Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
              : openJobs.map((job) => <OpenJobCard key={job.id} job={job} />)}
          </div>
        </div>
      )}

      {/* ── My Jobs ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !hasMyJobs && !hasOpenJobs && !openLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
            <Icons.jobs size={24} color="var(--color-text-muted)" />
          </div>
          <p className="text-[14px] font-semibold text-text-base mb-1">No jobs yet</p>
          <p className="text-[12.5px] text-text-muted">
            Jobs assigned to you or available to claim will appear here.
          </p>
        </div>
      ) : hasMyJobs ? (
        <>
          {hasOpenJobs && (
            <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
              My Jobs
            </p>
          )}
          <JobGroup title="In Progress" jobs={groups.inProgress} />
          <JobGroup title="Pending"     jobs={groups.pending} />
          <JobGroup title="Completed / Cancelled" jobs={groups.done} />
        </>
      ) : null}
    </div>
  )
}
