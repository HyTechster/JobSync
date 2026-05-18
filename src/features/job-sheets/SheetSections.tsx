import { useId } from 'react'
import { useFormContext } from 'react-hook-form'
import { SignaturePad } from '../../components/ui/SignaturePad'
import { Icons } from '../../components/ui/Icons'
import type { FullSheetFormData } from './fullSheetSchema'

// ── Style helpers ────────────────────────────────────────────────────────────

const lbl = 'block text-[12px] font-semibold text-text-muted mb-1.5'
const inp = 'w-full h-[44px] px-3 border border-slate-200 rounded-xl text-[14px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'
const area = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[14px] text-text-base bg-white outline-none resize-y leading-relaxed focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'
const err = 'text-[11.5px] text-danger mt-1'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-[12px] font-bold text-text-base uppercase tracking-widest mb-3">
        <span className="w-[3px] h-4 rounded-full bg-brand-700" />
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
      <label className={lbl}>{label} {required && <span className="text-danger">*</span>}</label>
      {children}
      {error && <p className={err}>{error}</p>}
    </div>
  )
}

// ── Photo sub-component ──────────────────────────────────────────────────────

interface PhotoPickerProps {
  label: string
  max: number
  previews: string[]
  count: number
  onAdd: (files: File[]) => void
  onRemove: (i: number) => void
  accept?: string
}

function PhotoPicker({ label, max, previews, count, onAdd, onRemove, accept = 'image/*' }: PhotoPickerProps) {
  const inputId = useId()
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={lbl + ' mb-0'}>{label}</span>
        <span className="text-[11px] text-text-muted">{count}/{max}</span>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
              {src.startsWith('data:application/pdf') || accept.includes('pdf') ? (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <Icons.sheets size={24} color="#94A3B8" />
                </div>
              ) : (
                <img src={src} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                aria-label="Remove"
              >
                <Icons.close size={11} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}
      {count < max && (
        <label
          htmlFor={inputId}
          className="flex items-center justify-center gap-2 h-[44px] rounded-xl border-2 border-dashed border-slate-300 text-[13px] text-text-muted cursor-pointer hover:border-brand-700 hover:text-brand-700 transition-colors"
        >
          <Icons.camera size={16} />
          Add {label.toLowerCase()}
          <input
            id={inputId}
            type="file"
            accept={accept}
            multiple
            capture="environment"
            onChange={(e) => {
              if (!e.target.files) return
              const remaining = max - count
              onAdd(Array.from(e.target.files).slice(0, remaining))
              e.target.value = ''
            }}
            className="sr-only"
          />
        </label>
      )}
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export interface SheetSectionsProps {
  assignedTechnicianNames: string[]
  additionalTechs: string[]
  onAddTech: (name: string) => void
  onRemoveTech: (i: number) => void
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
}

export function SheetSections({
  assignedTechnicianNames,
  additionalTechs,
  onAddTech,
  onRemoveTech,
  customerSig,
  onCustomerSig,
  technicianSig,
  onTechnicianSig,
  jobPhotoPreviews,
  jobPhotoCount,
  onAddJobPhotos,
  onRemoveJobPhoto,
  paymentPhotoPreviews,
  paymentPhotoCount,
  onAddPaymentPhotos,
  onRemovePaymentPhoto,
}: SheetSectionsProps) {
  const { register, formState: { errors } } = useFormContext<FullSheetFormData>()
  const addTechId = useId()

  return (
    <div className="px-4 py-5 space-y-6 pb-28">
      {/* Customer */}
      <SectionCard title="Customer">
        <Field label="Customer Name" required error={errors.customer_name?.message}>
          <input {...register('customer_name')} type="text" placeholder="Full name or company" className={inp} />
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
          <input {...register('job_title')} type="text" placeholder="e.g. CCTV maintenance at Site A" className={inp} />
        </Field>
        <Field label="Location" error={errors.job_location?.message}>
          <input {...register('job_location')} type="text" placeholder="Site address" className={inp} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Job Type">
            <select {...register('job_type')} className={inp}>
              <option value="">— select —</option>
              {['Service', 'Inspection', 'Installation', 'Maintenance', 'Emergency', 'Scheduled Maintenance', 'Other'].map((t) => (
                <option key={t} value={t.toLowerCase().replace(' ', '_')}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input {...register('job_date')} type="date" className={inp} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Time In">
            <input {...register('time_in')} type="time" className={inp} />
          </Field>
          <Field label="Time Out">
            <input {...register('time_out')} type="time" className={inp} />
          </Field>
        </div>
        <Field label="Description">
          <textarea {...register('job_description')} rows={3} placeholder="Brief job description…" className={area} />
        </Field>
      </SectionCard>

      {/* Work Performed */}
      <SectionCard title="Work Performed">
        <Field label="Work Performed" required error={errors.work_performed?.message}>
          <textarea {...register('work_performed')} rows={4} placeholder="Describe all work carried out…" className={area} />
        </Field>
        <Field label="Service Description">
          <textarea {...register('service_description')} rows={3} placeholder="Description for the client / invoice…" className={area} />
        </Field>
      </SectionCard>

      {/* Technicians */}
      <SectionCard title="Technicians">
        {assignedTechnicianNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {assignedTechnicianNames.map((name) => (
              <span key={name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 text-[12px] font-semibold">
                <Icons.user size={11} color="currentColor" />
                {name}
              </span>
            ))}
          </div>
        )}
        {additionalTechs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {additionalTechs.map((name, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                {name}
                <button type="button" onClick={() => onRemoveTech(i)} aria-label="Remove">
                  <Icons.close size={10} color="currentColor" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            id={addTechId}
            type="text"
            placeholder="Add technician name…"
            className={inp + ' flex-1'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = (e.currentTarget as HTMLInputElement).value.trim()
                if (val) { onAddTech(val); e.currentTarget.value = '' }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById(addTechId) as HTMLInputElement | null
              if (!el) return
              const val = el.value.trim()
              if (val) { onAddTech(val); el.value = '' }
            }}
            className="h-[44px] px-4 rounded-xl bg-slate-100 text-text-base text-[13px] font-semibold hover:bg-slate-200 transition-colors flex-shrink-0"
          >
            Add
          </button>
        </div>
      </SectionCard>

      {/* Payment */}
      <SectionCard title="Payment">
        <Field label="Total Amount Billed (MYR)">
          <input {...register('total_amount')} type="number" min="0" step="0.01" placeholder="0.00" className={inp} />
        </Field>
        <PhotoPicker
          label="Payment Evidence (max 3)"
          max={3}
          previews={paymentPhotoPreviews}
          count={paymentPhotoCount}
          onAdd={onAddPaymentPhotos}
          onRemove={onRemovePaymentPhoto}
          accept="image/*,.pdf"
        />
      </SectionCard>

      {/* Job Photos */}
      <SectionCard title="Job Site Photos">
        <PhotoPicker
          label="Photos (max 5)"
          max={5}
          previews={jobPhotoPreviews}
          count={jobPhotoCount}
          onAdd={onAddJobPhotos}
          onRemove={onRemoveJobPhoto}
        />
      </SectionCard>

      {/* Signatures */}
      <SectionCard title="Signatures">
        <SignaturePad label="Customer Signature" onChange={onCustomerSig} />
        <SignaturePad label="Technician Signature" onChange={onTechnicianSig} />
      </SectionCard>
    </div>
  )
}
