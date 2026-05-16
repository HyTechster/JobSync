import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { Icons } from '../ui/Icons'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[100] bg-[#1C1917] px-4 py-3 flex items-center gap-2.5"
    >
      <Icons.wifiOff size={14} color="white" />
      <p className="text-[12.5px] font-medium text-white flex-1 leading-snug">
        You're offline — changes will sync when reconnected.
      </p>
    </div>
  )
}
