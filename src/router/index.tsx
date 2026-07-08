/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AdminRoutes } from './AdminRoutes'
import { TechnicianRoutes } from './TechnicianRoutes'
import { RootErrorBoundary } from '../components/shared/RootErrorBoundary'

// Admin pages — eagerly imported so navigation never suspends inside startTransition
import AdminDashboard        from '../pages/admin/AdminDashboard'
import AdminJobs             from '../pages/admin/AdminJobs'
import AdminHistory          from '../pages/admin/AdminHistory'
import AdminJobSheets        from '../pages/admin/AdminJobSheets'
import AdminUsers            from '../pages/admin/AdminUsers'
import AdminAlerts           from '../pages/admin/AdminAlerts'
import AdminProfile          from '../pages/admin/AdminProfile'

// Technician pages — eagerly imported
import TechnicianDashboard   from '../pages/technician/TechnicianDashboard'
import TechnicianJobs        from '../pages/technician/TechnicianJobs'
import JobDetailPage         from '../pages/technician/JobDetailPage'
import SubmitJobSheetPage    from '../pages/technician/SubmitJobSheetPage'
import TechnicianHistory     from '../pages/technician/TechnicianHistory'
import TechnicianJobSheets   from '../pages/technician/TechnicianJobSheets'
import TechnicianAlertsPage  from '../pages/technician/TechnicianAlertsPage'
import TechnicianProfilePage from '../pages/technician/TechnicianProfilePage'

// Auth + dashboard pages — lazy, each has its own Suspense (no shell)
const HomePage                = lazy(() => import('../pages/home/HomePage'))
const LoginPage               = lazy(() => import('../pages/LoginPage'))
const SignUpPage             = lazy(() => import('../pages/SignUpPage'))
const AuthCallbackPage       = lazy(() => import('../pages/AuthCallbackPage'))
const WelcomePage            = lazy(() => import('../pages/dashboard/WelcomePage'))
const AdditionalInfoPage     = lazy(() => import('../pages/dashboard/AdditionalInfoPage'))
const CreateOrganizationPage = lazy(() => import('../pages/dashboard/CreateOrganizationPage'))
const SelectOrganizationPage = lazy(() => import('../pages/dashboard/SelectOrganizationPage'))
const AccountPage            = lazy(() => import('../pages/account/AccountPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2">
      <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
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
    // Pathless layout route — catches errors from every child route, including
    // "Failed to fetch dynamically imported module" after a new Vercel deploy.
    element: <Outlet />,
    errorElement: <RootErrorBoundary />,
    children: [
  {
    path: '/',
    element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense>,
  },
  {
    path: '/login',
    element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>,
  },
  {
    path: '/signup',
    element: <Suspense fallback={<PageLoader />}><SignUpPage /></Suspense>,
  },
  {
    path: '/auth/callback',
    element: <Suspense fallback={<PageLoader />}><AuthCallbackPage /></Suspense>,
  },
  {
    path: '/dashboard',
    children: [
      { index: true, element: <Navigate to="welcome" replace /> },
      { path: 'welcome',             element: wrap(WelcomePage) },
      { path: 'additional-info',     element: wrap(AdditionalInfoPage) },
      { path: 'create-organization', element: wrap(CreateOrganizationPage) },
      { path: 'select-organization', element: wrap(SelectOrganizationPage) },
    ],
  },
  {
    path: '/account',
    element: <Suspense fallback={<PageLoader />}><AccountPage /></Suspense>,
  },
  {
    path: '/admin',
    element: <AdminRoutes />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',  element: <AdminDashboard /> },
      { path: 'jobs',       element: <AdminJobs /> },
      { path: 'history',    element: <AdminHistory /> },
      { path: 'job-sheets', element: <AdminJobSheets /> },
      { path: 'users',      element: <AdminUsers /> },
      { path: 'alerts',     element: <AdminAlerts /> },
      { path: 'profile',    element: <AdminProfile /> },
    ],
  },
  {
    path: '/technician',
    element: <TechnicianRoutes />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',          element: <TechnicianDashboard /> },
      { path: 'jobs',               element: <TechnicianJobs /> },
      { path: 'jobs/:jobId',        element: <JobDetailPage /> },
      { path: 'jobs/:jobId/submit',  element: <SubmitJobSheetPage /> },
      { path: 'job-sheets/new',      element: <SubmitJobSheetPage /> },
      { path: 'history',             element: <TechnicianHistory /> },
      { path: 'job-sheets',         element: <TechnicianJobSheets /> },
      { path: 'alerts',             element: <TechnicianAlertsPage /> },
      { path: 'profile',            element: <TechnicianProfilePage /> },
    ],
  },
  ], // end children of pathless error-boundary wrapper
  },
])
