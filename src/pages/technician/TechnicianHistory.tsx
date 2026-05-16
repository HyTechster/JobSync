import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { offlineDb, type OfflineJobSheet } from '../../offline/db'
import { syncPendingJobSheets } from '../../offline/sync'
import { useJobSheets } from '../../features/job-sheets/hooks'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { formatDuration } from '../../utils/formatters'
import { Icons } from '../../components/ui/Icons'
import type { JobSheetWithDetail } from '../../features/job-sheets/hooks'

const STATUS_ICON: Record<OfflineJobSheet['syncStatus'], React.ReactNode> = {
  pending:  <Icons.clock size={14} color="#D97706" />,
  syncing:  <Icons.sync size={14} color="#2563EB" />,
  synced:   <Icons.check size={14} color="#059669" />,
  failed:   <Icons.warning size={14} color="#E11D48" />,
}

const STATUS_LABEL: Record<OfflineJobSheet['syncStatus'], string> = {
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
          {STATUS_ICON[sheet.syncStatus]}
          <span className="text-[11.5px] text-text-muted">{STATUS_LABEL[sheet.syncStatus]}</span>
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

function SheetCard({ sheet }: { sheet: JobSheetWithDetail }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
      <p className="text-[14px] font-semibold text-text-base truncate">
        {sheet.job_orders?.title ?? 'Unknown Job'}
      </p>
      <p className="text-[12.5px] text-text-muted mt-0.5">{sheet.job_orders?.customer_name}</p>
      <div className="flex items-center gap-3 mt-2.5">
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.clock size={12} />
          {formatDuration(sheet.time_spent_minutes)}
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.calendar size={12} />
          {sheet.submitted_at.slice(0, 10)}
        </span>
        {sheet.attachments.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
            <Icons.camera size={12} />
            {sheet.attachments.length}
          </span>
        )}
      </div>
    </div>
  )
}

export default function TechnicianHistory() {
  const isOnline = useOnlineStatus()
  const qc = useQueryClient()
  const { data: sheets = [], isLoading } = useJobSheets()
  const [pending, setPending] = useState<OfflineJobSheet[]>([])

  async function loadPending() {
    const records = await offlineDb.jobSheets
      .filter((s) => s.syncStatus !== 'synced')
      .toArray()
    setPending(records)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadPending() }, [isOnline])

  async function handleRetry(id: number) {
    await offlineDb.jobSheets.update(id, { syncStatus: 'pending' })
    await syncPendingJobSheets()
    void qc.invalidateQueries({ queryKey: ['job-sheets'] })
    await loadPending()
  }

  return (
    <div className="px-4 pt-6 pb-2 max-w-lg mx-auto">
      <h1 className="text-[22px] font-bold text-text-base mb-5">Job History</h1>

      {pending.length > 0 && (
        <div className="mb-5">
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
            Pending Sync · {pending.length}
          </p>
          <div className="flex flex-col gap-2.5">
            {pending.map((s) => (
              <PendingCard key={s.id} sheet={s} onRetry={() => void handleRetry(s.id!)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
          Submitted · {isLoading ? '…' : sheets.length}
        </p>
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 animate-pulse">
                <div className="h-4 w-44 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-28 bg-slate-100 rounded mb-3" />
                <div className="flex gap-3">
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sheets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-10 text-center">
            <Icons.sheets size={28} color="#94A3B8" className="mx-auto mb-2" />
            <p className="text-[13.5px] font-medium text-text-base mb-1">No submissions yet</p>
            <p className="text-[12.5px] text-text-muted">Submitted job sheets will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sheets.map((s) => <SheetCard key={s.id} sheet={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}
