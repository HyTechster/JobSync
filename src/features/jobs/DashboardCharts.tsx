import type { JobAnalyticsData } from './hooks'

// ─── Donut Chart ─────────────────────────────────────────────────────────────

const STATUS_SEGMENTS = [
  { key: 'pending',     label: 'Pending',    color: '#94A3B8' },
  { key: 'in_progress', label: 'Active',     color: '#3B82F6' },
  { key: 'completed',   label: 'Completed',  color: '#10B981' },
  { key: 'cancelled',   label: 'Cancelled',  color: '#F43F5E' },
] as const

export function StatusDonut({ data }: { data: JobAnalyticsData['byStatus'] }) {
  const R = 42
  const CX = 55
  const CY = 55
  const CIRC = 2 * Math.PI * R
  const total = Object.values(data).reduce((s, v) => s + v, 0)

  const segments = STATUS_SEGMENTS.map((s) => ({
    ...s,
    value: data[s.key],
  }))

  let cumDash = 0
  const arcs = segments.map((s) => {
    const pct = total > 0 ? s.value / total : 0
    const dash = CIRC * pct
    const offset = CIRC * 0.25 - cumDash
    cumDash += dash
    return { ...s, dash, offset }
  })

  return (
    <div className="flex items-center gap-4">
      <svg width="110" height="110" viewBox="0 0 110 110" className="flex-shrink-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F1F5F9" strokeWidth="16" />
        {total > 0 && arcs.map((arc) =>
          arc.dash > 0 ? (
            <circle
              key={arc.key}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth="16"
              strokeDasharray={`${arc.dash} ${CIRC - arc.dash}`}
              strokeDashoffset={arc.offset}
            />
          ) : null
        )}
        <text x={CX} y={CY - 6} textAnchor="middle" style={{ fontSize: 20, fontWeight: 700, fill: '#0F172A' }}>{total}</text>
        <text x={CX} y={CY + 10} textAnchor="middle" style={{ fontSize: 8.5, fill: '#64748B', letterSpacing: 1 }}>TOTAL</text>
      </svg>

      <div className="flex flex-col gap-1.5 min-w-0">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[11.5px] text-text-muted flex-1">{s.label}</span>
            <span className="text-[12px] font-bold text-text-base">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Priority Bars ────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = [
  { key: 'urgent', label: 'Urgent', barCls: 'bg-red-500',    textCls: 'text-red-700 bg-red-50' },
  { key: 'high',   label: 'High',   barCls: 'bg-orange-400', textCls: 'text-orange-700 bg-orange-50' },
  { key: 'medium', label: 'Medium', barCls: 'bg-amber-400',  textCls: 'text-amber-700 bg-amber-50' },
  { key: 'low',    label: 'Low',    barCls: 'bg-emerald-400', textCls: 'text-emerald-700 bg-emerald-50' },
] as const

export function PriorityBars({ data }: { data: JobAnalyticsData['byPriority'] }) {
  const max = Math.max(...Object.values(data), 1)
  return (
    <div className="flex flex-col gap-2.5">
      {PRIORITY_CONFIG.map(({ key, label, barCls, textCls }) => (
        <div key={key} className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded w-[46px] text-center flex-shrink-0 ${textCls}`}>
            {label}
          </span>
          <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barCls}`}
              style={{ width: `${(data[key] / max) * 100}%` }}
            />
          </div>
          <span className="text-[12px] font-bold text-text-base w-4 text-right">{data[key]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Weekly Area Chart ────────────────────────────────────────────────────────

export function WeeklyAreaChart({ data }: { data: JobAnalyticsData['daily'] }) {
  const W = 280
  const H = 70
  const PX = 12
  const PY = 8
  const max = Math.max(...data.map((d) => d.count), 1)

  const pts = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * (W - 2 * PX),
    y: PY + (1 - d.count / max) * (H - 2 * PY),
    count: d.count,
    label: d.label,
  }))

  const lineStr = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const areaStr = [
    `${pts[0].x},${H}`,
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${H}`,
  ].join(' ')

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="wk-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1E3A5F" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <polygon points={areaStr} fill="url(#wk-grad)" />
        <polyline points={lineStr} fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#1E3A5F" />
        ))}
      </svg>
      <div className="flex mt-1.5">
        {data.map((d) => (
          <div key={d.date} className="flex-1 text-center">
            <p className="text-[9.5px] text-text-muted">{d.label}</p>
            {d.count > 0 && <p className="text-[10px] font-bold text-brand-700">{d.count}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Completion Ring ──────────────────────────────────────────────────────────

export function CompletionRing({ pct }: { pct: number }) {
  const R = 32
  const CIRC = 2 * Math.PI * R
  const dash = (pct / 100) * CIRC
  return (
    <div className="flex items-center gap-3">
      <svg width="80" height="80" viewBox="0 0 80 80" className="flex-shrink-0">
        <circle cx="40" cy="40" r={R} fill="none" stroke="#F1F5F9" strokeWidth="10" />
        <circle
          cx="40" cy="40" r={R}
          fill="none"
          stroke="#10B981"
          strokeWidth="10"
          strokeDasharray={`${dash} ${CIRC - dash}`}
          strokeDashoffset={CIRC * 0.25}
          strokeLinecap="round"
        />
        <text x="40" y="40" textAnchor="middle" dy="0.35em" style={{ fontSize: 16, fontWeight: 700, fill: '#0F172A' }}>
          {pct}%
        </text>
      </svg>
      <div>
        <p className="text-[13px] font-semibold text-text-base">Completion Rate</p>
        <p className="text-[11.5px] text-text-muted mt-0.5">Jobs completed vs total</p>
      </div>
    </div>
  )
}
