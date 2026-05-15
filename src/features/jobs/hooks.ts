import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { JobOrder } from '../../types'

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
