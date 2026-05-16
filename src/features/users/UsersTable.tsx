import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { useAuthStore } from '../../store/authStore'
import { useToggleUserActive } from './mutations'
import type { UserWithAlertCount } from './hooks'

interface UsersTableProps {
  users: UserWithAlertCount[]
  isLoading?: boolean
  onEdit: (user: UserWithAlertCount) => void
}

const HEADERS = ['User', 'Role', 'Phone', 'Status', 'Alerts', '']

function SkeletonRow() {
  return (
    <tr>
      {HEADERS.map((_, i) => (
        <td key={i} className="px-4 py-[14px] border-b border-slate-100">
          <div
            className="h-4 bg-slate-200 rounded animate-pulse"
            style={{ width: `${50 + ((i * 19) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  )
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
        isAdmin
          ? 'bg-brand-50 text-brand-700'
          : 'bg-surface-2 text-text-muted'
      }`}
    >
      {isAdmin ? 'Admin' : 'Technician'}
    </span>
  )
}

export function UsersTable({ users, isLoading, onEdit }: UsersTableProps) {
  const currentUserId = useAuthStore((s) => s.profile?.id)
  const { mutate: toggleActive, isPending } = useToggleUserActive()

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-surface-2 text-text-muted">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] font-semibold tracking-wide uppercase border-b border-slate-200 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : users.map((user, i) => {
                const isLast = i === users.length - 1
                const border = isLast ? '' : 'border-b border-slate-100'
                const isSelf = user.id === currentUserId

                return (
                  <tr key={user.id} className="hover:bg-surface-2 transition-colors group">
                    <td className={`px-4 py-[14px] ${border}`}>
                      <div className="flex items-center gap-3">
                        <Avatar name={user.full_name} size={32} src={user.avatar_url} />
                        <div>
                          <div className="font-semibold text-text-base leading-tight">
                            {user.full_name}
                            {isSelf && (
                              <span className="ml-2 text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                                (you)
                              </span>
                            )}
                          </div>
                          <div className="text-[11.5px] text-text-muted mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      <RoleBadge role={user.role} />
                    </td>
                    <td className={`px-4 py-[14px] ${border} text-text-muted`}>
                      {user.phone ?? <span className="italic">—</span>}
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                          user.is_active ? 'text-success' : 'text-text-muted'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.is_active ? 'bg-success' : 'bg-text-muted'
                          }`}
                        />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      {user.role === 'technician' && user.unread_alerts > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-700 text-white text-[10px] font-bold">
                          {user.unread_alerts}
                        </span>
                      ) : (
                        <span className="text-text-subtle text-xs">—</span>
                      )}
                    </td>
                    <td className={`px-4 py-[14px] ${border}`}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(user)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-base transition-colors"
                          aria-label={`Edit ${user.full_name}`}
                        >
                          <Icons.edit size={15} />
                        </button>
                        <button
                          onClick={() =>
                            toggleActive({ id: user.id, is_active: !user.is_active })
                          }
                          disabled={isSelf || isPending}
                          title={
                            isSelf
                              ? 'Cannot deactivate your own account'
                              : user.is_active
                              ? 'Deactivate user'
                              : 'Reactivate user'
                          }
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                            user.is_active
                              ? 'text-text-muted hover:bg-[#FFE4E6] hover:text-danger'
                              : 'text-text-muted hover:bg-[#D1FAE5] hover:text-success'
                          }`}
                          aria-label={user.is_active ? 'Deactivate' : 'Reactivate'}
                        >
                          {user.is_active ? (
                            <Icons.close size={15} />
                          ) : (
                            <Icons.check size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
        </tbody>
      </table>

      {!isLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Icons.users size={40} color="#94A3B8" />
          <p className="text-sm font-medium text-text-muted">No users found</p>
        </div>
      )}
    </div>
  )
}
