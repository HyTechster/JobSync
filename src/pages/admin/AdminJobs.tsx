import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminTopbar } from '../../components/layout/AdminTopbar'
import { Icons } from '../../components/ui/Icons'
import { JobsTable } from '../../features/jobs/JobsTable'
import { CreateJobModal } from '../../features/jobs/CreateJobModal'
import { EditJobModal } from '../../features/jobs/EditJobModal'
import { DeleteJobDialog } from '../../features/jobs/DeleteJobDialog'
import { useJobs, useOrgTechnicians, type RecentJobRow } from '../../features/jobs/hooks'
import { useOrganization } from '../../context/OrganizationContext'
import type { JobStatus } from '../../types'

type StatusFilter = JobStatus | 'all'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
]

const inputCls =
  'h-[34px] px-3 border border-slate-200 rounded-lg text-[13px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

export default function AdminJobs() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search,       setSearch]       = useState('')
  const [techFilter,   setTechFilter]   = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [showCreate,   setShowCreate]   = useState(() => searchParams.get('create') === '1')
  const [editJob,      setEditJob]      = useState<RecentJobRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RecentJobRow | null>(null)

  // Clean the ?create=1 param from the URL after it has been consumed above
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const { activeOrgId } = useOrganization()
  const { data: allJobs = [], isLoading, isError, error } = useJobs(activeOrgId)
  const { data: orgTechs = [] } = useOrgTechnicians(activeOrgId)

  const filteredJobs = useMemo(() => {
    let result = allJobs

    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.customer_name.toLowerCase().includes(q),
      )
    }

    if (techFilter) {
      result = result.filter((j) =>
        j.job_assignments.some((a) => a.technician_id === techFilter),
      )
    }

    if (dateFrom) {
      result = result.filter((j) => !!j.scheduled_date && j.scheduled_date >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((j) => !!j.scheduled_date && j.scheduled_date <= dateTo)
    }

    return result
  }, [allJobs, statusFilter, search, techFilter, dateFrom, dateTo])

  const hasExtraFilters = techFilter !== '' || dateFrom !== '' || dateTo !== ''

  function clearExtraFilters() {
    setTechFilter('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <>
      <AdminTopbar
        title="Jobs"
        subtitle="All job orders across customers and technicians"
        right={
          <button
            onClick={() => setShowCreate(true)}
            className="h-[34px] md:h-[38px] px-3 md:px-4 rounded-lg bg-brand-700 text-white text-[13px] md:text-[14px] font-semibold hover:bg-brand-800 transition-colors inline-flex items-center gap-1.5 md:gap-2"
          >
            <Icons.plus size={14} color="white" />
            <span className="hidden sm:inline">New job</span>
            <span className="sm:hidden">New</span>
          </button>
        }
      >
        {/* Status tabs */}
        <div className="flex flex-col gap-2 mt-3 md:mt-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map(({ value, label }) => {
              const count =
                value === 'all'
                  ? allJobs.length
                  : allJobs.filter((j) => j.status === value).length
              const active = statusFilter === value
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-[6px] rounded-lg border text-[12.5px] md:text-[13px] font-semibold transition-colors ${
                    active
                      ? 'border-brand-700 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-text-base hover:bg-surface-2'
                  }`}
                >
                  {label}
                  <span className={`text-[11px] font-semibold ${active ? 'text-brand-700' : 'text-text-muted'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search + technician + date range row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Text search */}
            <div className="relative">
              <Icons.search
                size={14}
                color="#64748B"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs…"
                className={`${inputCls} w-full md:w-[200px] pl-8 pr-3`}
              />
            </div>

            {/* Technician filter */}
            <div className="relative">
              <Icons.users
                size={13}
                color="#64748B"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                aria-label="Filter by technician"
                className={`${inputCls} pl-8 pr-7 appearance-none`}
              >
                <option value="">All technicians</option>
                {orgTechs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.display_name ?? t.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Scheduled from"
              title="Scheduled from"
              className={inputCls}
            />
            <span className="text-[12px] text-text-muted select-none">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="Scheduled to"
              title="Scheduled to"
              className={inputCls}
            />

            {/* Clear extra filters */}
            {hasExtraFilters && (
              <button
                onClick={clearExtraFilters}
                className="h-[34px] px-3 rounded-lg border border-slate-200 text-[12.5px] font-semibold text-text-muted hover:bg-surface-2 transition-colors inline-flex items-center gap-1.5"
              >
                <Icons.close size={13} />
                Clear
              </button>
            )}
          </div>
        </div>
      </AdminTopbar>

      <div className="p-4 pb-4 md:p-8 md:pb-12">
        {isError ? (
          <div className="text-sm text-danger bg-[#FFE4E6] rounded-lg px-4 py-3">
            Failed to load jobs: {(error as Error).message}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <JobsTable
              jobs={filteredJobs}
              isLoading={isLoading}
              onEdit={setEditJob}
              onDelete={setDeleteTarget}
            />
          </div>
        )}
      </div>

      <CreateJobModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <EditJobModal job={editJob} onClose={() => setEditJob(null)} />
      <DeleteJobDialog
        jobId={deleteTarget?.id ?? null}
        jobTitle={deleteTarget?.title ?? ''}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}
