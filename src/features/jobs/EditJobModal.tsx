import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobOrderSchema, type JobOrderFormData } from './jobSchema'
import { useUpdateJob } from './mutations'
import { useTechnicians } from './hooks'
import { JobOrderFields } from './JobOrderFields'
import { Modal } from '../../components/ui/Modal'
import type { RecentJobRow } from './hooks'

interface EditJobModalProps {
  job: RecentJobRow | null
  onClose: () => void
}

export function EditJobModal({ job, onClose }: EditJobModalProps) {
  const { data: technicians = [] } = useTechnicians()
  const { mutate: updateJob, isPending, error } = useUpdateJob()

  const methods = useForm<JobOrderFormData>({
    resolver: zodResolver(jobOrderSchema),
    defaultValues: { priority: 'medium', technician_ids: [] },
  })

  useEffect(() => {
    if (!job) return
    methods.reset({
      title: job.title,
      description: job.description,
      customer_name: job.customer_name,
      customer_phone: job.customer_phone ?? '',
      location: job.location,
      priority: job.priority,
      scheduled_date: job.scheduled_date,
      scheduled_time: job.scheduled_time ?? '',
      technician_ids: job.job_assignments.map((a) => a.technician_id),
    })
  }, [job, methods])

  function handleSubmit(data: JobOrderFormData) {
    if (!job) return
    updateJob({ id: job.id, form: data }, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen={!!job}
      onClose={onClose}
      title="Edit job order"
      subtitle={job?.title}
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
              onClick={onClose}
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
              {isPending ? 'Saving…' : 'Save changes'}
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
