import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useMyJobs } from '../../features/jobs/hooks'
import { useMyJobSheets } from '../../features/job-sheets/hooks'
import { useUnreadAlertCount } from '../../features/alerts/hooks'
import { useOrganization } from '../../context/OrganizationContext'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import { formatDuration } from '../../utils/formatters'
import type { RecentJobRow } from '../../features/jobs/hooks'
import type { JobSheetWithDetail } from '../../features/job-sheets/hooks'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Mini stat card (mobile clickable link) ────────────────────────────────────

function MiniStat({ label, value, icon, to, accent, loading }: {
  label: string; value: number; icon: React.ReactNode
  to: string; accent: string; loading: boolean
}) {
  return (
    <Link to={to}
      className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}1A` }}>
        {icon}
      </div>
      {loading ? (
        <div className="space-y-1.5">
          <div className="h-6 w-10 bg-slate-100 rounded animate-pulse" />
          <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
        </div>
      ) : (
        <div>
          <p className="text-[26px] font-bold text-text-base leading-none">{value}</p>
          <p className="text-[11.5px] text-text-muted mt-0.5 leading-none">{label}</p>
        </div>
      )}
    </Link>
  )
}

// ── Job card (mobile) ─────────────────────────────────────────────────────────

function JobCard({ job }: { job: RecentJobRow }) {
  return (
    <Link to={`/technician/jobs/${job.id}`}
      className="block bg-white rounded-2xl border border-slate-200 px-4 py-3.5 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-text-base truncate">{job.title}</p>
          <p className="text-[12.5px] text-text-muted mt-0.5 truncate">{job.customer_name}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.pin size={12} />
          <span className="truncate max-w-[120px]">{job.location}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.calendar size={12} />
          {job.scheduled_date}
        </span>
        <PriorityBadge priority={job.priority} />
      </div>
    </Link>
  )
}

// ── Sheet row (desktop recent sheets) ────────────────────────────────────────

function SheetRow({ sheet }: { sheet: JobSheetWithDetail }) {
  const title = sheet.job_title ?? sheet.job_orders?.title ?? 'Untitled'
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <Icons.sheets size={13} color="#059669" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-text-base truncate">{title}</p>
        <p className="text-[11px] text-text-muted">{formatDuration(sheet.time_spent_minutes)}</p>
      </div>
      {sheet.sheet_number != null && (
        <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
          #{sheet.sheet_number}
        </span>
      )}
    </div>
  )
}

// ── My progress mini bar chart ────────────────────────────────────────────────

function MyProgressBars({ inProgress, completed, pending }: { inProgress: number; completed: number; pending: number }) {
  const total = inProgress + completed + pending
  const max   = Math.max(total, 1)
  const bars = [
    { label: 'Active',    value: inProgress, pct: (inProgress / max) * 100, color: 'bg-blue-500' },
    { label: 'Completed', value: completed,  pct: (completed  / max) * 100, color: 'bg-emerald-500' },
    { label: 'Pending',   value: pending,    pct: (pending    / max) * 100, color: 'bg-slate-300' },
  ]
  return (
    <div className="flex flex-col gap-2">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted w-16 flex-shrink-0">{b.label}</span>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${b.color}`} style={{ width: `${b.pct}%` }} />
          </div>
          <span className="text-[12px] font-bold text-text-base w-4 text-right">{b.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TechnicianDashboard() {
  const profile = useAuthStore((s) => s.profile)
  const { activeOrgId } = useOrganization()
  const { data: jobs = [], isLoading: jobsLoading } = useMyJobs(activeOrgId)
  const { data: sheets = [], isLoading: sheetsLoading } = useMyJobSheets(activeOrgId)
  const { data: unread = 0, isLoading: alertLoading } = useUnreadAlertCount(activeOrgId)

  const firstName = profile?.full_name.split(' ')[0] ?? 'there'

  const inProgressCount = useMemo(() => jobs.filter((j) => j.status === 'in_progress').length, [jobs])
  const pendingCount    = useMemo(() => jobs.filter((j) => j.status === 'pending').length, [jobs])
  const completedCount  = useMemo(() => jobs.filter((j) => j.status === 'completed').length, [jobs])
  const activeCount     = inProgressCount + pendingCount
  const recentJobs     = useMemo(() => jobs.slice(0, 5), [jobs])
  const recentSheets   = useMemo(() => sheets.slice(0, 5), [sheets])

  const loading = jobsLoading || sheetsLoading || alertLoading

  const STATS = [
    { label: 'Active Jobs',       value: activeCount,      to: '/technician/jobs',        accent: '#1E3A5F', icon: <Icons.jobs size={20} color="#1E3A5F" /> },
    { label: 'Completed Jobs',    value: completedCount,   to: '/technician/history',     accent: '#059669', icon: <Icons.check size={20} color="#059669" /> },
    { label: 'Sheets Submitted',  value: sheets.length,    to: '/technician/job-sheets',  accent: '#7C3AED', icon: <Icons.sheets size={20} color="#7C3AED" /> },
    { label: 'Unread Alerts',     value: unread,           to: '/technician/alerts',      accent: '#D97706', icon: <Icons.bell size={20} color="#D97706" /> },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
      {/* Greeting */}
      <div className="mb-5">
        <p className="text-[13px] text-text-muted">{getGreeting()},</p>
        <h1 className="text-[24px] font-bold text-text-base leading-tight">{firstName}</h1>
      </div>

      {/* Stat cards — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => (
          <MiniStat key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* ── Desktop 2-col layout ───────────────────────────────────────── */}
      <div className="hidden md:grid md:grid-cols-2 gap-5 mb-5">
        {/* My jobs list */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-text-base">My Jobs</h2>
            <Link to="/technician/jobs" className="text-xs font-semibold text-brand-700 hover:text-brand-600 flex items-center gap-1">
              View all <Icons.chevronR size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {jobsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-36 bg-slate-100 rounded" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </div>
              ))
            ) : recentJobs.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Icons.jobs size={28} color="#94A3B8" className="mx-auto mb-2" />
                <p className="text-[13px] text-text-muted">No jobs assigned yet</p>
              </div>
            ) : (
              recentJobs.map((job) => (
                <Link key={job.id} to={`/technician/jobs/${job.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-text-base truncate">{job.title}</p>
                    <p className="text-[11.5px] text-text-muted mt-0.5 truncate">{job.customer_name}</p>
                  </div>
                  <StatusBadge status={job.status} />
                  <Icons.chevronR size={13} color="#CBD5E1" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* My progress + recent sheets */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-3">My Job Progress</p>
            <MyProgressBars inProgress={inProgressCount} completed={completedCount} pending={pendingCount} />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-text-base">Recent Sheets</h2>
              <Link to="/technician/job-sheets" className="text-xs font-semibold text-brand-700 hover:text-brand-600 flex items-center gap-1">
                View all <Icons.chevronR size={12} />
              </Link>
            </div>
            <div className="px-4 py-2">
              {sheetsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-2.5 py-2.5 border-b border-slate-100 last:border-0 animate-pulse">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-32 bg-slate-100 rounded" />
                      <div className="h-2.5 w-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))
              ) : recentSheets.length === 0 ? (
                <div className="py-8 text-center">
                  <Icons.sheets size={24} color="#94A3B8" className="mx-auto mb-2" />
                  <p className="text-[12.5px] text-text-muted">No sheets submitted yet</p>
                </div>
              ) : (
                recentSheets.map((s) => <SheetRow key={s.id} sheet={s} />)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ─────────────────────────────────────────────── */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-text-base">Recent Jobs</h2>
          <Link to="/technician/jobs" className="text-[12.5px] text-brand-700 font-semibold">See all</Link>
        </div>

        {jobsLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 animate-pulse">
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
            ))}
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-10 text-center">
            <Icons.jobs size={32} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13.5px] font-medium text-text-base mb-1">No jobs yet</p>
            <p className="text-[12.5px] text-text-muted">Jobs assigned to you will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentJobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  )
}
