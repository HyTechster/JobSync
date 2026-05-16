import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useLogout } from '../../features/auth/hooks'
import { useOrganization, type OrgMembership } from '../../context/OrganizationContext'
import type { OrgRole } from '../../types'

const ROLE_LABEL: Record<OrgRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  technician: 'Technician',
}

const ROLE_COLOR: Record<OrgRole, string> = {
  admin: 'bg-brand-100 text-brand-700',
  manager: 'bg-violet-100 text-violet-700',
  technician: 'bg-emerald-100 text-emerald-700',
}

export default function SelectOrganizationPage() {
  const { session, isLoading: isAuthLoading } = useAuth()
  const { memberships, setActiveOrganization, isLoading: isOrgLoading } = useOrganization()
  const logout = useLogout()
  const navigate = useNavigate()

  const isLoading = isAuthLoading || isOrgLoading

  useEffect(() => {
    if (isLoading) return
    if (!session) { navigate('/login', { replace: true }); return }
    if (memberships.length === 0) { navigate('/dashboard/welcome', { replace: true }); return }
    if (memberships.length === 1) {
      selectOrg(memberships[0])
    }
  }, [isLoading, session, memberships]) // eslint-disable-line react-hooks/exhaustive-deps

  function selectOrg(m: OrgMembership) {
    setActiveOrganization(m.organization_id)
    navigate(m.role === 'technician' ? '/technician/jobs' : '/admin/dashboard', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surface-2 flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2.5 mb-10">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E3A5F" />
          <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
        </svg>
        <span className="text-xl font-bold text-text-base tracking-tight">JobSync</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-md p-10">
        <h1 className="text-xl font-bold text-text-base mb-1">Select an organization</h1>
        <p className="text-sm text-text-muted mb-7">
          You belong to multiple organizations. Choose one to continue.
        </p>

        <div className="flex flex-col gap-2">
          {memberships.map((m) => (
            <button
              key={m.organization_id}
              type="button"
              onClick={() => selectOrg(m)}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-brand-700 hover:bg-brand-50 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {m.organizations.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-base truncate">
                  {m.organizations.name}
                </div>
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${ROLE_COLOR[m.role]}`}>
                  {ROLE_LABEL[m.role]}
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="group-hover:stroke-brand-700 transition-colors">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-6 w-full h-9 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text-base transition-colors"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
