import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth, useLogoutAll } from '../auth/hooks'
import { useChangePassword, useLoginHistory } from './hooks'
import { useDateFormatter } from '../../hooks/useDateFormatter'
import { useAuthStore } from '../../store/authStore'
import { getDeviceInfo } from '../auth/deviceInfo'

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PwForm = z.infer<typeof pwSchema>

const inputCls = 'w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10'

function DeviceIcon({ deviceInfo }: { deviceInfo: string }) {
  const isMobile = /Android|iPhone|iPad/i.test(deviceInfo)
  if (isMobile) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  )
}

export function SecurityTab() {
  const { session } = useAuth()
  const userId = useAuthStore((s) => s.session?.user.id)
  const broadcastForcedSignout = useAuthStore((s) => s.broadcastForcedSignout)
  const queryClient = useQueryClient()
  const { fmtDateTime } = useDateFormatter()
  const changePassword = useChangePassword()
  const { data: loginHistory = [], isLoading: historyLoading } = useLoginHistory()
  const [signOutOthersSuccess, setSignOutOthersSuccess] = useState(false)
  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false)
  const [signingOutAll, setSigningOutAll] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const logoutAll = useLogoutAll()
  const currentDevice = getDeviceInfo()

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
    // Reuse the already-subscribed channel from authStore — no duplicate channel needed.
    await broadcastForcedSignout(currentDevice)

    await supabase.auth.signOut({ scope: 'others' })

    // Remove login_history rows for every device except this one
    if (userId) {
      await supabase
        .from('login_history' as never)
        .delete()
        .eq('user_id' as never, userId)
        .neq('device_info' as never, currentDevice)
    }
    await queryClient.invalidateQueries({ queryKey: ['login-history'] })
    setSignOutOthersSuccess(true)
    setTimeout(() => setSignOutOthersSuccess(false), 3000)
  }

  // One card per unique device (most-recent sign-in first, already ordered by query)
  const activeSessions = loginHistory.reduce<typeof loginHistory>((acc, row) => {
    if (!acc.find((r) => r.device_info === row.device_info)) acc.push(row)
    return acc
  }, [])

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
          <p className="text-xs text-text-muted mt-0.5">Devices that have signed in to your account</p>
        </div>

        <div className="divide-y divide-border">
          {historyLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
            ))
          ) : activeSessions.length === 0 ? (
            /* Fallback: login_history not yet populated — show current device only */
            <div className="px-6 py-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <DeviceIcon deviceInfo={currentDevice} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-text-base flex items-center gap-2">
                  {currentDevice}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Current</span>
                </div>
                <div className="text-xs text-text-muted mt-0.5">{session ? 'Session active' : '—'}</div>
              </div>
            </div>
          ) : (
            activeSessions.map((row) => {
              const isCurrent = row.device_info === currentDevice
              return (
                <div key={row.id} className="px-6 py-4 flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-brand-100' : 'bg-surface-2'}`}>
                    <DeviceIcon deviceInfo={row.device_info} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text-base flex items-center gap-2 flex-wrap">
                      {row.device_info}
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Current</span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">Last sign-in {fmtDateTime(row.signed_in_at)}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex flex-col gap-3">
          {signOutOthersSuccess && (
            <p className="text-sm text-success bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              Signed out of all other sessions
            </p>
          )}

          {confirmSignOutAll ? (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="flex-1 text-sm text-red-700">This will sign you out on every device, including this one. Continue?</p>
              <button
                type="button"
                disabled={signingOutAll}
                onClick={async () => {
                  setSigningOutAll(true)
                  await broadcastForcedSignout(currentDevice)
                  // Clear all login_history rows while still authenticated so
                  // Active sessions is empty when anyone next logs in.
                  if (userId) {
                    await supabase
                      .from('login_history' as never)
                      .delete()
                      .eq('user_id' as never, userId)
                  }
                  await logoutAll()
                }}
                className="h-8 px-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                {signingOutAll && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmSignOutAll(false)}
                className="h-8 px-3 text-xs font-semibold text-text-muted hover:text-text-base border border-border rounded-lg transition-colors flex-shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSignOutOthers()}
                className="h-9 px-4 text-sm font-semibold text-red-600 border border-red-300 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign out other sessions
              </button>
              <button
                type="button"
                onClick={() => setConfirmSignOutAll(true)}
                className="h-9 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sign out all sessions
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Sign-in history */}
      <section className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-base">Sign-in history</h2>
            <p className="text-xs text-text-muted mt-0.5">Recent account access across your devices</p>
          </div>
          {loginHistory.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllHistory((v) => !v)}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors"
            >
              {showAllHistory ? 'Show less' : `Show all ${loginHistory.length}`}
            </button>
          )}
        </div>

        <div className="divide-y divide-border">
          {historyLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
                <div className="h-3 w-28 bg-slate-100 rounded" />
              </div>
            ))
          ) : loginHistory.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-text-muted">No sign-in history yet</p>
            </div>
          ) : (
            (showAllHistory ? loginHistory : loginHistory.slice(0, 5)).map((record) => {
              const isCurrent = record.device_info === currentDevice
              return (
                <div key={record.id} className="px-6 py-3.5 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-brand-100' : 'bg-surface-2'}`}>
                    <DeviceIcon deviceInfo={record.device_info} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[13px] font-medium text-text-base truncate">{record.device_info}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">Current</span>
                      )}
                      {record.is_new_device && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">New device</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-text-muted flex-shrink-0 tabular-nums">{fmtDateTime(record.signed_in_at)}</span>
                </div>
              )
            })
          )}
        </div>

        {!historyLoading && loginHistory.length > 5 && (
          <div className="px-6 py-3 border-t border-border text-center">
            <button
              type="button"
              onClick={() => setShowAllHistory((v) => !v)}
              className="text-xs font-semibold text-text-muted hover:text-text-base transition-colors"
            >
              {showAllHistory ? '↑ Show less' : `↓ Show ${loginHistory.length - 5} more`}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
