import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { loginSchema, type LoginFormData, useLogin, useGoogleLogin } from './hooks'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Invalid login credentials')) {
      return 'Wrong email or password. Please try again.'
    }
    if (error.message.includes('deactivated')) return error.message
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.'
    }
  }
  return 'Something went wrong. Please try again.'
}

export function LoginForm() {
  const login  = useLogin()
  const google = useGoogleLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (data: LoginFormData) => login.mutate(data)

  return (
    <div className="flex items-center justify-center bg-white min-h-screen md:min-h-0 p-8 md:p-12">
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

        <h2 className="text-2xl font-bold text-text-base tracking-tight">Welcome back</h2>
        <p className="text-sm text-text-muted mt-1.5 mb-7">Sign in to continue to your workspace</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-text-base mb-1.5">
              Email
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

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-xs font-semibold text-text-base block mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              {...register('password')}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-white text-text-base placeholder:text-text-subtle outline-none transition-all focus:border-brand-700 focus:ring-3 focus:ring-brand-700/15"
            />
            {errors.password && (
              <p className="text-xs text-danger mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Error banner */}
          {login.isError && (
            <div className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {getErrorMessage(login.error)}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={login.isPending}
            className="mt-1 h-12 w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {login.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-subtle font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google OAuth */}
        {google.isError && (
          <p className="text-xs text-danger mb-3 text-center">
            Google sign-in failed. Please try again.
          </p>
        )}
        <button
          type="button"
          onClick={() => google.mutate()}
          disabled={google.isPending || login.isPending}
          className="w-full h-11 flex items-center justify-center gap-3 border border-border rounded-lg bg-white hover:bg-surface-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-text-base transition-colors"
        >
          {google.isPending ? (
            <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-sm text-text-muted text-center mt-6">
          New to JobSync?{' '}
          <Link to="/signup" className="text-brand-700 font-semibold hover:text-brand-600">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
