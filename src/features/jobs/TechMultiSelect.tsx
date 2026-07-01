import { useState, useRef, useEffect } from 'react'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'

interface Tech {
  id: string
  full_name: string
  display_name: string | null
  avatar_url: string | null
}

interface TechMultiSelectProps {
  techs: Tech[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export function TechMultiSelect({ techs, selected, onChange }: TechMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  const allSelected = techs.length > 0 && selected.length === techs.length

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  function toggleAll() {
    onChange(allSelected ? [] : techs.map((t) => t.id))
  }

  const selectedTech = selected.length === 1 ? techs.find((t) => t.id === selected[0]) : null
  const label =
    selected.length === 0
      ? 'All technicians'
      : selected.length === 1
      ? (selectedTech?.display_name ?? selectedTech?.full_name ?? '1 technician')
      : `${selected.length} technicians`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-[34px] flex items-center gap-2 px-3 border rounded-lg text-[13px] bg-white outline-none transition-all whitespace-nowrap ${
          open || selected.length > 0
            ? 'border-brand-700 ring-[3px] ring-brand-700/10 text-brand-700'
            : 'border-slate-200 text-text-base hover:border-slate-300'
        }`}
      >
        <Icons.users size={13} color={selected.length > 0 ? 'var(--color-brand-700)' : '#64748B'} />
        <span className={selected.length > 0 ? 'font-semibold' : ''}>{label}</span>
        <svg
          width="10" height="6" viewBox="0 0 10 6" fill="none"
          className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          stroke={selected.length > 0 ? 'var(--color-brand-700)' : '#94A3B8'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[210px] overflow-hidden">
          {/* Select all */}
          <label className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100 cursor-pointer hover:bg-surface-2 transition-colors">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-3.5 h-3.5 accent-brand-700 flex-shrink-0"
            />
            <span className="text-[12.5px] font-semibold text-text-base">All technicians</span>
            {selected.length > 0 && (
              <span className="ml-auto text-[11px] font-semibold text-brand-700">{selected.length} selected</span>
            )}
          </label>

          {/* Individual technicians */}
          <div className="max-h-[220px] overflow-y-auto p-1.5 flex flex-col gap-0.5">
            {techs.length === 0 ? (
              <p className="text-[12px] text-text-muted text-center py-3">No technicians found.</p>
            ) : (
              techs.map((tech) => {
                const checked = selected.includes(tech.id)
                return (
                  <label
                    key={tech.id}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      checked ? 'bg-brand-50' : 'hover:bg-surface-2'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(tech.id)}
                      className="w-3.5 h-3.5 accent-brand-700 flex-shrink-0"
                    />
                    <Avatar name={tech.full_name} size={22} src={tech.avatar_url} />
                    <span className="text-[13px] text-text-base truncate">
                      {tech.display_name ?? tech.full_name}
                    </span>
                  </label>
                )
              })
            )}
          </div>

          {/* Clear button */}
          {selected.length > 0 && (
            <div className="border-t border-slate-100 px-3 py-2">
              <button
                type="button"
                onClick={() => { onChange([]); setOpen(false) }}
                className="text-[12px] font-semibold text-text-muted hover:text-danger transition-colors w-full text-left"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
