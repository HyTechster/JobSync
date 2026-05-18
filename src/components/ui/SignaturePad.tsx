import { useRef, useEffect, useState, useId } from 'react'
import { Icons } from './Icons'

interface SignaturePadProps {
  label: string
  required?: boolean
  error?: string
  onChange: (dataUrl: string | null) => void
}

export function SignaturePad({ label, required, error, onChange }: SignaturePadProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const isDrawing     = useRef(false)
  const [hasContent, setHasContent] = useState(false)
  const [mode, setMode] = useState<'draw' | 'upload'>('draw')
  const inputId = useId()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#1E3A5F'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getXY(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = canvasRef.current!.width / rect.width
    const scaleY = canvasRef.current!.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    isDrawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getXY(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    canvasRef.current!.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const { x, y } = getXY(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function onPointerUp() {
    if (!isDrawing.current) return
    isDrawing.current = false
    setHasContent(true)
    onChange(canvasRef.current!.toDataURL('image/png'))
  }

  function clearCanvas() {
    const canvas = canvasRef.current!
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasContent(false)
    onChange(null)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setHasContent(true)
      onChange(reader.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function switchMode(next: 'draw' | 'upload') {
    setMode(next)
    if (hasContent) {
      clearCanvas()
      setHasContent(false)
      onChange(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12.5px] font-semibold text-text-muted">
          {label} {required && <span className="text-danger">*</span>}
        </p>
        <div className="flex rounded-lg overflow-hidden border border-slate-200 text-[11px] font-semibold">
          {(['draw', 'upload'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`px-2.5 py-1 transition-colors capitalize ${
                mode === m ? 'bg-brand-700 text-white' : 'text-text-muted hover:bg-surface-2'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'draw' ? (
        <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <canvas
            ref={canvasRef}
            width={680}
            height={200}
            className="w-full h-[100px] touch-none cursor-crosshair"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          {!hasContent && (
            <p className="absolute inset-0 flex items-center justify-center text-[12px] text-slate-400 pointer-events-none">
              Sign here
            </p>
          )}
          {hasContent && (
            <button
              type="button"
              onClick={clearCanvas}
              className="absolute top-2 right-2 h-6 px-2 rounded-md bg-white border border-slate-200 text-[10.5px] font-semibold text-text-muted hover:text-danger transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center h-[100px] border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-brand-700 transition-colors bg-slate-50"
        >
          {hasContent ? (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <Icons.check size={14} color="#059669" />
              <p className="text-[12px] font-medium">Image uploaded</p>
            </div>
          ) : (
            <>
              <Icons.camera size={20} color="#94A3B8" />
              <p className="text-[12px] text-text-muted mt-1">Upload signature image</p>
            </>
          )}
          <input id={inputId} type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
        </label>
      )}

      {error && <p className="text-[11.5px] text-danger mt-1">{error}</p>}
    </div>
  )
}
