import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

function isChunkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed') ||
    error.name === 'ChunkLoadError'
  )
}

export function RootErrorBoundary() {
  const error = useRouteError()

  if (isChunkError(error)) {
    const flag = 'jb_chunk_reload'
    if (!sessionStorage.getItem(flag)) {
      sessionStorage.setItem(flag, '1')
      window.location.reload()
      return null
    }
    sessionStorage.removeItem(flag)
  }

  const is404 = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2 px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-base">
            {is404 ? 'Page not found' : 'Something went wrong'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {is404
              ? "The page you're looking for doesn't exist."
              : 'A new version of JobSync may have been deployed. Try refreshing.'}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-9 px-5 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Refresh page
          </button>
          <Link
            to="/login"
            className="h-9 px-5 border border-border hover:bg-surface-2 text-text-base text-sm font-semibold rounded-lg transition-colors flex items-center justify-center"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
