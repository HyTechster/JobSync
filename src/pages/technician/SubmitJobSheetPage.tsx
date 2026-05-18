import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useJob } from '../../features/jobs/hooks'
import { useSubmitFullSheet } from '../../features/job-sheets/mutations'
import { fullSheetSchema, type FullSheetFormData } from '../../features/job-sheets/fullSheetSchema'
import { SheetSections } from '../../features/job-sheets/SheetSections'
import { useOrganization } from '../../context/OrganizationContext'
import { Icons } from '../../components/ui/Icons'

export default function SubmitJobSheetPage() {
  const { jobId } = useParams<{ jobId?: string }>()
  const navigate  = useNavigate()
  const { activeOrgId } = useOrganization()
  const { data: job }   = useJob(jobId ?? '')
  const { mutate, isPending, error } = useSubmitFullSheet()

  const methods = useForm<FullSheetFormData>({
    resolver: zodResolver(fullSheetSchema),
    defaultValues: {
      customer_name: '',
      job_title: '',
      work_performed: '',
    },
  })

  // Pre-fill from job order when data arrives
  useEffect(() => {
    if (!job) return
    const j = job as Record<string, unknown>
    methods.reset({
      customer_name:   (job.customer_name ?? '') as string,
      customer_phone:  (job.customer_phone ?? '') as string,
      customer_email:  ((j['customer_email'] ?? '') as string),
      job_title:       (job.title ?? '') as string,
      job_location:    (job.location ?? '') as string,
      job_description: (job.description ?? '') as string,
      job_type:        ((j['job_type'] ?? '') as string),
      job_date:        (job.scheduled_date ?? '') as string,
      work_performed:  '',
    }, { keepErrors: false })
  }, [job, methods])

  // Assigned technician display names
  const assignedNames = (job?.job_assignments ?? []).map((a) => {
    const p = a.profiles
    return p ? (p.display_name || p.full_name) : ''
  }).filter(Boolean)

  // Additional free-text technician names
  const [additionalTechs, setAdditionalTechs] = useState<string[]>([])

  // Job photos
  const [jobPhotos,        setJobPhotos]        = useState<File[]>([])
  const [jobPhotoPreviews, setJobPhotoPreviews] = useState<string[]>([])

  // Payment evidence
  const [paymentPhotos,        setPaymentPhotos]        = useState<File[]>([])
  const [paymentPhotoPreviews, setPaymentPhotoPreviews] = useState<string[]>([])

  // Signatures
  const [customerSig,    setCustomerSig]    = useState<string | null>(null)
  const [technicianSig,  setTechnicianSig]  = useState<string | null>(null)

  const addJobPhotos = useCallback((files: File[]) => {
    setJobPhotos((p) => [...p, ...files])
    setJobPhotoPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))])
  }, [])

  const removeJobPhoto = useCallback((i: number) => {
    URL.revokeObjectURL(jobPhotoPreviews[i])
    setJobPhotos((p) => p.filter((_, idx) => idx !== i))
    setJobPhotoPreviews((p) => p.filter((_, idx) => idx !== i))
  }, [jobPhotoPreviews])

  const addPaymentPhotos = useCallback((files: File[]) => {
    setPaymentPhotos((p) => [...p, ...files])
    setPaymentPhotoPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))])
  }, [])

  const removePaymentPhoto = useCallback((i: number) => {
    URL.revokeObjectURL(paymentPhotoPreviews[i])
    setPaymentPhotos((p) => p.filter((_, idx) => idx !== i))
    setPaymentPhotoPreviews((p) => p.filter((_, idx) => idx !== i))
  }, [paymentPhotoPreviews])

  function onSubmit(data: FullSheetFormData) {
    mutate(
      {
        orgId:                    activeOrgId,
        jobOrderId:               jobId ?? null,
        form:                     data,
        additionalTechnicianNames: additionalTechs,
        jobPhotos,
        paymentPhotos,
        customerSignatureDataUrl:  customerSig,
        technicianSignatureDataUrl: technicianSig,
      },
      {
        onSuccess: () => navigate(jobId ? `/technician/jobs/${jobId}` : '/technician/job-sheets'),
      }
    )
  }

  const isPreFilled = !!jobId
  const pageTitle   = isPreFilled ? 'Submit Job Sheet' : 'New Job Sheet'
  const subtitle    = isPreFilled ? (job?.title ?? '…') : 'Standalone report'

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
          <p className="text-[11px] text-text-muted font-medium truncate">{subtitle}</p>
          <p className="text-[14px] font-bold text-text-base leading-tight">{pageTitle}</p>
        </div>
      </header>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <SheetSections
            assignedTechnicianNames={assignedNames}
            additionalTechs={additionalTechs}
            onAddTech={(name) => setAdditionalTechs((p) => [...p, name])}
            onRemoveTech={(i) => setAdditionalTechs((p) => p.filter((_, idx) => idx !== i))}
            customerSig={customerSig}
            onCustomerSig={setCustomerSig}
            technicianSig={technicianSig}
            onTechnicianSig={setTechnicianSig}
            jobPhotoPreviews={jobPhotoPreviews}
            jobPhotoCount={jobPhotos.length}
            onAddJobPhotos={addJobPhotos}
            onRemoveJobPhoto={removeJobPhoto}
            paymentPhotoPreviews={paymentPhotoPreviews}
            paymentPhotoCount={paymentPhotos.length}
            onAddPaymentPhotos={addPaymentPhotos}
            onRemovePaymentPhoto={removePaymentPhoto}
          />

          <div className="fixed bottom-[60px] left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 py-3 md:static md:bottom-auto md:border-0 md:px-4 md:pb-8 md:pt-0">
            {error && (
              <p className="text-[12px] text-danger mb-2">{(error as Error).message}</p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-[50px] rounded-xl bg-brand-700 text-white text-[14px] font-semibold disabled:opacity-50 transition-colors hover:bg-brand-800 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Icons.send size={16} />
                  Submit Job Sheet
                </>
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
