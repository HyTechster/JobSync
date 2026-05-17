import { Outlet } from 'react-router-dom'
import { Suspense, Component, type ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminMobileHeader } from './AdminMobileHeader'
import { AdminBottomNav } from './AdminBottomNav'

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
  return (
    <div className="min-h-screen bg-surface-2">
      {/* Mobile-only top header */}
      <div className="md:hidden">
        <AdminMobileHeader />
      </div>

      {/* Desktop: sidebar + content grid | Mobile: single column */}
      <div className="md:grid md:grid-cols-[232px_1fr] md:min-h-screen">
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
    </div>
  )
}
