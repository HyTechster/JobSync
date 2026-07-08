import { Icons } from '../../components/ui/Icons'
import { Reveal } from '../../components/ui/Reveal'

const FEATURES = [
  {
    icon: Icons.jobs,
    accent: '#1E3A5F',
    title: 'Job orders & assignment',
    desc: 'Create job orders with customer, location, schedule and priority, then assign them to one or more technicians in seconds.',
  },
  {
    icon: Icons.users,
    accent: '#7C3AED',
    title: 'Built for the whole team',
    desc: 'Admins get a full desktop dashboard. Technicians get a mobile-first PWA built for one-handed use in the field.',
  },
  {
    icon: Icons.spark,
    accent: '#2563EB',
    title: 'Real-time status sync',
    desc: 'Every status change — pending, in progress, completed — reflects on the admin dashboard within seconds, no refresh needed.',
  },
  {
    icon: Icons.wifiOff,
    accent: '#059669',
    title: 'Offline-first job sheets',
    desc: 'No signal, no problem. Job sheets are saved locally and sync automatically the moment connectivity returns.',
  },
  {
    icon: Icons.camera,
    accent: '#D97706',
    title: 'Photo documentation',
    desc: 'Technicians attach photos straight from their phone camera as proof of work, stored securely with every job sheet.',
  },
  {
    icon: Icons.bell,
    accent: '#DC2626',
    title: 'Alerts that reach the field',
    desc: 'Send an update to one technician or the whole crew at once, and track exactly who has read it.',
  },
]

export function HomeFeatures() {
  return (
    <section id="features" className="relative overflow-hidden scroll-mt-16">
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(30,58,95,0.05), transparent 65%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <Reveal className="max-w-xl mx-auto text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">Everything included</p>
          <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight text-text-base">
            Everything your team needs to run field work
          </h2>
          <p className="text-[14.5px] text-text-muted mt-3 leading-relaxed">
            Built specifically for surveillance and maintenance crews who are done chasing paper.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, accent, title, desc }, i) => (
            <Reveal key={title} delay={i * 70}>
              <div className="h-full bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${accent}1A` }}
                >
                  <Icon size={19} color={accent} />
                </div>
                <h3 className="text-[15px] font-semibold text-text-base mb-1.5">{title}</h3>
                <p className="text-[13.5px] text-text-muted leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
