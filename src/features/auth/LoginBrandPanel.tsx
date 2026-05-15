function LogoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="rgba(255,255,255,0.25)" />
      <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
    </svg>
  )
}

const STATS = [
  { value: '2.3×', label: 'faster turnaround' },
  { value: '94%', label: 'on-time completion' },
  { value: '0', label: 'lost paper sheets' },
]

export function LoginBrandPanel() {
  return (
    <div className="relative hidden md:flex flex-col overflow-hidden text-white p-12 xl:p-14"
      style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1F33 100%)' }}>

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%)',
        }}
      />

      {/* Floating glow circles */}
      <div className="absolute -right-28 -top-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(100,150,220,0.35), transparent 60%)' }} />
      <div className="absolute -left-16 -bottom-28 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 60%)' }} />

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <LogoIcon />
        <span className="text-xl font-bold tracking-tight">JobSync</span>
      </div>

      {/* Headline */}
      <div className="relative mt-auto max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-4">
          Field operations, in sync
        </p>
        <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
          Replace paper job sheets with a system your crew will actually use.
        </h1>
        <p className="text-base leading-relaxed opacity-80 mt-5 max-w-md">
          Dispatch from the office. Complete from the field. Everything synced in real
          time — even when the van loses signal.
        </p>

        {/* Stats */}
        <div className="flex gap-8 mt-10">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold tracking-tight">{s.value}</div>
              <div className="text-xs opacity-70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative mt-auto pt-8 text-xs opacity-60">
        © 2026 JobSync · Built for service businesses that move
      </div>
    </div>
  )
}
