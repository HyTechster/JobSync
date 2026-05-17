import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { TechnicianBottomNav } from './TechnicianBottomNav'
import { OfflineBanner } from '../shared/OfflineBanner'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useOfflineSync } from '../../hooks/useOfflineSync'

function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
    </div>
  )
}

export function TechnicianShell() {
  const isOnline = useOnlineStatus()
  useOfflineSync()

  return (
    <div className="min-h-screen bg-surface-2">
      <OfflineBanner />
      <main className={`pb-[60px] transition-[padding-top] duration-150 ${!isOnline ? 'pt-[42px]' : ''}`}>
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <TechnicianBottomNav />
    </div>
  )
}
