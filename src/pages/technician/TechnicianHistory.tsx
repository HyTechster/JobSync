import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { offlineDb, type OfflineJobSheet } from '../../offline/db'
import { syncPendingJobSheets } from '../../offline/sync'
import { useMyCompletedJobs } from '../../features/jobs/hooks'
import { useOrganization } from '../../context/OrganizationContext'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import { PriorityBadge } from '../../components/ui/PriorityBadge'
import { Icons } from '../../components/ui/Icons'
import type { RecentJobRow } from '../../features/jobs/hooks'

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

function CompletedJobCard({ job }: { job: RecentJobRow }) {
  const { fmtDate } = useDateFormatter()
  const completedOn = fmtDate(job.updated_at)
  const scheduledOn = fmtDate(job.scheduled_date)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
      <div className="flex items-start gap-2 mb-1">
        <p className="text-[13.5px] font-semibold text-text-base truncate flex-1">{job.title}</p>
        <PriorityBadge priority={job.priority} />
      </div>
      <p className="text-[12.5px] text-text-muted truncate">{job.customer_name}</p>
      {job.location && (
        <p className="text-[12px] text-text-muted truncate mt-0.5">{job.location}</p>
      )}
      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          <Icons.check size={10} />
          Completed {completedOn}
        </span>
        <span className="inline-flex items-center gap-1 text-[11.5px] text-text-muted">
          <Icons.calendar size={11} />
          Scheduled {scheduledOn}
        </span>
      </div>
    </div>
  )
}

export default function TechnicianHistory() {
  const isOnline = useOnlineStatus()
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()
  const { data: completedJobs = [], isLoading, isError } = useMyCompletedJobs(activeOrgId)
  const [pending, setPending] = useState<OfflineJobSheet[]>([])

  async function loadPending() {
    const records = await offlineDb.jobSheets
      .filter((s) => s.syncStatus !== 'synced')
      .toArray()
    setPending(records)
  }

  useEffect(() => { void loadPending() }, [isOnline])  // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRetry(id: number) {
    await offlineDb.jobSheets.update(id, { syncStatus: 'pending' })
    await syncPendingJobSheets()
    void qc.invalidateQueries({ queryKey: ['my-completed-jobs'] })
    await loadPending()
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <h1 className="text-[22px] font-bold text-text-base mb-5">History</h1>

      {/* Pending offline sync */}
      {pending.length > 0 && (
        <section className="mb-5">
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
            Pending Sync · {pending.length}
          </p>
          <div className="flex flex-col gap-2.5">
            {pending.map((s) => (
              <PendingCard key={s.id} sheet={s} onRetry={() => void handleRetry(s.id!)} />
            ))}
          </div>
        </section>
      )}

      {/* Completed jobs */}
      <section>
        <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
          Completed · {isLoading ? '…' : completedJobs.length}
        </p>

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
        ) : completedJobs.length === 0 ? (
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
            {completedJobs.map((j) => <CompletedJobCard key={j.id} job={j} />)}
          </div>
        )}
      </section>
    </div>
  )
}
