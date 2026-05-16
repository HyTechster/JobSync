import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import type { AlertWithDetail } from './hooks'

interface AlertDetailModalProps {
  alert: AlertWithDetail | null
  onClose: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AlertDetailModal({ alert, onClose }: AlertDetailModalProps) {
  if (!alert) return null

  const readCount = alert.alert_recipients.filter((r) => r.read_at !== null).length
  const total = alert.alert_recipients.length

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={alert.title}
      subtitle={`Sent by ${alert.profiles?.full_name ?? 'Unknown'} · ${formatDate(alert.created_at)}`}
      maxWidth="max-w-xl"
    >
      <div className="bg-surface-2 rounded-xl px-4 py-3.5">
        <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">
          {alert.message}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-base">Recipients</h3>
          <span className="text-xs text-text-muted">
            {readCount} of {total} read
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {alert.alert_recipients.map((r) => (
            <div
              key={r.recipient_id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <Avatar
                name={r.profiles?.full_name ?? '?'}
                size={28}
                src={r.profiles?.avatar_url}
              />
              <span className="flex-1 text-[13px] font-medium text-text-base">
                {r.profiles?.full_name ?? 'Unknown'}
              </span>
              {r.read_at ? (
                <span className="inline-flex items-center gap-1 text-[11.5px] text-success font-medium">
                  <Icons.check size={12} color="#059669" />
                  {formatDate(r.read_at)}
                </span>
              ) : (
                <span className="text-[11.5px] text-text-muted">Unread</span>
              )}
            </div>
          ))}

          {total === 0 && (
            <p className="text-sm text-text-muted text-center py-4">No recipients.</p>
          )}
        </div>
      </div>
    </Modal>
  )
}
