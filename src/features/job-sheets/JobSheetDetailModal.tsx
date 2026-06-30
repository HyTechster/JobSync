import { useState, useEffect, useRef } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { supabase } from '../../lib/supabase'
import { formatDuration } from '../../utils/formatters'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import { JobSheetPrintView } from './JobSheetPrintView'
import { getJobTypeLabel } from './jobSheetPrintConstants'
import type { JobSheetWithDetail } from './hooks'

interface JobSheetDetailModalProps {
  sheet: JobSheetWithDetail | null
  onClose: () => void
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
}
const STATUS_CLS: Record<string, string> = {
  pending:     'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  completed:   'bg-emerald-50 text-emerald-700',
  cancelled:   'bg-red-50 text-red-600',
}
const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent',
}
const PRIORITY_CLS: Record<string, string> = {
  low:    'bg-slate-100 text-slate-600',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  high:   'bg-orange-50 text-orange-700 border border-orange-200',
  urgent: 'bg-red-50 text-red-600 border border-red-200',
}

function getPublicUrl(path: string) {
  return supabase.storage.from('job-attachments').getPublicUrl(path).data.publicUrl
}

function Sec({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><span className="w-[3px] h-3.5 rounded-full bg-brand-700 inline-block" />{children}</p>
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{label}</p>
      <p className="text-[13px] text-text-base mt-0.5 leading-snug">{value || <span className="text-text-subtle">—</span>}</p>
    </div>
  )
}

export function JobSheetDetailModal({ sheet, onClose }: JobSheetDetailModalProps) {
  const { fmtDateTime, fmtDate } = useDateFormatter()
  const [printing, setPrinting] = useState(false)
  const printFilenameRef = useRef('')

  useEffect(() => {
    if (!printing) return
    const prevTitle = document.title
    document.title = printFilenameRef.current || 'JobSheet'
    const onAfterPrint = () => { setPrinting(false); document.title = prevTitle }
    window.addEventListener('afterprint', onAfterPrint)
    const id = requestAnimationFrame(() => requestAnimationFrame(() => { window.print() }))
    return () => { cancelAnimationFrame(id); window.removeEventListener('afterprint', onAfterPrint); document.title = prevTitle }
  }, [printing])

  if (!sheet) return null

  const status   = sheet.job_orders?.status   ?? null
  const priority = sheet.job_orders?.priority ?? null
  const techName = sheet.profiles?.display_name ?? sheet.profiles?.full_name ?? 'Unknown'
  const custName = sheet.customer_name ?? sheet.job_orders?.customer_name ?? '—'
  const extraTechs = sheet.additional_technician_names ?? []

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
      <Modal isOpen onClose={onClose} title={titleNode}
        subtitle={`Submitted by ${techName} · ${fmtDateTime(sheet.submitted_at)}`}
        maxWidth="max-w-2xl">

        {/* ── Technician + Status + Priority ── */}
        <div className="flex items-center gap-3">
          <Avatar name={sheet.profiles?.full_name ?? '?'} size={38} src={sheet.profiles?.avatar_url} />
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-text-base truncate">{techName}</p>
            {sheet.profiles?.display_name && <p className="text-[11px] text-text-muted">{sheet.profiles.full_name}</p>}
            <p className="text-[12px] text-text-muted">{custName}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {status && <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[status] ?? 'bg-slate-100 text-slate-600'}`}>{STATUS_LABEL[status] ?? status}</span>}
            {priority && <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${PRIORITY_CLS[priority] ?? 'bg-slate-100 text-slate-600'}`}>{PRIORITY_LABEL[priority] ?? priority} Priority</span>}
          </div>
        </div>

        {/* ── Customer & Job Info ── */}
        <div>
          <Sec>Customer &amp; Job Info</Sec>
          <div className="bg-surface-2 rounded-xl p-3.5 grid grid-cols-2 gap-x-5 gap-y-3">
            <Field label="Customer Name"  value={custName} />
            <Field label="Contact (H/P)"  value={sheet.customer_phone ?? sheet.job_orders?.customer_phone ?? null} />
            {sheet.customer_email && <Field label="Email" value={sheet.customer_email} />}
            <Field label="Job Type" value={getJobTypeLabel(sheet.job_type)} />
            <div className="col-span-2">
              <Field label="Location / Site Address" value={sheet.job_location ?? sheet.job_orders?.location ?? null} />
            </div>
            <Field label="Scheduled Date" value={sheet.job_orders?.scheduled_date ? fmtDate(sheet.job_orders.scheduled_date) : null} />
            {sheet.job_description && <div className="col-span-2"><Field label="Job Description" value={sheet.job_description} /></div>}
          </div>
        </div>

        {/* ── Time Details ── */}
        <div>
          <Sec>Time Details</Sec>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Job Date',  value: sheet.job_date ? fmtDate(sheet.job_date) : '—' },
              { label: 'Time In',   value: sheet.time_in  ?? '—' },
              { label: 'Time Out',  value: sheet.time_out ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface-2 rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{label}</p>
                <p className="text-[13px] font-medium text-text-base mt-0.5">{value}</p>
              </div>
            ))}
            <div className="bg-brand-700 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <Icons.clock size={14} color="white" />
              <div>
                <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">Duration</p>
                <p className="text-[13px] font-bold text-white mt-0.5">{formatDuration(sheet.time_spent_minutes)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Work Performed ── */}
        <div>
          <Sec>Work Performed / Findings</Sec>
          <div className="bg-surface-2 rounded-xl px-4 py-3.5">
            <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">{sheet.work_performed}</p>
          </div>
        </div>

        {/* ── Service Description ── */}
        {sheet.service_description && (
          <div>
            <Sec>Service Description / Materials Used</Sec>
            <div className="bg-surface-2 rounded-xl px-4 py-3.5">
              <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">{sheet.service_description}</p>
            </div>
          </div>
        )}

        {/* ── Notes ── */}
        {sheet.notes && (
          <div>
            <Sec>Technician Remarks</Sec>
            <div className="bg-surface-2 rounded-xl px-4 py-3.5">
              <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">{sheet.notes}</p>
            </div>
          </div>
        )}

        {/* ── Payment + Technicians ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-2 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">Total Amount</p>
            <p className="text-[22px] font-bold text-brand-700 leading-none">
              {sheet.total_amount != null ? `RM ${sheet.total_amount.toFixed(2)}` : <span className="text-text-subtle text-[15px]">Not recorded</span>}
            </p>
          </div>
          <div className="bg-surface-2 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">Technicians</p>
            <p className="text-[13px] text-text-base">Lead: <span className="font-semibold">{techName}</span></p>
            {extraTechs.map((name, i) => (
              <p key={i} className="text-[12.5px] text-text-muted">{i + 2}. {name}</p>
            ))}
          </div>
        </div>

        {/* ── Signatures ── */}
        {(sheet.technician_signature_url || sheet.customer_signature_url) && (
          <div>
            <Sec>Signatures</Sec>
            <div className="grid grid-cols-2 gap-2">
              {([
                { label: 'Technician', url: sheet.technician_signature_url, name: sheet.profiles?.display_name ?? sheet.profiles?.full_name },
                { label: 'Customer',   url: sheet.customer_signature_url,   name: custName },
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

        {/* ── Photos ── */}
        {sheet.attachments.length > 0 && (() => {
          const sitePhotos    = sheet.attachments.filter((a) => !a.storage_path.includes('/payment/'))
          const paymentPhotos = sheet.attachments.filter((a) => a.storage_path.includes('/payment/'))
          const renderGrid = (items: typeof sheet.attachments) =>
            items.map((att) => {
              const url = getPublicUrl(att.storage_path)
              const isImage = att.mime_type?.startsWith('image/') ?? true
              return (
                <a key={att.id} href={url} target="_blank" rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border border-slate-200 hover:border-brand-700 transition-colors aspect-square"
                  title={att.file_name}>
                  {isImage
                    ? <img src={url} alt={att.file_name} loading="lazy" className="w-full h-full object-contain bg-slate-50" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-surface-2 p-2">
                        <Icons.download size={20} color="var(--color-brand-700)" />
                        <span className="text-[10px] text-text-muted text-center line-clamp-2 break-all">{att.file_name}</span>
                      </div>}
                </a>
              )
            })
          const payEv = paymentPhotos[0]
          return (
            <div className="space-y-3">
              {sitePhotos.length > 0 && (
                <div>
                  <Sec>Site Photos ({sitePhotos.length})</Sec>
                  <div className="grid grid-cols-3 gap-2">{renderGrid(sitePhotos)}</div>
                </div>
              )}
              {payEv && (() => {
                const url = getPublicUrl(payEv.storage_path)
                const isImage = payEv.mime_type?.startsWith('image/') ?? true
                return (
                  <div>
                    <Sec>Payment Evidence</Sec>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden border border-slate-200 hover:border-brand-700 transition-colors"
                      title={payEv.file_name}>
                      {isImage
                        ? <img src={url} alt={payEv.file_name} loading="lazy" className="w-full aspect-[4/3] object-contain bg-slate-50" />
                        : <div className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-2 bg-surface-2">
                            <Icons.download size={24} color="var(--color-brand-700)" />
                            <span className="text-[11px] text-text-muted text-center px-4 break-all">{payEv.file_name}</span>
                          </div>}
                    </a>
                  </div>
                )
              })()}
            </div>
          )
        })()}

        {/* ── Download PDF ── */}
        <div className="pt-2 border-t border-border">
          <button type="button"
            onClick={() => {
              const num  = sheet.sheet_number != null ? String(sheet.sheet_number).padStart(6, '0') : sheet.id.slice(0, 8).toUpperCase()
              const date = (sheet.job_date ?? new Date().toISOString().slice(0, 10)).replace(/-/g, '')
              printFilenameRef.current = `JobSheet-${num}-${date}`
              setPrinting(true)
            }}
            disabled={printing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
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
