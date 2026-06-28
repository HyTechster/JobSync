import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

type AlertRecipient = {
  recipient_id: string
  read_at: string | null
  profiles: { full_name: string; display_name: string | null; avatar_url: string | null } | null
}

export type AlertJob = {
  job_order_id: string
  job_orders: { id: string; title: string; customer_name: string } | null
}

export type AlertWithDetail = {
  id: string
  title: string
  message: string
  created_by: string
  created_at: string
  profiles: { full_name: string; display_name: string | null; avatar_url: string | null } | null
  alert_recipients: AlertRecipient[]
  alert_jobs: AlertJob[]
}

export type MyAlertRow = {
  id: string
  alert_id: string
  read_at: string | null
  created_at: string
  alerts: {
    title: string
    message: string
    created_at: string
    profiles: { full_name: string; display_name: string | null } | null
    alert_jobs: AlertJob[]
  } | null
}

/** Technician — own alerts for the active org */
export function useMyAlerts(orgId: string | null) {
  const userId = useAuthStore((s) => s.session?.user.id)
  return useQuery<MyAlertRow[]>({
    queryKey: ['my-alerts', orgId],
    enabled: !!userId && !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_recipients')
        .select(
          '*, alerts:alert_id!inner(title, message, created_at, profiles:created_by(full_name, display_name), alert_jobs(job_order_id, job_orders:job_order_id(id, title, customer_name)))'
        )
        .eq('recipient_id', userId!)
        .eq('alerts.organization_id', orgId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as MyAlertRow[]
    },
  })
}

/** Technician — unread alert count for the active org */
export function useUnreadAlertCount(orgId: string | null) {
  const userId = useAuthStore((s) => s.session?.user.id)
  return useQuery<number>({
    queryKey: ['unread-alert-counts', orgId],
    enabled: !!userId && !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_recipients')
        .select(
          'id, alerts:alert_id!inner(organization_id)'
        )
        .eq('recipient_id', userId!)
        .is('read_at', null)
        .eq('alerts.organization_id', orgId!)
      if (error) throw error
      return (data ?? []).length
    },
  })
}

/** Admin — all alerts for the active org */
export function useAlerts(orgId: string | null) {
  return useQuery<AlertWithDetail[]>({
    queryKey: ['alerts', orgId],
    enabled: !!orgId,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select(
          '*, profiles:created_by(full_name, display_name, avatar_url), alert_recipients(recipient_id, read_at, profiles:recipient_id(full_name, display_name, avatar_url)), alert_jobs(job_order_id, job_orders:job_order_id(id, title, customer_name))'
        )
        .eq('organization_id' as never, orgId!)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as AlertWithDetail[]
    },
  })
}
