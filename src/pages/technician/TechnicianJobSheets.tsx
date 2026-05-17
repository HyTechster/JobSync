import { useState, useEffect } from 'react'
import { useMyJobSheets } from '../../features/job-sheets/hooks'
import { useOrganization } from '../../context/OrganizationContext'
import { offlineDb, type DraftJobSheet } from '../../offline/db'
import { AddJobSheetModal } from '../../features/job-sheets/AddJobSheetModal'
import { formatDuration } from '../../utils/formatters'
import { Icons } from '../../components/ui/Icons'
import type { JobSheetWithDetail } from '../../features/job-sheets/hooks'

function DraftCard({ draft, onDelete }: { draft: DraftJobSheet; onDelete: () => void }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
              DRAFT
            </span>
          </div>
          <p className="text-[13.5px] font-semibold text-text-base truncate mt-1">{draft.jobTitle}</p>
          {draft.workPerformed && (
            <p className="text-[12px] text-text-muted mt-0.5 line-clamp-1">{draft.workPerformed}</p>
          )}
          <p className="text-[11.5px] text-text-muted mt-1">{draft.createdAt.slice(0, 10)}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete draft"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <Icons.trash size={14} />
        </button>
      </div>
    </div>
  )
}

function SheetCard({ sheet }: { sheet: JobSheetWithDetail }) {
  const title = sheet.job_title ?? sheet.job_orders?.title ?? 'Untitled Sheet'
  const sub   = sheet.job_orders?.customer_name ?? 'Standalone report'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          {sheet.sheet_number != null && (
            <span className="text-[10.5px] font-bold text-emerald-700 mb-1 inline-block">
              #{sheet.sheet_number}
            </span>
          )}
          <p className="text-[13.5px] font-semibold text-text-base truncate">{title}</p>
          <p className="text-[12px] text-text-muted mt-0.5">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.clock size={12} />
          {formatDuration(sheet.time_spent_minutes)}
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
          <Icons.calendar size={12} />
          {sheet.submitted_at.slice(0, 10)}
        </span>
        {sheet.attachments.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[12px] text-text-muted">
            <Icons.camera size={12} />
            {sheet.attachments.length}
          </span>
        )}
        {!sheet.job_order_id && (
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
            STANDALONE
          </span>
        )}
      </div>
    </div>
  )
}

export default function TechnicianJobSheets() {
  const { activeOrgId } = useOrganization()
  const { data: sheets = [], isLoading, isError } = useMyJobSheets(activeOrgId)
  const [drafts, setDrafts]     = useState<DraftJobSheet[]>([])
  const [showModal, setShowModal] = useState(false)

  async function loadDrafts() {
    if (!activeOrgId) return
    const rows = await offlineDb.draftSheets
      .where('organizationId')
      .equals(activeOrgId)
      .reverse()
      .sortBy('createdAt')
    setDrafts(rows.reverse())
  }

  useEffect(() => { void loadDrafts() }, [activeOrgId])

  async function deleteDraft(id: number) {
    await offlineDb.draftSheets.delete(id)
    await loadDrafts()
  }

  return (
    <div className="px-4 pt-6 pb-2 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-bold text-text-base">Job Sheets</h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
        >
          <Icons.plus size={14} color="white" />
          New Sheet
        </button>
      </div>

      {/* Drafts section */}
      {drafts.length > 0 && (
        <section className="mb-5">
          <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
            Drafts · {drafts.length}
          </p>
          <div className="flex flex-col gap-2.5">
            {drafts.map((d) => (
              <DraftCard
                key={d.id}
                draft={d}
                onDelete={() => void deleteDraft(d.id!)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Submitted sheets */}
      <section>
        <p className="text-[11.5px] font-semibold text-text-muted uppercase tracking-wide mb-2 px-0.5">
          Submitted · {isLoading ? '…' : sheets.length}
        </p>

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
            <p className="text-[13px] text-danger">Failed to load sheets. Please refresh.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 animate-pulse">
                <div className="h-3 w-16 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-44 bg-slate-100 rounded mb-1.5" />
                <div className="h-3 w-28 bg-slate-100 rounded mb-3" />
                <div className="flex gap-3">
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sheets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-10 text-center">
            <Icons.sheets size={28} color="#94A3B8" className="mx-auto mb-3" />
            <p className="text-[13.5px] font-medium text-text-base mb-1">No sheets submitted yet</p>
            <p className="text-[12.5px] text-text-muted mb-4">
              Tap "New Sheet" to create your first job sheet.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700 transition-colors"
            >
              New Sheet
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sheets.map((s) => <SheetCard key={s.id} sheet={s} />)}
          </div>
        )}
      </section>

      {showModal && (
        <AddJobSheetModal
          onClose={() => setShowModal(false)}
          onSubmitted={() => void loadDrafts()}
        />
      )}
    </div>
  )
}
