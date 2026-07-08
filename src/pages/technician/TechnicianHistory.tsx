import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { offlineDb, type OfflineJobSheet, type PendingFullSheet } from '../../offline/db'
import { syncPendingJobSheets, syncPendingFullSheets } from '../../offline/sync'
import { useMyCompletedJobs } from '../../features/jobs/hooks'
import { useJobSheet } from '../../features/job-sheets/hooks'
import { JobSheetDetailModal } from '../../features/job-sheets/JobSheetDetailModal'
import { useOrganization } from '../../context/OrganizationContext'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import { SortSelect } from '../../components/ui/SortSelect'
import { useSort } from '../../hooks/useSort'
import type { RecentJobRow } from '../../features/jobs/hooks'
import type { FullSheetFormData } from '../../features/job-sheets/fullSheetSchema'

type SortKey = 'completed' | 'scheduled' | 'title'

const COMPARATORS: Record<SortKey, (a: RecentJobRow, b: RecentJobRow) => number> = {
  completed: (a, b) => (a.updated_at ?? '').localeCompare(b.updated_at ?? ''),
  scheduled: (a, b) => (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''),
  title:     (a, b) => a.title.localeCompare(b.title),
}

const SORT_OPTIONS = [
  { key: 'completed' as SortKey, dir: 'desc' as const, label: 'Completed (newest)' },
  { key: 'completed' as SortKey, dir: 'asc'  as const, label: 'Completed (oldest)' },
  { key: 'scheduled' as SortKey, dir: 'desc' as const, label: 'Scheduled (newest)' },
  { key: 'title'     as SortKey, dir: 'asc'  as const, label: 'Job (A–Z)' },
]

const SYNC_ICON: Record<OfflineJobSheet['syncStatus'], React.ReactNode> = {
  pending: <Icons.clock   size={14} color="#D97706" />,
  syncing: <Icons.sync    size={14} color="#2563EB" />,
  synced:  <Icons.check   size={14} color="#059669" />,
  failed:  <Icons.warning size={14} color="#E11D48" />,
}

const SYNC_LABEL: Record<OfflineJobSheet['syncStatus'], string> = {
  pending: 'Waiting to sync',
  syncing: 'Syncing…',
  synced:  'Synced',
  failed:  'Failed — tap to retry',
}

function PendingCard({ sheet, onRetry }: { sheet: OfflineJobSheet; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-text-base truncate">
            {sheet.workPerformed.split('\n')[0]}
          </p>
          <p className="text-[12px] text-text-muted mt-0.5">{sheet.createdAt.slice(0, 10)}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {SYNC_ICON[sheet.syncStatus]}
          <span className="text-[11.5px] text-text-muted">{SYNC_LABEL[sheet.syncStatus]}</span>
        </div>
      </div>
      {sheet.syncStatus === 'failed' && (
        <button
          onClick={onRetry}
          className="mt-2.5 w-full h-[36px] rounded-xl border border-slate-300 text-[12.5px] font-semibold text-text-base hover:bg-surface-2 transition-colors"
        >
          Retry sync
        </button>
      )}
    </div>
  )
}

function PendingFullCard({ record, onRetry }: { record: PendingFullSheet; onRetry: () => void }) {
  const jobTitle = useMemo(() => {
    try { return (JSON.parse(record.formDataJson) as FullSheetFormData).job_title }
    catch { return 'Pending sheet' }
  }, [record.formDataJson])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wide text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded inline-block mb-1">
            Full Sheet
          </span>
          <p className="text-[13.5px] font-semibold text-text-base truncate">{jobTitle}</p>
          <p className="text-[12px] text-text-muted mt-0.5">{record.createdAt.slice(0, 10)}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {SYNC_ICON[record.syncStatus]}
          <span className="text-[11.5px] text-text-muted">{SYNC_LABEL[record.syncStatus]}</span>
        </div>
      </div>
      {record.syncStatus === 'failed' && (
        <button
          onClick={onRetry}
          className="mt-2.5 w-full h-[36px] rounded-xl border border-slate-300 text-[12.5px] font-semibold text-text-base hover:bg-surface-2 transition-colors"
        >
          Retry sync
        </button>
      )}
    </div>
  )
}

function CompletedJobCard({ job, onViewSheet }: { job: RecentJobRow; onViewSheet: (sheetId: string) => void }) {
  const { fmtDate } = useDateFormatter()
  const completedOn = fmtDate(job.updated_at)
  const scheduledOn = fmtDate(job.scheduled_date)
  const sheetId = job.job_sheets?.[0]?.id
  const sheetNumber = job.job_sheets?.[0]?.sheet_number

  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
      <div className="flex items-start gap-2 mb-1">
        <p className="text-[13.5px] font-semibold text-text-base truncate flex-1">{job.title}</p>
        {!sheetId && (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5 whitespace-nowrap">
            <Icons.warning size={10} />
            Sheet needed
          </span>
        )}
        <PriorityBadge priority={job.priority} />
      </div>
      <p className="text-[12.5px] text-text-muted truncate">{job.customer_name}</p>
      {job.location && (
        <p className="text-[12px] text-text-muted truncate mt-0.5">{job.location}</p>
      )}
      <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Icons.check size={10} />
            Completed {completedOn}
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px] text-text-muted">
            <Icons.calendar size={11} />
            Scheduled {scheduledOn}
          </span>
        </div>
        {sheetId ? (
          <button
            type="button"
            onClick={() => onViewSheet(sheetId)}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
          >
            <Icons.sheets size={12} />
            {sheetNumber != null ? `Sheet #${sheetNumber}` : 'View Sheet'}
          </button>
        ) : (
          <Link
            to={`/technician/jobs/${job.id}/submit`}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-white bg-amber-600 hover:bg-amber-700 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
          >
            <Icons.sheets size={12} color="white" />
            Submit Sheet
          </Link>
        )}
      </div>
    </div>
  )
}

function SheetViewer({ sheetId, onClose }: { sheetId: string; onClose: () => void }) {
  const { data: sheet, isLoading } = useJobSheet(sheetId)
  if (isLoading) return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(15,23,42,0.55)]">
      <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
    </div>
  )
  return <JobSheetDetailModal sheet={sheet ?? null} onClose={onClose} />
}

export default function TechnicianHistory() {
  const isOnline = useOnlineStatus()
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()
  const { data: completedJobs = [], isLoading, isError } = useMyCompletedJobs(activeOrgId)
  const { sortKey, sortDir, setSort, sorted: sortedCompleted } = useSort<RecentJobRow, SortKey>(completedJobs, COMPARATORS, 'completed', 'desc')
  const [pendingSimple, setPendingSimple]   = useState<OfflineJobSheet[]>([])
  const [pendingFull, setPendingFull]       = useState<PendingFullSheet[]>([])
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null)

  async function loadPending() {
    const [simple, full] = await Promise.all([
      offlineDb.jobSheets.filter((s) => s.syncStatus !== 'synced').toArray(),
      offlineDb.pendingFullSheets.where('syncStatus').anyOf(['pending', 'syncing', 'failed']).toArray(),
    ])
    setPendingSimple(simple)
    setPendingFull(full)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadPending() }, [isOnline])

  async function handleRetry(id: number) {
    await offlineDb.jobSheets.update(id, { syncStatus: 'pending' })
    await syncPendingJobSheets()
    void qc.invalidateQueries({ queryKey: ['my-completed-jobs'] })
    await loadPending()
  }

  async function handleRetryFull(id: number) {
    await offlineDb.pendingFullSheets.update(id, { syncStatus: 'pending' })
    await syncPendingFullSheets()
    void qc.invalidateQueries({ queryKey: ['my-completed-jobs'] })
    void qc.invalidateQueries({ queryKey: ['job-sheets'] })
    await loadPending()
  }

  const totalPending = pendingSimple.length + pendingFull.length

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <h1 className="text-[22px] font-bold text-text-base mb-5">History</h1>

      {/* Pending offline sync */}
      {totalPending > 0 && (
        <section className="mb-5">
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
            Pending Sync · {totalPending}
          </p>
          <div className="flex flex-col gap-2.5">
            {pendingSimple.map((s) => (
              <PendingCard key={`simple-${s.id}`} sheet={s} onRetry={() => void handleRetry(s.id!)} />
            ))}
            {pendingFull.map((r) => (
              <PendingFullCard key={`full-${r.id}`} record={r} onRetry={() => void handleRetryFull(r.id!)} />
            ))}
          </div>
        </section>
      )}

      {/* Completed jobs */}
      <section>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide">
            Completed · {isLoading ? '…' : completedJobs.length}
          </p>
          {!isLoading && sortedCompleted.length > 0 && (
            <SortSelect options={SORT_OPTIONS} sortKey={sortKey} sortDir={sortDir} onChange={setSort} />
          )}
        </div>

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
            <p className="text-[13px] text-danger">Failed to load history. Please refresh.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 animate-pulse">
                <div className="h-4 w-44 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-28 bg-slate-100 rounded mb-3" />
                <div className="flex gap-3">
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedCompleted.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <Icons.check size={24} color="#059669" />
            </div>
            <p className="text-[13.5px] font-medium text-text-base mb-1">No completed jobs yet</p>
            <p className="text-[12.5px] text-text-muted">
              Jobs you complete will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sortedCompleted.map((j) => (
              <CompletedJobCard key={j.id} job={j} onViewSheet={setSelectedSheetId} />
            ))}
          </div>
        )}
      </section>

      {selectedSheetId && (
        <SheetViewer sheetId={selectedSheetId} onClose={() => setSelectedSheetId(null)} />
      )}
    </div>
  )
}
