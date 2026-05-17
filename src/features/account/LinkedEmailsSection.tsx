import { useState } from 'react'
import { useAuth } from '../auth/hooks'
import { useLinkedEmails, useAddLinkedEmail, useRemoveLinkedEmail } from './hooks'

export function LinkedEmailsSection() {
  const { session } = useAuth()
  const { data: linkedEmails = [], isLoading } = useLinkedEmails()
  const addEmail = useAddLinkedEmail()
  const removeEmail = useRemoveLinkedEmail()

  const [email, setEmail] = useState('')
  const [label, setLabel] = useState('')
  const [showForm, setShowForm] = useState(false)

  const primaryEmail = session?.user.email ?? ''

  function handleAdd() {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) return
    addEmail.mutate(
      { email: trimmed, label: label.trim() || undefined },
      {
        onSuccess: () => { setEmail(''); setLabel(''); setShowForm(false) },
      }
    )
  }

  return (
    <section className="bg-white border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text-base">Email addresses</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Associate additional emails with your account
        </p>
      </div>

      <div className="px-6 py-4 flex flex-col gap-2">
        {/* Primary email */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-surface-2 rounded-lg">
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="text-sm text-text-base">{primaryEmail}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">Primary</span>
        </div>

        {/* Linked emails */}
        {isLoading ? (
          <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          linkedEmails.map((le) => (
            <div key={le.id} className="flex items-center justify-between py-2.5 px-3 border border-border rounded-lg group">
              <div className="flex items-center gap-2.5 min-w-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="text-sm text-text-base truncate">{le.email}</span>
                {le.label && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-text-muted flex-shrink-0">
                    {le.label}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeEmail.mutate(le.id)}
                disabled={removeEmail.isPending}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-danger hover:bg-red-50 transition-all flex-shrink-0"
                aria-label="Remove email"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))
        )}

        {/* Add email form */}
        {showForm ? (
          <div className="border border-border rounded-lg p-3 flex flex-col gap-2 mt-1">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-border rounded-lg outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
            />
            <input
              type="text"
              placeholder="Label (optional) — e.g. Work, Google"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-border rounded-lg outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
            />
            {addEmail.isError && (
              <p className="text-xs text-danger">
                {addEmail.error instanceof Error ? addEmail.error.message : 'Failed to add email'}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!email.trim() || addEmail.isPending}
                className="h-8 px-4 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {addEmail.isPending && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Add email
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEmail(''); setLabel('') }}
                className="h-8 px-4 border border-border text-text-muted text-xs font-semibold rounded-lg hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-600 py-1 transition-colors mt-1"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add email address
          </button>
        )}
      </div>
    </section>
  )
}
