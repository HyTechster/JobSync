import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { formatDuration } from '../../utils/formatters'
import type { JobSheetWithDetail } from './hooks'

interface JobSheetsTableProps {
  sheets: JobSheetWithDetail[]
  isLoading: boolean
  onView: (sheet: JobSheetWithDetail) => void
}

function formatSubmitted(iso: string): string {
  return new Date(iso).toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-100 animate-pulse">
      <td className="px-4 py-3"><div className="h-3.5 w-40 bg-slate-100 rounded" /></td>
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

const HEADERS = ['Job', 'Technician', 'Submitted', 'Duration', 'Photos', '']

export function JobSheetsTable({ sheets, isLoading, onView }: JobSheetsTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-2 border-b border-slate-200">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-[11.5px] font-semibold text-text-muted uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : sheets.map((sheet) => (
                <tr
                  key={sheet.id}
                  className="border-t border-slate-100 hover:bg-surface-2 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <p className="text-[13.5px] font-medium text-text-base line-clamp-1">
                      {sheet.job_orders?.title ?? 'Unknown Job'}
                    </p>
                    <p className="text-[11.5px] text-text-muted mt-0.5">
                      {sheet.job_orders?.customer_name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={sheet.profiles?.full_name ?? '?'}
                        size={28}
                        src={sheet.profiles?.avatar_url}
                      />
                      <span className="text-[13px] text-text-base">
                        {sheet.profiles?.full_name ?? 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-text-muted whitespace-nowrap">
                    {formatSubmitted(sheet.submitted_at)}
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
                      <span className="text-text-subtle">—</span>
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
              ))}
        </tbody>
      </table>
    </div>
  )
}
