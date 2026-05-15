import { NavLink, useNavigate } from 'react-router-dom'
import { Icons } from '../ui/Icons'
import { useAuthStore } from '../../store/authStore'
import { useLogout } from '../../features/auth/hooks'

const NAV_ITEMS = [
  { to: '/admin/dashboard',  label: 'Dashboard',  Icon: Icons.dashboard },
  { to: '/admin/jobs',       label: 'Jobs',        Icon: Icons.jobs      },
  { to: '/admin/job-sheets', label: 'Job Sheets',  Icon: Icons.sheets    },
  { to: '/admin/users',      label: 'Users',       Icon: Icons.users     },
  { to: '/admin/alerts',     label: 'Alerts',      Icon: Icons.alerts    },
]

export function AdminSidebar() {
  const profile = useAuthStore((s) => s.profile)
  const logout = useLogout()
  const navigate = useNavigate()

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

      {/* New job button */}
      <div className="px-3.5 mb-4">
        <button
          type="button"
          onClick={() => navigate('/admin/jobs')}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Icons.plus size={15} color="#fff" />
          New job order
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-100 text-brand-700 font-semibold'
                  : 'text-text-base hover:bg-surface-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  color={isActive ? '#1E3A5F' : '#64748B'}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3.5 py-3.5 border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
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
          <button
            type="button"
            onClick={() => void logout()}
            title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-base hover:bg-surface-2 transition-colors"
          >
            <Icons.logout size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
