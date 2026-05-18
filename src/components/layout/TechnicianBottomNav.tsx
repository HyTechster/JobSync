import { NavLink, useNavigation, useNavigate } from 'react-router-dom'
import { Icons } from '../ui/Icons'
import { useUnreadAlertCount } from '../../features/alerts/hooks'

const LEFT_NAV = [
  { to: '/technician/jobs',       Icon: Icons.jobs,   label: 'Jobs'       },
  { to: '/technician/job-sheets', Icon: Icons.sheets, label: 'Job Sheets' },
] as const

const RIGHT_NAV = [
  { to: '/technician/history', Icon: Icons.sheets, label: 'History', badge: false },
  { to: '/technician/alerts',  Icon: Icons.bell,   label: 'Alerts',  badge: true  },
] as const

function NavItem({
  to,
  Icon,
  label,
  badge,
  unread,
  pendingTo,
}: {
  to: string
  Icon: (typeof Icons)[keyof typeof Icons]
  label: string
  badge?: boolean
  unread?: number
  pendingTo: string | null
}) {
  const isPending = pendingTo === to
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors ${
          isActive || isPending ? 'text-emerald-700' : 'text-text-muted'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative w-6 h-6 flex items-center justify-center">
            {isPending ? (
              <span className="w-[18px] h-[18px] border-2 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
            ) : (
              <Icon
                size={22}
                color={isActive ? '#059669' : 'currentColor'}
              />
            )}
            {badge && (unread ?? 0) > 0 && !isPending && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center px-[3px] leading-none">
                {(unread ?? 0) > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function TechnicianBottomNav() {
  const { data: unread = 0 } = useUnreadAlertCount()
  const navigation = useNavigation()
  const navigate   = useNavigate()
  const pendingTo  = navigation.state === 'loading' ? (navigation.location?.pathname ?? null) : null

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
        aria-label="Main navigation"
      >
        <div className="flex h-[60px] max-w-lg mx-auto">
          {/* Left two tabs */}
          {LEFT_NAV.map(({ to, Icon, label }) => (
            <NavItem key={to} to={to} Icon={Icon} label={label} pendingTo={pendingTo} />
          ))}

          {/* Center FAB */}
          <div className="flex-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => navigate('/technician/job-sheets/new')}
              aria-label="Add new job sheet"
              className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all -mt-3"
            >
              <Icons.plus size={22} color="white" strokeWidth={2.5} />
            </button>
          </div>

          {/* Right two tabs */}
          {RIGHT_NAV.map(({ to, Icon, label, badge }) => (
            <NavItem
              key={to}
              to={to}
              Icon={Icon}
              label={label}
              badge={badge}
              unread={unread}
              pendingTo={pendingTo}
            />
          ))}
        </div>
      </nav>

    </>
  )
}
