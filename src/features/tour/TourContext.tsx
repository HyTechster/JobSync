import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { TourStep } from './tourSteps'
import { markTourSeen } from './tourStorage'

interface TourContextValue {
  steps: TourStep[]
  stepIndex: number
  isActive: boolean
  currentStep: TourStep | null
  start: (steps: TourStep[], seenKey: string) => void
  next: () => void
  back: () => void
  skip: () => void
  finish: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<TourStep[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [activeSeenKey, setActiveSeenKey] = useState<string | null>(null)

  const start = useCallback((newSteps: TourStep[], seenKey: string) => {
    setSteps(newSteps)
    setStepIndex(0)
    setActiveSeenKey(seenKey)
    setIsActive(true)
  }, [])

  const stop = useCallback(() => {
    if (activeSeenKey) markTourSeen(activeSeenKey)
    setIsActive(false)
    setActiveSeenKey(null)
  }, [activeSeenKey])

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= steps.length) {
        stop()
        return i
      }
      return i + 1
    })
  }, [steps.length, stop])

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1))
  }, [])

  return (
    <TourContext.Provider
      value={{
        steps,
        stepIndex,
        isActive,
        currentStep: isActive ? (steps[stepIndex] ?? null) : null,
        start,
        next,
        back,
        skip: stop,
        finish: stop,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}
