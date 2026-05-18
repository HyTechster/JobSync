import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobOrderSchema, type JobOrderFormData } from './jobSchema'
import { useCreateJob } from './mutations'
import { useOrgTechnicians } from './hooks'
import { JobOrderFields } from './JobOrderFields'
import { Modal } from '../../components/ui/Modal'
import { useOrganization } from '../../context/OrganizationContext'

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_VALUES: Partial<JobOrderFormData> = {
  priority: 'medium',
  technician_ids: [],
  scheduled_date_flexible: false,
  scheduled_time_flexible: false,
  due_date_flexible: true,
  billing_same_as_location: true,
}

export function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  const { activeOrgId } = useOrganization()
  const { data: technicians = [] } = useOrgTechnicians(activeOrgId)
  const { mutate: createJob, isPending, error } = useCreateJob()

  const methods = useForm<JobOrderFormData>({
    resolver: zodResolver(jobOrderSchema),
    defaultValues: DEFAULT_VALUES,
  })

  function handleSubmit(data: JobOrderFormData) {
    if (!activeOrgId) return
    createJob({ form: data, orgId: activeOrgId }, {
      onSuccess: () => {
        methods.reset(DEFAULT_VALUES)
        onClose()
      },
    })
  }

  function handleClose() {
    methods.reset(DEFAULT_VALUES)
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
