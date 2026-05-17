import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, useLogout } from '../../features/auth/hooks'
import { useOrganization, type OrgMembership } from '../../context/OrganizationContext'
import type { OrgRole } from '../../types'

function ProfileButton({ name }: { name: string }) {
  const navigate = useNavigate()
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <button
      type="button"
      onClick={() => navigate('/account')}
      title="Account settings"
      className="w-9 h-9 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center hover:bg-brand-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-700/30"
      aria-label="Go to account settings"
    >
      {initials}
    </button>
  )
}

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

const ORG_COLORS = [
  'bg-brand-700',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
]

function orgColor(index: number) {
  return ORG_COLORS[index % ORG_COLORS.length]
}

export default function SelectOrganizationPage() {
  const { session, profile, isLoading: isAuthLoading } = useAuth()
  const { memberships, setActiveOrganization, isLoading: isOrgLoading } = useOrganization()
  const logout = useLogout()
  const navigate = useNavigate()

  const isLoading = isAuthLoading || isOrgLoading

  useEffect(() => {
    if (isLoading) return
    if (!session) { navigate('/login', { replace: true }); return }
    if (memberships.length === 0) { navigate('/dashboard/welcome', { replace: true }); return }
  }, [isLoading, session, memberships, navigate])

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
      {/* Logo + profile button */}
      <div className="flex items-center gap-2.5 mb-10 w-full max-w-md">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E3A5F" />
          <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
        </svg>
        <span className="text-xl font-bold text-text-base tracking-tight flex-1">JobSync</span>
        <ProfileButton name={profile?.full_name ?? 'U'} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <h1 className="text-[20px] font-bold text-text-base leading-tight">Your organizations</h1>
          <p className="text-sm text-text-muted mt-1">
            Select a workspace to continue
          </p>
        </div>

        {/* Org list */}
        <div className="px-4 py-3 flex flex-col gap-1">
          {memberships.map((m, i) => (
            <button
              key={m.organization_id}
              type="button"
              onClick={() => selectOrg(m)}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-surface-2 text-left transition-colors group"
            >
              {/* Org avatar */}
              <div className={`w-11 h-11 rounded-xl ${orgColor(i)} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
                {m.organizations.name.slice(0, 2).toUpperCase()}
              </div>

              {/* Org info */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-text-base truncate leading-tight">
                  {m.organizations.name}
                </div>
                <span className={`inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-full mt-1 ${ROLE_COLOR[m.role]}`}>
                  {ROLE_LABEL[m.role]}
                </span>
              </div>

              {/* Arrow */}
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
                className="flex-shrink-0 group-hover:stroke-brand-700 transition-colors"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Create new org */}
        <div className="px-4 pb-4">
          <Link
            to="/dashboard/create-organization"
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-slate-300 hover:border-brand-700 hover:bg-brand-50 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-brand-700 flex items-center justify-center flex-shrink-0 transition-colors">
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
                className="group-hover:stroke-brand-700 transition-colors"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-text-muted group-hover:text-brand-700 transition-colors">
                New organization
              </div>
              <div className="text-[12px] text-text-subtle mt-0.5">
                Create a new workspace
              </div>
            </div>
          </Link>
        </div>

        {/* Sign out */}
        <div className="px-8 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full h-9 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text-base transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </main>
  )
}
