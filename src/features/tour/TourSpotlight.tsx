const PAD = 8
const DIM = 'rgba(15,23,42,0.6)'

interface TourSpotlightProps {
  rect: DOMRect | null
}

/** Full-viewport dim layer with a rounded cutout around the target rect, plus a
 *  glowing ring. With no rect yet (target not mounted), dims the whole screen. */
export function TourSpotlight({ rect }: TourSpotlightProps) {
  if (!rect) {
    return <div className="fixed inset-0 z-[80] pointer-events-none" style={{ background: DIM }} />
  }

  const top = Math.max(rect.top - PAD, 0)
  const left = Math.max(rect.left - PAD, 0)
  const width = rect.width + PAD * 2
  const height = rect.height + PAD * 2
  const bottom = top + height
  const right = left + width

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
      <div className="fixed left-0 right-0" style={{ top: 0, height: top, background: DIM }} />
      <div className="fixed left-0 right-0" style={{ top: bottom, bottom: 0, background: DIM }} />
      <div className="fixed" style={{ top, height, left: 0, width: left, background: DIM }} />
      <div className="fixed" style={{ top, height, left: right, right: 0, background: DIM }} />
      <div
        className="fixed rounded-xl ring-4 ring-brand-700 shadow-[0_0_0_4px_rgba(30,58,95,0.25)] transition-all duration-300"
        style={{ top, left, width, height }}
      />
    </div>
  )
}
