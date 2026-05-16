import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types'

export type UserWithAlertCount = Profile & { unread_alerts: number }

export function useUsers() {
  return useQuery<UserWithAlertCount[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const [profilesRes, alertsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase
          .from('alert_recipients')
          .select('recipient_id')
          .is('read_at', null),
      ])

      if (profilesRes.error) throw profilesRes.error
      if (alertsRes.error) throw alertsRes.error

      const unreadCounts: Record<string, number> = {}
      for (const row of alertsRes.data ?? []) {
        unreadCounts[row.recipient_id] = (unreadCounts[row.recipient_id] ?? 0) + 1
      }

      return (profilesRes.data ?? []).map((p) => ({
        ...p,
        unread_alerts: unreadCounts[p.id] ?? 0,
      }))
    },
  })
}
