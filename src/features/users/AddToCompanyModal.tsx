import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useInviteUser, type InviteUserData } from './hooks'
import type { OrgRole } from '../../types'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  role: z.enum(['admin', 'manager', 'technician'] as const),
})

type FormData = z.infer<typeof schema>

const ROLE_OPTIONS: { value: OrgRole; label: string; description: string }[] = [
  { value: 'technician', label: 'Technician', description: 'Field — views and submits job sheets' },
  { value: 'manager',    label: 'Manager',    description: 'Office — manages jobs and users'       },
  { value: 'admin',      label: 'Admin',      description: 'Full access — all permissions'          },
]

interface Props {
  isOpen: boolean
  isCurrentUserOwner: boolean
  onClose: () => void
}

export function AddToCompanyModal({ isOpen, isCurrentUserOwner, onClose }: Props) {
  const inviteUser = useInviteUser()
  const visibleRoles = isCurrentUserOwner
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((r) => r.value !== 'admin')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'technician' },
  })

  useEffect(() => {
    if (isOpen) {
      reset()
      inviteUser.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const onSubmit = (data: FormData) => {
    inviteUser.mutate(data as InviteUserData, { onSuccess: onClose })
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-user-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 id="invite-user-title" className="text-[15px] font-semibold text-text-base">
              Invite user
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              They'll see the invitation when they log in
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-text-base transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label htmlFor="invite-email" className="block text-xs font-semibold text-text-base mb-1.5">
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              placeholder="technician@company.com"
              {...register('email')}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10"
            />
            {errors.email && (
              <p className="text-xs text-danger mt-1">{errors.email.message}</p>
            )}
          </div>

          <fieldset>
            <legend className="block text-xs font-semibold text-text-base mb-2">Role</legend>
            <div className="flex flex-col gap-2">
              {visibleRoles.map(({ value, label, description }) => (
                <label
                  key={value}
                  className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-2 transition-colors has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50"
                >
                  <input
                    type="radio"
                    value={value}
                    {...register('role')}
                    className="mt-0.5 accent-brand-700"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-text-base leading-none mb-0.5">
                      {label}
                    </span>
                    <span className="text-xs text-text-muted">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {inviteUser.isError && (
            <div className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {inviteUser.error instanceof Error ? inviteUser.error.message : 'Something went wrong.'}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-slate-200 text-text-base text-sm font-semibold rounded-lg hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteUser.isPending}
              className="flex-1 h-10 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              {inviteUser.isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Send invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
