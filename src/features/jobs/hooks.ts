import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
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

export function useRealtimeDashboard() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_orders' },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
          void queryClient.invalidateQueries({ queryKey: ['recent-jobs'] })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])
}
