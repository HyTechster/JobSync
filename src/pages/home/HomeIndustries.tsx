import { Icons } from '../../components/ui/Icons'
import { Reveal } from '../../components/ui/Reveal'

const INDUSTRIES = [
  { icon: Icons.camera, label: 'Surveillance & Security' },
  { icon: Icons.shield, label: 'Access Control' },
  { icon: Icons.warning, label: 'Fire & Safety Systems' },
  { icon: Icons.building, label: 'Facilities Management' },
  { icon: Icons.jobs, label: 'HVAC & Maintenance' },
  { icon: Icons.spark, label: 'Electrical Services' },
]

export function HomeIndustries() {
  return (
    <section className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-18">
      <Reveal className="text-center mb-9">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-2">Built for the field</p>
        <h2 className="text-[20px] md:text-[24px] font-bold tracking-tight text-text-base">
          Made for teams like yours
        </h2>
      </Reveal>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {INDUSTRIES.map(({ icon: Icon, label }, i) => (
          <Reveal key={label} delay={i * 60}>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-3 pr-4 py-2 hover:border-brand-300 hover:shadow-sm transition-all">
              <span className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon size={12} color="#1E3A5F" />
              </span>
              <span className="text-[12.5px] font-medium text-text-base whitespace-nowrap">{label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
