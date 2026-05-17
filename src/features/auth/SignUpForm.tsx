import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { signUpSchema, type SignUpFormData, useSignUp } from './hooks'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('email already')) {
      return 'An account with this email already exists. Try signing in instead.'
    }
    if (msg.includes('password')) {
      return 'Password does not meet requirements (minimum 8 characters).'
    }
    return error.message
  }
  return 'Sign up failed. Please try again.'
}

export function SignUpForm() {
  const signUp = useSignUp()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) })

  const onSubmit = (data: SignUpFormData) => signUp.mutate(data)

  if (signUp.data?.needsEmailConfirmation) {
    return (
      <div className="flex items-center justify-center bg-white min-h-screen md:min-h-0 p-8 md:p-12">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-base mb-2">Check your email</h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            We sent a confirmation link to your email. Click it to activate your account, then sign in.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-600">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center bg-white min-h-screen md:min-h-0 p-8 md:p-12 overflow-y-auto">
      <div className="w-full max-w-sm">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 md:hidden">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E3A5F" />
            <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
          </svg>
          <span className="text-lg font-bold text-text-base tracking-tight">JobSync</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-7">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-[12px] font-semibold text-brand-700">Account</span>
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full border-2 border-slate-200 text-slate-400 text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-[12px] font-medium text-text-muted">Preferences</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text-base tracking-tight">Create your account</h2>
        <p className="text-sm text-text-muted mt-1.5 mb-7">
          Join JobSync and get your team organised
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-text-base mb-1.5">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Ahmad bin Abdullah"
              {...register('fullName')}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-3 focus:ring-brand-700/15"
            />
            {errors.fullName && (
              <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-text-base mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...register('email')}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-3 focus:ring-brand-700/15"
            />
            {errors.email && (
              <p className="text-xs text-danger mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-text-base mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register('password')}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-3 focus:ring-brand-700/15"
            />
            {errors.password && (
              <p className="text-xs text-danger mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-text-base mb-1.5">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              {...register('confirmPassword')}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-3 focus:ring-brand-700/15"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {signUp.isError && (
            <div className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {getErrorMessage(signUp.error)}
            </div>
          )}

          <button
            type="submit"
            disabled={signUp.isPending}
            className="mt-1 h-12 w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {signUp.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="text-sm text-text-muted text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 font-semibold hover:text-brand-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
