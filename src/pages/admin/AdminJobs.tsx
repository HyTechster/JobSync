import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminTopbar } from '../../components/layout/AdminTopbar'
import { Icons } from '../../components/ui/Icons'
import { JobsTable } from '../../features/jobs/JobsTable'
import { CreateJobModal } from '../../features/jobs/CreateJobModal'
import { EditJobModal } from '../../features/jobs/EditJobModal'
import { DeleteJobDialog } from '../../features/jobs/DeleteJobDialog'
import { useJobs, type RecentJobRow } from '../../features/jobs/hooks'
import type { JobStatus } from '../../types'

type StatusFilter = JobStatus | 'all'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
]

export default function AdminJobs() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editJob, setEditJob] = useState<RecentJobRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RecentJobRow | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreate(true)
      setSearchParams({}, { replace: true })
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const { data: allJobs = [], isLoading, isError, error } = useJobs()

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
          j.customer_name.toLowerCase().includes(q)
      )
    }
    return result
  }, [allJobs, statusFilter, search])

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
        <div className="flex flex-col gap-2 mt-3 md:mt-4 md:flex-row md:flex-wrap md:items-center">
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

          <div className="md:ml-auto">
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
                className="h-[34px] w-full md:w-[220px] pl-8 pr-3 border border-slate-200 rounded-lg text-[13px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
              />
            </div>
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
