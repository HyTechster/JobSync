import { useLocation, useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { Icons } from '../ui/Icons'

const NAV = [
  { to: '/admin/dashboard',  Icon: Icons.dashboard, label: 'Dashboard' },
  { to: '/admin/jobs',       Icon: Icons.jobs,      label: 'Jobs'      },
  { to: '/admin/job-sheets', Icon: Icons.sheets,    label: 'Sheets'    },
  { to: '/admin/users',      Icon: Icons.users,     label: 'Users'     },
  { to: '/admin/alerts',     Icon: Icons.alerts,    label: 'Alerts'    },
] as const

export function AdminBottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border"
      aria-label="Admin navigation"
    >
      <div className="flex h-[60px]">
        {NAV.map(({ to, Icon, label }) => {
          const isActive = pathname.startsWith(to)
          return (
            <button
              key={to}
              type="button"
              onClick={() => flushSync(() => navigate(to))}
              className={`flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${
                isActive ? 'text-brand-700' : 'text-text-muted hover:text-text-base'
              }`}
            >
              <Icon size={20} color={isActive ? '#1E3A5F' : 'currentColor'} />
              <span className="text-[9.5px] font-medium leading-none">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
