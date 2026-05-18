import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { supabase } from '../../lib/supabase'
import { formatDuration } from '../../utils/formatters'
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getPublicUrl(storagePath: string): string {
  return supabase.storage.from('job-attachments').getPublicUrl(storagePath).data.publicUrl
}

export function JobSheetDetailModal({ sheet, onClose }: JobSheetDetailModalProps) {
  if (!sheet) return null

  const status = sheet.job_orders?.status ?? 'pending'

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={sheet.job_orders?.title ?? 'Job Sheet'}
      subtitle={`Submitted by ${sheet.profiles ? (sheet.profiles.display_name ?? sheet.profiles.full_name) : 'Unknown'} · ${formatDate(sheet.submitted_at)}`}
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
            <span className="text-[13px] text-text-base">{formatDate(sheet.submitted_at)}</span>
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

      {sheet.attachments.length > 0 && (
        <div>
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2">
            Photos ({sheet.attachments.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {sheet.attachments.map((att) => {
              const url = getPublicUrl(att.storage_path)
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
                    <img
                      src={url}
                      alt={att.file_name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-surface-2 p-2">
                      <Icons.download size={20} color="var(--color-brand-700)" />
                      <span className="text-[10px] text-text-muted text-center line-clamp-2 break-all">
                        {att.file_name}
                      </span>
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}
