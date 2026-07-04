import { Link } from 'react-router-dom'
import { AdminTopbar } from '../../components/layout/AdminTopbar'
import { StatCard, StatCardSkeleton } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import { SkeletonBlock } from '../../components/shared/SkeletonBlock'
import { useAuthStore } from '../../store/authStore'
import { useDashboardStats, useRecentJobs, useRealtimeDashboard, useJobAnalytics } from '../../features/jobs/hooks'
import { StatusDonut, PriorityBars, WeeklyAreaChart, CompletionRing } from '../../features/jobs/DashboardCharts'
import { useOrganization } from '../../context/OrganizationContext'
import { useDateFormatter } from '../../hooks/useDateFormatter'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTurnaround(hrs: number): string {
  if (hrs < 1) return `${Math.round(hrs * 60)} min`
  if (hrs < 24) return `${hrs.toFixed(1)} hrs`
  return `${(hrs / 24).toFixed(1)} days`
}

function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
          <div className="h-3.5 w-32 bg-slate-100 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-3 bg-slate-100 rounded" style={{ width: `${60 + j * 10}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function RecentJobsTable() {
  const { activeOrgId } = useOrganization()
  const { fmtDate } = useDateFormatter()
  const { data: jobs, isLoading, isError } = useRecentJobs(activeOrgId)

  if (isError) return <p className="px-4 py-6 text-sm text-danger">Failed to load recent jobs. Please refresh.</p>

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <SkeletonBlock className="h-4 w-28 md:w-36" />
            <SkeletonBlock className="h-4 flex-1" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
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
          <div key={job.id} className="hover:bg-surface-2 transition-colors">
            <div className="flex items-center gap-3 px-4 py-3 md:hidden">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <StatusBadge status={job.status} /><PriorityBadge priority={job.priority} />
                </div>
                <p className="text-[13.5px] font-semibold text-text-base truncate">{job.title}</p>
                <p className="text-[11.5px] text-text-muted truncate mt-0.5">{job.customer_name}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-[11px] text-text-muted">{fmtDate(job.scheduled_date)}</p>
                <Icons.chevronR size={13} color="#CBD5E1" className="mt-1 ml-auto" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 px-5 py-3.5">
              <div className="w-36 flex-shrink-0">
                <div className="text-xs font-semibold text-text-muted truncate">{job.id.slice(0, 8)}</div>
                <div className="text-sm font-semibold text-text-base truncate mt-0.5">{job.title}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-muted truncate">{job.customer_name}</div>
                <div className="text-xs text-text-subtle truncate mt-0.5">{job.location}</div>
              </div>
              <div className="text-xs text-text-muted w-20 flex-shrink-0">{fmtDate(job.scheduled_date)}</div>
              <StatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
              <div className="flex -space-x-1.5 flex-shrink-0">
                {techs.length === 0 && <span className="text-xs text-text-subtle italic">Unassigned</span>}
                {techs.slice(0, 3).map((a) => (
                  <div key={a.technician_id} title={a.profiles?.full_name ?? ''}
                    className="w-6 h-6 rounded-full bg-brand-700 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {(a.profiles?.full_name ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                ))}
              </div>
              <Icons.chevronR size={15} color="#94A3B8" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const { activeOrgId } = useOrganization()
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats(activeOrgId)
  const { data: analytics, isLoading: analyticsLoading } = useJobAnalytics(activeOrgId)
  const { isLive } = useRealtimeDashboard()

  const STAT_CARDS = [
    { label: 'Total Jobs',         value: stats?.total ?? 0,       icon: <Icons.jobs size={16} />,   accent: '#1E3A5F' },
    { label: 'Total Job Sheets',   value: stats?.totalSheets ?? 0, icon: <Icons.sheets size={16} />, accent: '#7C3AED' },
    { label: 'Active Jobs',        value: stats?.active ?? 0,      icon: <Icons.spark size={16} />,  accent: '#2563EB' },
    { label: 'Completed Jobs',     value: stats?.completed ?? 0,   icon: <Icons.check size={16} />,  accent: '#059669' },
    { label: 'Active Technicians', value: stats?.technicians ?? 0, icon: <Icons.users size={16} />,  accent: '#D97706' },
    { label: 'Total Alerts',       value: stats?.totalAlerts ?? 0, icon: <Icons.bell size={16} />,   accent: '#DC2626' },
    { label: 'Unseen Alerts',      value: stats?.unseenAlerts ?? 0,icon: <Icons.alerts size={16} />, accent: '#EA580C' },
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

      <div className="p-4 md:p-8 flex flex-col gap-5 md:gap-6 pb-24 md:pb-12">
        {/* ── 7 stat cards ── */}
        {statsError ? (
          <p className="text-sm text-danger">Failed to load statistics.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
            {statsLoading
              ? Array.from({ length: 7 }).map((_, i) => <StatCardSkeleton key={i} />)
              : STAT_CARDS.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}

        {/* ── Getting started (shown only when no jobs exist yet) ── */}
        {!statsLoading && !statsError && stats?.total === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 px-6 py-8 md:px-10 md:py-10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                <Icons.jobs size={32} color="#1E3A5F" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-[11px] font-bold text-brand-700 uppercase tracking-widest mb-1.5">Getting Started</p>
                <h2 className="text-[20px] md:text-[22px] font-bold text-text-base leading-snug mb-2">
                  <span className="block text-text-muted font-medium text-[15px] md:text-[16px] mb-0.5">Your workspace is ready</span>
                  <span className="block">Create your first job order</span>
                </h2>
                <p className="text-[13.5px] text-text-muted leading-relaxed max-w-[480px]">
                  Add a job, assign it to a technician, and track work in real time.
                  Job sheets, analytics, and alerts all build from there.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-5 justify-center md:justify-start">
                  <Link
                    to="/admin/jobs?create=1"
                    className="inline-flex items-center gap-2 h-[38px] px-5 bg-brand-700 hover:bg-brand-800 text-white text-[13.5px] font-semibold rounded-xl transition-colors"
                  >
                    <Icons.plus size={14} color="white" />
                    Create first job order
                  </Link>
                  <Link
                    to="/admin/users"
                    className="inline-flex items-center gap-2 h-[38px] px-5 border border-slate-200 hover:bg-surface-2 text-text-base text-[13.5px] font-semibold rounded-xl transition-colors"
                  >
                    <Icons.users size={14} />
                    Manage team first
                  </Link>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {[
                { step: '1', title: 'Add your team', desc: 'Invite technicians so you can assign them to jobs.', to: '/admin/users' },
                { step: '2', title: 'Create a job order', desc: 'Fill in the customer, location, schedule and priority.', to: '/admin/jobs?create=1' },
                { step: '3', title: 'Track in real time', desc: 'Watch status updates and job sheets come in live.', to: '/admin/jobs' },
              ].map(({ step, title, desc, to }) => (
                <Link key={step} to={to} className="flex items-start gap-3 px-6 py-4 hover:bg-surface-2 transition-colors group">
                  <span className="w-6 h-6 rounded-full bg-brand-700 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-text-base group-hover:text-brand-700 transition-colors">{title}</p>
                    <p className="text-[12px] text-text-muted mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Analytics ── */}
        {analyticsLoading ? (
          <AnalyticsSkeleton />
        ) : analytics && (stats?.total ?? 0) > 0 ? (
          <>
            {/* Row 1: Status Donut + Priority Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-4">Status Distribution</p>
                <StatusDonut data={analytics.byStatus} />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-4">Jobs by Priority</p>
                <PriorityBars data={analytics.byPriority} />
              </div>
            </div>

            {/* Row 2: Weekly trend (full width) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">Jobs Created — Last 7 Days</p>
                <span className="text-[11.5px] text-text-muted">
                  {analytics.daily.reduce((s, d) => s + d.count, 0)} this week
                </span>
              </div>
              <WeeklyAreaChart data={analytics.daily} />
            </div>

            {/* Row 3: Turnaround + Completion Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-3">Avg Sheet Turnaround</p>
                {analytics.avgTurnaroundHours === null ? (
                  <p className="text-[13px] text-text-muted">No sheets submitted yet.</p>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-[36px] font-bold text-text-base leading-none">
                      {formatTurnaround(analytics.avgTurnaroundHours)}
                    </span>
                    <span className="text-[12px] text-text-muted mb-1">job created → sheet submitted</span>
                  </div>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-3">Overall Progress</p>
                <CompletionRing pct={analytics.completionRate} />
              </div>
            </div>
          </>
        ) : null}

        {/* ── Recent jobs ── */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 md:px-5 md:py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-text-base">Recent jobs</h2>
              <p className="text-xs text-text-muted mt-0.5">Last 5 created job orders</p>
            </div>
            <Link to="/admin/jobs" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-600">
              View all <Icons.chevronR size={13} />
            </Link>
          </div>
          <RecentJobsTable />
        </div>
      </div>
    </>
  )
}
