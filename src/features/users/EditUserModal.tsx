import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editUserSchema, type EditUserFormData } from './userSchema'
import { useUpdateUser } from './mutations'
import { Modal } from '../../components/ui/Modal'
import type { UserWithAlertCount } from './hooks'

interface EditUserModalProps {
  user: UserWithAlertCount | null
  isCurrentUserOwner: boolean
  onClose: () => void
}

const inputCls =
  'w-full h-[38px] px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all'

export function EditUserModal({ user, isCurrentUserOwner, onClose }: EditUserModalProps) {
  const { mutate: updateUser, isPending, error } = useUpdateUser()
  const isOwnerTarget = user?.is_owner ?? false
  const roleIsLocked  = isOwnerTarget && !isCurrentUserOwner

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  })

  useEffect(() => {
    if (!user) return
    reset({
      full_name: user.full_name,
      phone: user.phone ?? '',
      role: user.role as 'admin' | 'manager' | 'technician',
    })
  }, [user, reset])

  function onSubmit(data: EditUserFormData) {
    if (!user) return
    updateUser({ id: user.id, data }, { onSuccess: onClose })
  }

  return (
    <Modal
      isOpen={!!user}
      onClose={onClose}
      title="Edit user"
      subtitle={user?.email}
      maxWidth="max-w-lg"
      footer={
        <>
          <p className="text-[12px]">
            {error ? <span className="text-danger">{(error as Error).message}</span> : null}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] px-4 rounded-lg border border-slate-300 text-sm font-semibold text-text-base hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isPending}
              className="h-[38px] px-4 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
            Full name <span className="text-danger">*</span>
          </label>
          <input {...register('full_name')} className={inputCls} />
          {errors.full_name && (
            <p className="text-[11.5px] text-danger mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">Phone</label>
            <input {...register('phone')} type="tel" className={inputCls} />
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-text-base mb-1.5">
              Role <span className="text-danger">*</span>
            </label>
            <select
              {...register('role')}
              disabled={roleIsLocked}
              className="w-full h-[38px] px-3 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="technician">Technician</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            {roleIsLocked && (
              <p className="text-[11px] text-text-muted mt-1">
                Only the owner can change their own role.
              </p>
            )}
          </div>
        </div>

        <p className="text-[12px] text-text-muted bg-surface-2 rounded-lg px-3 py-2.5">
          Password changes are not available here. The user must reset their own password via the
          login page.
        </p>
      </div>
    </Modal>
  )
}
