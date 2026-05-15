import type { ReactNode } from 'react'

interface AdminTopbarProps {
  title: ReactNode
  subtitle?: string
  right?: ReactNode
  children?: ReactNode
}

export function AdminTopbar({ title, subtitle, right, children }: AdminTopbarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-border px-8 py-5">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text-base tracking-tight leading-none">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
        {right && (
          <div className="flex items-center gap-2.5 flex-shrink-0">{right}</div>
        )}
      </div>
      {children}
    </div>
  )
}
