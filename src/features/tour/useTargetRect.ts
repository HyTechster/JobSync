import { useState, useEffect } from 'react'

function getVisibleTarget(target: string): Element | null {
  const els = document.querySelectorAll(`[data-tour="${target}"]`)
  for (const el of els) {
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return el
  }
  return null
}

/** Tracks the bounding rect of the currently-visible element matching a data-tour
 *  attribute. Desktop and mobile layouts both render the same data-tour markers
 *  simultaneously (one hidden via Tailwind responsive classes), so this filters
 *  for whichever one actually has a non-zero rendered size. Polls briefly after
 *  the target changes to allow for route transitions to mount the element. */
export function useTargetRect(target: string | null): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRect(null)
      return
    }

    let cancelled = false
    let pollId: number | undefined
    let attempts = 0

    function measure(): Element | null {
      const el = getVisibleTarget(target as string)
      if (!cancelled) setRect(el ? el.getBoundingClientRect() : null)
      return el
    }

    function poll() {
      const el = measure()
      attempts += 1
      if (!el && attempts < 40 && !cancelled) {
        pollId = window.setTimeout(poll, 50)
      }
    }
    poll()

    function onReflow() {
      measure()
    }
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)

    return () => {
      cancelled = true
      if (pollId) window.clearTimeout(pollId)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [target])

  return rect
}
