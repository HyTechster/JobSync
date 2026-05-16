import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobOrderSchema, type JobOrderFormData } from './jobSchema'
import { useCreateJob } from './mutations'
import { useTechnicians } from './hooks'
import { JobOrderFields } from './JobOrderFields'
import { Modal } from '../../components/ui/Modal'

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  const { data: technicians = [] } = useTechnicians()
  const { mutate: createJob, isPending, error } = useCreateJob()

  const methods = useForm<JobOrderFormData>({
    resolver: zodResolver(jobOrderSchema),
    defaultValues: { priority: 'medium', technician_ids: [] },
  })

  function handleSubmit(data: JobOrderFormData) {
    createJob(data, {
      onSuccess: () => {
        methods.reset({ priority: 'medium', technician_ids: [] })
        onClose()
      },
    })
  }

  function handleClose() {
    methods.reset({ priority: 'medium', technician_ids: [] })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New job order"
      subtitle="Create and assign a new job"
      footer={
        <>
          <p className="text-[12px]">
            {error ? (
              <span className="text-danger">{(error as Error).message}</span>
            ) : null}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-[38px] px-4 rounded-lg border border-slate-300 text-sm font-semibold text-text-base hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={methods.handleSubmit(handleSubmit)}
              disabled={isPending}
              className="h-[38px] px-4 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating…' : 'Create job'}
            </button>
          </div>
        </>
      }
    >
      <FormProvider {...methods}>
        <JobOrderFields technicians={technicians} />
      </FormProvider>
    </Modal>
  )
}
