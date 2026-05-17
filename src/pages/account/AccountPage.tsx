import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks'
import { ProfileTab } from '../../features/account/ProfileTab'
import { SecurityTab } from '../../features/account/SecurityTab'
import { SettingsTab } from '../../features/account/SettingsTab'

type Tab = 'profile' | 'security' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile',  label: 'Profile'  },
  { id: 'security', label: 'Security' },
  { id: 'settings', label: 'Settings' },
]

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const cls = size === 'sm'
    ? 'w-8 h-8 text-xs'
    : 'w-10 h-10 text-sm'
  return (
    <div className={`${cls} rounded-full bg-brand-700 text-white font-bold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function AccountPage() {
  const { session, profile, isLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  useEffect(() => {
    if (!isLoading && !session) navigate('/login', { replace: true })
  }, [isLoading, session, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-2">
        <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-700 rounded-full animate-spin" />
      </div>
    )
  }

  const displayName = profile?.full_name ?? 'Account'

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-text-base transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E3A5F" />
              <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
            </svg>
            <span className="text-sm font-bold text-text-base">Account settings</span>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-text-base leading-none">{displayName}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{profile?.email}</p>
            </div>
            <Avatar name={displayName} size="sm" />
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-3xl mx-auto px-6 flex gap-1 border-t border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-brand-700 text-brand-700'
                  : 'border-transparent text-text-muted hover:text-text-base'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {activeTab === 'profile'  && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}
