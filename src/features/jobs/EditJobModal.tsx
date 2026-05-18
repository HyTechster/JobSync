import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobOrderSchema, type JobOrderFormData } from './jobSchema'
import { useUpdateJob } from './mutations'
import { useOrgTechnicians } from './hooks'
import { JobOrderFields } from './JobOrderFields'
import { Modal } from '../../components/ui/Modal'
import { useOrganization } from '../../context/OrganizationContext'
import type { RecentJobRow } from './hooks'

interface EditJobModalProps {
  job: RecentJobRow | null
  onClose: () => void
}

export function EditJobModal({ job, onClose }: EditJobModalProps) {
  const { activeOrgId } = useOrganization()
  const { data: technicians = [] } = useOrgTechnicians(activeOrgId)
  const { mutate: updateJob, isPending, error } = useUpdateJob()

  const methods = useForm<JobOrderFormData>({
    resolver: zodResolver(jobOrderSchema),
    defaultValues: {
      priority: 'medium',
      technician_ids: [],
      scheduled_date_flexible: false,
      scheduled_time_flexible: false,
      due_date_flexible: true,
      billing_same_as_location: true,
    },
  })

  useEffect(() => {
    if (!job) return
    const j = job as Record<string, unknown>
    methods.reset({
      title:           job.title,
      description:     job.description,
      customer_name:   job.customer_name,
      customer_phone:  (job.customer_phone ?? '') as string,
      customer_email:  (j['customer_email'] as string | undefined) ?? '',
      location_street: (j['location_street'] as string | undefined) ?? job.location,
      location_city:   (j['location_city']    as string | undefined) ?? '',
      location_state:  (j['location_state']   as string | undefined) ?? '',
      location_postcode: (j['location_postcode'] as string | undefined) ?? '',
      priority:        job.priority,
      job_type:        (j['job_type'] as JobOrderFormData['job_type'] | undefined) ?? 'service',
      job_type_other:  (j['job_type_other'] as string | undefined) ?? '',
      scheduled_date_flexible: !job.scheduled_date,
      scheduled_date:  job.scheduled_date ?? '',
      scheduled_time_flexible: !job.scheduled_time,
      scheduled_time:  (job.scheduled_time ?? '') as string,
      due_date_flexible: !(j['due_date'] as string | undefined),
      due_date:        (j['due_date'] as string | undefined) ?? '',
      technician_ids:  job.job_assignments.map((a) => a.technician_id),
      billing_same_as_location: !(j['billing_address'] as string | undefined),
      billing_address: (j['billing_address'] as string | undefined) ?? '',
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
