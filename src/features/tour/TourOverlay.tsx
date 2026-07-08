import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTour } from './TourContext'
import { useTargetRect } from './useTargetRect'
import { TourSpotlight } from './TourSpotlight'
import { TourCard } from './TourCard'

export function TourOverlay() {
  const { isActive, currentStep, steps, stepIndex, next, back, skip } = useTour()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const rect = useTargetRect(isActive ? (currentStep?.target ?? null) : null)

  useEffect(() => {
    if (isActive && currentStep && pathname !== currentStep.path) {
      navigate(currentStep.path)
    }
  }, [isActive, currentStep, pathname, navigate])

  useEffect(() => {
    if (!isActive) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isActive])

  if (!isActive || !currentStep) return null

  return (
    <>
      <TourSpotlight rect={rect} />
      <TourCard
        step={currentStep}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        rect={rect}
        onNext={next}
        onBack={back}
        onSkip={skip}
      />
    </>
  )
}
