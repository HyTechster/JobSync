import { Outlet } from 'react-router-dom'
import { TechnicianBottomNav } from './TechnicianBottomNav'
import { OfflineBanner } from '../shared/OfflineBanner'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useOfflineSync } from '../../hooks/useOfflineSync'

export function TechnicianShell() {
  const isOnline = useOnlineStatus()
  useOfflineSync()

  return (
    <div className="min-h-screen bg-surface-2">
      <OfflineBanner />
      <main className={`pb-[60px] transition-[padding-top] duration-150 ${!isOnline ? 'pt-[42px]' : ''}`}>
        <Outlet />
      </main>
      <TechnicianBottomNav />
    </div>
  )
}
