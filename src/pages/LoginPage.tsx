import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginBrandPanel } from '../features/auth/LoginBrandPanel'
import { LoginForm } from '../features/auth/LoginForm'
import { useAuth } from '../features/auth/hooks'

export default function LoginPage() {
  const { session, role, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && session && role) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/technician/jobs', { replace: true })
    }
  }, [session, role, isLoading, navigate])

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
      <LoginForm />
    </main>
  )
}
