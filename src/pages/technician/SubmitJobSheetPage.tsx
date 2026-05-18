import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useJob } from '../../features/jobs/hooks'
import { useOrgTechnicians } from '../../features/jobs/hooks'
import { useSubmitFullSheet } from '../../features/job-sheets/mutations'
import { fullSheetSchema, type FullSheetFormData } from '../../features/job-sheets/fullSheetSchema'
import { SheetSections, type ExtraErrors } from '../../features/job-sheets/SheetSections'
import { useOrganization } from '../../context/OrganizationContext'
import { useAuthStore } from '../../store/authStore'
import { offlineDb } from '../../offline/db'
import { Icons } from '../../components/ui/Icons'

export default function SubmitJobSheetPage() {
  const { jobId }                = useParams<{ jobId?: string }>()
  const [searchParams]           = useSearchParams()
  const draftId                  = searchParams.get('draftId')
  const navigate                 = useNavigate()
  const { activeOrgId }          = useOrganization()
  const userId                   = useAuthStore((s) => s.session?.user.id) ?? ''
  const { data: job }            = useJob(jobId ?? '')
  const { data: orgTechs = [] }  = useOrgTechnicians(activeOrgId)
  const { mutate, isPending, error: mutationError } = useSubmitFullSheet()

  const methods = useForm<FullSheetFormData>({
    resolver: zodResolver(fullSheetSchema),
    defaultValues: { customer_name: '', job_title: '', job_location: '', job_date: '', time_in: '', time_out: '', work_performed: '', total_amount: '' },
  })

  // Pre-fill from job order when data arrives
  useEffect(() => {
    if (!job || draftId) return
    const j = job as Record<string, unknown>
    methods.reset({
      customer_name:   String(job.customer_name ?? ''),
      customer_phone:  String(job.customer_phone ?? ''),
      customer_email:  String((j['customer_email'] ?? '') as string),
      job_title:       String(job.title ?? ''),
      job_location:    String(job.location ?? ''),
      job_description: String(job.description ?? ''),
      job_type:        String((j['job_type'] ?? '') as string),
      job_date:        String(job.scheduled_date ?? ''),
      work_performed:  '',
      total_amount:    '',
    }, { keepErrors: false })
  }, [job, draftId, methods])

  // Load draft when draftId present
  useEffect(() => {
    if (!draftId) return
    offlineDb.draftSheets.get(parseInt(draftId, 10)).then((draft) => {
      if (!draft?.formDataJson) return
      try {
        const data = JSON.parse(draft.formDataJson) as FullSheetFormData
        methods.reset(data, { keepErrors: false })
      } catch { /* ignore parse errors */ }
    })
  }, [draftId, methods])

  // Additional org technicians (exclude self)
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([])
  const toggleTech = useCallback((id: string) => {
    setSelectedTechIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])
  }, [])

  // Photos
  const [jobPhotos,        setJobPhotos]        = useState<File[]>([])
  const [jobPhotoPreviews, setJobPhotoPreviews] = useState<string[]>([])
  const [paymentPhotos,        setPaymentPhotos]        = useState<File[]>([])
  const [paymentPhotoPreviews, setPaymentPhotoPreviews] = useState<string[]>([])

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

  // Signatures
  const [customerSig,   setCustomerSig]   = useState<string | null>(null)
  const [technicianSig, setTechnicianSig] = useState<string | null>(null)

  // Extra validation state (for photos + sigs which live outside Zod)
  const [extraErrors, setExtraErrors] = useState<ExtraErrors>({})

  // Draft save — only requires customer_name + job_title
  const [draftSaving, setDraftSaving] = useState(false)
  const [draftSaved,  setDraftSaved]  = useState(false)

  async function handleSaveDraft() {
    const vals = methods.getValues()
    if (!vals.customer_name?.trim()) {
      methods.setError('customer_name', { message: 'Required to save draft' })
      return
    }
    if (!vals.job_title?.trim()) {
      methods.setError('job_title', { message: 'Required to save draft' })
      return
    }
    if (!activeOrgId || !userId) return
    setDraftSaving(true)
    try {
      const payload = {
        localId:        crypto.randomUUID(),
        organizationId: activeOrgId,
        technicianId:   userId,
        jobTitle:       vals.job_title.trim(),
        customerName:   vals.customer_name.trim(),
        formDataJson:   JSON.stringify(vals),
        createdAt:      new Date().toISOString(),
        updatedAt:      new Date().toISOString(),
      }
      if (draftId) {
        await offlineDb.draftSheets.update(parseInt(draftId, 10), payload)
      } else {
        await offlineDb.draftSheets.add(payload)
      }
      setDraftSaved(true)
      setTimeout(() => navigate('/technician/job-sheets'), 800)
    } finally {
      setDraftSaving(false)
    }
  }

  function onSubmit(data: FullSheetFormData) {
    const extras: ExtraErrors = {}
    if (jobPhotos.length === 0)    extras.jobPhotos    = 'At least one job site photo is required'
    if (paymentPhotos.length === 0) extras.paymentPhotos = 'At least one payment evidence is required'
    if (!customerSig)              extras.customerSig   = 'Customer signature is required'
    if (!technicianSig)            extras.technicianSig = 'Technician signature is required'

    if (Object.keys(extras).length > 0) {
      setExtraErrors(extras)
      return
    }
    setExtraErrors({})

    // Resolve selected technician names
    const additionalNames = selectedTechIds
      .map((id) => {
        const t = orgTechs.find((o) => o.id === id)
        return t ? (t.display_name || t.full_name) : null
      })
      .filter(Boolean) as string[]

    mutate(
      {
        orgId:                      activeOrgId,
        jobOrderId:                 jobId ?? null,
        form:                       data,
        additionalTechnicianNames:  additionalNames,
        jobPhotos,
        paymentPhotos,
        customerSignatureDataUrl:   customerSig,
        technicianSignatureDataUrl: technicianSig,
      },
      {
        onSuccess: async () => {
          if (draftId) await offlineDb.draftSheets.delete(parseInt(draftId, 10))
          navigate(jobId ? `/technician/jobs/${jobId}` : '/technician/job-sheets')
        },
      }
    )
  }

  const isPreFilled = !!jobId
  const pageTitle   = isPreFilled ? 'Submit Job Sheet' : 'New Job Sheet'
  const subtitle    = isPreFilled ? (job?.title ?? '…') : draftId ? 'Continuing draft' : 'Standalone report'

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors"
          aria-label="Go back">
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
            orgTechnicians={orgTechs}
            currentUserId={userId}
            selectedTechIds={selectedTechIds}
            onToggleTech={toggleTech}
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
            extraErrors={extraErrors}
          />

          {/* Fixed footer */}
          <div className="fixed bottom-[60px] left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 py-3 md:static md:bottom-auto md:border-0 md:px-4 md:pb-8 md:pt-0">
            {mutationError && (
              <p className="text-[12px] text-danger mb-2">{(mutationError as Error).message}</p>
            )}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => void handleSaveDraft()}
                disabled={draftSaving || draftSaved || isPending}
                className="flex-1 h-[50px] rounded-xl border-2 border-slate-300 text-[13.5px] font-semibold text-text-base disabled:opacity-50 transition-colors hover:bg-surface-2"
              >
                {draftSaved ? 'Saved!' : draftSaving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-[2] h-[50px] rounded-xl bg-brand-700 text-white text-[14px] font-semibold disabled:opacity-50 transition-colors hover:bg-brand-800 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                ) : (
                  <><Icons.send size={16} />Submit Sheet</>
                )}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
