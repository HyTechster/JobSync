import { useState } from 'react'
import { useMyAlerts, type MyAlertRow } from '../../features/alerts/hooks'
import { useMarkAlertRead } from '../../features/alerts/mutations'
import { AlertBottomSheet } from '../../features/alerts/AlertBottomSheet'
import { Icons } from '../../components/ui/Icons'

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function AlertItem({ alert, onOpen }: { alert: MyAlertRow; onOpen: () => void }) {
  const isUnread = !alert.read_at
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-start gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isUnread ? 'bg-brand-50' : 'bg-surface-2'}`}>
        <Icons.bell size={18} color={isUnread ? 'var(--color-brand-700)' : 'var(--color-text-muted)'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-[14px] truncate flex-1 ${isUnread ? 'font-bold text-text-base' : 'font-medium text-text-base'}`}>
            {alert.alerts?.title ?? 'Alert'}
          </p>
          {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Unread" />}
        </div>
        <p className="text-[12.5px] text-text-muted mt-0.5 truncate">{alert.alerts?.message}</p>
        <p className="text-[11.5px] text-text-muted mt-0.5">{shortDate(alert.created_at)}</p>
      </div>
      <Icons.chevronR size={16} className="flex-shrink-0 text-text-muted mt-1" />
    </button>
  )
}

function SkeletonItem() {
  return (
    <div className="flex items-start gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3.5 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-44 bg-slate-100 rounded" />
        <div className="h-3 w-56 bg-slate-100 rounded" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export default function TechnicianAlertsPage() {
  const { data: alerts = [], isLoading, isError } = useMyAlerts()
  const { mutate: markRead } = useMarkAlertRead()
  const [selected, setSelected] = useState<MyAlertRow | null>(null)

  function handleOpen(alert: MyAlertRow) {
    if (!alert.read_at) markRead(alert.id)
    setSelected(alert)
  }

  return (
    <div className="px-4 pt-6 pb-2 max-w-lg mx-auto">
      <h1 className="text-[22px] font-bold text-text-base mb-5">Alerts</h1>

      {isError && (
        <div className="bg-[#FFF1F2] border border-[#FFD6DB] rounded-xl px-4 py-3 mb-4">
          <p className="text-[13px] text-danger">Failed to load alerts. Please refresh.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-3">
            <Icons.bell size={24} color="var(--color-text-muted)" />
          </div>
          <p className="text-[14px] font-semibold text-text-base mb-1">No alerts</p>
          <p className="text-[12.5px] text-text-muted">Notifications from your admin will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onOpen={() => handleOpen(alert)} />
          ))}
        </div>
      )}

      <AlertBottomSheet alert={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
