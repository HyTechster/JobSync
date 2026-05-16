import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import type { CreateUserFormData, EditUserFormData } from './userSchema'

function invalidateUsers(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['users'] })
  void qc.invalidateQueries({ queryKey: ['technicians'] })
  void qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const { error } = await supabase.rpc('create_staff_account', {
        p_email: data.email,
        p_password: data.password,
        p_full_name: data.full_name,
        p_role: data.role,
        p_phone: data.phone ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => invalidateUsers(qc),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditUserFormData }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone ?? null,
          role: data.role,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateUsers(qc),
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const currentUserId = useAuthStore.getState().profile?.id
      if (id === currentUserId) {
        throw new Error('You cannot deactivate your own account')
      }
      const { error } = await supabase
        .from('profiles')
        .update({ is_active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateUsers(qc),
  })
}
