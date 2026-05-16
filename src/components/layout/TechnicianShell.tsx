import { Outlet } from 'react-router-dom'
import { TechnicianBottomNav } from './TechnicianBottomNav'

export function TechnicianShell() {
  return (
    <div className="min-h-screen bg-surface-2">
      <main className="pb-[60px]">
        <Outlet />
      </main>
      <TechnicianBottomNav />
    </div>
  )
}
