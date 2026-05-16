import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useMyJobs } from '../../features/jobs/hooks'
import { useUnreadAlertCount } from '../../features/alerts/hooks'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Icons } from '../../components/ui/Icons'
import type { RecentJobRow } from '../../features/jobs/hooks'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  to: string
  iconBg: string
}

function StatCard({ label, value, icon, to, iconBg }: StatCardProps) {
  return (
    <Link
      to={to}
      className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-[26px] font-bold text-text-base leading-none">{value}</p>
        <p className="text-[12px] text-text-muted mt-0.5 leading-none">{label}</p>
      </div>
    </Link>
  )
}

function JobPreviewCard({ job }: { job: RecentJobRow }) {
  return (
    <Link
      to="/technician/jobs"
      className="block bg-white rounded-2xl border border-slate-200 px-4 py-3.5 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-text-base truncate">{job.title}</p>
          <p className="text-[12.5px] text-text-muted mt-0.5 truncate">{job.customer_name}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <div className="flex items-center gap-3 mt-2.5">
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.pin size={12} />
          <span className="truncate max-w-[140px]">{job.location}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.calendar size={12} />
          {job.scheduled_date}
        </span>
      </div>
    </Link>
  )
}

function SkeletonJobCard() {
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
        <div className="h-3 w-32 bg-slate-100 rounded" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export default function TechnicianDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const { data: jobs = [], isLoading } = useMyJobs()
  const { data: unread = 0 } = useUnreadAlertCount()

  const firstName = profile?.full_name.split(' ')[0] ?? 'there'

  const activeCount = useMemo(
    () => jobs.filter((j) => j.status === 'pending' || j.status === 'in_progress').length,
    [jobs]
  )

  const recentJobs = useMemo(() => jobs.slice(0, 3), [jobs])

  return (
    <div className="px-4 pt-6 pb-2 max-w-lg mx-auto">
      <div className="mb-6">
        <p className="text-[13px] text-text-muted">{getGreeting()},</p>
        <h1 className="text-[24px] font-bold text-text-base leading-tight">{firstName}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-7">
        <StatCard
          label="Active Jobs"
          value={activeCount}
          to="/technician/jobs"
          iconBg="bg-brand-50"
          icon={<Icons.jobs size={20} color="var(--color-brand-700)" />}
        />
        <StatCard
          label="Unread Alerts"
          value={unread}
          to="/technician/alerts"
          iconBg="bg-[#FEF3C7]"
          icon={<Icons.bell size={20} color="#D97706" />}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-text-base">Recent Jobs</h2>
          <Link to="/technician/jobs" className="text-[12.5px] text-brand-700 font-semibold">
            See all
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonJobCard key={i} />)}
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-10 text-center">
            <Icons.jobs size={32} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13.5px] font-medium text-text-base mb-1">No jobs yet</p>
            <p className="text-[12.5px] text-text-muted">
              Jobs assigned to you will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentJobs.map((job) => (
              <JobPreviewCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
