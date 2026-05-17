import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { TechnicianSidebar } from './TechnicianSidebar'
import { TechnicianMobileHeader } from './TechnicianMobileHeader'
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

      {/* Mobile-only top header — shifts down when offline banner is visible */}
      <div className={`md:hidden transition-[padding-top] duration-150 ${!isOnline ? 'pt-[42px]' : ''}`}>
        <TechnicianMobileHeader />
      </div>

      {/* Desktop: sidebar + content grid | Mobile: single column */}
      <div className="md:grid md:grid-cols-[232px_1fr] md:min-h-screen">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block">
          <TechnicianSidebar />
        </div>

        {/* Main content — offline banner pushes content down on mobile */}
        <main
          className={`min-w-0 pb-[60px] md:pb-0 transition-[padding-top] duration-150 ${
            !isOnline ? 'pt-[42px]' : ''
          }`}
        >
          <Suspense fallback={<PageSpinner />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Mobile-only bottom nav */}
      <div className="md:hidden">
        <TechnicianBottomNav />
      </div>
    </div>
  )
}
