import { useEffect } from 'react'
import { Icons } from '../../components/ui/Icons'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import type { MyAlertRow } from './hooks'

interface AlertBottomSheetProps {
  alert: MyAlertRow | null
  onClose: () => void
}

export function AlertBottomSheet({ alert, onClose }: AlertBottomSheetProps) {
  const { fmtDateTime } = useDateFormatter()
  useEffect(() => {
    if (!alert) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [alert, onClose])

  if (!alert) return null

  const data = alert.alerts
  const linkedJobs = data?.alert_jobs ?? []

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/*
        Mobile: slides up from the bottom (bottom-0, rounded-t-3xl)
        Desktop (md+): centered dialog (bottom-auto, top-1/2, -translate-y-1/2, rounded-3xl)
      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={data?.title ?? 'Alert'}
        className="
          fixed z-[90] bg-white overflow-y-auto
          bottom-0 left-0 right-0 rounded-t-3xl max-h-[78vh]
          md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          md:w-full md:max-w-lg md:max-h-[80vh] md:rounded-3xl md:right-auto
        "
      >
        <div className="px-5 pt-4 pb-10">
          {/* Drag handle (mobile only) */}
          <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5 md:hidden" />

          {/* Header */}
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Icons.bell size={20} color="var(--color-brand-700)" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[17px] font-bold text-text-base leading-snug">{data?.title}</h2>
              <p className="text-[12px] text-text-muted mt-0.5">
                From {data?.profiles?.full_name ?? 'Admin'} · {data ? fmtDateTime(data.created_at) : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-2 hover:bg-slate-200 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <Icons.close size={14} />
            </button>
          </div>

          {/* Message */}
          <div className="bg-surface-2 rounded-2xl px-4 py-4 mb-4">
            <p className="text-[14px] text-text-base leading-relaxed whitespace-pre-wrap">
              {data?.message}
            </p>
          </div>

          {/* Linked jobs */}
          {linkedJobs.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Icons.jobs size={13} color="#64748B" />
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                  Linked Jobs ({linkedJobs.length})
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {linkedJobs.map((aj) => (
                  <div
                    key={aj.job_order_id}
                    className="flex items-center gap-2.5 bg-surface-2 rounded-xl px-3 py-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Icons.jobs size={13} color="var(--color-brand-700)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-base truncate">
                        {aj.job_orders?.title ?? 'Job'}
                      </p>
                      {aj.job_orders?.customer_name && (
                        <p className="text-[11.5px] text-text-muted truncate">
                          {aj.job_orders.customer_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
