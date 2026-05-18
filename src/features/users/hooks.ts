import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useOrganization } from '../../context/OrganizationContext'
import type { Profile, OrgRole } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserWithAlertCount = Profile & {
  unread_alerts: number
  is_owner: boolean
}

export interface PendingInvitation {
  id: string
  organization_id: string
  email: string
  role: OrgRole
  invited_by: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  organizations: { id: string; name: string } | null
}

export interface OrgInvitation {
  id: string
  email: string
  role: OrgRole
  invited_by: string
  status: string
  created_at: string
}

// ─── Org member list (replaces global useUsers) ───────────────────────────────

export function useOrgMembers() {
  const { activeOrgId } = useOrganization()

  return useQuery<UserWithAlertCount[]>({
    queryKey: ['org-members', activeOrgId],
    enabled: !!activeOrgId,
    staleTime: 0,
    queryFn: async () => {
      if (!activeOrgId) return []

      // Fetch members (with org role) and org owner_id in parallel
      const [membersRes, orgRes] = await Promise.all([
        supabase
          .from('organization_members')
          .select('user_id, role')
          .eq('organization_id', activeOrgId)
          .order('joined_at', { ascending: true }),
        supabase
          .from('organizations')
          .select('owner_id')
          .eq('id', activeOrgId)
          .single(),
      ])

      if (membersRes.error) throw membersRes.error
      if (orgRes.error) throw orgRes.error

      const ownerId   = orgRes.data?.owner_id ?? null
      const memberList = membersRes.data ?? []
      const userIds   = memberList.map((m) => m.user_id)
      if (userIds.length === 0) return []

      const [profilesRes, alertsRes] = await Promise.all([
        supabase.from('profiles').select('*').in('id', userIds),
        supabase.from('alert_recipients').select('recipient_id').is('read_at', null),
      ])

      if (profilesRes.error) throw profilesRes.error
      if (alertsRes.error) throw alertsRes.error

      const unreadCounts: Record<string, number> = {}
      for (const row of alertsRes.data ?? []) {
        unreadCounts[row.recipient_id] = (unreadCounts[row.recipient_id] ?? 0) + 1
      }

      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]))
      return memberList
        .map((m) => {
          const profile = profileMap.get(m.user_id)
          if (!profile) return null
          return {
            ...(profile as Profile),
            role: m.role,
            is_owner: profile.id === ownerId,
            unread_alerts: unreadCounts[profile.id] ?? 0,
          }
        })
        .filter(Boolean) as UserWithAlertCount[]
    },
  })
}

// Kept as alias for any existing imports
export const useUsers = useOrgMembers

// ─── Invite user by email ─────────────────────────────────────────────────────

export interface InviteUserData {
  email: string
  role: OrgRole
}

export function useInviteUser() {
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()
  const currentUserId = useAuthStore((s) => s.profile?.id)

  return useMutation({
    mutationFn: async ({ email, role }: InviteUserData) => {
      if (!activeOrgId) throw new Error('No active organization found.')
      if (!currentUserId) throw new Error('Not authenticated.')

      const normalizedEmail = email.trim().toLowerCase()

      // Remove any stale accepted/rejected invitation so the person can be re-invited.
      // A still-pending invitation is intentionally left alone — inserting below will
      // hit the unique constraint and surface the "already sent" error.
      await supabase
        .from('organization_invitations' as never)
        .delete()
        .eq('organization_id' as never, activeOrgId)
        .eq('email' as never, normalizedEmail)
        .in('status' as never, ['accepted', 'rejected'])

      const { error } = await supabase.from('organization_invitations' as never).insert({
        organization_id: activeOrgId,
        email: normalizedEmail,
        role,
        invited_by: currentUserId,
      } as never)

      if (error) {
        if ((error as { code?: string }).code === '23505') {
          throw new Error('An invitation has already been sent to this email address.')
        }
        throw error
      }
    },

    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-invitations', activeOrgId] })
    },
  })
}

// Keep old name as alias (used by AddToCompanyModal)
export const useAddMember = useInviteUser

// ─── Org invitations (admin view) ────────────────────────────────────────────

export function useOrgInvitations() {
  const { activeOrgId } = useOrganization()

  return useQuery<OrgInvitation[]>({
    queryKey: ['org-invitations', activeOrgId],
    enabled: !!activeOrgId,
    queryFn: async () => {
      if (!activeOrgId) return []
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('id, email, role, invited_by, status, created_at')
        .eq('organization_id', activeOrgId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as OrgInvitation[]
    },
  })
}

export function useCancelInvitation() {
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-invitations', activeOrgId] })
    },
  })
}

// ─── Pending invitations (invitee view, shown on SelectOrganizationPage) ──────

export function usePendingInvitations() {
  const session = useAuthStore((s) => s.session)

  return useQuery<PendingInvitation[]>({
    // Key by user id — available immediately when session is restored
    queryKey: ['pending-invitations', session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      // No client-side email filter — RLS policy "Users see own invitations"
      // filters by matching the caller's profile email on the server.
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*, organizations(id, name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as PendingInvitation[]
    },
  })
}

export function useRespondToInvitation() {
  const qc = useQueryClient()
  const session = useAuthStore((s) => s.session)

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'accept' | 'reject' }) => {
      if (action === 'accept') {
        const { error } = await supabase.rpc('accept_organization_invitation', {
          p_invitation_id: id,
        })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('organization_invitations')
          .update({ status: 'rejected' })
          .eq('id', id)
        if (error) throw error
      }
    },

    onSuccess: (_data, { action }) => {
      void qc.invalidateQueries({ queryKey: ['pending-invitations', session?.user.id] })
      if (action === 'accept') {
        void qc.invalidateQueries({ queryKey: ['org-memberships'] })
        void qc.invalidateQueries({ queryKey: ['org-members'] })
        void qc.invalidateQueries({ queryKey: ['org-invitations'] })
      }
    },
  })
}
