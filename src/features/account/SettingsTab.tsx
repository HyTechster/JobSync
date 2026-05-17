import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../auth/hooks'
import { useUpdatePreferences, parsePreferences } from './hooks'

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '17/05/2026' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '05/17/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-05-17' },
] as const

export function SettingsTab() {
  const { profile } = useAuth()
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()
  const updatePreferences = useUpdatePreferences()

  const prefs = parsePreferences(profile?.preferences)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  function handleDateFormat(value: string) {
    updatePreferences.mutate({ date_format: value as typeof prefs.date_format })
  }

  function handleNotifyToggle() {
    updatePreferences.mutate({ notify_new_signin: !prefs.notify_new_signin })
  }

  async function handleCloseAccount() {
    if (deleteInput !== 'DELETE') return
    setIsDeleting(true)
    try {
      await supabase.from('profiles').update({ is_active: false }).eq('id', profile!.id)
      await supabase.auth.signOut()
      clearSession()
      navigate('/login', { replace: true })
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
        </div>
        <div className="px-6 py-5">
          {!showDeleteConfirm ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-base">Close account</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Deactivates your account. You will be signed out immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-shrink-0 h-9 px-4 border border-red-300 text-danger text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
              >
                Close account
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-sm">
              <p className="text-sm text-text-base">
                Type <strong>DELETE</strong> to confirm closing your account.
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full h-10 px-3 text-sm border border-red-300 rounded-lg outline-none focus:border-danger focus:ring-[3px] focus:ring-danger/10 transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleCloseAccount()}
                  disabled={deleteInput !== 'DELETE' || isDeleting}
                  className="h-9 px-4 bg-danger hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {isDeleting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Confirm close
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                  className="h-9 px-4 border border-border text-text-muted text-sm font-semibold rounded-lg hover:bg-surface-2 transition-colors"
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
