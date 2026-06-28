import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { syncPendingJobSheets, syncPendingFullSheets } from '../offline/sync'

export function useOfflineSync() {
  const qc = useQueryClient()

  useEffect(() => {
    async function handleOnline() {
      await Promise.all([syncPendingJobSheets(), syncPendingFullSheets()])
      void qc.invalidateQueries({ queryKey: ['job-sheets'] })
      void qc.invalidateQueries({ queryKey: ['my-jobs'] })
      void qc.invalidateQueries({ queryKey: ['my-completed-jobs'] })
      void qc.invalidateQueries({ queryKey: ['next-sheet-id'] })
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [qc])
}
