import { useState, useMemo } from 'react'
import { AdminTopbar } from '../../components/layout/AdminTopbar'
import { Icons } from '../../components/ui/Icons'
import { UsersTable } from '../../features/users/UsersTable'
import { EditUserModal } from '../../features/users/EditUserModal'
import { AddToCompanyModal } from '../../features/users/AddToCompanyModal'
import {
  useOrgMembers,
  useOrgInvitations,
  useCancelInvitation,
  type UserWithAlertCount,
} from '../../features/users/hooks'
import { useOrganization } from '../../context/OrganizationContext'
import { useAuthStore } from '../../store/authStore'

type RoleFilter = 'all' | 'admin' | 'manager' | 'technician'

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'all',        label: 'All'          },
  { value: 'admin',      label: 'Admins'       },
  { value: 'manager',    label: 'Managers'     },
  { value: 'technician', label: 'Technicians'  },
]

const ROLE_BADGE: Record<string, string> = {
  admin:      'bg-brand-50 text-brand-700',
  manager:    'bg-violet-100 text-violet-700',
  technician: 'bg-emerald-100 text-emerald-700',
}

export default function AdminUsers() {
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>('all')
  const [search, setSearch]             = useState('')
  const [showInvite, setShowInvite]     = useState(false)
  const [editUser, setEditUser]         = useState<UserWithAlertCount | null>(null)

  const { activeOrg, userRole } = useOrganization()
  const currentUserId      = useAuthStore((s) => s.profile?.id)
  const isCurrentUserOwner = !!(activeOrg?.owner_id && activeOrg.owner_id === currentUserId)
  const isManager          = userRole === 'manager'

  const { data: allUsers = [],      isLoading,    isError, error }   = useOrgMembers()
  const { data: invitations = [],   isLoading: isInvLoading }        = useOrgInvitations()
  const cancelInvitation = useCancelInvitation()

  const filteredUsers = useMemo(() => {
    let result = allUsers
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }
    return result
  }, [allUsers, roleFilter, search])

  return (
    <>
      <AdminTopbar
        title="Users"
        subtitle="Members and pending invitations for this organization"
        right={
          !isManager ? (
            <button
              onClick={() => setShowInvite(true)}
              className="h-[34px] md:h-[38px] px-3 md:px-4 rounded-lg bg-brand-700 text-white text-[13px] md:text-[14px] font-semibold hover:bg-brand-800 transition-colors inline-flex items-center gap-1.5"
            >
              <Icons.plus size={14} color="white" />
              <span className="hidden sm:inline">Invite by email</span>
              <span className="sm:hidden">Invite</span>
            </button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-2 mt-3 md:mt-4 md:flex-row md:flex-wrap md:items-center">
          <div className="flex flex-wrap gap-2">
            {ROLE_TABS.map(({ value, label }) => {
              const count =
                value === 'all'
                  ? allUsers.length
                  : allUsers.filter((u) => u.role === value).length
              const active = roleFilter === value
              return (
                <button
                  key={value}
                  onClick={() => setRoleFilter(value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-[6px] rounded-lg border text-[12.5px] md:text-[13px] font-semibold transition-colors ${
                    active
                      ? 'border-brand-700 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-text-base hover:bg-surface-2'
                  }`}
                >
                  {label}
                  <span className={`text-[11px] font-semibold ${active ? 'text-brand-700' : 'text-text-muted'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="md:ml-auto">
            <div className="relative">
              <Icons.search
                size={14}
                color="#64748B"
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="h-[34px] w-full md:w-[220px] pl-8 pr-3 border border-slate-200 rounded-lg text-[13px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
              />
            </div>
          </div>
        </div>
      </AdminTopbar>

      <div className="p-4 pb-4 md:p-8 md:pb-12 flex flex-col gap-6">
        {/* Members table */}
        {isError ? (
          <div className="text-sm text-danger bg-[#FFE4E6] rounded-lg px-4 py-3">
            Failed to load users: {(error as Error).message}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <UsersTable
              users={filteredUsers}
              isLoading={isLoading}
              isCurrentUserOwner={isCurrentUserOwner}
              isManager={isManager}
              onEdit={setEditUser}
            />
          </div>
        )}

        {/* Pending invitations */}
        {(isInvLoading || invitations.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[13.5px] font-semibold text-text-base">Pending invitations</h2>
              {invitations.length > 0 && (
                <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                  {invitations.length}
                </span>
              )}
            </div>

            {isInvLoading ? (
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-text-base truncate">{inv.email}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded capitalize ${ROLE_BADGE[inv.role] ?? 'bg-slate-100 text-slate-600'}`}>
                          {inv.role}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          · Sent {new Date(inv.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelInvitation.mutate(inv.id)}
                      disabled={cancelInvitation.isPending}
                      className="text-[12px] text-text-muted hover:text-danger transition-colors px-2 py-1 rounded hover:bg-red-50 disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditUserModal
        user={editUser}
        isCurrentUserOwner={isCurrentUserOwner}
        onClose={() => setEditUser(null)}
      />
      <AddToCompanyModal
        isOpen={showInvite}
        isCurrentUserOwner={isCurrentUserOwner}
        onClose={() => setShowInvite(false)}
      />
    </>
  )
}
