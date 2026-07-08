import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { TechnicianSidebar } from './TechnicianSidebar'
import { TechnicianMobileHeader } from './TechnicianMobileHeader'
import { TechnicianBottomNav } from './TechnicianBottomNav'
import { OfflineBanner } from '../shared/OfflineBanner'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useOfflineSync } from '../../hooks/useOfflineSync'
import { TourOverlay } from '../../features/tour/TourOverlay'
import { useTourAutoStart } from '../../features/tour/useTourAutoStart'
import { TECHNICIAN_TOUR_STEPS } from '../../features/tour/tourSteps'
import { useOrganization } from '../../context/OrganizationContext'
import { useMyJobs } from '../../features/jobs/hooks'

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

  const { activeOrgId } = useOrganization()
  const { data: jobs, isLoading: jobsLoading } = useMyJobs(activeOrgId)
  const shouldTriggerTour = !jobsLoading && (jobs?.length ?? 0) === 0

  useTourAutoStart('technician', activeOrgId, shouldTriggerTour, TECHNICIAN_TOUR_STEPS)

  return (
    <div className="min-h-screen bg-surface-2">
      <OfflineBanner />

      {/* Mobile-only top header — fixed; shifts down when offline banner visible */}
      <div className="md:hidden">
        <TechnicianMobileHeader />
      </div>

      {/* Desktop: sidebar + content grid | Mobile: single column */}
      {/* pt-14 offsets the fixed mobile header (56px); add 42px more when offline banner shown */}
      <div className="pt-14 md:pt-0 md:grid md:grid-cols-[232px_1fr] md:min-h-screen">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block">
          <TechnicianSidebar />
        </div>

        {/* Main content */}
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

      <TourOverlay />
    </div>
  )
}
