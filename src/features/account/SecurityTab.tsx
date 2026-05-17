import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/hooks'
import { useChangePassword } from './hooks'

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PwForm = z.infer<typeof pwSchema>

function getDeviceInfo() {
  const ua = navigator.userAgent
  let browser = 'Unknown browser'
  if (ua.includes('Edg'))                               browser = 'Edge'
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome'
  else if (ua.includes('Firefox'))                      browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'

  let os = 'Unknown OS'
  if (ua.includes('Windows'))                      os = 'Windows'
  else if (ua.includes('Mac') && !ua.includes('iPhone') && !ua.includes('iPad')) os = 'macOS'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Android'))                 os = 'Android'
  else if (ua.includes('Linux'))                   os = 'Linux'

  return `${browser} on ${os}`
}

function formatSignInTime(session: ReturnType<typeof useAuth>['session']) {
  if (!session?.access_token) return '—'
  try {
    const payload = JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return new Date(payload.iat * 1000).toLocaleString('en-MY', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return '—' }
}

const inputCls = 'w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10'

export function SecurityTab() {
  const { session } = useAuth()
  const changePassword = useChangePassword()
  const [signOutOthersSuccess, setSignOutOthersSuccess] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  })

  function onSubmit(data: PwForm) {
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => reset() }
    )
  }

  async function handleSignOutOthers() {
    await supabase.auth.signOut({ scope: 'others' })
    setSignOutOthersSuccess(true)
    setTimeout(() => setSignOutOthersSuccess(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Change password */}
      <section className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-base">Change password</h2>
          <p className="text-xs text-text-muted mt-0.5">Use a strong password you don't use elsewhere</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 flex flex-col gap-4 max-w-md">
          <div>
            <label htmlFor="cur-pw" className="block text-xs font-semibold text-text-base mb-1.5">Current password</label>
            <input id="cur-pw" type="password" {...register('currentPassword')} className={inputCls} />
            {errors.currentPassword && <p className="text-xs text-danger mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="new-pw" className="block text-xs font-semibold text-text-base mb-1.5">New password</label>
            <input id="new-pw" type="password" {...register('newPassword')} className={inputCls} />
            {errors.newPassword && <p className="text-xs text-danger mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="conf-pw" className="block text-xs font-semibold text-text-base mb-1.5">Confirm new password</label>
            <input id="conf-pw" type="password" {...register('confirmPassword')} className={inputCls} />
            {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {changePassword.isError && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {changePassword.error instanceof Error ? changePassword.error.message : 'Failed to update password'}
            </p>
          )}
          {changePassword.isSuccess && (
            <p className="text-sm text-success bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Password updated successfully
            </p>
          )}

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="self-start h-9 px-5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {changePassword.isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Update password
          </button>
        </form>
      </section>

      {/* Sessions */}
      <section className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-base">Active sessions</h2>
          <p className="text-xs text-text-muted mt-0.5">Devices currently signed in to your account</p>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3.5 bg-surface-2 rounded-lg border border-border">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-base flex items-center gap-2">
                {getDeviceInfo()}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Current</span>
              </div>
              <div className="text-xs text-text-muted mt-0.5">Signed in {formatSignInTime(session)}</div>
            </div>
          </div>

          {signOutOthersSuccess ? (
            <p className="text-sm text-success bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Signed out of all other sessions
            </p>
          ) : (
            <button
              type="button"
              onClick={() => void handleSignOutOthers()}
              className="self-start text-sm font-semibold text-danger hover:text-red-700 transition-colors"
            >
              Sign out of all other sessions
            </button>
          )}
        </div>
      </section>

      {/* Activity */}
      <section className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-base">Activity</h2>
        </div>
        <div className="px-6 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Last sign-in</span>
            <span className="font-medium text-text-base">{formatSignInTime(session)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Sign-in method</span>
            <span className="font-medium text-text-base">Email &amp; password</span>
          </div>
        </div>
      </section>
    </div>
  )
}
