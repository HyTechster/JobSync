import { Outlet } from 'react-router-dom'
import { Suspense, Component, type ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminMobileHeader } from './AdminMobileHeader'
import { AdminBottomNav } from './AdminBottomNav'
import { TourOverlay } from '../../features/tour/TourOverlay'
import { useTourAutoStart } from '../../features/tour/useTourAutoStart'
import { ADMIN_TOUR_STEPS } from '../../features/tour/tourSteps'
import { useOrganization } from '../../context/OrganizationContext'
import { useDashboardStats } from '../../features/jobs/hooks'

interface ErrorBoundaryState { error: Error | null }

class PageErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm font-semibold text-danger">Failed to load page</p>
          <p className="text-xs text-text-muted max-w-sm">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="h-9 px-4 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px]">
      <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
    </div>
  )
}

export function AdminShell() {
  const { activeOrgId } = useOrganization()
  const { data: stats, isLoading: statsLoading } = useDashboardStats(activeOrgId)
  const shouldTriggerTour = !statsLoading && stats?.total === 0 && stats?.technicians === 0

  useTourAutoStart('admin', activeOrgId, shouldTriggerTour, ADMIN_TOUR_STEPS)

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Mobile-only top header */}
      <div className="md:hidden">
        <AdminMobileHeader />
      </div>

      {/* Desktop: sidebar + content grid | Mobile: single column */}
      {/* pt-14 offsets the fixed mobile header on mobile; desktop uses sidebar so no offset needed */}
      <div className="pt-14 md:pt-0 md:grid md:grid-cols-[232px_1fr] md:min-h-screen">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Main content — leave bottom room for mobile nav */}
        <main className="min-w-0 flex flex-col pb-16 md:pb-0">
          <PageErrorBoundary>
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </PageErrorBoundary>
        </main>
      </div>

      {/* Mobile-only bottom nav */}
      <div className="md:hidden">
        <AdminBottomNav />
      </div>

      <TourOverlay />
    </div>
  )
}
