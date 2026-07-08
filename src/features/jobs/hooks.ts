import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { JobOrder, JobStatus, JobPriority } from '../../types'

export interface JobFilters {
  status?: JobStatus | 'all'
  priority?: JobPriority
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface AdminDashboardStats {
  total: number
  pending: number
  active: number
  completed: number
  cancelled: number
  technicians: number
  totalSheets: number
  pendingSheets: number
  totalAlerts: number
  unseenAlerts: number
}

export function useDashboardStats(orgId: string | null) {
  return useQuery<AdminDashboardStats>({
    queryKey: ['dashboard-stats', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [jobsRes, techsRes, sheetsRes, alertsRes, unseenRes] = await Promise.all([
        supabase.from('job_orders').select('status, job_sheets(id)').eq('organization_id' as never, orgId!),
        supabase.from('organization_members' as never)
          .select('id', { count: 'exact', head: true })
          .eq('organization_id' as never, orgId!)
          .eq('role' as never, 'technician'),
        supabase.from('job_sheets').select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId!),
        supabase.from('alerts').select('id', { count: 'exact', head: true })
          .eq('organization_id' as never, orgId!),
        supabase.from('alert_recipients')
          .select('id, alerts:alert_id!inner(organization_id)')
          .is('read_at', null)
          .eq('alerts.organization_id' as never, orgId!),
      ])

      if (jobsRes.error) throw jobsRes.error

      const jobs = (jobsRes.data ?? []) as { status: JobStatus; job_sheets: { id: string }[] }[]
      return {
        total: jobs.length,
        pending: jobs.filter((j) => j.status === 'pending').length,
        active: jobs.filter((j) => j.status === 'in_progress').length,
        completed: jobs.filter((j) => j.status === 'completed').length,
        cancelled: jobs.filter((j) => j.status === 'cancelled').length,
        technicians: techsRes.count ?? 0,
        totalSheets: sheetsRes.count ?? 0,
        pendingSheets: jobs.filter((j) => j.status === 'completed' && j.job_sheets.length === 0).length,
        totalAlerts: alertsRes.count ?? 0,
        unseenAlerts: (unseenRes.data ?? []).length,
      }
    },
  })
}

export interface JobAnalyticsData {
  byStatus: { pending: number; in_progress: number; completed: number; cancelled: number }
  byPriority: { low: number; medium: number; high: number; urgent: number }
  daily: { date: string; count: number; label: string }[]
  avgTurnaroundHours: number | null
  completionRate: number
}

export function useJobAnalytics(orgId: string | null) {
  return useQuery<JobAnalyticsData>({
    queryKey: ['job-analytics', orgId],
    enabled: !!orgId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const [jobsRes, recentRes, sheetsRes] = await Promise.all([
        supabase.from('job_orders').select('status, priority').eq('organization_id' as never, orgId!),
        supabase.from('job_orders').select('created_at').eq('organization_id' as never, orgId!)
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('job_sheets').select('submitted_at, job_orders:job_order_id(created_at)')
          .eq('organization_id', orgId!),
      ])

      const jobs = jobsRes.data ?? []
      const byStatus = {
        pending:     jobs.filter((j) => j.status === 'pending').length,
        in_progress: jobs.filter((j) => j.status === 'in_progress').length,
        completed:   jobs.filter((j) => j.status === 'completed').length,
        cancelled:   jobs.filter((j) => j.status === 'cancelled').length,
      }
      const byPriority = {
        low:    jobs.filter((j) => j.priority === 'low').length,
        medium: jobs.filter((j) => j.priority === 'medium').length,
        high:   jobs.filter((j) => j.priority === 'high').length,
        urgent: jobs.filter((j) => j.priority === 'urgent').length,
      }

      const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dateMap = new Map<string, number>()
      const daily: JobAnalyticsData['daily'] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        dateMap.set(key, 0)
        daily.push({ date: key, count: 0, label: i === 0 ? 'Today' : DAYS[d.getDay()] })
      }
      for (const job of recentRes.data ?? []) {
        const key = (job.created_at as string).slice(0, 10)
        if (dateMap.has(key)) dateMap.set(key, (dateMap.get(key) ?? 0) + 1)
      }
      daily.forEach((d) => { d.count = dateMap.get(d.date) ?? 0 })

      type SheetRow = { submitted_at: string; job_orders: { created_at: string } | null }
      let totalMs = 0, sheetCount = 0
      for (const sheet of (sheetsRes.data ?? []) as unknown as SheetRow[]) {
        if (sheet.job_orders?.created_at) {
          const ms = new Date(sheet.submitted_at).getTime() - new Date(sheet.job_orders.created_at).getTime()
          if (ms > 0) { totalMs += ms; sheetCount++ }
        }
      }

      const total = byStatus.pending + byStatus.in_progress + byStatus.completed + byStatus.cancelled
      return {
        byStatus,
        byPriority,
        daily,
        avgTurnaroundHours: sheetCount > 0 ? totalMs / sheetCount / 3_600_000 : null,
        completionRate: total > 0 ? Math.round((byStatus.completed / total) * 100) : 0,
      }
    },
  })
}

type TechAssignment = {
  technician_id: string
  profiles: { full_name: string; display_name: string | null; avatar_url: string | null } | null
}

export type RecentJobRow = JobOrder & {
  job_assignments: TechAssignment[]
  job_sheets?: { id: string; sheet_number: number | null }[]
}

export function useRecentJobs(orgId: string | null) {
  return useQuery<RecentJobRow[]>({
    queryKey: ['recent-jobs', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(
          '*, job_assignments(technician_id, profiles:technician_id(full_name, display_name, avatar_url)), job_sheets(id, sheet_number)'
        )
        .eq('organization_id' as never, orgId!)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return (data ?? []) as RecentJobRow[]
    },
  })
}

/** Completed jobs that don't have a job sheet submitted yet — lets admins spot
 *  technicians who marked a job complete but never filed the paperwork. */
export function useJobsMissingSheet(orgId: string | null) {
  return useQuery<RecentJobRow[]>({
    queryKey: ['jobs-missing-sheet', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(
          '*, job_assignments(technician_id, profiles:technician_id(full_name, display_name, avatar_url)), job_sheets(id, sheet_number)'
        )
        .eq('organization_id' as never, orgId!)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })

      if (error) throw error
      const jobs = (data ?? []) as RecentJobRow[]
      return jobs.filter((j) => (j.job_sheets?.length ?? 0) === 0)
    },
  })
}

export function useJobs(orgId: string | null, filters?: JobFilters) {
  return useQuery<RecentJobRow[]>({
    queryKey: ['jobs', orgId, filters],
    enabled: !!orgId,
    queryFn: async () => {
      let query = supabase
        .from('job_orders')
        .select(
          '*, job_assignments(technician_id, profiles:technician_id(full_name, display_name, avatar_url)), job_sheets(id, sheet_number)'
        )
        .eq('organization_id' as never, orgId!)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.dateFrom) query = query.gte('scheduled_date', filters.dateFrom)
      if (filters?.dateTo) query = query.lte('scheduled_date', filters.dateTo)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as RecentJobRow[]
    },
  })
}

const JOB_DETAIL_SELECT =
  '*, job_assignments(technician_id, profiles:technician_id(full_name, display_name, avatar_url)), job_sheets(id, sheet_number)'

export function useJob(id: string) {
  return useQuery<RecentJobRow | null>({
    queryKey: ['job', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(JOB_DETAIL_SELECT)
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data as RecentJobRow | null
    },
  })
}

// !inner ensures only jobs where this technician has an assignment row are returned.
// After the RLS update (045_open_jobs_feature.sql), the technician can also see
// unassigned open jobs, so the inner join scopes this hook to "my assigned jobs" only.
const MY_JOBS_SELECT =
  '*, job_assignments!inner(technician_id, profiles:technician_id(full_name, display_name, avatar_url)), job_sheets(id, sheet_number)'

export function useMyJobs(orgId: string | null) {
  return useQuery<RecentJobRow[]>({
    queryKey: ['my-jobs', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(MY_JOBS_SELECT)
        .eq('organization_id' as never, orgId!)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as RecentJobRow[]
    },
  })
}

export function useOpenJobs(orgId: string | null) {
  return useQuery<RecentJobRow[]>({
    queryKey: ['open-jobs', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(JOB_DETAIL_SELECT)
        .eq('organization_id' as never, orgId!)
        .eq('status', 'pending')
        .order('scheduled_date', { ascending: true })
      if (error) throw error
      const jobs = (data ?? []) as RecentJobRow[]
      // With the updated RLS, job_assignments only contains the current user's rows.
      // An empty array means no one is assigned → truly an open job.
      return jobs.filter((j) => j.job_assignments.length === 0)
    },
  })
}

export function useMyCompletedJobs(orgId: string | null) {
  return useQuery<RecentJobRow[]>({
    queryKey: ['my-completed-jobs', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(
          '*, job_assignments(technician_id, profiles:technician_id(full_name, display_name, avatar_url)), job_sheets(id, sheet_number)'
        )
        .eq('organization_id' as never, orgId!)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as RecentJobRow[]
    },
  })
}

export function useRealtimeDashboard(): { isLive: boolean } {
  const qc = useQueryClient()
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null

    function invalidate() {
      void qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      void qc.invalidateQueries({ queryKey: ['job-analytics'] })
      void qc.invalidateQueries({ queryKey: ['recent-jobs'] })
      void qc.invalidateQueries({ queryKey: ['jobs-missing-sheet'] })
      void qc.invalidateQueries({ queryKey: ['jobs'] })
      void qc.invalidateQueries({ queryKey: ['my-jobs'] })
    }

    function startPolling() {
      if (pollTimer) return
      pollTimer = setInterval(invalidate, 30_000)
    }

    function stopPolling() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
    }

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_orders' }, invalidate)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true)
          stopPolling()
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsLive(false)
          startPolling()
        }
      })

    return () => {
      stopPolling()
      void supabase.removeChannel(channel)
    }
  }, [qc])

  return { isLive }
}

export interface OrgTechnician {
  id: string
  full_name: string
  display_name: string | null
  email: string
  avatar_url: string | null
}

export function useOrgTechnicians(orgId: string | null) {
  return useQuery<OrgTechnician[]>({
    queryKey: ['org-technicians', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members' as never)
        .select('profiles:user_id(id, full_name, display_name, email, avatar_url, is_active)' as never)
        .eq('organization_id' as never, orgId!)
        .eq('role' as never, 'technician')
      if (error) throw error
      type Row = {
        profiles: {
          id: string; full_name: string; display_name: string | null
          email: string; avatar_url: string | null; is_active: boolean
        } | null
      }
      return ((data ?? []) as unknown as Row[])
        .filter((m) => m.profiles?.is_active)
        .map((m) => ({
          id:           m.profiles!.id,
          full_name:    m.profiles!.full_name,
          display_name: m.profiles!.display_name,
          email:        m.profiles!.email,
          avatar_url:   m.profiles!.avatar_url,
        }))
    },
  })
}

export function useRealtimeTechnicianJobs() {
  const qc = useQueryClient()
  const userId = useAuthStore((s) => s.profile?.id)

  useEffect(() => {
    if (!userId) return

    function invalidate() {
      void qc.invalidateQueries({ queryKey: ['my-jobs'] })
      void qc.invalidateQueries({ queryKey: ['open-jobs'] })
    }

    const channel = supabase
      .channel('technician-jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_assignments',
          filter: `technician_id=eq.${userId}`,
        },
        invalidate
      )
      // Watch all job_orders changes — needed so an open job disappearing
      // (when claimed by any tech) is reflected immediately.
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_orders' },
        invalidate
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc, userId])
}
