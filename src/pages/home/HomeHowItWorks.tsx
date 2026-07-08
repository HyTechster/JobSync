import { Reveal } from '../../components/ui/Reveal'

const STEPS = [
  {
    step: '1',
    title: 'Admin creates & assigns',
    desc: 'Add the job details, pick a priority, and assign it to the right technician — or several.',
  },
  {
    step: '2',
    title: 'Technician gets it on mobile',
    desc: 'The job appears instantly on their phone. They tap once to start, no phone calls needed.',
  },
  {
    step: '3',
    title: 'Work gets done, even offline',
    desc: 'They complete the job, attach photos, and submit a digital sheet — synced the moment they’re back online.',
  },
  {
    step: '4',
    title: 'Admin sees it live',
    desc: 'Status updates and the finished job sheet land on the dashboard in real time, ready for review.',
  },
]

export function HomeHowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-surface-2 border-y border-slate-200 scroll-mt-16">
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.06), transparent 65%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal className="max-w-xl mx-auto text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">How it works</p>
          <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight text-text-base">
            From dispatch to done, in four steps
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map(({ step, title, desc }, i) => (
            <Reveal key={step} delay={i * 90}>
              <div className="h-full bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <span className="w-8 h-8 rounded-full bg-brand-700 text-white text-[13px] font-bold flex items-center justify-center mb-4">
                  {step}
                </span>
                <h3 className="text-[14.5px] font-semibold text-text-base mb-1.5">{title}</h3>
                <p className="text-[13px] text-text-muted leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
