import { Link } from 'react-router-dom'
import loginIllustration from '../../assets/login-illustration.svg'
import dotPattern from '../../assets/dot-pattern.svg'


const STATS = [
  { value: '2.3×', label: 'faster turnaround' },
  { value: '94%', label: 'on-time completion' },
  { value: '0', label: 'lost paper sheets' },
]

export function LoginBrandPanel() {
  return (
    <div className="relative hidden md:flex flex-col overflow-hidden text-white p-12 xl:p-14"
      style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1F33 100%)' }}>

      {/* Dot pattern texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${dotPattern})`,
          backgroundSize: '40px 40px',
          opacity: 0.6,
        }}
      />

      {/* Floating glow circles */}
      <div className="absolute -right-28 -top-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(100,150,220,0.35), transparent 60%)' }} />
      <div className="absolute -left-16 -bottom-28 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 60%)' }} />

      {/* Logo — back to homepage */}
      <Link to="/" className="relative flex items-center gap-3 w-fit hover:opacity-90 transition-opacity">
        <img src="/icons/jobsync-icon.svg" alt="JobSync logo" width={36} height={36} className="rounded-lg" />
        <span className="text-xl font-bold tracking-tight">JobSync</span>
      </Link>

      {/* Illustration */}
      <div className="relative flex flex-1 items-center justify-center py-6">
        <img
          src={loginIllustration}
          alt=""
          aria-hidden="true"
          className="w-full max-w-[400px] select-none"
          loading="eager"
          draggable={false}
        />
      </div>

      {/* Headline */}
      <div className="relative max-w-lg">
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
      <div className="relative pt-6 text-xs opacity-60">
        © 2026 JobSync · Built for service businesses that move
      </div>
    </div>
  )
}
