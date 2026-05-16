import { useMemo } from 'react'
import { useMyJobs } from '../../features/jobs/hooks'
import { TechnicianJobCard } from '../../features/jobs/TechnicianJobCard'
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
  const { data: jobs = [], isLoading, isError } = useMyJobs()

  const groups = useMemo(
    () => ({
      inProgress: jobs.filter((j) => j.status === 'in_progress'),
      pending:    jobs.filter((j) => j.status === 'pending'),
      done:       jobs.filter((j) => j.status === 'completed' || j.status === 'cancelled'),
    }),
    [jobs]
  )

  return (
    <div className="px-4 pt-6 pb-2 max-w-lg mx-auto">
      <h1 className="text-[22px] font-bold text-text-base mb-5">My Jobs</h1>

      {isError && (
        <div className="bg-[#FFF1F2] border border-[#FFD6DB] rounded-xl px-4 py-3 mb-4">
          <p className="text-[13px] text-danger">Failed to load jobs. Please refresh.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
            <Icons.jobs size={24} color="var(--color-text-muted)" />
          </div>
          <p className="text-[14px] font-semibold text-text-base mb-1">No jobs assigned</p>
          <p className="text-[12.5px] text-text-muted">
            Jobs assigned to you by your admin will appear here.
          </p>
        </div>
      ) : (
        <>
          <JobGroup title="In Progress" jobs={groups.inProgress} />
          <JobGroup title="Pending"     jobs={groups.pending} />
          <JobGroup title="Completed / Cancelled" jobs={groups.done} />
        </>
      )}
    </div>
  )
}
