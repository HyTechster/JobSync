import type { CSSProperties } from 'react'

interface AvatarProps {
  name: string
  size?: number
  src?: string | null
  className?: string
}

const PALETTE = [
  '#0D9488', '#4F46E5', '#DB2777', '#D97706',
  '#0284C7', '#7C3AED', '#059669', '#DC2626',
]

function hashName(name: string): number {
  return [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
}

export function Avatar({ name, size = 28, src, className }: AvatarProps) {
  const initials = (name || '?')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const bg = PALETTE[hashName(name || '?') % PALETTE.length]

  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '999px',
    fontSize: size * 0.38,
    flexShrink: 0,
    letterSpacing: '-0.02em',
    ...(src
      ? { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: bg }),
  }

  return (
    <div
      className={`inline-flex items-center justify-center font-semibold text-white ${className ?? ''}`}
      style={style}
      aria-label={name}
    >
      {!src && initials}
    </div>
  )
}
