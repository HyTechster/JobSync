import type { ReactNode } from 'react'

interface AdminTopbarProps {
  title: ReactNode
  subtitle?: string
  right?: ReactNode
  children?: ReactNode
}

export function AdminTopbar({ title, subtitle, right, children }: AdminTopbarProps) {
  return (
    <div className="sticky top-14 md:top-0 z-20 bg-white border-b border-border px-4 py-4 md:px-8 md:py-5">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] md:text-xl font-bold text-text-base tracking-tight leading-none">{title}</h1>
          {subtitle && (
            <p className="text-[12px] md:text-sm text-text-muted mt-1 leading-snug">{subtitle}</p>
          )}
        </div>
        {right && (
          <div className="flex items-center gap-2 flex-shrink-0">{right}</div>
        )}
      </div>
      {children}
    </div>
  )
}
