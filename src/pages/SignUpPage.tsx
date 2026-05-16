import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginBrandPanel } from '../features/auth/LoginBrandPanel'
import { SignUpForm } from '../features/auth/SignUpForm'
import { useAuth } from '../features/auth/hooks'
import { useOrganization } from '../context/OrganizationContext'

export default function SignUpPage() {
  const { session, isLoading: isAuthLoading } = useAuth()
  const { memberships, userRole, isLoading: isOrgLoading } = useOrganization()
  const navigate = useNavigate()
  const isLoading = isAuthLoading || isOrgLoading

  useEffect(() => {
    if (isLoading || !session) return
    if (memberships.length === 0) {
      navigate('/dashboard/welcome', { replace: true })
    } else if (memberships.length === 1) {
      navigate(userRole === 'technician' ? '/technician/jobs' : '/admin/dashboard', { replace: true })
    } else {
      navigate('/dashboard/select-organization', { replace: true })
    }
  }, [isLoading, session, memberships, userRole, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <span className="w-8 h-8 border-3 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen md:grid md:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />
      <SignUpForm />
    </main>
  )
}
