import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { formatDuration } from '../../utils/formatters'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import type { JobSheetWithDetail } from './hooks'

interface JobSheetsTableProps {
  sheets: JobSheetWithDetail[]
  isLoading: boolean
  onView: (sheet: JobSheetWithDetail) => void
}

// ─── Mobile card skeleton ───────────────────────────────────────────────────

function MobileSkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3 w-12 bg-slate-100 rounded mb-1.5" />
          <div className="h-4 w-40 bg-slate-100 rounded mb-1" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function MobileCard({ sheet, onView }: { sheet: JobSheetWithDetail; onView: () => void }) {
  const { fmtDate } = useDateFormatter()
  const title      = sheet.job_title ?? sheet.job_orders?.title ?? 'Untitled Sheet'
  const subtitle   = sheet.job_orders?.customer_name ?? null
  const isStandalone = !sheet.job_order_id

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5">
      <div className="flex items-start gap-3">
        <Avatar name={sheet.profiles?.full_name ?? '?'} size={36} src={sheet.profiles?.avatar_url} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap">
            {sheet.sheet_number != null && (
              <span className="text-[10.5px] font-bold text-brand-700">#{sheet.sheet_number} · </span>
            )}
            <span className="text-[10.5px] text-text-muted">
              {sheet.profiles ? (sheet.profiles.display_name ?? sheet.profiles.full_name) : 'Unknown'}
            </span>
            {sheet.profiles?.display_name && (
              <span className="text-[10px] text-text-subtle">({sheet.profiles.full_name})</span>
            )}
          </div>
          <p className="text-[13.5px] font-semibold text-text-base truncate mt-0.5">{title}</p>
          {subtitle ? (
            <p className="text-[12px] text-text-muted">{subtitle}</p>
          ) : isStandalone ? (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
              STANDALONE
            </span>
          ) : null}
        </div>
        <button
          onClick={onView}
          className="h-[30px] px-3 rounded-lg border border-slate-200 text-[12px] font-semibold text-text-muted hover:border-brand-700 hover:text-brand-700 transition-colors flex-shrink-0"
        >
          View
        </button>
      </div>
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[11.5px] text-text-muted">
          <Icons.clock size={12} />
          {formatDuration(sheet.time_spent_minutes)}
        </span>
        <span className="inline-flex items-center gap-1 text-[11.5px] text-text-muted">
          <Icons.calendar size={12} />
          {fmtDate(sheet.submitted_at)}
        </span>
        {sheet.attachments.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11.5px] text-text-muted">
            <Icons.camera size={12} />
            {sheet.attachments.length}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Desktop table skeleton row ───────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-100 animate-pulse">
      <td className="px-4 py-3"><div className="h-3.5 w-12 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3">
        <div className="h-3.5 w-40 bg-slate-100 rounded mb-1.5" />
        <div className="h-3 w-24 bg-slate-100 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 flex-shrink-0" />
          <div className="h-3.5 w-28 bg-slate-100 rounded" />
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-3.5 w-32 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-16 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-10 bg-slate-100 rounded" /></td>
      <td className="px-4 py-3" />
    </tr>
  )
}

const HEADERS = ['Sheet #', 'Job / Title', 'Technician', 'Submitted', 'Duration', 'Photos', '']

// ─── Main export ──────────────────────────────────────────────────────────────

export function JobSheetsTable({ sheets, isLoading, onView }: JobSheetsTableProps) {
  const { fmtDateTime } = useDateFormatter()
  return (
    <>
      {/* Mobile card list (hidden on md+) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <MobileSkeletonCard key={i} />)
          : sheets.map((sheet) => (
              <MobileCard key={sheet.id} sheet={sheet} onView={() => onView(sheet)} />
            ))}
      </div>

      {/* Desktop table (hidden below md) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* overflow-x-auto prevents the table from blowing out the viewport width */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-2 border-b border-slate-200">
                {HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11.5px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : sheets.map((sheet) => {
                    const title      = sheet.job_title ?? sheet.job_orders?.title ?? 'Untitled Sheet'
                    const subtitle   = sheet.job_orders?.customer_name ?? null
                    const isStandalone = !sheet.job_order_id

                    return (
                      <tr
                        key={sheet.id}
                        className="border-t border-slate-100 hover:bg-surface-2 transition-colors group"
                      >
                        <td className="px-4 py-3">
                          {sheet.sheet_number != null ? (
                            <span className="text-[13px] font-bold text-brand-700">
                              #{sheet.sheet_number}
                            </span>
                          ) : (
                            <span className="text-[12px] text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13.5px] font-medium text-text-base line-clamp-1">{title}</p>
                          {subtitle ? (
                            <p className="text-[11.5px] text-text-muted mt-0.5">{subtitle}</p>
                          ) : isStandalone ? (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
                              STANDALONE
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={sheet.profiles?.full_name ?? '?'}
                              size={28}
                              src={sheet.profiles?.avatar_url}
                            />
                            <div>
                              <div className="text-[13px] text-text-base">
                                {sheet.profiles ? (sheet.profiles.display_name ?? sheet.profiles.full_name) : 'Unknown'}
                              </div>
                              {sheet.profiles?.display_name && (
                                <div className="text-[11px] text-text-muted">{sheet.profiles.full_name}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-text-muted whitespace-nowrap">
                          {fmtDateTime(sheet.submitted_at)}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-text-muted whitespace-nowrap">
                          {formatDuration(sheet.time_spent_minutes)}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-text-muted">
                          {sheet.attachments.length > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <Icons.camera size={13} />
                              {sheet.attachments.length}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onView(sheet)}
                            className="h-[30px] px-3 rounded-lg border border-slate-200 text-[12px] font-semibold text-text-muted opacity-0 group-hover:opacity-100 hover:border-brand-700 hover:text-brand-700 transition-all"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
