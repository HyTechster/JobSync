import { useState } from 'react'
import { useAlerts } from '../../features/alerts/hooks'
import { useDeleteAlert } from '../../features/alerts/mutations'
import { AlertCard } from '../../features/alerts/AlertCard'
import { CreateAlertModal } from '../../features/alerts/CreateAlertModal'
import { AlertDetailModal } from '../../features/alerts/AlertDetailModal'
import { Icons } from '../../components/ui/Icons'
import type { AlertWithDetail } from '../../features/alerts/hooks'

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-[18px] animate-pulse">
      <div className="flex items-start gap-3.5">
        <div className="w-[38px] h-[38px] rounded-[9px] bg-slate-100 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-48 bg-slate-100 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded ml-auto" />
          </div>
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-2/3 bg-slate-100 rounded" />
          <div className="flex items-center gap-2 mt-3">
            <div className="h-5 w-5 rounded-full bg-slate-100" />
            <div className="h-5 w-5 rounded-full bg-slate-100" />
            <div className="h-3 w-24 bg-slate-100 rounded ml-1" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminAlerts() {
  const { data: alerts = [], isLoading, isError } = useAlerts()
  const { mutate: deleteAlert } = useDeleteAlert()

  const [showCreate, setShowCreate] = useState(false)
  const [viewAlert, setViewAlert] = useState<AlertWithDetail | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AlertWithDetail | null>(null)

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    deleteAlert(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-bold text-text-base">Alerts</h1>
          <p className="text-[12.5px] md:text-[13px] text-text-muted mt-0.5">
            Send important notices to your field technicians
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-[34px] md:h-[38px] px-3 md:px-4 rounded-lg bg-brand-700 text-white text-[13px] md:text-sm font-semibold hover:bg-brand-800 transition-colors inline-flex items-center gap-1.5 md:gap-2"
        >
          <Icons.plus size={14} color="white" />
          <span className="hidden sm:inline">New alert</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {deleteTarget && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-[#FFF1F2] border border-[#FFD6DB] rounded-xl px-4 py-3">
          <div className="flex items-start gap-2">
            <Icons.trash size={15} color="#E11D48" className="mt-0.5 flex-shrink-0" />
            <p className="text-[13px] text-danger font-medium leading-snug">
              Delete &ldquo;{deleteTarget.title}&rdquo;? This cannot be undone.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 sm:flex-none h-[32px] px-3 rounded-lg border border-slate-300 text-[12.5px] font-semibold text-text-base hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 sm:flex-none h-[32px] px-3 rounded-lg bg-danger text-white text-[12.5px] font-semibold hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {isError && (
        <div className="bg-[#FFF1F2] border border-[#FFD6DB] rounded-xl px-4 py-3 mb-4">
          <p className="text-[13px] text-danger">Failed to load alerts. Please refresh the page.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <Icons.bell size={26} color="var(--color-brand-700)" />
          </div>
          <h2 className="text-[15px] font-semibold text-text-base mb-1">No alerts sent yet</h2>
          <p className="text-[13px] text-text-muted mb-5 max-w-xs">
            Keep your team informed by sending alerts about job updates, schedule changes, or important notices.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="h-[38px] px-4 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors inline-flex items-center gap-2"
          >
            <Icons.plus size={15} color="white" />
            Send the first alert
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onView={() => setViewAlert(alert)}
              onDelete={() => setDeleteTarget(alert)}
            />
          ))}
        </div>
      )}

      <CreateAlertModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <AlertDetailModal alert={viewAlert} onClose={() => setViewAlert(null)} />
    </div>
  )
}
