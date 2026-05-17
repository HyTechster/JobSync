import { NavLink, useNavigation } from 'react-router-dom'
import { Icons } from '../ui/Icons'
import { useUnreadAlertCount } from '../../features/alerts/hooks'

const NAV = [
  { to: '/technician/jobs',    Icon: Icons.jobs,   label: 'Jobs' },
  { to: '/technician/history', Icon: Icons.sheets, label: 'History' },
  { to: '/technician/alerts',  Icon: Icons.bell,   label: 'Alerts' },
  { to: '/account',            Icon: Icons.user,   label: 'Profile' },
] as const

export function TechnicianBottomNav() {
  const { data: unread = 0 } = useUnreadAlertCount()
  const navigation = useNavigation()
  const pendingTo = navigation.state === 'loading' ? navigation.location?.pathname : null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
      aria-label="Main navigation"
    >
      <div className="flex h-[60px]">
        {NAV.map(({ to, Icon, label }) => {
          const isPending = pendingTo === to
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${
                  isActive || isPending ? 'text-brand-700' : 'text-text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    {isPending ? (
                      <span className="w-[18px] h-[18px] border-2 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
                    ) : (
                      <Icon
                        size={22}
                        color={isActive ? 'var(--color-brand-700)' : 'currentColor'}
                      />
                    )}
                    {label === 'Alerts' && unread > 0 && !isPending && (
                      <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center px-[3px] leading-none">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
