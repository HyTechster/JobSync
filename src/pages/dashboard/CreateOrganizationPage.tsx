import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth, useLogout } from '../../features/auth/hooks'
import { useOrganization } from '../../context/OrganizationContext'
import { useCreateOrganization } from '../../features/organizations/hooks'

const schema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
})

type FormData = z.infer<typeof schema>

export default function CreateOrganizationPage() {
  const { session, isLoading: isAuthLoading } = useAuth()
  const { refreshMemberships } = useOrganization()
  const logout = useLogout()
  const navigate = useNavigate()
  const createOrg = useCreateOrganization()

  useEffect(() => {
    if (!isAuthLoading && !session) navigate('/login', { replace: true })
  }, [isAuthLoading, session, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    createOrg.mutate(data, {
      onSuccess: () => {
        refreshMemberships()
        navigate('/admin/dashboard', { replace: true })
      },
    })
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surface-2 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E3A5F" />
          <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
        </svg>
        <span className="text-xl font-bold text-text-base tracking-tight">JobSync</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm w-full max-w-md p-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-base mb-6 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-xl font-bold text-text-base mb-1">Create your organization</h1>
        <p className="text-sm text-text-muted mb-7 leading-relaxed">
          This is your company workspace. You can invite team members after setup.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="org-name" className="block text-xs font-semibold text-text-base mb-1.5">
              Organization name
            </label>
            <input
              id="org-name"
              type="text"
              autoComplete="organization"
              placeholder="Syarikat ABC Sdn Bhd"
              {...register('name')}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-3 focus:ring-brand-700/15"
            />
            {errors.name && (
              <p className="text-xs text-danger mt-1">{errors.name.message}</p>
            )}
          </div>

          {createOrg.isError && (
            <div className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {createOrg.error instanceof Error ? createOrg.error.message : 'Something went wrong.'}
            </div>
          )}

          <button
            type="submit"
            disabled={createOrg.isPending}
            className="h-12 w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {createOrg.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create organization'
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-6 w-full h-9 flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text-base transition-colors"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
