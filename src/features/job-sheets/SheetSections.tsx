import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { SignaturePad } from '../../components/ui/SignaturePad'
import { Icons } from '../../components/ui/Icons'
import type { FullSheetFormData } from './fullSheetSchema'
import type { OrgTechnician } from '../jobs/hooks'

// ── Style helpers ────────────────────────────────────────────────────────────

const lbl  = 'block text-[12px] font-semibold text-text-muted mb-1.5'
const inp  = 'w-full h-[44px] px-3 border border-slate-200 rounded-xl text-[14px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'
const inpE = 'w-full h-[44px] px-3 border border-danger rounded-xl text-[14px] text-text-base bg-white outline-none focus:border-danger focus:ring-[3px] focus:ring-danger/10 transition-all'
const area = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[14px] text-text-base bg-white outline-none resize-y leading-relaxed focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'
const errT = 'text-[11.5px] text-danger mt-1'

const JOB_TYPES = [
  { value: 'service',               label: 'Service' },
  { value: 'inspection',            label: 'Inspection' },
  { value: 'installation',          label: 'Installation' },
  { value: 'maintenance',           label: 'Maintenance' },
  { value: 'emergency',             label: 'Emergency' },
  { value: 'scheduled_maintenance', label: 'Scheduled Maintenance' },
  { value: 'other',                 label: 'Other' },
] as const

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-[12px] font-bold text-text-base uppercase tracking-widest mb-3">
        <span className="w-[3px] h-4 rounded-full bg-brand-700 flex-shrink-0" />
        {title}
      </h2>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className={lbl}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <p className={errT}>{error}</p>}
    </div>
  )
}

// ── Photo picker ──────────────────────────────────────────────────────────────

function PhotoPicker({
  label, required, max, previews, count, onAdd, onRemove, accept = 'image/*', error,
}: {
  label: string; required?: boolean; max: number
  previews: string[]; count: number
  onAdd: (files: File[]) => void; onRemove: (i: number) => void
  accept?: string; error?: string
}) {
  const inputId = useId()
  const isSingle = max === 1

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={lbl + ' mb-0'}>{label} {required && <span className="text-danger">*</span>}</span>
        {!isSingle && <span className="text-[11px] text-text-muted">{count}/{max}</span>}
      </div>

      {previews.length > 0 && (
        isSingle ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 mb-2">
            <img
              src={previews[0]} alt={`${label} photo`}
              className="w-full aspect-[4/3] object-cover" loading="lazy"
            />
            <button type="button" onClick={() => onRemove(0)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
              aria-label="Remove">
              <Icons.close size={12} color="white" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                {src.startsWith('blob:') || src.startsWith('data:image') ? (
                  <img src={src} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Icons.sheets size={24} color="#94A3B8" />
                  </div>
                )}
                <button type="button" onClick={() => onRemove(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                  aria-label="Remove">
                  <Icons.close size={11} color="white" />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {count < max && (
        <label htmlFor={inputId}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            isSingle ? 'h-[110px]' : 'h-[44px] flex-row gap-2'
          } ${error ? 'border-danger text-danger' : 'border-slate-300 text-text-muted hover:border-brand-700 hover:text-brand-700'}`}>
          <Icons.camera size={isSingle ? 22 : 16} />
          {isSingle ? (
            <>
              <span className="text-[13px] font-semibold">Add {label.toLowerCase()}</span>
              <span className="text-[10.5px] opacity-70">Tap to take or upload a photo</span>
            </>
          ) : (
            <span>Add {label.toLowerCase()}</span>
          )}
          <input id={inputId} type="file" accept={accept} multiple={!isSingle}
            onChange={(e) => {
              if (!e.target.files) return
              const remaining = max - count
              onAdd(Array.from(e.target.files).slice(0, remaining))
              e.target.value = ''
            }}
            className="sr-only" />
        </label>
      )}
      {error && <p className={errT}>{error}</p>}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ExtraErrors {
  jobPhotos?: string
  paymentPhotos?: string
  customerSig?: string
  technicianSig?: string
}

export interface SheetSectionsProps {
  orgTechnicians: OrgTechnician[]
  currentUserId: string
  selectedTechIds: string[]
  onToggleTech: (id: string) => void
  customerSig: string | null
  onCustomerSig: (s: string | null) => void
  technicianSig: string | null
  onTechnicianSig: (s: string | null) => void
  jobPhotoPreviews: string[]
  jobPhotoCount: number
  onAddJobPhotos: (files: File[]) => void
  onRemoveJobPhoto: (i: number) => void
  paymentPhotoPreviews: string[]
  paymentPhotoCount: number
  onAddPaymentPhotos: (files: File[]) => void
  onRemovePaymentPhoto: (i: number) => void
  extraErrors: ExtraErrors
}

// ── Main export ───────────────────────────────────────────────────────────────

export function SheetSections({
  orgTechnicians,
  currentUserId,
  selectedTechIds,
  onToggleTech,
  onCustomerSig,
  onTechnicianSig,
  jobPhotoPreviews,
  jobPhotoCount,
  onAddJobPhotos,
  onRemoveJobPhoto,
  paymentPhotoPreviews,
  paymentPhotoCount,
  onAddPaymentPhotos,
  onRemovePaymentPhoto,
  extraErrors,
}: SheetSectionsProps) {
  const { register, formState: { errors } } = useFormContext<FullSheetFormData>()
  const jobType = useWatch<FullSheetFormData, 'job_type'>({ name: 'job_type' })

  const availableTechs = orgTechnicians.filter((t) => t.id !== currentUserId)

  return (
    <div className="px-4 py-5 space-y-6 pb-36">

      {/* Customer */}
      <SectionCard title="Customer">
        <Field label="Customer Name" required error={errors.customer_name?.message}>
          <input {...register('customer_name')} type="text" placeholder="Full name or company"
            className={errors.customer_name ? inpE : inp} />
        </Field>
        <Field label="Phone" error={errors.customer_phone?.message}>
          <input {...register('customer_phone')} type="tel" placeholder="+60 12-345 6789" className={inp} />
        </Field>
        <Field label="Email" error={errors.customer_email?.message}>
          <input {...register('customer_email')} type="email" placeholder="customer@example.com" className={inp} />
        </Field>
      </SectionCard>

      {/* Job Details */}
      <SectionCard title="Job Details">
        <Field label="Job Title" required error={errors.job_title?.message}>
          <input {...register('job_title')} type="text" placeholder="e.g. CCTV maintenance at Site A"
            className={errors.job_title ? inpE : inp} />
        </Field>
        <Field label="Location" required error={errors.job_location?.message}>
          <input {...register('job_location')} type="text" placeholder="Site address"
            className={errors.job_location ? inpE : inp} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Job Type">
            <select {...register('job_type')} className={inp}>
              <option value="">— select —</option>
              {JOB_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" required error={errors.job_date?.message}>
            <input {...register('job_date')} type="date"
              className={errors.job_date ? inpE : inp} />
          </Field>
        </div>
        {jobType === 'other' && (
          <Field label="Specify Type" required error={errors.job_type_other?.message}>
            <input {...register('job_type_other')} type="text" placeholder="Describe the job type"
              className={errors.job_type_other ? inpE : inp} />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Time In" required error={errors.time_in?.message}>
            <input {...register('time_in')} type="time"
              className={errors.time_in ? inpE : inp} />
          </Field>
          <Field label="Time Out" required error={errors.time_out?.message}>
            <input {...register('time_out')} type="time"
              className={errors.time_out ? inpE : inp} />
          </Field>
        </div>
        <Field label="Description">
          <textarea {...register('job_description')} rows={3} placeholder="Brief job description…" className={area} />
        </Field>
      </SectionCard>

      {/* Work Performed */}
      <SectionCard title="Work Performed">
        <Field label="Work Performed" required error={errors.work_performed?.message}>
          <textarea {...register('work_performed')} rows={4} placeholder="Describe all work carried out…"
            className={`${area} ${errors.work_performed ? 'border-danger' : ''}`} />
        </Field>
        <Field label="Service Description">
          <textarea {...register('service_description')} rows={3}
            placeholder="Description for the client / invoice…" className={area} />
        </Field>
      </SectionCard>

      {/* Technicians */}
      <SectionCard title="Technicians">
        {availableTechs.length === 0 ? (
          <p className="text-[12.5px] text-text-muted">No other technicians in this organization.</p>
        ) : (
          <div className="space-y-1">
            <p className="text-[11.5px] text-text-muted mb-2">Select additional technicians involved:</p>
            {availableTechs.map((tech) => {
              const name   = tech.display_name || tech.full_name
              const isSelected = selectedTechIds.includes(tech.id)
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => onToggleTech(tech.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left ${
                    isSelected
                      ? 'border-brand-700 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-text-base hover:bg-surface-2'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'border-brand-700 bg-brand-700' : 'border-slate-300'
                  }`}>
                    {isSelected && <Icons.check size={11} color="white" />}
                  </div>
                  <span className="text-[13.5px] font-medium">{name}</span>
                </button>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* Payment */}
      <SectionCard title="Payment">
        <Field label="Total Amount Billed (MYR)" required error={errors.total_amount?.message}>
          <input {...register('total_amount')} type="number" min="0" step="0.01" placeholder="0.00"
            className={errors.total_amount ? inpE : inp} />
        </Field>
        <PhotoPicker
          label="Payment Evidence"
          required
          max={1}
          previews={paymentPhotoPreviews}
          count={paymentPhotoCount}
          onAdd={onAddPaymentPhotos}
          onRemove={onRemovePaymentPhoto}
          accept="image/*,.pdf"
          error={extraErrors.paymentPhotos}
        />
      </SectionCard>

      {/* Job Photos */}
      <SectionCard title="Job Site Photos">
        <PhotoPicker
          label="Site Photos"
          required
          max={3}
          previews={jobPhotoPreviews}
          count={jobPhotoCount}
          onAdd={onAddJobPhotos}
          onRemove={onRemoveJobPhoto}
          error={extraErrors.jobPhotos}
        />
      </SectionCard>

      {/* Signatures */}
      <SectionCard title="Signatures">
        <div className={extraErrors.customerSig ? 'ring-1 ring-danger rounded-xl p-1' : ''}>
          <SignaturePad label="Customer Signature" required onChange={onCustomerSig} />
          {extraErrors.customerSig && <p className={errT}>{extraErrors.customerSig}</p>}
        </div>
        <div className={extraErrors.technicianSig ? 'ring-1 ring-danger rounded-xl p-1 mt-4' : 'mt-4'}>
          <SignaturePad label="Technician Signature" required onChange={onTechnicianSig} />
          {extraErrors.technicianSig && <p className={errT}>{extraErrors.technicianSig}</p>}
        </div>
      </SectionCard>

    </div>
  )
}
