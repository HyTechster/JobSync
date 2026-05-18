import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'success'
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const VARIANT_BTN: Record<NonNullable<ConfirmDialogProps['variant']>, string> = {
  danger:  'bg-red-600 hover:bg-red-700 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
}

const VARIANT_ICON: Record<NonNullable<ConfirmDialogProps['variant']>, string> = {
  danger:  'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  isPending    = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(15,23,42,0.55)] backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-5">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${VARIANT_ICON[variant]}`}>
            {variant === 'success' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>

          <h2 id="confirm-title" className="text-[15px] font-bold text-text-base leading-snug">
            {title}
          </h2>
          <p className="text-[13px] text-text-muted mt-1.5 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-2.5 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl border border-slate-200 text-[13.5px] font-semibold text-text-base hover:bg-surface-2 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 h-10 rounded-xl text-[13.5px] font-semibold disabled:opacity-60 transition-colors flex items-center justify-center gap-2 ${VARIANT_BTN[variant]}`}
          >
            {isPending && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isPending ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
