import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../auth/hooks'
import { useUpdatePreferences, parsePreferences } from './hooks'
import { queryClient } from '../../lib/queryClient'

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '17/05/2026' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '05/17/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-05-17' },
] as const

export function SettingsTab() {
  const { profile, session } = useAuth()
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()
  const updatePreferences = useUpdatePreferences()

  const prefs = parsePreferences(profile?.preferences)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [password, setPassword]   = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting]   = useState(false)

  function handleDateFormat(value: string) {
    updatePreferences.mutate({ date_format: value as typeof prefs.date_format })
  }

  function handleNotifyToggle() {
    updatePreferences.mutate({ notify_new_signin: !prefs.notify_new_signin })
  }

  function cancelDelete() {
    setShowDeleteConfirm(false)
    setPassword('')
    setDeleteError('')
  }

  async function handleDeleteAccount() {
    if (!password || !profile || !session) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      // Step 1: verify password by re-authenticating
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      })
      if (authError) {
        setDeleteError('Incorrect password. Please try again.')
        return
      }

      // Step 2: call RPC — deletes owned orgs, all their data, and the auth user
      const { error: rpcError } = await supabase.rpc('delete_user_account' as never)
      if (rpcError) throw rpcError

      // Step 3: clear all local state and redirect
      queryClient.clear()
      localStorage.removeItem('jobsync_active_org')
      clearSession()
      navigate('/login', { replace: true })
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete account. Please try again.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Preferences */}
      <section className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-base">Preferences</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-text-base mb-2">Date format</label>
            <div className="flex flex-col gap-2">
              {DATE_FORMATS.map((fmt) => (
                <label
                  key={fmt.value}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-2 transition-colors has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50"
                >
                  <input
                    type="radio"
                    name="date_format"
                    value={fmt.value}
                    checked={prefs.date_format === fmt.value}
                    onChange={() => handleDateFormat(fmt.value)}
                    className="accent-brand-700"
                  />
                  <span className="text-sm font-medium text-text-base">{fmt.label}</span>
                  <span className="text-xs text-text-muted ml-auto">{fmt.example}</span>
                </label>
              ))}
            </div>
            {updatePreferences.isError && (
              <p className="text-xs text-danger mt-2">Failed to save preference</p>
            )}
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-base">Notifications</h2>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-base">New sign-in alert</p>
              <p className="text-xs text-text-muted mt-0.5">
                Email me when a new sign-in is detected from an unrecognised device
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.notify_new_signin}
              onClick={handleNotifyToggle}
              className={`relative inline-flex w-11 h-6 rounded-full flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-700/30 ${prefs.notify_new_signin ? 'bg-brand-700' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${prefs.notify_new_signin ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-white border border-red-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
          <p className="text-xs text-red-500 mt-0.5">These actions are permanent and cannot be undone</p>
        </div>
        <div className="px-6 py-5">
          {!showDeleteConfirm ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-base">Delete account</p>
                <p className="text-xs text-text-muted mt-0.5 max-w-xs">
                  Permanently deletes your account, all organizations you own, and every job, alert, and record linked to them.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-shrink-0 h-9 px-4 bg-red-50 border border-red-300 text-danger text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete account
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-sm">
              {/* What will be deleted */}
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex flex-col gap-1.5">
                <p className="text-xs font-bold text-danger uppercase tracking-wide">This will permanently delete:</p>
                <ul className="text-xs text-red-700 space-y-1 list-none">
                  <li className="flex items-start gap-1.5">
                    <span className="text-danger mt-0.5">•</span>
                    Your account and profile
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-danger mt-0.5">•</span>
                    All organizations you are the sole admin of
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-danger mt-0.5">•</span>
                    All job orders, job sheets, and alerts in those organizations
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-danger mt-0.5">•</span>
                    All uploaded photos and attachments
                  </li>
                </ul>
              </div>

              {/* Password input */}
              <div>
                <label htmlFor="delete-password" className="block text-xs font-semibold text-text-base mb-1.5">
                  Enter your password to confirm
                </label>
                <input
                  id="delete-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setDeleteError('') }}
                  placeholder="Your current password"
                  autoComplete="current-password"
                  className="w-full h-10 px-3 text-sm border border-red-300 rounded-lg outline-none focus:border-danger focus:ring-[3px] focus:ring-danger/10 transition-all"
                />
              </div>

              {deleteError && (
                <p className="text-xs text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {deleteError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleDeleteAccount()}
                  disabled={!password || isDeleting}
                  className="h-9 px-4 bg-danger hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {isDeleting && (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Permanently delete
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="h-9 px-4 border border-border text-text-muted text-sm font-semibold rounded-lg hover:bg-surface-2 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
