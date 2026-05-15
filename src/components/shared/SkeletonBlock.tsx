interface SkeletonBlockProps {
  className?: string
}

export function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <div className={`animate-pulse bg-surface-3 rounded ${className}`} />
}
