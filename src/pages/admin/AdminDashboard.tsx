import { Link } from 'react-router-dom'
import { AdminTopbar } from '../../components/layout/AdminTopbar'
import { StatCard, StatCardSkeleton } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import { SkeletonBlock } from '../../components/shared/SkeletonBlock'
import { useAuthStore } from '../../store/authStore'
import { useDashboardStats, useRecentJobs, useRealtimeDashboard } from '../../features/jobs/hooks'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function RecentJobsTable() {
  const { data: jobs, isLoading, isError } = useRecentJobs()

  if (isError) {
    return (
      <p className="px-5 py-6 text-sm text-danger">
        Failed to load recent jobs. Please refresh.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-4 flex-1" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
            <SkeletonBlock className="h-5 w-12 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!jobs?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Icons.jobs size={32} color="#94A3B8" />
        <p className="mt-3 text-sm font-medium text-text-muted">No job orders yet</p>
        <Link to="/admin/jobs" className="mt-2 text-sm font-semibold text-brand-700 hover:text-brand-600">
          Create your first job →
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {jobs.map((job) => {
        const techs = job.job_assignments ?? []
        return (
          <div
            key={job.id}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors"
          >
            <div className="w-36 flex-shrink-0">
              <div className="text-xs font-semibold text-text-muted truncate">{job.id.slice(0, 8)}</div>
              <div className="text-sm font-semibold text-text-base truncate mt-0.5">{job.title}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-text-muted truncate">{job.customer_name}</div>
              <div className="text-xs text-text-subtle truncate mt-0.5">{job.location}</div>
            </div>
            <div className="text-xs text-text-muted w-20 flex-shrink-0">
              {new Date(job.scheduled_date).toLocaleDateString('en-MY', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
            <div className="flex -space-x-1.5 flex-shrink-0">
              {techs.length === 0 && (
                <span className="text-xs text-text-subtle italic">Unassigned</span>
              )}
              {techs.slice(0, 3).map((a) => (
                <div
                  key={a.technician_id}
                  title={a.profiles?.full_name ?? ''}
                  className="w-6 h-6 rounded-full bg-brand-700 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white"
                >
                  {(a.profiles?.full_name ?? '?')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
              ))}
            </div>
            <Icons.chevronR size={15} color="#94A3B8" />
          </div>
        )
      })}
    </div>
  )
}

export default function AdminDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats()
  const { isLive } = useRealtimeDashboard()

  const STAT_CARDS = [
    { label: 'Total Jobs',          value: stats?.total ?? 0,       icon: <Icons.jobs size={16} />,  accent: '#1E3A5F' },
    { label: 'Active Jobs',         value: stats?.active ?? 0,      icon: <Icons.spark size={16} />, accent: '#2563EB' },
    { label: 'Completed Jobs',      value: stats?.completed ?? 0,   icon: <Icons.check size={16} />, accent: '#059669' },
    { label: 'Active Technicians',  value: stats?.technicians ?? 0, icon: <Icons.users size={16} />, accent: '#D97706' },
  ]

  return (
    <>
      <AdminTopbar
        title={`${getGreeting()}, ${profile?.full_name?.split(' ')[0] ?? 'there'}`}
        subtitle="Here's what's happening across your jobs today."
        right={
          isLive ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_0_3px_rgba(5,150,105,0.2)]" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Polling
            </span>
          )
        }
      />

      <div className="p-8 flex flex-col gap-6">
        {/* Stat cards */}
        {statsError ? (
          <p className="text-sm text-danger">Failed to load statistics. Check your Supabase connection.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3.5">
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
              : STAT_CARDS.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}

        {/* Recent jobs */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-text-base">Recent jobs</h2>
              <p className="text-xs text-text-muted mt-0.5">Last 5 created job orders</p>
            </div>
            <Link
              to="/admin/jobs"
              className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-600"
            >
              View all <Icons.chevronR size={13} />
            </Link>
          </div>
          <RecentJobsTable />
        </div>
      </div>
    </>
  )
}
