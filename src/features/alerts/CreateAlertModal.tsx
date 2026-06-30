import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAlertSchema, type CreateAlertFormData } from './alertSchema'
import { useCreateAlert } from './mutations'
import { useOrgTechnicians, useJobs } from '../jobs/hooks'
import { useOrganization } from '../../context/OrganizationContext'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { Modal } from '../../components/ui/Modal'

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
}

const inputCls =
  'w-full h-[38px] px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

export function CreateAlertModal({ isOpen, onClose }: CreateAlertModalProps) {
  const { activeOrgId } = useOrganization()
  const { data: technicians = [] } = useOrgTechnicians(activeOrgId)
  const { data: allJobs = [] } = useJobs(activeOrgId)
  const { mutate: createAlert, isPending, error } = useCreateAlert()

  const [jobSearch, setJobSearch] = useState('')

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAlertFormData>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: { recipient_ids: [], job_order_ids: [] },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedIds = watch('recipient_ids')
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedJobIds = watch('job_order_ids') ?? []
  const allSelected = technicians.length > 0 && selectedIds.length === technicians.length

  const activeJobs = allJobs.filter((j) => j.status !== 'cancelled')
  const filteredJobs = jobSearch.trim()
    ? activeJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
          j.customer_name.toLowerCase().includes(jobSearch.toLowerCase())
      )
    : activeJobs

  function toggleAll() {
    setValue('recipient_ids', allSelected ? [] : technicians.map((t) => t.id))
  }

  function onSubmit(data: CreateAlertFormData) {
    if (!activeOrgId) return
    createAlert({ form: data, orgId: activeOrgId }, {
      onSuccess: () => {
        reset({ recipient_ids: [], job_order_ids: [] })
        setJobSearch('')
        onClose()
      },
    })
  }

  function handleClose() {
    reset({ recipient_ids: [], job_order_ids: [] })
    setJobSearch('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send alert"
      subtitle="Notify one or more technicians"
      maxWidth="max-w-lg"
      footer={
        <>
          <p className="text-[12px]">
            {error ? <span className="text-danger">{(error as Error).message}</span> : null}
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
              onClick={handleSubmit(onSubmit)}
              disabled={isPending}
              className="h-[38px] px-4 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Icons.send size={14} color="white" />
              {isPending ? 'Sending…' : 'Send alert'}
            </button>
          </div>
        </>
      }
    >
      {/* Title */}
      <div>
        <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
          Title <span className="text-danger">*</span>
        </label>
        <input
          {...register('title')}
          className={inputCls}
          placeholder="Short, clear headline"
        />
        {errors.title && (
          <p className="text-[11.5px] text-danger mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
          Message <span className="text-danger">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={4}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none resize-y leading-relaxed focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
          placeholder="What do technicians need to know?"
        />
        {errors.message && (
          <p className="text-[11.5px] text-danger mt-1">{errors.message.message}</p>
        )}
      </div>

      {/* Linked jobs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12.5px] font-semibold text-text-base flex items-center gap-1.5">
            <Icons.jobs size={13} />
            Link to jobs
            <span className="text-[11px] font-normal text-text-muted">(optional)</span>
          </label>
          {selectedJobIds.length > 0 && (
            <span className="text-[11.5px] font-semibold text-brand-700">
              {selectedJobIds.length} selected
            </span>
          )}
        </div>

        <Controller
          name="job_order_ids"
          control={control}
          render={({ field }) => (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-2.5 py-1.5 border-b border-slate-100">
                <input
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Search jobs…"
                  className="w-full text-[12.5px] text-text-base bg-transparent outline-none placeholder:text-text-muted"
                />
              </div>
              <div className="flex flex-col gap-0 max-h-[160px] overflow-y-auto p-1.5">
                {filteredJobs.length === 0 ? (
                  <p className="text-[12px] text-text-muted text-center py-3">
                    {allJobs.length === 0 ? 'No jobs in this organization.' : 'No matches found.'}
                  </p>
                ) : (
                  filteredJobs.map((job) => {
                    const checked = (field.value ?? []).includes(job.id)
                    return (
                      <label
                        key={job.id}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          checked ? 'bg-brand-50' : 'hover:bg-surface-2'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const cur = field.value ?? []
                            field.onChange(
                              checked
                                ? cur.filter((id) => id !== job.id)
                                : [...cur, job.id]
                            )
                          }}
                          className="w-3.5 h-3.5 accent-brand-700 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-text-base truncate">{job.title}</p>
                          <p className="text-[11px] text-text-muted truncate">{job.customer_name}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                          job.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-700'
                            : job.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-text-muted'
                        }`}>
                          {job.status === 'in_progress' ? 'Active' : job.status === 'completed' ? 'Done' : 'Pending'}
                        </span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          )}
        />
      </div>

      {/* Recipients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12.5px] font-semibold text-text-base">
            Recipients <span className="text-danger">*</span>
            <span className="ml-1 text-[11.5px] font-normal text-text-muted">
              ({selectedIds.length} of {technicians.length} selected)
            </span>
          </label>
          <button
            type="button"
            onClick={toggleAll}
            className="text-[12px] font-semibold text-brand-700 hover:underline"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <Controller
          name="recipient_ids"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto border border-slate-200 rounded-lg p-1.5">
              {technicians.length === 0 ? (
                <p className="text-[12px] text-text-muted text-center py-3">
                  No active technicians found.
                </p>
              ) : (
                technicians.map((tech) => {
                  const checked = field.value.includes(tech.id)
                  return (
                    <label
                      key={tech.id}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        checked ? 'bg-brand-50' : 'hover:bg-surface-2'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          field.onChange(
                            checked
                              ? field.value.filter((id) => id !== tech.id)
                              : [...field.value, tech.id]
                          )
                        }}
                        className="w-3.5 h-3.5 accent-brand-700"
                      />
                      <Avatar name={tech.full_name} size={24} src={tech.avatar_url} />
                      <div className="flex-1">
                        <div className="text-[13px] text-text-base">{tech.display_name ?? tech.full_name}</div>
                        {tech.display_name && (
                          <div className="text-[11px] text-text-muted">{tech.full_name}</div>
                        )}
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          )}
        />
        {errors.recipient_ids && (
          <p className="text-[11.5px] text-danger mt-1">{errors.recipient_ids.message}</p>
        )}
      </div>
    </Modal>
  )
}
