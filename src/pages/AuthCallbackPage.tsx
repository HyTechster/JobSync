import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

type Status = 'verifying' | 'error'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate  = useNavigate()
  const session   = useAuthStore((s) => s.session)
  const isLoading = useAuthStore((s) => s.isLoading)

  // Derive error state directly from URL params — no useEffect needed
  const urlError  = searchParams.get('error')
  const urlDesc   = searchParams.get('error_description')
  const [status,   setStatus]   = useState<Status>(() => urlError ? 'error' : 'verifying')
  const [errorMsg, setErrorMsg] = useState(() => urlError ? (urlDesc ?? urlError) : '')

  // detectSessionInUrl: true in supabase client auto-exchanges the code and fires
  // onAuthStateChange → initAuth updates the store. We just wait for it here.
  // Distinguish first-ever login from a returning user by comparing created_at with
  // last_sign_in_at: on a brand-new account these are the same timestamp; on every
  // subsequent sign-in last_sign_in_at is updated to "now" while created_at stays fixed.
  useEffect(() => {
    if (status === 'error') return
    if (!isLoading && session) {
      const created     = new Date(session.user.created_at).getTime()
      const lastSignIn  = new Date(session.user.last_sign_in_at ?? session.user.created_at).getTime()
      const isFirstLogin = lastSignIn - created < 30_000
      navigate(isFirstLogin ? '/dashboard/additional-info' : '/dashboard/select-organization', { replace: true })
    }
  }, [session, isLoading, status, navigate])

  // Fallback: if no session after 10 seconds, the link was likely expired
  useEffect(() => {
    if (status === 'error') return
    const t = setTimeout(() => {
      if (!useAuthStore.getState().session) {
        setErrorMsg('The confirmation link has expired or already been used. Please sign up again.')
        setStatus('error')
      }
    }, 10_000)
    return () => clearTimeout(t)
  }, [status])

  if (status === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface-2 p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-[18px] font-bold text-text-base mb-2">Verification failed</h2>
          <p className="text-[13.5px] text-text-muted leading-relaxed mb-6">{errorMsg}</p>
          <a
            href="/signup"
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-brand-700 text-white text-[14px] font-semibold hover:bg-brand-800 transition-colors"
          >
            Back to sign up
          </a>
          <a
            href="/login"
            className="block mt-3 text-[13px] text-text-muted hover:text-text-base transition-colors"
          >
            Already have an account? Sign in
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-2 p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <span className="w-7 h-7 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
        </div>
        <h2 className="text-[18px] font-bold text-text-base mb-2">Verifying your email…</h2>
        <p className="text-[13.5px] text-text-muted leading-relaxed">
          Please wait while we confirm your account.
        </p>
      </div>
    </main>
  )
}
