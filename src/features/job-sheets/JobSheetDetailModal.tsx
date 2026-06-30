import { useState, useEffect, useRef } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { supabase } from '../../lib/supabase'
import { formatDuration } from '../../utils/formatters'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import { JobSheetPrintView } from './JobSheetPrintView'
import type { JobSheetWithDetail } from './hooks'

interface JobSheetDetailModalProps {
  sheet: JobSheetWithDetail | null
  onClose: () => void
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_CLS: Record<string, string> = {
  pending:     'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  completed:   'bg-emerald-50 text-emerald-700',
  cancelled:   'bg-red-50 text-red-600',
}

function getPublicUrl(storagePath: string): string {
  return supabase.storage.from('job-attachments').getPublicUrl(storagePath).data.publicUrl
}

export function JobSheetDetailModal({ sheet, onClose }: JobSheetDetailModalProps) {
  const { fmtDateTime } = useDateFormatter()
  const [printing, setPrinting] = useState(false)
  const printFilenameRef = useRef('')

  useEffect(() => {
    if (!printing) return
    const prevTitle = document.title
    document.title = printFilenameRef.current || 'JobSheet'
    const onAfterPrint = () => {
      setPrinting(false)
      document.title = prevTitle
    }
    window.addEventListener('afterprint', onAfterPrint)
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => { window.print() })
    )
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('afterprint', onAfterPrint)
      document.title = prevTitle
    }
  }, [printing])

  if (!sheet) return null

  const status = sheet.job_orders?.status ?? 'pending'

  const titleNode = (
    <span className="flex items-center gap-2 flex-wrap">
      <span>{sheet.job_title ?? sheet.job_orders?.title ?? 'Job Sheet'}</span>
      {sheet.sheet_number != null && (
        <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
          #{sheet.sheet_number}
        </span>
      )}
    </span>
  )

  return (
    <>
    {printing && <JobSheetPrintView sheet={sheet} />}
    <Modal
      isOpen
      onClose={onClose}
      title={titleNode}
      subtitle={`Submitted by ${sheet.profiles ? (sheet.profiles.display_name ?? sheet.profiles.full_name) : 'Unknown'} · ${fmtDateTime(sheet.submitted_at)}`}
      maxWidth="max-w-2xl"
    >
      <div className="flex items-center gap-3">
        <Avatar
          name={sheet.profiles?.full_name ?? '?'}
          size={36}
          src={sheet.profiles?.avatar_url}
        />
        <div>
          <p className="text-[13.5px] font-semibold text-text-base">
            {sheet.profiles ? (sheet.profiles.display_name ?? sheet.profiles.full_name) : 'Unknown'}
          </p>
          {sheet.profiles?.display_name && (
            <p className="text-[11px] text-text-muted">{sheet.profiles.full_name}</p>
          )}
          <p className="text-[12px] text-text-muted">{sheet.job_orders?.customer_name}</p>
        </div>
        {sheet.job_orders?.status && (
          <span className={`ml-auto text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[status] ?? ''}`}>
            {STATUS_LABEL[status] ?? status}
          </span>
        )}
      </div>

      <div>
        <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
          Work Performed
        </p>
        <div className="bg-surface-2 rounded-xl px-4 py-3.5">
          <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">
            {sheet.work_performed}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            Time Spent
          </p>
          <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-4 py-3">
            <Icons.clock size={15} color="var(--color-brand-700)" />
            <span className="text-[13.5px] font-semibold text-text-base">
              {formatDuration(sheet.time_spent_minutes)}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            Submitted
          </p>
          <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-4 py-3">
            <Icons.calendar size={15} color="var(--color-brand-700)" />
            <span className="text-[13px] text-text-base">{fmtDateTime(sheet.submitted_at)}</span>
          </div>
        </div>
      </div>

      {sheet.notes && (
        <div>
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            Notes
          </p>
          <div className="bg-surface-2 rounded-xl px-4 py-3.5">
            <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">
              {sheet.notes}
            </p>
          </div>
        </div>
      )}

      {(sheet.technician_signature_url || sheet.customer_signature_url) && (
        <div>
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2">
            Signatures
          </p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { label: 'Technician', url: sheet.technician_signature_url, name: sheet.profiles?.display_name ?? sheet.profiles?.full_name },
              { label: 'Customer',   url: sheet.customer_signature_url,   name: sheet.customer_name ?? sheet.job_orders?.customer_name },
            ] as const).map(({ label, url, name }) => (
              <div key={label} className="bg-surface-2 rounded-xl p-3">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-2">{label}</p>
                {url
                  ? <img src={url} alt={`${label} signature`} loading="lazy" className="w-full h-20 object-contain rounded border border-slate-200 bg-white" />
                  : <div className="h-20 flex items-center justify-center rounded border border-dashed border-slate-200"><span className="text-[11px] text-text-muted">Not captured</span></div>}
                {name && <p className="text-[11.5px] text-text-muted mt-1.5 truncate">{name}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {sheet.attachments.length > 0 && (() => {
        const sitePhotos    = sheet.attachments.filter((a) => !a.storage_path.includes('/payment/'))
        const paymentPhotos = sheet.attachments.filter((a) => a.storage_path.includes('/payment/'))
        const renderGrid = (items: typeof sheet.attachments) =>
          items.map((att) => {
            const url     = getPublicUrl(att.storage_path)
            const isImage = att.mime_type?.startsWith('image/') ?? true
            return (
              <a
                key={att.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg overflow-hidden border border-slate-200 hover:border-brand-700 transition-colors aspect-square"
                title={att.file_name}
              >
                {isImage ? (
                  <img src={url} alt={att.file_name} loading="lazy" className="w-full h-full object-contain bg-slate-50" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-surface-2 p-2">
                    <Icons.download size={20} color="var(--color-brand-700)" />
                    <span className="text-[10px] text-text-muted text-center line-clamp-2 break-all">{att.file_name}</span>
                  </div>
                )}
              </a>
            )
          })
        const payEv = paymentPhotos[0]
        return (
          <div className="space-y-3">
            {sitePhotos.length > 0 && (
              <div>
                <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2">
                  Site Photos ({sitePhotos.length})
                </p>
                <div className="grid grid-cols-3 gap-2">{renderGrid(sitePhotos)}</div>
              </div>
            )}
            {payEv && (() => {
              const url     = getPublicUrl(payEv.storage_path)
              const isImage = payEv.mime_type?.startsWith('image/') ?? true
              return (
                <div>
                  <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Payment Evidence
                  </p>
                  <a
                    href={url} target="_blank" rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden border border-slate-200 hover:border-brand-700 transition-colors"
                    title={payEv.file_name}
                  >
                    {isImage
                      ? <img src={url} alt={payEv.file_name} loading="lazy" className="w-full aspect-[4/3] object-contain bg-slate-50" />
                      : <div className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-2 bg-surface-2">
                          <Icons.download size={24} color="var(--color-brand-700)" />
                          <span className="text-[11px] text-text-muted text-center px-4 break-all">{payEv.file_name}</span>
                        </div>
                    }
                  </a>
                </div>
              )
            })()}
          </div>
        )
      })()}

      {/* Download PDF */}
      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => {
            const num = sheet.sheet_number != null
              ? String(sheet.sheet_number).padStart(6, '0')
              : sheet.id.slice(0, 8).toUpperCase()
            const date = (sheet.job_date ?? new Date().toISOString().slice(0, 10)).replace(/-/g, '')
            printFilenameRef.current = `JobSheet-${num}-${date}`
            setPrinting(true)
          }}
          disabled={printing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Icons.download size={15} color="white" />
          {printing ? 'Preparing PDF…' : 'Download as PDF'}
        </button>
        <p className="text-[10.5px] text-text-muted text-center mt-1.5">
          Opens browser print dialog — choose "Save as PDF" to download.
        </p>
      </div>
    </Modal>
    </>
  )
}
