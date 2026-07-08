import { Link } from 'react-router-dom'

export function HomeFooter() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img src="/icons/jobsync-icon.svg" alt="" width={24} height={24} className="rounded-md" />
          <div>
            <span className="text-sm font-bold text-text-base">JobSync</span>
            <span className="text-xs text-text-muted ml-2">Built for service businesses that move</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/login" className="text-[13px] font-medium text-text-muted hover:text-text-base transition-colors">
            Log in
          </Link>
          <Link to="/signup" className="text-[13px] font-medium text-text-muted hover:text-text-base transition-colors">
            Sign up
          </Link>
          <span className="text-[12px] text-text-subtle">© {new Date().getFullYear()} JobSync</span>
        </div>
      </div>
    </footer>
  )
}
