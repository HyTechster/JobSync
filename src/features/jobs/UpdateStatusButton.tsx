import { useState } from 'react'
import { Icons } from '../../components/ui/Icons'
import { useUpdateJobStatus } from './mutations'
import type { JobStatus } from '../../types'

interface UpdateStatusButtonProps {
  jobId: string
  currentStatus: JobStatus
}

const TRANSITION: Partial<Record<JobStatus, { label: string; next: JobStatus; cls: string }>> = {
  pending:     { label: 'Start Job',    next: 'in_progress', cls: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' },
  in_progress: { label: 'Complete Job', next: 'completed',   cls: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800' },
}

export function UpdateStatusButton({ jobId, currentStatus }: UpdateStatusButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutate, isPending } = useUpdateJobStatus()

  const t = TRANSITION[currentStatus]
  if (!t) return null

  function proceed() {
    mutate({ id: jobId, status: t!.next }, { onSuccess: () => setShowConfirm(false) })
  }

  if (showConfirm) {
    return (
      <div className="bg-[#F0FDF4] border border-emerald-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icons.check size={16} color="#059669" />
          <p className="text-[14px] font-semibold text-text-base">Mark as completed?</p>
        </div>
        <p className="text-[12.5px] text-text-muted mb-4 leading-relaxed">
          Ensure all work is done and your job sheet has been submitted before completing.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="flex-1 h-[44px] rounded-xl border border-slate-300 text-[13.5px] font-semibold text-text-base bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={proceed}
            disabled={isPending}
            className="flex-1 h-[44px] rounded-xl bg-emerald-600 text-white text-[13.5px] font-semibold disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Completing…' : 'Yes, complete'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => t.next === 'completed' ? setShowConfirm(true) : proceed()}
      disabled={isPending}
      className={`w-full h-[48px] rounded-xl text-white text-[14px] font-semibold disabled:opacity-50 transition-colors ${t.cls}`}
    >
      {isPending ? 'Updating…' : t.label}
    </button>
  )
}
