import { useUpdateJobStatus } from './mutations'
import { Modal } from '../../components/ui/Modal'
import { Icons } from '../../components/ui/Icons'

interface CancelJobDialogProps {
  jobId: string | null
  jobTitle: string
  onClose: () => void
}

export function CancelJobDialog({ jobId, jobTitle, onClose }: CancelJobDialogProps) {
  const { mutate: updateStatus, isPending } = useUpdateJobStatus()

  function handleConfirm() {
    if (!jobId) return
    updateStatus({ id: jobId, status: 'cancelled' }, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen={!!jobId}
      onClose={onClose}
      title="Cancel job order"
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-[38px] px-4 rounded-lg border border-slate-300 text-sm font-semibold text-text-base hover:bg-surface-2 transition-colors"
          >
            Keep job
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="h-[38px] px-4 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-[#9F1239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Cancelling…' : 'Cancel job'}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-12 h-12 rounded-full bg-[#FFE4E6] flex items-center justify-center">
          <Icons.ban size={22} color="#E11D48" />
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          Mark <span className="font-semibold text-text-base">"{jobTitle}"</span> as cancelled?
          It will stay in your records but no further work will be expected on it.
          You can find it later under the Cancelled filter.
        </p>
      </div>
    </Modal>
  )
}
