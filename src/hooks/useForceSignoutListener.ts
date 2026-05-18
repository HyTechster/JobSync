import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { queryClient } from '../lib/queryClient'
import { getDeviceInfo } from '../features/auth/deviceInfo'

export function useForceSignoutListener() {
  const userId = useAuthStore((s) => s.session?.user.id)
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel(`forced-signout:${userId}`)

    channel
      .on('broadcast', { event: 'sign_out' }, (payload) => {
        // Ignore the broadcast sent by this device itself
        if (payload.payload?.device_info === getDeviceInfo()) return

        clearSession()
        localStorage.removeItem('jobsync_active_org')
        queryClient.clear()
        navigate('/login', { replace: true })
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [userId, clearSession, navigate])
}
