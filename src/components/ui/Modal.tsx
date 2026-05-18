import { useEffect, useRef, type ReactNode } from 'react'
import { Icons } from './Icons'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-3xl',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      // Mobile: push content between the fixed top header (56px) and bottom nav (60px),
      //         with a small visual gap on each side.
      // Desktop: standard centred with equal padding on all sides.
      className="fixed inset-0 z-[60] flex items-center justify-center px-3 pt-[68px] pb-[88px] md:p-8 bg-[rgba(15,23,42,0.55)] backdrop-blur-[4px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        // max-h-full fills the remaining space inside the padded overlay on mobile
        className={`relative w-full ${maxWidth} max-h-full md:max-h-[calc(100vh-64px)] bg-white rounded-[14px] shadow-[0_24px_60px_rgba(0,0,0,.35)] flex flex-col overflow-hidden`}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 md:px-7 py-4 md:py-5 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 id="modal-title" className="text-[16px] md:text-[17px] font-bold tracking-tight text-text-base">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12px] md:text-[12.5px] text-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] ml-4 rounded-[7px] flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <Icons.close size={18} />
          </button>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-5 md:px-7 py-5 md:py-6 flex flex-col gap-5 md:gap-6">
            {children}
          </div>

          {/* Footer lives inside the scroll container with sticky bottom-0
              so it is always pinned to the bottom of the visible area —
              no need to scroll to find the Cancel / Submit buttons.       */}
          {footer && (
            <div className="sticky bottom-0 flex items-center justify-between gap-3 px-5 md:px-7 py-3 md:py-4 border-t border-slate-200 bg-white">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
