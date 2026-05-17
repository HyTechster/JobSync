import { useState, useEffect, useId } from 'react'
import { Icons } from '../../components/ui/Icons'
import { useNextSheetId, useSubmitStandaloneSheet } from './hooks'
import { useOrganization } from '../../context/OrganizationContext'
import { useAuthStore } from '../../store/authStore'
import { offlineDb } from '../../offline/db'

interface Props {
  onClose: () => void
  onSubmitted?: () => void
}

const labelCls = 'block text-[12.5px] font-semibold text-text-muted mb-1'
const inputCls =
  'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-[13.5px] text-text-base bg-white outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/10 transition-all placeholder:text-slate-400'
const errorCls = 'text-[11.5px] text-danger mt-1'

function SheetIdBadge({ orgId }: { orgId: string | null }) {
  const { data: nextId, isLoading } = useNextSheetId(orgId)
  return (
    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        #
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10.5px] font-semibold text-emerald-700 uppercase tracking-wide leading-none mb-0.5">
          Sheet Number (assigned on submit)
        </p>
        <p className="text-[20px] font-bold text-emerald-800 leading-none">
          {isLoading || !orgId ? '—' : `#${nextId ?? '?'}`}
        </p>
      </div>
      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
        PREVIEW
      </span>
    </div>
  )
}

export function AddJobSheetModal({ onClose, onSubmitted }: Props) {
  const titleId = useId()
  const workId  = useId()
  const timeId  = useId()
  const notesId = useId()

  const { activeOrgId } = useOrganization()
  const userId = useAuthStore((s) => s.session?.user.id)
  const submitMutation = useSubmitStandaloneSheet()

  const [jobTitle, setJobTitle]     = useState('')
  const [workDone, setWorkDone]     = useState('')
  const [timeStr, setTimeStr]       = useState('')
  const [notes, setNotes]           = useState('')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [draftSaved, setDraftSaved] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function validate(requireAll: boolean) {
    const errs: Record<string, string> = {}
    if (!jobTitle.trim()) errs.jobTitle = 'Job title is required'
    if (requireAll) {
      if (!workDone.trim()) errs.workDone = 'Work performed is required'
      const mins = parseInt(timeStr, 10)
      if (!timeStr || isNaN(mins) || mins <= 0) errs.time = 'Enter a valid time (minutes > 0)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleDraft() {
    if (!validate(false)) return
    if (!activeOrgId || !userId) return

    await offlineDb.draftSheets.add({
      localId: crypto.randomUUID(),
      organizationId: activeOrgId,
      technicianId: userId,
      jobTitle: jobTitle.trim(),
      workPerformed: workDone.trim() || undefined,
      timeSpentMinutes: parseInt(timeStr, 10) || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setDraftSaved(true)
    setTimeout(onClose, 1000)
  }

  async function handleSubmit() {
    if (!validate(true)) return
    if (!activeOrgId) return
    setSubmitError('')

    try {
      await submitMutation.mutateAsync({
        orgId: activeOrgId,
        jobTitle: jobTitle.trim(),
        workPerformed: workDone.trim(),
        timeSpentMinutes: parseInt(timeStr, 10),
        notes: notes.trim() || undefined,
      })
      onSubmitted?.()
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" role="dialog" aria-modal="true" aria-label="Add job sheet">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet — slides up from bottom */}
      <div className="relative mt-auto w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92dvh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-text-base leading-none">New Job Sheet</h2>
            <p className="text-[11.5px] text-text-muted mt-0.5">Standalone report not linked to a job order</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-slate-100 transition-colors"
          >
            <Icons.close size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Next sheet ID preview */}
          <SheetIdBadge orgId={activeOrgId} />

          {/* Job title */}
          <div>
            <label htmlFor={titleId} className={labelCls}>
              Job Title <span className="text-danger">*</span>
            </label>
            <input
              id={titleId}
              type="text"
              value={jobTitle}
              onChange={(e) => { setJobTitle(e.target.value); setErrors((p) => ({ ...p, jobTitle: '' })) }}
              placeholder="e.g. CCTV maintenance at Site A"
              className={`${inputCls} ${errors.jobTitle ? 'border-danger focus:border-danger focus:ring-danger/10' : ''}`}
            />
            {errors.jobTitle && <p className={errorCls}>{errors.jobTitle}</p>}
          </div>

          {/* Work performed */}
          <div>
            <label htmlFor={workId} className={labelCls}>
              Work Performed <span className="text-danger">*</span>
            </label>
            <textarea
              id={workId}
              rows={4}
              value={workDone}
              onChange={(e) => { setWorkDone(e.target.value); setErrors((p) => ({ ...p, workDone: '' })) }}
              placeholder="Describe the work carried out…"
              className={`${inputCls} resize-none leading-relaxed ${errors.workDone ? 'border-danger focus:border-danger focus:ring-danger/10' : ''}`}
            />
            {errors.workDone && <p className={errorCls}>{errors.workDone}</p>}
          </div>

          {/* Time spent */}
          <div>
            <label htmlFor={timeId} className={labelCls}>
              Time Spent (minutes) <span className="text-danger">*</span>
            </label>
            <input
              id={timeId}
              type="number"
              inputMode="numeric"
              min={1}
              value={timeStr}
              onChange={(e) => { setTimeStr(e.target.value); setErrors((p) => ({ ...p, time: '' })) }}
              placeholder="e.g. 90"
              className={`${inputCls} ${errors.time ? 'border-danger focus:border-danger focus:ring-danger/10' : ''}`}
            />
            {errors.time && <p className={errorCls}>{errors.time}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor={notesId} className={labelCls}>
              Notes <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id={notesId}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional remarks…"
              className={`${inputCls} resize-none leading-relaxed`}
            />
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-[13px] text-danger">{submitError}</p>
            </div>
          )}

          {draftSaved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <Icons.check size={14} color="#059669" />
              <p className="text-[13px] text-emerald-700 font-medium">Draft saved!</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={() => void handleDraft()}
            disabled={submitMutation.isPending || draftSaved}
            className="flex-1 h-12 rounded-2xl border border-slate-300 text-[14px] font-semibold text-text-base hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitMutation.isPending || draftSaved}
            className="flex-1 h-12 rounded-2xl bg-emerald-600 text-white text-[14px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {submitMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Icons.send size={14} />
            )}
            {submitMutation.isPending ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
