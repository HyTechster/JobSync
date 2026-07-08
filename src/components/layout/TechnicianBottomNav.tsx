import { NavLink, useNavigation } from 'react-router-dom'
import { Icons } from '../ui/Icons'
import { useUnreadAlertCount } from '../../features/alerts/hooks'
import { useOrganization } from '../../context/OrganizationContext'

const NAV = [
  { to: '/technician/dashboard',  Icon: Icons.dashboard, label: 'Home',    badge: false },
  { to: '/technician/jobs',       Icon: Icons.jobs,      label: 'Jobs',    badge: false },
  { to: '/technician/job-sheets', Icon: Icons.sheets,    label: 'Sheets',  badge: false },
  { to: '/technician/history',    Icon: Icons.check,     label: 'History', badge: false },
  { to: '/technician/alerts',     Icon: Icons.bell,      label: 'Alerts',  badge: true  },
] as const

function NavItem({
  to,
  Icon,
  label,
  badge,
  unread,
  pendingTo,
  tourTarget,
}: {
  to: string
  Icon: (typeof Icons)[keyof typeof Icons]
  label: string
  badge: boolean
  unread: number
  pendingTo: string | null
  tourTarget?: string
}) {
  const isPending = pendingTo === to
  return (
    <NavLink
      to={to}
      data-tour={tourTarget}
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
              <span className="w-[17px] h-[17px] border-2 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
            ) : (
              <Icon size={20} color={isActive ? '#059669' : 'currentColor'} />
            )}
            {badge && unread > 0 && !isPending && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center px-[3px] leading-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
          <span className="text-[9.5px] font-medium leading-none">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function TechnicianBottomNav() {
  const { activeOrgId } = useOrganization()
  const { data: unread = 0 } = useUnreadAlertCount(activeOrgId)
  const navigation = useNavigation()
  const pendingTo  = navigation.state === 'loading' ? (navigation.location?.pathname ?? null) : null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
      aria-label="Main navigation"
    >
      <div className="flex h-[60px]">
        {NAV.map(({ to, Icon, label, badge }) => (
          <NavItem
            key={to}
            to={to}
            Icon={Icon}
            label={label}
            badge={badge}
            unread={unread}
            pendingTo={pendingTo}
            tourTarget={label === 'Jobs' ? 'nav-jobs' : label === 'Sheets' ? 'nav-sheets' : label === 'Alerts' ? 'nav-alerts' : undefined}
          />
        ))}
      </div>
    </nav>
  )
}
