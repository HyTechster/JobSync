import type { ReactNode } from 'react'
import { SkeletonBlock } from './SkeletonBlock'

interface StatCardProps {
  label: string
  value: number
  icon: ReactNode
  accent: string
}

export function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-text-muted tracking-tight">{label}</span>
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}1A`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3.5 text-3xl font-bold text-text-base tracking-tight">{value}</div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <SkeletonBlock className="h-3.5 w-24" />
        <SkeletonBlock className="w-8 h-8 rounded-lg" />
      </div>
      <SkeletonBlock className="mt-4 h-8 w-16" />
    </div>
  )
}
