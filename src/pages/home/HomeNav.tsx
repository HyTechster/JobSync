import { Link } from 'react-router-dom'
import { useScrollY } from '../../hooks/useScrollY'

export function HomeNav() {
  const scrolled = useScrollY() > 40

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/icons/jobsync-icon.svg" alt="" width={30} height={30} className="rounded-lg" />
          <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-text-base' : 'text-white'}`}>
            JobSync
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#features"
            className={`text-sm font-medium transition-colors ${scrolled ? 'text-text-muted hover:text-text-base' : 'text-white/80 hover:text-white'}`}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className={`text-sm font-medium transition-colors ${scrolled ? 'text-text-muted hover:text-text-base' : 'text-white/80 hover:text-white'}`}
          >
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/login"
            className={`h-9 px-3.5 md:px-4 rounded-lg text-[13.5px] font-semibold transition-colors duration-300 inline-flex items-center ${
              scrolled ? 'text-text-base hover:bg-surface-2' : 'text-white hover:bg-white/10'
            }`}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className={`h-9 px-3.5 md:px-4 rounded-lg text-[13.5px] font-semibold transition-colors duration-300 inline-flex items-center ${
              scrolled ? 'bg-brand-700 hover:bg-brand-800 text-white' : 'bg-white text-brand-800 hover:bg-slate-100'
            }`}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
