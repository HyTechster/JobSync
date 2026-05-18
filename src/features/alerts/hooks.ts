import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

type AlertRecipient = {
  recipient_id: string
  read_at: string | null
  profiles: { full_name: string; display_name: string | null; avatar_url: string | null } | null
}

export type AlertWithDetail = {
  id: string
  title: string
  message: string
  created_by: string
  created_at: string
  profiles: { full_name: string; display_name: string | null; avatar_url: string | null } | null
  alert_recipients: AlertRecipient[]
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
  } | null
}

export function useMyAlerts() {
  return useQuery<MyAlertRow[]>({
    queryKey: ['my-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_recipients')
        .select(
          '*, alerts:alert_id(title, message, created_at, profiles:created_by(full_name, display_name))'
        )
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as MyAlertRow[]
    },
  })
}

export function useUnreadAlertCount() {
  return useQuery<number>({
    queryKey: ['unread-alert-counts'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('alert_recipients')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)
      if (error) throw error
      return count ?? 0
    },
  })
}

export function useAlerts() {
  return useQuery<AlertWithDetail[]>({
    queryKey: ['alerts'],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select(
          '*, profiles:created_by(full_name, display_name, avatar_url), alert_recipients(recipient_id, read_at, profiles:recipient_id(full_name, display_name, avatar_url))'
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as AlertWithDetail[]
    },
  })
}
