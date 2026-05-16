import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { syncPendingJobSheets } from '../offline/sync'

export function useOfflineSync() {
  const qc = useQueryClient()

  useEffect(() => {
    async function handleOnline() {
      await syncPendingJobSheets()
      void qc.invalidateQueries({ queryKey: ['job-sheets'] })
      void qc.invalidateQueries({ queryKey: ['my-jobs'] })
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [qc])
}
