import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

type AlertRecipient = {
  recipient_id: string
  read_at: string | null
  profiles: { full_name: string; avatar_url: string | null } | null
}

export type AlertWithDetail = {
  id: string
  title: string
  message: string
  created_by: string
  created_at: string
  profiles: { full_name: string; avatar_url: string | null } | null
  alert_recipients: AlertRecipient[]
}

export function useAlerts() {
  return useQuery<AlertWithDetail[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select(
          '*, profiles:created_by(full_name, avatar_url), alert_recipients(recipient_id, read_at, profiles:recipient_id(full_name, avatar_url))'
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as AlertWithDetail[]
    },
  })
}
