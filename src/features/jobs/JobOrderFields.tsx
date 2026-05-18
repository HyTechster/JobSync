import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import type { JobOrderFormData } from './jobSchema'
import { JOB_TYPES } from './jobSchema'
import type { Profile } from '../../types'
import { TechnicianPicker } from './TechnicianPicker'
import { MapPickerModal } from '../../components/ui/MapPickerModal'
import { Icons } from '../../components/ui/Icons'

const PRIORITIES = [
  { value: 'low',    label: 'Low',    dot: 'bg-[#94A3B8]' },
  { value: 'medium', label: 'Medium', dot: 'bg-[#F59E0B]' },
  { value: 'high',   label: 'High',   dot: 'bg-[#E11D48]' },
  { value: 'urgent', label: 'Urgent', dot: 'bg-[#DC2626]' },
] as const

const inputCls =
  'w-full h-[38px] px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

const sectionTitleCls =
  'text-[10.5px] font-bold text-brand-700 uppercase tracking-widest mb-3 pb-1.5 border-b border-brand-100'

function FlexToggle({ label, name }: { label: string; name: 'scheduled_date_flexible' | 'scheduled_time_flexible' | 'due_date_flexible' }) {
  const { register } = useFormContext<JobOrderFormData>()
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <input type="checkbox" {...register(name)} className="w-3.5 h-3.5 accent-brand-700" />
      <span className="text-[12px] text-text-muted">{label}</span>
    </label>
  )
}

interface JobOrderFieldsProps {
  technicians: Profile[]
}

export function JobOrderFields({ technicians }: JobOrderFieldsProps) {
  const [showMap, setShowMap] = useState(false)

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<JobOrderFormData>()

  const jobType        = watch('job_type')
  const dateFlexible   = watch('scheduled_date_flexible')
  const timeFlexible   = watch('scheduled_time_flexible')
  const dueFlexible    = watch('due_date_flexible')
  const billingSame    = watch('billing_same_as_location')

  return (
    <>
      {/* ── Customer ──────────────────────────────────────────────── */}
      <section>
        <p className={sectionTitleCls}>Customer</p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
                Customer name <span className="text-danger">*</span>
              </label>
              <input {...register('customer_name')} className={inputCls} placeholder="e.g. Brightline Offices" />
              {errors.customer_name && (
                <p className="text-[11.5px] text-danger mt-1">{errors.customer_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
                Phone <span className="text-danger">*</span>
              </label>
              <input {...register('customer_phone')} className={inputCls} placeholder="+60 12-345 6789" type="tel" />
              {errors.customer_phone && (
                <p className="text-[11.5px] text-danger mt-1">{errors.customer_phone.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">Email</label>
            <input {...register('customer_email')} className={inputCls} placeholder="customer@example.com" type="email" />
            {errors.customer_email && (
              <p className="text-[11.5px] text-danger mt-1">{errors.customer_email.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Job Details ───────────────────────────────────────────── */}
      <section>
        <p className={sectionTitleCls}>Job Details</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Title <span className="text-danger">*</span>
            </label>
            <input {...register('title')} className={inputCls} placeholder="e.g. AC unit not cooling – Suite 3B" />
            {errors.title && <p className="text-[11.5px] text-danger mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12.5px] font-semibold text-text-base">
                Location <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:text-brand-800 transition-colors"
              >
                <Icons.pin size={13} />
                Pick on map
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <input {...register('location_street')} className={inputCls} placeholder="Street / unit address" />
              {errors.location_street && (
                <p className="text-[11.5px] text-danger -mt-1">{errors.location_street.message}</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                <input {...register('location_postcode')} className={inputCls} placeholder="Postcode" />
                <input {...register('location_city')} className={inputCls} placeholder="City" />
                <input {...register('location_state')} className={inputCls} placeholder="State" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Priority <span className="text-danger">*</span>
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-1 p-1 bg-surface-2 rounded-lg">
                  {PRIORITIES.map(({ value, label, dot }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex items-center justify-center gap-1.5 py-[7px] rounded-md text-xs font-semibold transition-all ${
                        field.value === value
                          ? 'bg-white shadow-sm text-text-base ring-1 ring-slate-200'
                          : 'text-text-muted hover:text-text-base'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      {label}
                    </button>
                  ))}
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

          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Type <span className="text-danger">*</span>
            </label>
            <select {...register('job_type')} className={`${inputCls} pr-8`}>
              <option value="">Select job type…</option>
              {JOB_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.job_type && <p className="text-[11.5px] text-danger mt-1">{errors.job_type.message}</p>}
            {jobType === 'other' && (
              <div className="mt-2">
                <input
                  {...register('job_type_other')}
                  className={inputCls}
                  placeholder="Please specify the job type…"
                />
                {errors.job_type_other && (
                  <p className="text-[11.5px] text-danger mt-1">{errors.job_type_other.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Schedule ──────────────────────────────────────────────── */}
      <section>
        <p className={sectionTitleCls}>Schedule</p>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12.5px] font-semibold text-text-base">
                Date <span className="text-danger">*</span>
              </label>
              <FlexToggle name="scheduled_date_flexible" label="Whenever" />
            </div>
            {!dateFlexible && <input {...register('scheduled_date')} type="date" className={inputCls} />}
            {errors.scheduled_date && (
              <p className="text-[11.5px] text-danger mt-1">{errors.scheduled_date.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12.5px] font-semibold text-text-base">Time</label>
              <FlexToggle name="scheduled_time_flexible" label="Whenever" />
            </div>
            {!timeFlexible && <input {...register('scheduled_time')} type="time" className={inputCls} />}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12.5px] font-semibold text-text-base">Due date</label>
              <FlexToggle name="due_date_flexible" label="No due date" />
            </div>
            {!dueFlexible && <input {...register('due_date')} type="date" className={inputCls} />}
          </div>
        </div>
      </section>

      {/* ── Assignment ────────────────────────────────────────────── */}
      <section>
        <p className={sectionTitleCls}>Assignment</p>
        <p className="text-[12px] text-text-muted -mt-1 mb-3">
          Pick one or more technicians, or leave unassigned
        </p>
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

      {/* ── Payment ───────────────────────────────────────────────── */}
      <section>
        <p className={sectionTitleCls}>Payment</p>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12.5px] font-semibold text-text-base">
              Billing address <span className="text-danger">*</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('billing_same_as_location')}
                className="w-3.5 h-3.5 accent-brand-700"
              />
              <span className="text-[12px] text-text-muted">Same as location</span>
            </label>
          </div>
          {!billingSame && (
            <textarea
              {...register('billing_address')}
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none resize-y leading-relaxed focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
              placeholder="Enter billing address…"
            />
          )}
          {errors.billing_address && (
            <p className="text-[11.5px] text-danger mt-1">{errors.billing_address.message}</p>
          )}
        </div>
      </section>

      <MapPickerModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        onConfirm={(result) => {
          setValue('location_street',  result.street,   { shouldValidate: true })
          setValue('location_city',    result.city,     { shouldValidate: true })
          setValue('location_state',   result.state,    { shouldValidate: true })
          setValue('location_postcode', result.postcode, { shouldValidate: true })
        }}
      />
    </>
  )
}
