import { useEffect } from 'react'
import { Icons } from '../../components/ui/Icons'
import type { MyAlertRow } from './hooks'

interface AlertBottomSheetProps {
  alert: MyAlertRow | null
  onClose: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function AlertBottomSheet({ alert, onClose }: AlertBottomSheetProps) {
  useEffect(() => {
    if (!alert) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [alert, onClose])

  if (!alert) return null

  const data = alert.alerts

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={data?.title ?? 'Alert'}
        className="fixed bottom-0 left-0 right-0 z-[90] bg-white rounded-t-3xl max-h-[78vh] overflow-y-auto"
      >
        <div className="px-5 pt-4 pb-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />

          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Icons.bell size={20} color="var(--color-brand-700)" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[17px] font-bold text-text-base leading-snug">{data?.title}</h2>
              <p className="text-[12px] text-text-muted mt-0.5">
                From {data?.profiles?.full_name ?? 'Admin'} · {data ? formatDate(data.created_at) : ''}
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

          <div className="bg-surface-2 rounded-2xl px-4 py-4">
            <p className="text-[14px] text-text-base leading-relaxed whitespace-pre-wrap">
              {data?.message}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
