import { Icons } from '../../components/ui/Icons'
import { Reveal } from '../../components/ui/Reveal'

function OfficeMockup() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: 'Active Jobs', value: '18', accent: '#2563EB' },
            { label: 'Completed', value: '142', accent: '#059669' },
            { label: 'Technicians', value: '7', accent: '#D97706' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-2 rounded-lg p-2.5">
              <p className="text-[16px] font-bold text-text-base leading-none">{s.value}</p>
              <p className="text-[9.5px] text-text-muted mt-1 leading-none">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[10px] font-semibold text-success">Live</span>
        </div>
        {['CCTV Installation', 'Alarm Maintenance', 'Access Control Repair'].map((title, i) => (
          <div key={title} className="flex items-center justify-between py-2 border-t border-slate-100">
            <span className="text-[11.5px] text-text-base">{title}</span>
            <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full ${
              i === 0 ? 'bg-blue-50 text-blue-700' : i === 1 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {i === 0 ? 'In Progress' : i === 1 ? 'Pending' : 'Completed'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FieldMockup() {
  return (
    <div className="mx-auto w-[220px] bg-white border-4 border-slate-800 rounded-[2rem] shadow-lg overflow-hidden">
      <div className="bg-brand-700 px-4 py-3 flex items-center justify-between">
        <span className="text-white text-[12px] font-bold">My Jobs</span>
        <Icons.bell size={14} color="white" />
      </div>
      <div className="p-3 space-y-2.5">
        <div className="bg-surface-2 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-text-base">CCTV Install</span>
            <span className="text-[8.5px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Active</span>
          </div>
          <p className="text-[9.5px] text-text-muted">Klang Valley Logistics</p>
        </div>
        <button className="w-full h-9 rounded-xl bg-emerald-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5">
          <Icons.check size={12} color="white" />
          Submit Job Sheet
        </button>
        <div className="flex items-center gap-1.5 justify-center pt-1">
          <Icons.wifiOff size={11} color="#94A3B8" />
          <span className="text-[9px] text-text-subtle">Saved offline · will sync</span>
        </div>
      </div>
    </div>
  )
}

function MockupStage({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}26, transparent 70%)` }}
      />
      <div className="relative transition-transform duration-500 hover:-translate-y-2">{children}</div>
    </div>
  )
}

export function HomeSplitSections() {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 flex flex-col gap-16 md:gap-24">
      {/* Built for the office */}
      <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <Reveal direction="left">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">For the office</p>
          <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight text-text-base mb-3">
            One dashboard for every job, technician, and job sheet.
          </h2>
          <p className="text-[14.5px] text-text-muted leading-relaxed">
            See exactly what's happening across your team — active jobs, completed work, and which
            technicians are still catching up on paperwork. Real-time updates mean you're never
            waiting on a phone call to know a job is done.
          </p>
        </Reveal>
        <Reveal direction="right" delay={120}>
          <MockupStage accent="#1E3A5F">
            <OfficeMockup />
          </MockupStage>
        </Reveal>
      </div>

      {/* Built for the field */}
      <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
        <Reveal direction="left" className="order-2 md:order-1">
          <MockupStage accent="#059669">
            <FieldMockup />
          </MockupStage>
        </Reveal>
        <Reveal direction="right" delay={120} className="order-1 md:order-2">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">For the field</p>
          <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight text-text-base mb-3">
            Everything a technician needs, in their pocket.
          </h2>
          <p className="text-[14.5px] text-text-muted leading-relaxed">
            Claim jobs, update status, and submit a complete job sheet with photos — all from a
            phone. Lose signal on-site? Nothing is lost. It syncs automatically the moment
            connectivity comes back.
          </p>
        </Reveal>
      </div>
    </div>
  )
}
