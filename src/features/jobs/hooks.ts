import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { JobOrder, JobStatus, JobPriority, Profile } from '../../types'

export interface JobFilters {
  status?: JobStatus | 'all'
  priority?: JobPriority
  search?: string
  dateFrom?: string
  dateTo?: string
}

interface DashboardStats {
  total: number
  active: number
  completed: number
  technicians: number
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [jobsRes, techsRes] = await Promise.all([
        supabase.from('job_orders').select('status'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'technician')
          .eq('is_active', true),
      ])

      if (jobsRes.error) throw jobsRes.error
      if (techsRes.error) throw techsRes.error

      const jobs = jobsRes.data
      return {
        total: jobs.length,
        active: jobs.filter((j) => j.status === 'in_progress').length,
        completed: jobs.filter((j) => j.status === 'completed').length,
        technicians: techsRes.count ?? 0,
      }
    },
  })
}

type TechAssignment = {
  technician_id: string
  profiles: { full_name: string; avatar_url: string | null } | null
}

export type RecentJobRow = JobOrder & { job_assignments: TechAssignment[] }

export function useRecentJobs() {
  return useQuery<RecentJobRow[]>({
    queryKey: ['recent-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(
          '*, job_assignments(technician_id, profiles:technician_id(full_name, avatar_url))'
        )
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return (data ?? []) as RecentJobRow[]
    },
  })
}

export function useJobs(filters?: JobFilters) {
  return useQuery<RecentJobRow[]>({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      let query = supabase
        .from('job_orders')
        .select(
          '*, job_assignments(technician_id, profiles:technician_id(full_name, avatar_url))'
        )
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

export function useTechnicians() {
  return useQuery<Profile[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'technician')
        .eq('is_active', true)
        .order('full_name')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useJob(id: string) {
  return useQuery<RecentJobRow | null>({
    queryKey: ['job', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(
          '*, job_assignments(technician_id, profiles:technician_id(full_name, avatar_url))'
        )
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data as RecentJobRow | null
    },
  })
}

export function useMyJobs() {
  return useQuery<RecentJobRow[]>({
    queryKey: ['my-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_orders')
        .select(
          '*, job_assignments(technician_id, profiles:technician_id(full_name, avatar_url))'
        )
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
      void qc.invalidateQueries({ queryKey: ['recent-jobs'] })
      void qc.invalidateQueries({ queryKey: ['jobs'] })
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

export function useRealtimeTechnicianJobs() {
  const qc = useQueryClient()
  const userId = useAuthStore((s) => s.profile?.id)

  useEffect(() => {
    if (!userId) return

    function invalidate() {
      void qc.invalidateQueries({ queryKey: ['my-jobs'] })
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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'job_orders' },
        invalidate
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc, userId])
}
