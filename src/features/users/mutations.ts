import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useOrganization } from '../../context/OrganizationContext'
import type { CreateUserFormData, EditUserFormData } from './userSchema'

function invalidateUsers(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['org-members'] })
  void qc.invalidateQueries({ queryKey: ['technicians'] })
  void qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
}

export function useCreateUser() {
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()

  return useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const { data: userId, error } = await supabase.rpc('create_staff_account', {
        p_email:     data.email,
        p_password:  data.password,
        p_full_name: data.full_name,
        p_role:      data.role,
        p_phone:     data.phone ?? null,
      })
      if (error) throw error

      if (activeOrgId && userId) {
        const { error: memberError } = await supabase.from('organization_members').insert({
          organization_id: activeOrgId,
          user_id: userId as string,
          role: data.role,
        })
        if (memberError) throw memberError
      }
    },
    onSuccess: () => invalidateUsers(qc),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditUserFormData }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name, phone: data.phone ?? null })
        .eq('id', id)
      if (error) throw error

      if (activeOrgId) {
        const { error: roleError } = await supabase
          .from('organization_members')
          .update({ role: data.role })
          .eq('organization_id', activeOrgId)
          .eq('user_id', id)
        if (roleError) throw roleError
      }
    },
    onSuccess: () => invalidateUsers(qc),
  })
}

export function useRemoveOrgMember() {
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()

  return useMutation({
    mutationFn: async ({ userId, isOwner }: { userId: string; isOwner: boolean }) => {
      if (isOwner) throw new Error('The organization owner cannot be removed.')
      if (!activeOrgId) throw new Error('No active organization.')
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', activeOrgId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org-members'] })
      void qc.invalidateQueries({ queryKey: ['org-invitations'] })
    },
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  const { activeOrgId } = useOrganization()

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const currentUserId = useAuthStore.getState().profile?.id
      if (id === currentUserId) throw new Error('You cannot deactivate your own account')
      if (!activeOrgId) throw new Error('No active organization.')

      const { error } = await supabase
        .from('organization_members')
        .update({ is_active })
        .eq('organization_id', activeOrgId)
        .eq('user_id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateUsers(qc),
  })
}
