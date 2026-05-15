import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'

export function AdminShell() {
  return (
    <div className="grid grid-cols-[232px_1fr] min-h-screen bg-surface-2">
      <AdminSidebar />
      <main className="min-w-0 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
