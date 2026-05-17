import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '../ui/Icons'
import { useAuthStore } from '../../store/authStore'
import { useOrganization } from '../../context/OrganizationContext'
import { useLogout } from '../../features/auth/hooks'

export function AdminMobileHeader() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { activeOrg } = useOrganization()
  const logout = useLogout()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [showMenu])

  const initials = (profile?.full_name ?? 'A')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border flex items-center gap-3 px-4 h-14">
      <Icons.logo size={26} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-base leading-none">JobSync</span>
          <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">
            OFFICE
          </span>
        </div>
        {activeOrg && (
          <p className="text-[11px] text-text-muted truncate leading-none mt-0.5">{activeOrg.name}</p>
        )}
      </div>

      {/* Profile button with dropdown */}
      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setShowMenu((v) => !v)}
          aria-label="Profile menu"
          aria-expanded={showMenu}
          className="w-8 h-8 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center hover:bg-brand-800 transition-colors"
        >
          {initials}
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
            <button
              type="button"
              onClick={() => { setShowMenu(false); navigate('/account') }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-base hover:bg-surface-2 transition-colors text-left"
            >
              <Icons.user size={15} color="#64748B" />
              Manage account
            </button>
            <div className="h-px bg-border mx-3 my-1" />
            <button
              type="button"
              onClick={() => { setShowMenu(false); void logout() }}
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
