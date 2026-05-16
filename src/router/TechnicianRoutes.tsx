import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { TechnicianShell } from '../components/layout/TechnicianShell'

export function TechnicianRoutes() {
  const { session, role, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  if (role !== 'technician') return <Navigate to="/admin/dashboard" replace />

  return <TechnicianShell />
}
