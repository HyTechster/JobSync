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
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-[rgba(15,23,42,0.55)] backdrop-blur-[4px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`relative w-full ${maxWidth} max-h-[calc(100vh-64px)] bg-white rounded-[14px] shadow-[0_24px_60px_rgba(0,0,0,.35)] flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between px-7 py-5 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 id="modal-title" className="text-[17px] font-bold tracking-tight text-text-base">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12.5px] text-text-muted mt-0.5">{subtitle}</p>
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

        <div className="flex-1 min-h-0 overflow-y-auto px-7 py-6 flex flex-col gap-6">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-between gap-3 px-7 py-4 border-t border-slate-200 bg-white flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
