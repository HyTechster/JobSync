import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { Icons } from '../ui/Icons'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../features/auth/hooks'
import { useOrganization } from '../../context/OrganizationContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard',  label: 'Dashboard',  Icon: Icons.dashboard },
  { to: '/admin/jobs',       label: 'Jobs',        Icon: Icons.jobs      },
  { to: '/admin/history',    label: 'History',     Icon: Icons.check     },
  { to: '/admin/job-sheets', label: 'Job Sheets',  Icon: Icons.sheets    },
  { to: '/admin/users',      label: 'Users',       Icon: Icons.users     },
  { to: '/admin/alerts',     label: 'Alerts',      Icon: Icons.alerts    },
]

export function AdminSidebar() {
  const profile = useAuthStore((s) => s.profile)
  const logout = useLogout()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { activeOrg, memberships, setActiveOrganization } = useOrganization()
  const [showOrgMenu, setShowOrgMenu] = useState(false)

  const orgMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showOrgMenu) return
    function onPointerDown(e: PointerEvent) {
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target as Node)) {
        setShowOrgMenu(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowOrgMenu(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [showOrgMenu])

  function handleNav(to: string) {
    setShowOrgMenu(false)
    flushSync(() => navigate(to))
  }

  function switchOrg(orgId: string, role: string) {
    setActiveOrganization(orgId)
    setShowOrgMenu(false)
    flushSync(() =>
      navigate(role === 'technician' ? '/technician/jobs' : '/admin/dashboard', { replace: true })
    )
  }

  return (
    <aside className="sticky top-0 h-screen flex flex-col bg-white border-r border-border overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4.5">
        <Icons.logo size={28} />
        <span className="text-base font-bold text-text-base tracking-tight">JobSync</span>
        <span className="ml-auto text-[9.5px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
          OFFICE
        </span>
      </div>

      {/* Organization switcher */}
      <div ref={orgMenuRef} className="px-3.5 mb-3 relative">
        <button
          type="button"
          onClick={() => setShowOrgMenu((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border hover:bg-surface-2 transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-md bg-brand-700 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {(activeOrg?.name ?? 'O').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-text-base truncate leading-none">
              {activeOrg?.name ?? 'Organization'}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Switch organization</div>
          </div>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
            className={`flex-shrink-0 transition-transform ${showOrgMenu ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {showOrgMenu && (
          <div className="absolute left-3.5 right-3.5 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Your organizations</p>
            </div>

            {memberships.map((m) => {
              const isActive = m.organization_id === activeOrg?.id
              return (
                <button
                  key={m.organization_id}
                  type="button"
                  onClick={() => !isActive && switchOrg(m.organization_id, m.role)}
                  disabled={isActive}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-2 disabled:hover:bg-white transition-colors text-left"
                >
                  <div className={`w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {m.organizations.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-base truncate">{m.organizations.name}</div>
                    <div className="text-[10px] text-text-muted capitalize">{m.role}</div>
                  </div>
                  {isActive && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              )
            })}

            <div className="border-t border-border">
              <button
                type="button"
                onClick={() => { setShowOrgMenu(false); flushSync(() => navigate('/dashboard/create-organization')) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-2 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-md border border-dashed border-slate-300 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-text-muted">New organization</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New job button */}
      <div className="px-3.5 mb-4">
        <button
          type="button"
          onClick={() => handleNav('/admin/jobs?create=1')}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Icons.plus size={15} color="#fff" />
          New job order
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const isActive = pathname.startsWith(to)
          return (
            <button
              key={to}
              type="button"
              onClick={() => handleNav(to)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                isActive
                  ? 'bg-brand-100 text-brand-700 font-semibold'
                  : 'text-text-base hover:bg-surface-2'
              }`}
            >
              <Icon size={17} color={isActive ? '#1E3A5F' : '#64748B'} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* User profile */}
      <div className="px-3.5 py-3.5 border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <Link
            to="/account"
            className="flex items-center gap-2.5 flex-1 min-w-0 rounded-lg hover:bg-surface-2 transition-colors -mx-2 px-2 py-1"
          >
            <div className="w-8 h-8 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {(profile?.full_name ?? 'A')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-base truncate">
                {profile?.full_name ?? 'Admin'}
              </div>
              <div className="text-xs text-text-muted truncate">{profile?.email ?? ''}</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-base hover:bg-surface-2 transition-colors flex-shrink-0"
          >
            <Icons.logout size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
