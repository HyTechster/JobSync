import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useLogout } from '../../features/auth/hooks'
import { useOrganization } from '../../context/OrganizationContext'

export default function WelcomePage() {
  const { session, profile, isLoading: isAuthLoading } = useAuth()
  const { memberships, userRole, isLoading: isOrgLoading } = useOrganization()
  const logout = useLogout()
  const navigate = useNavigate()

  const isLoading = isAuthLoading || isOrgLoading

  useEffect(() => {
    if (isLoading) return
    if (!session) { navigate('/login', { replace: true }); return }
    if (memberships.length > 0 && userRole) {
      navigate(userRole === 'technician' ? '/technician/jobs' : '/admin/dashboard', { replace: true })
    }
  }, [isLoading, session, memberships, userRole, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surface-2 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E3A5F" />
          <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
        </svg>
        <span className="text-xl font-bold text-text-base tracking-tight">JobSync</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-lg p-10">
        <h1 className="text-2xl font-bold text-text-base mb-1">
          Welcome, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-text-muted mb-8 leading-relaxed">
          Your account is ready. To get started, create your organization workspace or wait for an admin to add you.
        </p>

        {/* Primary action */}
        <Link
          to="/dashboard/create-organization"
          className="flex items-center gap-4 p-5 rounded-xl border-2 border-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors group mb-4"
        >
          <div className="w-11 h-11 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-brand-700">Create an organization</div>
            <div className="text-xs text-text-muted mt-0.5">Set up your company workspace and invite your team</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="opacity-70 group-hover:translate-x-0.5 transition-transform">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Secondary info */}
        <div className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50">
          <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-text-base">Waiting to be added?</div>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Ask your company admin to add your email address{' '}
              <span className="font-semibold text-text-base">{profile?.email}</span>{' '}
              to their organization. Once added, refresh this page or sign in again.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-6 w-full h-9 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text-base transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </main>
  )
}
