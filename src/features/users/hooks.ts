import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useOrganization } from '../../context/OrganizationContext'
import type { Profile, OrgRole } from '../../types'

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

export interface AddMemberData {
  email: string
  role: OrgRole
}

export function useAddMember() {
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()
  const currentUserId = useAuthStore((s) => s.profile?.id)

  return useMutation({
    mutationFn: async ({ email, role }: AddMemberData) => {
      if (!activeOrgId) throw new Error('No active organization found.')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (profileError) throw profileError
      if (!profile) throw new Error('No account found with that email address.')

      const { error: insertError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: activeOrgId,
          user_id: profile.id,
          role,
          added_by: currentUserId ?? null,
        })

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('This user is already a member of your organization.')
        }
        throw insertError
      }

      return profile
    },

    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
      void qc.invalidateQueries({ queryKey: ['org-memberships'] })
    },
  })
}
