import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useJob } from '../../features/jobs/hooks'
import { useSubmitJobSheet } from '../../features/job-sheets/mutations'
import { Icons } from '../../components/ui/Icons'

const formSchema = z.object({
  work_performed: z.string().min(1, 'Work performed is required'),
  hours:   z.number().int().min(0).max(23),
  minutes: z.number().int().min(0).max(59),
  notes: z.string().optional(),
}).refine((d) => d.hours * 60 + d.minutes >= 1, {
  message: 'Enter at least 1 minute',
  path: ['minutes'],
})

type FormData = z.infer<typeof formSchema>

const inputCls = 'w-full h-[44px] px-3 border border-slate-200 rounded-xl text-[14px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'
const labelCls = 'block text-[12px] font-semibold text-text-muted uppercase tracking-wide mb-1.5'

export default function SubmitJobSheetPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { data: job } = useJob(jobId ?? '')
  const { mutate, isPending, error } = useSubmitJobSheet()

  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { hours: 0, minutes: 0 },
  })

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const remaining = 5 - photos.length
    const newFiles = Array.from(e.target.files).slice(0, remaining)
    setPhotos((p) => [...p, ...newFiles])
    setPreviews((p) => [...p, ...newFiles.map((f) => URL.createObjectURL(f))])
    e.target.value = ''
  }

  function removePhoto(idx: number) {
    URL.revokeObjectURL(previews[idx])
    setPhotos((p) => p.filter((_, i) => i !== idx))
    setPreviews((p) => p.filter((_, i) => i !== idx))
  }

  function onSubmit(data: FormData) {
    const time_spent_minutes = data.hours * 60 + data.minutes
    mutate(
      { jobOrderId: jobId!, form: { work_performed: data.work_performed, time_spent_minutes, notes: data.notes }, photos },
      { onSuccess: () => navigate('/technician/history') }
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors"
          aria-label="Go back"
        >
          <Icons.arrowL size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-text-muted font-medium truncate">{job?.title ?? '…'}</p>
          <p className="text-[14px] font-bold text-text-base leading-tight">Submit Job Sheet</p>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 space-y-5">
        <div>
          <label className={labelCls}>Work Performed <span className="text-danger normal-case font-normal">*</span></label>
          <textarea
            {...register('work_performed')}
            rows={5}
            placeholder="Describe all work carried out…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[14px] text-text-base bg-white outline-none resize-y leading-relaxed focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
          />
          {errors.work_performed && <p className="text-[11.5px] text-danger mt-1">{errors.work_performed.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Time Spent <span className="text-danger normal-case font-normal">*</span></label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input {...register('hours', { valueAsNumber: true })} type="number" min={0} max={23} placeholder="0" className={inputCls} aria-label="Hours" />
              <p className="text-[11px] text-text-muted mt-1 text-center">hrs</p>
            </div>
            <span className="text-[20px] text-text-muted pb-5">:</span>
            <div className="flex-1">
              <input {...register('minutes', { valueAsNumber: true })} type="number" min={0} max={59} placeholder="0" className={inputCls} aria-label="Minutes" />
              <p className="text-[11px] text-text-muted mt-1 text-center">min</p>
            </div>
          </div>
          {errors.minutes && <p className="text-[11.5px] text-danger mt-1">{errors.minutes.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Notes <span className="text-text-muted font-normal normal-case">(optional)</span></label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Additional observations or follow-up actions…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[14px] text-text-base bg-white outline-none resize-y leading-relaxed focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls + ' mb-0'}>Photos <span className="text-text-muted font-normal normal-case">(max 5)</span></label>
            <span className="text-[11px] text-text-muted">{photos.length}/5</span>
          </div>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                  <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center" aria-label="Remove photo">
                    <Icons.close size={11} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < 5 && (
            <label className="flex items-center justify-center gap-2 h-[44px] rounded-xl border-2 border-dashed border-slate-300 text-[13px] text-text-muted cursor-pointer hover:border-brand-700 hover:text-brand-700 transition-colors">
              <Icons.camera size={17} />
              Add photos
              <input type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoChange} className="sr-only" />
            </label>
          )}
        </div>

        {error && <p className="text-[12.5px] text-danger">{(error as Error).message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-[50px] rounded-xl bg-brand-700 text-white text-[14px] font-semibold disabled:opacity-50 transition-colors hover:bg-brand-800 active:bg-brand-900"
        >
          {isPending ? 'Submitting…' : 'Submit Job Sheet'}
        </button>
      </form>
    </div>
  )
}
