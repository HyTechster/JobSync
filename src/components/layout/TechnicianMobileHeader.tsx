import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { Icons } from '../ui/Icons'
import { useAuthStore } from '../../store/authStore'
import { useOrganization } from '../../context/OrganizationContext'
import { useLogout } from '../../features/auth/hooks'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export function TechnicianMobileHeader() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { activeOrg, memberships, setActiveOrganization } = useOrganization()
  const logout = useLogout()
  const isOnline = useOnlineStatus()

  const [showOrgMenu, setShowOrgMenu]   = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const orgMenuRef     = useRef<HTMLDivElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Close org menu on outside click
  useEffect(() => {
    if (!showOrgMenu) return
    function onPointerDown(e: PointerEvent) {
      if (orgMenuRef.current && !orgMenuRef.current.contains(e.target as Node)) {
        setShowOrgMenu(false)
      }
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setShowOrgMenu(false) }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [showOrgMenu])

  // Close profile menu on outside click
  useEffect(() => {
    if (!showProfileMenu) return
    function onPointerDown(e: PointerEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [showProfileMenu])

  function switchOrg(orgId: string, role: string) {
    setActiveOrganization(orgId)
    setShowOrgMenu(false)
    flushSync(() =>
      navigate(role === 'technician' ? '/technician/jobs' : '/admin/dashboard', { replace: true })
    )
  }

  const initials = (profile?.full_name ?? 'T')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className={`fixed left-0 right-0 z-40 bg-white border-b border-border flex items-center gap-3 px-4 h-14 transition-[top] duration-150 ${isOnline ? 'top-0' : 'top-[42px]'}`}>
      <Icons.logo size={26} />

      {/* Org switcher trigger */}
      <div ref={orgMenuRef} className="flex-1 min-w-0 relative">
        <button
          type="button"
          onClick={() => { setShowOrgMenu((v) => !v); setShowProfileMenu(false) }}
          aria-label="Switch organization"
          aria-expanded={showOrgMenu}
          className="w-full text-left group"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-text-base leading-none">JobSync</span>
            <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
              FIELD
            </span>
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <p className="text-[11.5px] font-semibold text-emerald-700 truncate leading-none">
              {activeOrg?.name ?? 'Select organization'}
            </p>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`flex-shrink-0 transition-transform ${showOrgMenu ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>

        {/* Org dropdown */}
        {showOrgMenu && (
          <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Your organizations
              </p>
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
                  <div className={`w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.organizations.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-text-base truncate">{m.organizations.name}</div>
                    <div className="text-[10px] text-text-muted capitalize">{m.role}</div>
                  </div>
                  {isActive && (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="flex-shrink-0"
                    >
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
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-text-muted">New organization</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile button with dropdown */}
      <div ref={profileMenuRef} className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => { setShowProfileMenu((v) => !v); setShowOrgMenu(false) }}
          aria-label="Profile menu"
          aria-expanded={showProfileMenu}
          className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center hover:bg-emerald-700 transition-colors"
        >
          {initials}
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
            <button
              type="button"
              onClick={() => { setShowProfileMenu(false); navigate('/account') }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-surface-2 transition-colors text-left"
            >
              <Icons.user size={15} color="#64748B" />
              Manage account
            </button>
            <div className="h-px bg-border mx-3 my-1" />
            <button
              type="button"
              onClick={() => { setShowProfileMenu(false); logout() }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors text-left"
            >
              <Icons.logout size={15} color="currentColor" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
