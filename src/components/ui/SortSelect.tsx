import type { SortDir } from '../../hooks/useSort'
import { Icons } from './Icons'

export interface SortSelectOption<K extends string> {
  key: K
  dir: SortDir
  label: string
}

interface SortSelectProps<K extends string> {
  options: SortSelectOption<K>[]
  sortKey: K | null
  sortDir: SortDir
  onChange: (key: K, dir: SortDir) => void
  className?: string
}

/** "Sort by" dropdown for card-only lists that have no clickable table header
 *  to sort by (mobile card lists, or pages without a desktop table at all). */
export function SortSelect<K extends string>({ options, sortKey, sortDir, onChange, className = '' }: SortSelectProps<K>) {
  const value = sortKey ? `${sortKey}:${sortDir}` : options[0] ? `${options[0].key}:${options[0].dir}` : ''

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Icons.filter size={13} color="#64748B" className="absolute left-2.5 pointer-events-none" />
      <select
        aria-label="Sort by"
        value={value}
        onChange={(e) => {
          const [key, dir] = e.target.value.split(':') as [K, SortDir]
          onChange(key, dir)
        }}
        className="h-[34px] pl-7 pr-7 border border-slate-200 rounded-lg text-[12.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all appearance-none"
      >
        {options.map((o) => (
          <option key={`${o.key}:${o.dir}`} value={`${o.key}:${o.dir}`}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
