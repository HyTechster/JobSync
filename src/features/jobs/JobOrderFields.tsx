import { useFormContext, Controller } from 'react-hook-form'
import type { JobOrderFormData } from './jobSchema'
import type { Profile } from '../../types'
import { TechnicianPicker } from './TechnicianPicker'

const PRIORITIES = [
  { value: 'low',    label: 'Low',    dot: 'bg-[#94A3B8]' },
  { value: 'medium', label: 'Medium', dot: 'bg-[#F59E0B]' },
  { value: 'high',   label: 'High',   dot: 'bg-[#E11D48]' },
  { value: 'urgent', label: 'Urgent', dot: 'bg-[#DC2626]' },
] as const

const inputCls =
  'w-full h-[38px] px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

interface JobOrderFieldsProps {
  technicians: Profile[]
}

export function JobOrderFields({ technicians }: JobOrderFieldsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<JobOrderFormData>()

  return (
    <>
      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-text-base">Customer</h3>
          <p className="text-[12px] text-text-muted mt-0.5">Who is this job for?</p>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Customer name <span className="text-danger">*</span>
            </label>
            <input
              {...register('customer_name')}
              className={inputCls}
              placeholder="e.g. Brightline Offices"
            />
            {errors.customer_name && (
              <p className="text-[11.5px] text-danger mt-1">{errors.customer_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Phone
            </label>
            <input
              {...register('customer_phone')}
              className={inputCls}
              placeholder="+60 12-345 6789"
              type="tel"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-text-base">Job details</h3>
          <p className="text-[12px] text-text-muted mt-0.5">What needs to happen, and how urgent</p>
        </div>
        <div className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Title <span className="text-danger">*</span>
            </label>
            <input
              {...register('title')}
              className={inputCls}
              placeholder="e.g. AC unit not cooling – Suite 3B"
            />
            {errors.title && (
              <p className="text-[11.5px] text-danger mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Location <span className="text-danger">*</span>
            </label>
            <input
              {...register('location')}
              className={inputCls}
              placeholder="e.g. 12 Jalan Ampang, Kuala Lumpur"
            />
            {errors.location && (
              <p className="text-[11.5px] text-danger mt-1">{errors.location.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-1 p-1 bg-surface-2 rounded-lg">
                  {PRIORITIES.map(({ value, label, dot }) => {
                    const active = field.value === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={`flex items-center justify-center gap-1.5 py-[7px] rounded-md text-xs font-semibold transition-all ${
                          active
                            ? 'bg-white shadow-sm text-text-base ring-1 ring-slate-200'
                            : 'text-text-muted hover:text-text-base'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none resize-y leading-relaxed focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
              placeholder="Describe the problem, symptoms, access notes…"
            />
            {errors.description && (
              <p className="text-[11.5px] text-danger mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-text-base">Schedule</h3>
          <p className="text-[12px] text-text-muted mt-0.5">When the work should happen</p>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Date <span className="text-danger">*</span>
            </label>
            <input
              {...register('scheduled_date')}
              type="date"
              className={inputCls}
            />
            {errors.scheduled_date && (
              <p className="text-[11.5px] text-danger mt-1">{errors.scheduled_date.message}</p>
            )}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Time
            </label>
            <input
              {...register('scheduled_time')}
              type="time"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-text-base">Assignment</h3>
          <p className="text-[12px] text-text-muted mt-0.5">
            Pick one or more technicians, or leave unassigned
          </p>
        </div>
        <Controller
          name="technician_ids"
          control={control}
          render={({ field }) => (
            <TechnicianPicker
              technicians={technicians}
              selectedIds={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </section>
    </>
  )
}
