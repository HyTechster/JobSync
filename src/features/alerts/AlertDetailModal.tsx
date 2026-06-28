import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import type { AlertWithDetail } from './hooks'

interface AlertDetailModalProps {
  alert: AlertWithDetail | null
  onClose: () => void
}

export function AlertDetailModal({ alert, onClose }: AlertDetailModalProps) {
  const { fmtDateTime } = useDateFormatter()
  if (!alert) return null

  const recipients = alert.alert_recipients ?? []
  const readCount = recipients.filter((r) => r.read_at !== null).length
  const total = recipients.length

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={alert.title}
      subtitle={`Sent by ${alert.profiles?.full_name ?? 'Unknown'} · ${fmtDateTime(alert.created_at)}`}
      maxWidth="max-w-xl"
    >
      <div className="bg-surface-2 rounded-xl px-4 py-3.5">
        <p className="text-[13.5px] text-text-base leading-relaxed whitespace-pre-wrap">
          {alert.message}
        </p>
      </div>

      {(alert.alert_jobs ?? []).length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Icons.jobs size={14} color="#64748B" />
            <h3 className="text-sm font-semibold text-text-base">
              Linked Jobs ({alert.alert_jobs.length})
            </h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {alert.alert_jobs.map((aj) => (
              <div
                key={aj.job_order_id}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-surface-2 rounded-lg"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Icons.jobs size={13} color="var(--color-brand-700)" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-text-base truncate">
                    {aj.job_orders?.title ?? 'Job'}
                  </p>
                  {aj.job_orders?.customer_name && (
                    <p className="text-[11.5px] text-text-muted">{aj.job_orders.customer_name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-base">Recipients</h3>
          <span className="text-xs text-text-muted">
            {readCount} of {total} read
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {recipients.map((r) => (
            <div
              key={r.recipient_id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <Avatar
                name={r.profiles?.full_name ?? '?'}
                size={28}
                src={r.profiles?.avatar_url}
              />
              <div className="flex-1">
                <div className="text-[13px] font-medium text-text-base">
                  {r.profiles ? (r.profiles.display_name ?? r.profiles.full_name) : 'Unknown'}
                </div>
                {r.profiles?.display_name && (
                  <div className="text-[11px] text-text-muted">{r.profiles.full_name}</div>
                )}
              </div>
              {r.read_at ? (
                <span className="inline-flex items-center gap-1 text-[11.5px] text-success font-medium">
                  <Icons.check size={12} color="#059669" />
                  {fmtDateTime(r.read_at)}
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
