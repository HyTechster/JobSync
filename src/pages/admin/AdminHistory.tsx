import { useState, useMemo } from 'react'
import { AdminTopbar } from '../../components/layout/AdminTopbar'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import { SortableTh } from '../../components/ui/SortIndicator'
import { SortSelect } from '../../components/ui/SortSelect'
import { useSort } from '../../hooks/useSort'
import { useJobs, type RecentJobRow } from '../../features/jobs/hooks'
import { useJobSheet } from '../../features/job-sheets/hooks'
import { JobSheetDetailModal } from '../../features/job-sheets/JobSheetDetailModal'
import { useOrganization } from '../../context/OrganizationContext'
import { useDateFormatter } from '../../hooks/useDateFormatter'

type SortKey = 'title' | 'customer' | 'scheduled' | 'completed'

const COMPARATORS: Record<SortKey, (a: RecentJobRow, b: RecentJobRow) => number> = {
  title:     (a, b) => a.title.localeCompare(b.title),
  customer:  (a, b) => a.customer_name.localeCompare(b.customer_name),
  scheduled: (a, b) => (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''),
  completed: (a, b) => (a.updated_at ?? '').localeCompare(b.updated_at ?? ''),
}

const SORT_OPTIONS = [
  { key: 'completed' as SortKey, dir: 'desc' as const, label: 'Completed (newest)' },
  { key: 'completed' as SortKey, dir: 'asc'  as const, label: 'Completed (oldest)' },
  { key: 'scheduled' as SortKey, dir: 'desc' as const, label: 'Scheduled (newest)' },
  { key: 'scheduled' as SortKey, dir: 'asc'  as const, label: 'Scheduled (oldest)' },
  { key: 'title'     as SortKey, dir: 'asc'  as const, label: 'Job (A–Z)' },
  { key: 'customer'  as SortKey, dir: 'asc'  as const, label: 'Customer (A–Z)' },
]

function SheetViewer({ sheetId, onClose }: { sheetId: string; onClose: () => void }) {
  const { data: sheet, isLoading } = useJobSheet(sheetId)
  if (isLoading) return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,23,42,0.55)]">
      <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
    </div>
  )
  return <JobSheetDetailModal sheet={sheet ?? null} onClose={onClose} />
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

function MobileCard({ job, onViewSheet }: { job: RecentJobRow; onViewSheet: (id: string) => void }) {
  const { fmtDate } = useDateFormatter()
  const techs = job.job_assignments ?? []
  const sheetId = job.job_sheets?.[0]?.id
  const sheetNumber = job.job_sheets?.[0]?.sheet_number
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
                title={a.profiles ? (a.profiles.display_name ?? a.profiles.full_name) : ''}
                className="w-5 h-5 rounded-full bg-brand-700 text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white"
              >
                {(a.profiles?.full_name ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            ))}
          </div>
          <div className="truncate">
            <span className="text-[11.5px] text-text-muted">
              {techs[0].profiles ? (techs[0].profiles.display_name ?? techs[0].profiles.full_name) : 'Unknown'}
              {techs.length > 1 ? ` +${techs.length - 1}` : ''}
            </span>
            {techs[0].profiles?.display_name && (
              <span className="text-[10px] text-text-subtle ml-1">({techs[0].profiles.full_name})</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Icons.check size={10} />
            Completed {fmtDate(job.updated_at)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px] text-text-muted">
            <Icons.calendar size={11} />
            {fmtDate(job.scheduled_date)}
          </span>
        </div>
        {sheetId && (
          <button
            type="button"
            onClick={() => onViewSheet(sheetId)}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
          >
            <Icons.sheets size={12} />
            {sheetNumber != null ? `Sheet #${sheetNumber}` : 'View Sheet'}
          </button>
        )}
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

const HEADERS: { label: string; sortKey?: SortKey }[] = [
  { label: 'Job',          sortKey: 'title' },
  { label: 'Customer',     sortKey: 'customer' },
  { label: 'Technicians' },
  { label: 'Scheduled',    sortKey: 'scheduled' },
  { label: 'Completed On', sortKey: 'completed' },
  { label: 'Sheet' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminHistory() {
  const { fmtDate } = useDateFormatter()
  const [search, setSearch] = useState('')
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)
  const { activeOrgId } = useOrganization()
  const { data: allJobs = [], isLoading, isError } = useJobs(activeOrgId, { status: 'completed' })

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

  const { sortKey, sortDir, handleSort, setSort, sorted } = useSort<RecentJobRow, SortKey>(filtered, COMPARATORS, 'completed', 'desc')

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
          {!isLoading && sorted.length > 0 && (
            <div className="flex justify-end mb-0.5">
              <SortSelect options={SORT_OPTIONS} sortKey={sortKey} sortDir={sortDir} onChange={setSort} />
            </div>
          )}
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <MobileSkeleton key={i} />)
            : sorted.length === 0
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
            : sorted.map((j) => <MobileCard key={j.id} job={j} onViewSheet={setSelectedSheetId} />)
          }
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-2 border-b border-slate-200">
                  {HEADERS.map(({ label, sortKey: sk }) => (
                    <SortableTh
                      key={label}
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
                  : sorted.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
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
                  : sorted.map((job) => {
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
                                    title={a.profiles ? (a.profiles.display_name ?? a.profiles.full_name) : ''}
                                    className="w-6 h-6 rounded-full bg-brand-700 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white"
                                  >
                                    {(a.profiles?.full_name ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <span className="text-[13px] text-text-muted">
                                  {techs[0].profiles ? (techs[0].profiles.display_name ?? techs[0].profiles.full_name) : 'Unknown'}
                                  {techs.length > 1 ? ` +${techs.length - 1}` : ''}
                                </span>
                                {techs[0].profiles?.display_name && (
                                  <span className="text-[11px] text-text-subtle ml-1">({techs[0].profiles.full_name})</span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-text-muted whitespace-nowrap">
                          {fmtDate(job.scheduled_date)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                            <Icons.check size={11} />
                            {fmtDate(job.updated_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {job.job_sheets?.[0]?.id ? (
                            <button
                              type="button"
                              onClick={() => setSelectedSheetId(job.job_sheets![0].id)}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Icons.sheets size={12} />
                              {job.job_sheets[0].sheet_number != null
                                ? `#${job.job_sheets[0].sheet_number}`
                                : 'View'}
                            </button>
                          ) : (
                            <span className="text-[12px] text-text-subtle italic">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSheetId && (
        <SheetViewer sheetId={selectedSheetId} onClose={() => setSelectedSheetId(null)} />
      )}
    </>
  )
}
