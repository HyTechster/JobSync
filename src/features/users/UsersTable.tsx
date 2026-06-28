import { useState } from 'react'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'
import { useToggleUserActive, useRemoveOrgMember } from './mutations'
import type { UserWithAlertCount } from './hooks'

interface UsersTableProps {
  users: UserWithAlertCount[]
  isLoading?: boolean
  isCurrentUserOwner?: boolean
  onEdit: (user: UserWithAlertCount) => void
}

type PendingToggle = { user: UserWithAlertCount }
type PendingRemove = { user: UserWithAlertCount }

const HEADERS = ['User', 'Role', 'Phone', 'Status', 'Alerts', '']

const ROLE_STYLE: Record<string, string> = {
  owner:      'bg-amber-100 text-amber-700',
  admin:      'bg-brand-50 text-brand-700',
  manager:    'bg-violet-100 text-violet-700',
  technician: 'bg-surface-2 text-text-muted',
}

const ROLE_LABEL: Record<string, string> = {
  owner:      'Owner',
  admin:      'Admin',
  manager:    'Manager',
  technician: 'Technician',
}

function RoleBadge({ role, isOwner }: { role: string; isOwner: boolean }) {
  const key = isOwner ? 'owner' : role
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${ROLE_STYLE[key] ?? 'bg-surface-2 text-text-muted'}`}>
      {ROLE_LABEL[key] ?? role}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {HEADERS.map((_, i) => (
        <td key={i} className="px-4 py-[14px] border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${50 + ((i * 19) % 40)}%` }} />
        </td>
      ))}
    </tr>
  )
}

function MobileSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-32 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
        <div className="h-5 w-16 bg-slate-100 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export function UsersTable({ users, isLoading, isCurrentUserOwner = false, onEdit }: UsersTableProps) {
  const currentUserId = useAuthStore((s) => s.profile?.id)
  const { mutate: toggleActive, isPending: isToggling } = useToggleUserActive()
  const { mutate: removeUser,   isPending: isRemoving  } = useRemoveOrgMember()

  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null)
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null)

  function handleConfirmToggle() {
    if (!pendingToggle) return
    const { user } = pendingToggle
    toggleActive(
      { id: user.id, is_active: !user.is_active },
      { onSettled: () => setPendingToggle(null) },
    )
  }

  function handleConfirmRemove() {
    if (!pendingRemove) return
    removeUser(
      { userId: pendingRemove.user.id, isOwner: pendingRemove.user.is_owner },
      { onSettled: () => setPendingRemove(null) },
    )
  }

  return (
    <>
      {/* ── Mobile card list ─────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col divide-y divide-slate-100">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <MobileSkeletonCard key={i} />)
          : users.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
              <Icons.users size={36} color="#94A3B8" />
              <p className="text-sm font-medium text-text-muted">No users found</p>
            </div>
          )
          : users.map((user) => {
              const isSelf    = user.id === currentUserId
              const canRemove = !isSelf && (isCurrentUserOwner ? true : !user.is_owner)

              return (
                <div key={user.id} className="px-4 py-4">
                  {/* Top row: avatar + name + role badge */}
                  <div className="flex items-start gap-3">
                    <Avatar name={user.full_name} size={40} src={user.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[13.5px] font-semibold text-text-base truncate">
                          {user.display_name ?? user.full_name}
                        </span>
                        {isSelf && (
                          <span className="text-[9.5px] font-semibold text-text-muted uppercase tracking-wide">(you)</span>
                        )}
                      </div>
                      {user.display_name && (
                        <p className="text-[11.5px] text-text-muted leading-tight">{user.full_name}</p>
                      )}
                      <p className="text-[12px] text-text-muted mt-0.5 truncate">{user.email}</p>
                    </div>
                    <RoleBadge role={user.role} isOwner={user.is_owner} />
                  </div>

                  {/* Bottom row: status + alerts + actions */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${user.is_active ? 'text-success' : 'text-text-muted'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-success' : 'bg-text-muted'}`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>

                    {user.role === 'technician' && user.unread_alerts > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11.5px] text-text-muted">
                        <Icons.alerts size={12} />
                        <span className="font-semibold text-brand-700">{user.unread_alerts}</span>
                        <span>unread</span>
                      </span>
                    )}

                    {user.phone && (
                      <span className="text-[12px] text-text-muted truncate">{user.phone}</span>
                    )}

                    {/* Actions pushed to right */}
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => onEdit(user)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-base transition-colors"
                        aria-label={`Edit ${user.full_name}`}
                      >
                        <Icons.edit size={15} />
                      </button>

                      <button
                        onClick={() => !isSelf && setPendingToggle({ user })}
                        disabled={isSelf}
                        title={isSelf ? 'Cannot change your own status' : user.is_active ? 'Deactivate' : 'Reactivate'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                          user.is_active
                            ? 'text-text-muted hover:bg-[#FFE4E6] hover:text-danger'
                            : 'text-text-muted hover:bg-[#D1FAE5] hover:text-success'
                        }`}
                        aria-label={user.is_active ? 'Deactivate' : 'Reactivate'}
                      >
                        {user.is_active ? <Icons.close size={15} /> : <Icons.check size={15} />}
                      </button>

                      <button
                        onClick={() => canRemove && setPendingRemove({ user })}
                        disabled={!canRemove}
                        title={
                          isSelf ? 'Cannot remove yourself'
                          : user.is_owner && !isCurrentUserOwner ? 'Admins cannot remove the owner'
                          : 'Remove from organization'
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-[#FFE4E6] hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Remove ${user.full_name}`}
                      >
                        <Icons.logout size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
      </div>

      {/* ── Desktop table ─────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
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
                  const isLast  = i === users.length - 1
                  const border  = isLast ? '' : 'border-b border-slate-100'
                  const isSelf  = user.id === currentUserId
                  const canRemove = !isSelf && (isCurrentUserOwner ? true : !user.is_owner)

                  return (
                    <tr key={user.id} className="hover:bg-surface-2 transition-colors group">
                      <td className={`px-4 py-[14px] ${border}`}>
                        <div className="flex items-center gap-3">
                          <Avatar name={user.full_name} size={32} src={user.avatar_url} />
                          <div>
                            <div className="font-semibold text-text-base leading-tight flex items-center gap-1.5 flex-wrap">
                              {user.display_name ?? user.full_name}
                              {user.is_owner && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 leading-none">
                                  Owner
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">(you)</span>
                              )}
                            </div>
                            {user.display_name && (
                              <div className="text-[11.5px] text-text-muted leading-tight">{user.full_name}</div>
                            )}
                            <div className="text-[11.5px] text-text-muted mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className={`px-4 py-[14px] ${border}`}>
                        <RoleBadge role={user.role} isOwner={user.is_owner} />
                      </td>

                      <td className={`px-4 py-[14px] ${border} text-text-muted`}>
                        {user.phone ?? <span className="italic">—</span>}
                      </td>

                      <td className={`px-4 py-[14px] ${border}`}>
                        <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${user.is_active ? 'text-success' : 'text-text-muted'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-success' : 'bg-text-muted'}`} />
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
                            onClick={() => !isSelf && setPendingToggle({ user })}
                            disabled={isSelf}
                            title={
                              isSelf ? 'Cannot change your own status'
                              : user.is_active ? 'Deactivate user' : 'Reactivate user'
                            }
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              user.is_active
                                ? 'text-text-muted hover:bg-[#FFE4E6] hover:text-danger'
                                : 'text-text-muted hover:bg-[#D1FAE5] hover:text-success'
                            }`}
                            aria-label={user.is_active ? 'Deactivate' : 'Reactivate'}
                          >
                            {user.is_active ? <Icons.close size={15} /> : <Icons.check size={15} />}
                          </button>

                          <button
                            onClick={() => canRemove && setPendingRemove({ user })}
                            disabled={!canRemove}
                            title={
                              isSelf ? 'Cannot remove yourself'
                              : user.is_owner && !isCurrentUserOwner ? 'Admins cannot remove the owner'
                              : 'Remove from organization'
                            }
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-[#FFE4E6] hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={`Remove ${user.full_name} from organization`}
                          >
                            <Icons.logout size={15} />
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

      <ConfirmDialog
        isOpen={!!pendingToggle}
        title={
          pendingToggle?.user.is_active
            ? `Deactivate ${pendingToggle?.user.full_name}?`
            : `Reactivate ${pendingToggle?.user.full_name}?`
        }
        message={
          pendingToggle?.user.is_active
            ? 'This will prevent them from logging in. You can reactivate them at any time.'
            : 'They will be able to log in and access the organization again.'
        }
        confirmLabel={pendingToggle?.user.is_active ? 'Deactivate' : 'Reactivate'}
        variant={pendingToggle?.user.is_active ? 'danger' : 'success'}
        isPending={isToggling}
        onConfirm={handleConfirmToggle}
        onCancel={() => setPendingToggle(null)}
      />

      <ConfirmDialog
        isOpen={!!pendingRemove}
        title={`Remove ${pendingRemove?.user.full_name}?`}
        message="They will immediately lose access to all jobs, alerts, and data in this organization. This does not delete their account."
        confirmLabel="Remove"
        variant="danger"
        isPending={isRemoving}
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </>
  )
}
