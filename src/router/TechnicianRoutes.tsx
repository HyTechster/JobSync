import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useOrganization } from '../context/OrganizationContext'
import { TechnicianShell } from '../components/layout/TechnicianShell'
export function TechnicianRoutes() {
  const session = useAuthStore((s) => s.session)
  const isAuthLoading = useAuthStore((s) => s.isLoading)
  const { userRole, memberships, isLoading: isOrgLoading } = useOrganization()

  const isLoading = isAuthLoading || isOrgLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  if (memberships.length === 0) return <Navigate to="/dashboard/welcome" replace />
  if (!userRole) return <Navigate to="/dashboard/select-organization" replace />
  if (userRole !== 'technician') return <Navigate to="/admin/dashboard" replace />

  return <TechnicianShell />
}
