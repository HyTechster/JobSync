import { useState, useMemo } from 'react'
import { AdminTopbar } from '../../components/layout/AdminTopbar'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import { useJobs, type RecentJobRow } from '../../features/jobs/hooks'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function MobileCard({ job }: { job: RecentJobRow }) {
  const techs = job.job_assignments ?? []
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5">
      <div className="flex items-start gap-2 mb-1">
        <p className="text-[13.5px] font-semibold text-text-base truncate flex-1">{job.title}</p>
        <PriorityBadge priority={job.priority} />
      </div>
      <p className="text-[12.5px] text-text-muted truncate">{job.customer_name}</p>
      {job.location && (
        <p className="text-[12px] text-text-muted truncate mt-0.5">{job.location}</p>
      )}

      {/* Technicians */}
      {techs.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex -space-x-1.5">
            {techs.slice(0, 3).map((a) => (
              <div
                key={a.technician_id}
                title={a.profiles?.full_name ?? ''}
                className="w-5 h-5 rounded-full bg-brand-700 text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white"
              >
                {(a.profiles?.full_name ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-[11.5px] text-text-muted truncate">
            {techs[0].profiles?.full_name ?? 'Unknown'}
            {techs.length > 1 ? ` +${techs.length - 1}` : ''}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Icons.check size={10} />
          Completed {formatDate(job.updated_at)}
        </span>
        <span className="inline-flex items-center gap-1 text-[11.5px] text-text-muted">
          <Icons.calendar size={11} />
          {formatDate(job.scheduled_date)}
        </span>
      </div>
    </div>
  )
}

// ─── Mobile skeleton ──────────────────────────────────────────────────────────

function MobileSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 animate-pulse">
      <div className="h-4 w-40 bg-slate-100 rounded mb-2" />
      <div className="h-3 w-28 bg-slate-100 rounded mb-3" />
      <div className="flex gap-3">
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

// ─── Desktop skeleton row ─────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-100 animate-pulse">
      <td className="px-4 py-3"><div className="h-3.5 w-36 bg-slate-100 rounded mb-1" /><div className="h-3 w-24 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-28 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-24 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-20 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-24 bg-slate-100 rounded" /></td>
    </tr>
  )
}

const HEADERS = ['Job', 'Customer', 'Technicians', 'Scheduled', 'Completed On']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminHistory() {
  const [search, setSearch] = useState('')
  const { data: allJobs = [], isLoading, isError } = useJobs({ status: 'completed' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allJobs
    return allJobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.customer_name.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
    )
  }, [allJobs, search])

  return (
    <>
      <AdminTopbar
        title="History"
        subtitle="All completed job orders"
        right={
          !isLoading && (
            <span className="text-[12px] font-medium text-text-muted whitespace-nowrap">
              {filtered.length} / {allJobs.length} completed
            </span>
          )
        }
      >
        <div className="mt-3">
          <div className="relative">
            <Icons.search
              size={14}
              color="#64748B"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job, customer, location…"
              className="h-[34px] w-full md:w-[280px] pl-8 pr-3 border border-slate-200 rounded-lg text-[13px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
            />
          </div>
        </div>
      </AdminTopbar>

      <div className="p-4 pb-4 md:p-8 md:pb-12">
        {isError && (
          <div className="text-sm text-danger bg-[#FFE4E6] rounded-lg px-4 py-3 mb-4">
            Failed to load history. Please refresh the page.
          </div>
        )}

        {/* ── Mobile card list ── */}
        <div className="flex flex-col gap-2.5 md:hidden">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <MobileSkeleton key={i} />)
            : filtered.length === 0
            ? (
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <Icons.check size={24} color="#059669" />
                </div>
                <p className="text-[13.5px] font-semibold text-text-base mb-1">
                  {search ? 'No matches found' : 'No completed jobs yet'}
                </p>
                <p className="text-[12.5px] text-text-muted">
                  {search ? 'Try a different search term.' : 'Completed jobs will appear here.'}
                </p>
              </div>
            )
            : filtered.map((j) => <MobileCard key={j.id} job={j} />)
          }
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-2 border-b border-slate-200">
                  {HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[11.5px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Icons.check size={24} color="#059669" />
                          </div>
                          <p className="text-sm font-semibold text-text-base mt-1">
                            {search ? 'No matches found' : 'No completed jobs yet'}
                          </p>
                          <p className="text-[13px] text-text-muted">
                            {search ? 'Try a different search term.' : 'Completed jobs will appear here.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                  : filtered.map((job) => {
                    const techs = job.job_assignments ?? []
                    return (
                      <tr key={job.id} className="border-t border-slate-100 hover:bg-surface-2 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-[13.5px] font-medium text-text-base line-clamp-1">{job.title}</p>
                          <p className="text-[11.5px] text-text-muted mt-0.5">{job.location}</p>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-text-muted whitespace-nowrap">
                          {job.customer_name}
                        </td>
                        <td className="px-4 py-3">
                          {techs.length === 0 ? (
                            <span className="text-[12px] text-text-subtle italic">Unassigned</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                {techs.slice(0, 3).map((a) => (
                                  <div
                                    key={a.technician_id}
                                    title={a.profiles?.full_name ?? ''}
                                    className="w-6 h-6 rounded-full bg-brand-700 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white"
                                  >
                                    {(a.profiles?.full_name ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                                  </div>
                                ))}
                              </div>
                              <span className="text-[13px] text-text-muted">
                                {techs[0].profiles?.full_name ?? 'Unknown'}
                                {techs.length > 1 ? ` +${techs.length - 1}` : ''}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-text-muted whitespace-nowrap">
                          {formatDate(job.scheduled_date)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                            <Icons.check size={11} />
                            {formatDate(job.updated_at)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
