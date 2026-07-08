import { useEffect, useState } from 'react'

/** Current vertical scroll offset of the window, updated on scroll via a passive listener. */
export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrollY
}
