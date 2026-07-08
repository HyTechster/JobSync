import { Link } from 'react-router-dom'
import { Reveal } from '../../components/ui/Reveal'

export function HomeCTA() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1F33 100%)' }}
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(100,150,220,0.25), transparent 65%)' }}
      />

      <Reveal className="relative max-w-4xl mx-auto px-5 md:px-8 py-16 md:py-20 text-center">
        <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight leading-tight">
          Ready to ditch the paperwork?
        </h2>
        <p className="text-[14.5px] md:text-base opacity-80 mt-3 max-w-lg mx-auto">
          Set up your organization and invite your team in a couple of minutes. No credit card, no installation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            to="/signup"
            className="h-11 px-6 rounded-xl bg-white text-brand-800 text-[14.5px] font-semibold hover:bg-slate-100 transition-colors inline-flex items-center"
          >
            Get Started free
          </Link>
          <Link
            to="/login"
            className="h-11 px-6 rounded-xl border border-white/30 text-white text-[14.5px] font-semibold hover:bg-white/10 transition-colors inline-flex items-center"
          >
            Log in
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
