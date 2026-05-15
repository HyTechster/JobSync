import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminRoutes } from './AdminRoutes'
import { TechnicianRoutes } from './TechnicianRoutes'

const LoginPage = lazy(() => import('../pages/LoginPage'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const TechnicianJobs = lazy(() => import('../pages/technician/TechnicianJobs'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2">
      <span className="w-8 h-8 border-3 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: <AdminRoutes />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/technician',
    element: <TechnicianRoutes />,
    children: [
      { index: true, element: <Navigate to="jobs" replace /> },
      {
        path: 'jobs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TechnicianJobs />
          </Suspense>
        ),
      },
    ],
  },
])
