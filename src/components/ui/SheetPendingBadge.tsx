import { Icons } from './Icons'

/** Flags a completed job that has no job sheet submitted yet. Shared across the
 *  admin jobs table, dashboards, and history views so the wording stays consistent. */
export function SheetPendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5 whitespace-nowrap">
      <Icons.warning size={10} />
      Sheet Pending
    </span>
  )
}
