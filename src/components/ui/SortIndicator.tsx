import type { SortDir } from '../../hooks/useSort'

export function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-[2px] align-middle">
      <svg width="6" height="4" viewBox="0 0 6 4" fill={active && dir === 'asc' ? 'var(--color-brand-700)' : '#CBD5E1'}>
        <path d="M3 0L6 4H0Z" />
      </svg>
      <svg width="6" height="4" viewBox="0 0 6 4" fill={active && dir === 'desc' ? 'var(--color-brand-700)' : '#CBD5E1'}>
        <path d="M3 4L0 0H6Z" />
      </svg>
    </span>
  )
}

interface SortableThProps {
  label: string
  sortable?: boolean
  active: boolean
  dir: SortDir
  onClick?: () => void
}

/** Column header for a sortable table, matching the pattern established in JobsTable. */
export function SortableTh({ label, sortable = true, active, dir, onClick }: SortableThProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-[11px] font-semibold tracking-wide uppercase border-b border-slate-200 whitespace-nowrap ${
        sortable ? 'cursor-pointer select-none hover:text-text-base transition-colors' : ''
      }`}
      onClick={sortable ? onClick : undefined}
    >
      {label}
      {sortable && <SortIndicator active={active} dir={dir} />}
    </th>
  )
}
