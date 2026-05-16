/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminRoutes } from './AdminRoutes'
import { TechnicianRoutes } from './TechnicianRoutes'

const LoginPage         = lazy(() => import('../pages/LoginPage'))
const SignUpPage        = lazy(() => import('../pages/SignUpPage'))
const WelcomePage              = lazy(() => import('../pages/dashboard/WelcomePage'))
const CreateOrganizationPage   = lazy(() => import('../pages/dashboard/CreateOrganizationPage'))
const SelectOrganizationPage   = lazy(() => import('../pages/dashboard/SelectOrganizationPage'))
const AdminDashboard    = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminJobs         = lazy(() => import('../pages/admin/AdminJobs'))
const AdminUsers        = lazy(() => import('../pages/admin/AdminUsers'))
const AdminJobSheets    = lazy(() => import('../pages/admin/AdminJobSheets'))
const AdminAlerts       = lazy(() => import('../pages/admin/AdminAlerts'))
const TechnicianDashboard  = lazy(() => import('../pages/technician/TechnicianDashboard'))
const TechnicianJobs       = lazy(() => import('../pages/technician/TechnicianJobs'))
const TechnicianHistory    = lazy(() => import('../pages/technician/TechnicianHistory'))
const JobDetailPage        = lazy(() => import('../pages/technician/JobDetailPage'))
const SubmitJobSheetPage   = lazy(() => import('../pages/technician/SubmitJobSheetPage'))
const TechnicianAlertsPage = lazy(() => import('../pages/technician/TechnicianAlertsPage'))
const TechnicianProfilePage = lazy(() => import('../pages/technician/TechnicianProfilePage'))

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
    path: '/',
    element: <Navigate to="/login" replace />,
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
    path: '/dashboard',
    children: [
      { index: true, element: <Navigate to="welcome" replace /> },
      { path: 'welcome',              element: wrap(WelcomePage) },
      { path: 'create-organization',  element: wrap(CreateOrganizationPage) },
      { path: 'select-organization',  element: wrap(SelectOrganizationPage) },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoutes />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',  element: wrap(AdminDashboard) },
      { path: 'jobs',       element: wrap(AdminJobs) },
      { path: 'job-sheets', element: wrap(AdminJobSheets) },
      { path: 'users',      element: wrap(AdminUsers) },
      { path: 'alerts',     element: wrap(AdminAlerts) },
    ],
  },
  {
    path: '/technician',
    element: <TechnicianRoutes />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: wrap(TechnicianDashboard) },
      { path: 'jobs',               element: wrap(TechnicianJobs) },
      { path: 'jobs/:jobId',        element: wrap(JobDetailPage) },
      { path: 'jobs/:jobId/submit', element: wrap(SubmitJobSheetPage) },
      { path: 'history',            element: wrap(TechnicianHistory) },
      { path: 'alerts',    element: wrap(TechnicianAlertsPage) },
      { path: 'profile',   element: wrap(TechnicianProfilePage) },
    ],
  },
])
