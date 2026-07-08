import { Link } from 'react-router-dom'
import fieldSyncIllustration from '../../assets/field-sync-illustration.svg'
import dotPattern from '../../assets/dot-pattern.svg'
import { useScrollY } from '../../hooks/useScrollY'

const STATS = [
  { value: '2.3×', label: 'faster turnaround' },
  { value: '94%', label: 'on-time completion' },
  { value: '0', label: 'lost paper sheets' },
]

export function HomeHero() {
  const scrollY = useScrollY()

  return (
    <section
      id="top"
      className="relative overflow-hidden text-white scroll-mt-16"
      style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1F33 100%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url(${dotPattern})`, backgroundSize: '40px 40px', opacity: 0.5 }}
      />
      <div
        className="absolute -right-32 -top-24 w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(100,150,220,0.35), transparent 60%)',
          transform: `translateY(${scrollY * 0.18}px)`,
        }}
      />
      <div
        className="absolute -left-20 -bottom-32 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 60%)',
          transform: `translateY(${scrollY * -0.12}px)`,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-28 pb-16 md:pt-32 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-8 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-4">
            Field operations, in sync
          </p>
          <h1 className="text-[34px] leading-[1.1] md:text-5xl md:leading-[1.08] font-bold tracking-tight">
            Replace paper job sheets with a system{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #8FB4E8, #FFFFFF)' }}
            >
              your crew will actually use.
            </span>
          </h1>
          <p className="text-[15px] md:text-base leading-relaxed opacity-80 mt-5 max-w-md">
            Dispatch from the office. Complete from the field. Everything synced in real
            time — even when the van loses signal.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link
              to="/signup"
              className="h-11 px-5 rounded-xl bg-white text-brand-800 text-[14.5px] font-semibold hover:bg-slate-100 transition-colors inline-flex items-center"
            >
              Get Started free
            </Link>
            <Link
              to="/login"
              className="h-11 px-5 rounded-xl border border-white/30 text-white text-[14.5px] font-semibold hover:bg-white/10 transition-colors inline-flex items-center"
            >
              Log in
            </Link>
          </div>

          <div className="flex gap-8 mt-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                <div className="text-xs opacity-70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <img
            src={fieldSyncIllustration}
            alt="A field technician updating a job sheet on their phone, syncing live to the office dashboard"
            className="w-full max-w-[480px] select-none"
            loading="eager"
            draggable={false}
          />
        </div>
      </div>
    </section>
  )
}
