import type { CSSProperties } from 'react'
import type { TourStep } from './tourSteps'

const CARD_WIDTH = 320
const CARD_HEIGHT_ESTIMATE = 210
const MARGIN = 14

interface TourCardProps {
  step: TourStep
  stepIndex: number
  totalSteps: number
  rect: DOMRect | null
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

function computeStyle(rect: DOMRect | null): CSSProperties {
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (!rect) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }

  const fitsBelow = rect.bottom + MARGIN + CARD_HEIGHT_ESTIMATE < vh
  const top = fitsBelow
    ? rect.bottom + MARGIN
    : Math.max(rect.top - MARGIN - CARD_HEIGHT_ESTIMATE, MARGIN)

  const left = Math.min(Math.max(rect.left, MARGIN), vw - CARD_WIDTH - MARGIN)

  return { top, left: Math.max(left, MARGIN) }
}

export function TourCard({ step, stepIndex, totalSteps, rect, onNext, onBack, onSkip }: TourCardProps) {
  const isLast = stepIndex === totalSteps - 1

  return (
    <div
      className="fixed z-[90] w-80 max-w-[calc(100vw-28px)] bg-white rounded-[14px] shadow-[0_24px_60px_rgba(0,0,0,.35)] p-5 transition-all duration-300"
      style={computeStyle(rect)}
    >
      <p className="text-[10.5px] font-bold text-brand-700 uppercase tracking-widest mb-1.5">
        Step {stepIndex + 1} of {totalSteps}
      </p>
      <h3 className="text-[15px] font-bold text-text-base leading-snug mb-1.5">{step.title}</h3>
      <p className="text-[13px] text-text-muted leading-relaxed mb-4">{step.description}</p>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-[12.5px] font-semibold text-text-muted hover:text-text-base transition-colors"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={onBack}
              className="h-8 px-3 rounded-lg border border-slate-200 text-[12.5px] font-semibold text-text-base hover:bg-surface-2 transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="h-8 px-3.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-[12.5px] font-semibold transition-colors"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
