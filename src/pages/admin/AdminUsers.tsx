import { useState, useMemo } from 'react'
import { AdminTopbar } from '../../components/layout/AdminTopbar'
import { Icons } from '../../components/ui/Icons'
import { UsersTable } from '../../features/users/UsersTable'
import { CreateUserModal } from '../../features/users/CreateUserModal'
import { EditUserModal } from '../../features/users/EditUserModal'
import { AddToCompanyModal } from '../../features/users/AddToCompanyModal'
import { useUsers, type UserWithAlertCount } from '../../features/users/hooks'

type RoleFilter = 'all' | 'admin' | 'technician'

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'admin',       label: 'Admins' },
  { value: 'technician',  label: 'Technicians' },
]

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showAddToCompany, setShowAddToCompany] = useState(false)
  const [editUser, setEditUser] = useState<UserWithAlertCount | null>(null)

  const { data: allUsers = [], isLoading, isError, error } = useUsers()

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
        subtitle="Manage staff accounts and access"
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddToCompany(true)}
              className="h-[38px] px-4 rounded-lg border border-slate-200 bg-white text-text-base text-[14px] font-semibold hover:bg-surface-2 transition-colors inline-flex items-center gap-2"
            >
              <Icons.plus size={15} color="currentColor" />
              Add by email
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="h-[38px] px-4 rounded-lg bg-brand-700 text-white text-[14px] font-semibold hover:bg-brand-800 transition-colors inline-flex items-center gap-2"
            >
              <Icons.plus size={15} color="white" />
              Create user
            </button>
          </div>
        }
      >
        <div className="flex items-center gap-2 mt-4 flex-wrap">
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
                className={`inline-flex items-center gap-1.5 px-3 py-[7px] rounded-lg border text-[13px] font-semibold transition-colors ${
                  active
                    ? 'border-brand-700 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-text-base hover:bg-surface-2'
                }`}
              >
                {label}
                <span
                  className={`text-[11px] font-semibold ${
                    active ? 'text-brand-700' : 'text-text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}

          <div className="ml-auto">
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
                className="h-[34px] w-[220px] pl-8 pr-3 border border-slate-200 rounded-lg text-[13px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
              />
            </div>
          </div>
        </div>
      </AdminTopbar>

      <div className="p-8 pb-12">
        {isError ? (
          <div className="text-sm text-danger bg-[#FFE4E6] rounded-lg px-4 py-3">
            Failed to load users: {(error as Error).message}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <UsersTable
              users={filteredUsers}
              isLoading={isLoading}
              onEdit={setEditUser}
            />
          </div>
        )}
      </div>

      <CreateUserModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
      <AddToCompanyModal isOpen={showAddToCompany} onClose={() => setShowAddToCompany(false)} />
    </>
  )
}
