import { useState, useMemo } from 'react'
import { useJobSheets } from '../../features/job-sheets/hooks'
import { useTechnicians } from '../../features/jobs/hooks'
import { JobSheetsTable } from '../../features/job-sheets/JobSheetsTable'
import { JobSheetDetailModal } from '../../features/job-sheets/JobSheetDetailModal'
import { Icons } from '../../components/ui/Icons'
import type { JobSheetWithDetail } from '../../features/job-sheets/hooks'

const inputCls =
  'h-[38px] px-3 border border-slate-200 rounded-lg text-[13px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

export default function AdminJobSheets() {
  const { data: sheets = [], isLoading, isError } = useJobSheets()
  const { data: technicians = [] } = useTechnicians()

  const [search, setSearch] = useState('')
  const [technicianId, setTechnicianId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [viewSheet, setViewSheet] = useState<JobSheetWithDetail | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return sheets.filter((s) => {
      if (technicianId && s.technician_id !== technicianId) return false
      if (dateFrom && s.submitted_at < dateFrom) return false
      if (dateTo && s.submitted_at > dateTo + 'T23:59:59') return false
      if (q) {
        const inJob = s.job_orders?.title.toLowerCase().includes(q)
        const inCustomer = s.job_orders?.customer_name.toLowerCase().includes(q)
        const inTech = s.profiles?.full_name.toLowerCase().includes(q)
        if (!inJob && !inCustomer && !inTech) return false
      }
      return true
    })
  }, [sheets, search, technicianId, dateFrom, dateTo])

  const hasFilters = search || technicianId || dateFrom || dateTo

  function clearFilters() {
    setSearch('')
    setTechnicianId('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-text-base">Job Sheets</h1>
          <p className="text-[13px] text-text-muted mt-0.5">
            Review all submitted job reports from your technicians
          </p>
        </div>
        <span className="text-[13px] text-text-muted">
          {isLoading ? '—' : `${filtered.length} of ${sheets.length} sheet${sheets.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-[320px]">
          <Icons.search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job, customer, technician…"
            className={`${inputCls} pl-9 w-full`}
          />
        </div>

        <select
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
          className={`${inputCls} pr-8`}
        >
          <option value="">All technicians</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>{t.full_name}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={inputCls}
            title="From date"
          />
          <span className="text-text-muted text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={inputCls}
            title="To date"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-[38px] px-3 rounded-lg border border-slate-200 text-[12.5px] font-semibold text-text-muted hover:bg-surface-2 transition-colors inline-flex items-center gap-1.5"
          >
            <Icons.close size={13} />
            Clear
          </button>
        )}
      </div>

      {isError && (
        <div className="bg-[#FFF1F2] border border-[#FFD6DB] rounded-xl px-4 py-3 mb-4">
          <p className="text-[13px] text-danger">Failed to load job sheets. Please refresh the page.</p>
        </div>
      )}

      {!isLoading && filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
              <Icons.sheets size={26} color="var(--color-text-muted)" />
            </div>
            <h2 className="text-[15px] font-semibold text-text-base mb-1">
              {hasFilters ? 'No sheets match your filters' : 'No job sheets yet'}
            </h2>
            <p className="text-[13px] text-text-muted max-w-xs">
              {hasFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Job sheets appear here once technicians submit their reports.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 h-[36px] px-4 rounded-lg border border-slate-300 text-[12.5px] font-semibold text-text-base hover:bg-surface-2 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <JobSheetsTable
          sheets={filtered}
          isLoading={isLoading}
          onView={(sheet) => setViewSheet(sheet)}
        />
      )}

      <JobSheetDetailModal sheet={viewSheet} onClose={() => setViewSheet(null)} />
    </div>
  )
}
