import type { OrgTechnician } from './hooks'
import { Avatar } from '../../components/ui/Avatar'
import { Icons } from '../../components/ui/Icons'

interface TechnicianPickerProps {
  technicians: OrgTechnician[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function TechnicianPicker({ technicians, selectedIds, onChange }: TechnicianPickerProps) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    )
  }

  if (technicians.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-3">
        No active technicians found.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {technicians.map((tech) => {
        const active = selectedIds.includes(tech.id)
        return (
          <button
            key={tech.id}
            type="button"
            onClick={() => toggle(tech.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] border text-left transition-colors ${
              active
                ? 'border-brand-700 bg-brand-50'
                : 'border-slate-200 bg-white hover:bg-surface-2'
            }`}
          >
            <Avatar name={tech.full_name} size={32} src={tech.avatar_url} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-base truncate">
                {tech.display_name ?? tech.full_name}
              </p>
              {tech.display_name && (
                <p className="text-[11px] text-text-muted truncate">{tech.full_name}</p>
              )}
              <p className="text-[11.5px] text-text-muted mt-0.5 truncate">{tech.email}</p>
            </div>
            {active && <Icons.check size={16} color="#1E3A5F" />}
          </button>
        )
      })}
    </div>
  )
}
