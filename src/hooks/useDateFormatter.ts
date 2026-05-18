import { useAuthStore } from '../store/authStore'
import { parsePreferences } from '../features/account/hooks'
import { formatDate, formatDateTime } from '../utils/formatters'

export function useDateFormatter() {
  const profile = useAuthStore((s) => s.profile)
  const fmt = parsePreferences(profile?.preferences).date_format
  return {
    fmtDate:     (iso: string) => formatDate(iso, fmt),
    fmtDateTime: (iso: string) => formatDateTime(iso, fmt),
  }
}
