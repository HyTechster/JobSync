import { useEffect, useRef } from 'react'
import { useTour } from './TourContext'
import { hasSeenTour } from './tourStorage'
import type { TourStep } from './tourSteps'

export function useTourAutoStart(
  role: 'admin' | 'technician',
  orgId: string | null,
  shouldTrigger: boolean,
  steps: TourStep[],
) {
  const { start, isActive } = useTour()
  const triggeredForOrg = useRef<string | null>(null)

  useEffect(() => {
    if (!orgId || !shouldTrigger || isActive) return
    if (triggeredForOrg.current === orgId) return

    const seenKey = `${orgId}_${role}`
    if (hasSeenTour(seenKey)) {
      triggeredForOrg.current = orgId
      return
    }

    triggeredForOrg.current = orgId
    start(steps, seenKey)
  }, [orgId, role, shouldTrigger, isActive, steps, start])
}
