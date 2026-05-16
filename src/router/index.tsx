import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminRoutes } from './AdminRoutes'
import { TechnicianRoutes } from './TechnicianRoutes'

const LoginPage         = lazy(() => import('../pages/LoginPage'))
const AdminDashboard    = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminJobs         = lazy(() => import('../pages/admin/AdminJobs'))
const AdminUsers        = lazy(() => import('../pages/admin/AdminUsers'))
const AdminAlerts       = lazy(() => import('../pages/admin/AdminAlerts'))
const TechnicianJobs    = lazy(() => import('../pages/technician/TechnicianJobs'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2">
      <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
    </div>
  )
}

function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-base">{title}</h1>
      <p className="text-text-muted mt-1 text-sm">This section is being built in an upcoming phase.</p>
    </div>
  )
}

function wrap(Page: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
  },
  {
    path: '/admin',
    element: <AdminRoutes />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',  element: wrap(AdminDashboard) },
      { path: 'jobs',       element: wrap(AdminJobs) },
      { path: 'job-sheets', element: <AdminPlaceholder title="Job Sheets" /> },
      { path: 'users',      element: wrap(AdminUsers) },
      { path: 'alerts',     element: wrap(AdminAlerts) },
    ],
  },
  {
    path: '/technician',
    element: <TechnicianRoutes />,
    children: [
      { index: true, element: <Navigate to="jobs" replace /> },
      { path: 'jobs', element: wrap(TechnicianJobs) },
    ],
  },
])
