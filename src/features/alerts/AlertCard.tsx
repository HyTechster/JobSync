import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import type { AlertWithDetail } from './hooks'

interface AlertCardProps {
  alert: AlertWithDetail
  onView: () => void
  onDelete: () => void
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function AlertCard({ alert, onView, onDelete }: AlertCardProps) {
  const recipients = alert.alert_recipients
  const readCount = recipients.filter((r) => r.read_at !== null).length

  return (
    <div
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onView()}
      className="bg-white border border-slate-200 rounded-xl p-[18px] hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all group"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-[38px] h-[38px] rounded-[9px] bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
          <Icons.bell size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14.5px] font-semibold text-text-base truncate flex-1">
              {alert.title}
            </span>
            <span className="text-[11.5px] text-text-muted whitespace-nowrap flex-shrink-0">
              {shortDate(alert.created_at)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 hover:bg-[#FFE4E6] hover:text-danger transition-all flex-shrink-0"
              aria-label="Delete alert"
            >
              <Icons.trash size={14} />
            </button>
          </div>

          <p className="text-[13.5px] text-text-muted mt-1.5 leading-relaxed line-clamp-2">
            {alert.message}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center">
              {recipients.slice(0, 5).map((r, i) => (
                <div
                  key={r.recipient_id}
                  style={{ marginLeft: i ? -6 : 0 }}
                  className="border-2 border-white rounded-full"
                >
                  <Avatar
                    name={r.profiles?.full_name ?? '?'}
                    size={22}
                    src={r.profiles?.avatar_url}
                  />
                </div>
              ))}
              {recipients.length > 5 && (
                <div
                  className="w-[22px] h-[22px] rounded-full bg-surface-2 border-2 border-white text-[10px] font-semibold text-text-muted flex items-center justify-center"
                  style={{ marginLeft: -6 }}
                >
                  +{recipients.length - 5}
                </div>
              )}
            </div>
            <span className="text-[12px] text-text-muted">
              {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[12px] text-text-subtle">·</span>
            <span className="text-[12px] text-text-muted">
              {readCount}/{recipients.length} read
            </span>
            {alert.profiles && (
              <>
                <span className="text-[12px] text-text-subtle">·</span>
                <span className="text-[12px] text-text-muted">
                  by {alert.profiles.full_name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
