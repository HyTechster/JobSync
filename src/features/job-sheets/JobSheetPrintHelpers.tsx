import type React from 'react'

export interface PrintHeaderProps { orgName: string; sheetNum: string }

export function PrintHeader({ orgName, sheetNum }: PrintHeaderProps) {
  return (
    <div style={{ backgroundColor: '#1E3A5F', padding: '10px 14px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 5, display: 'flex' }}>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="8" fill="#1E3A5F" />
              <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="22" cy="20.5" r="1.6" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: 17, letterSpacing: '-0.3px' }}>JobSync</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 1 }}>{orgName}</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: 15, letterSpacing: '3px' }}>JOB SHEET</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: '1px' }}>DIGITAL WORK ORDER</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Sheet No.</div>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: 21, letterSpacing: '2px', fontFamily: 'monospace' }}>{sheetNum}</div>
        </div>
      </div>
      <div style={{ height: 3, backgroundColor: '#EA580C', marginTop: 10, borderRadius: 1 }} />
    </div>
  )
}

export function PrintFooter({ orgName }: { orgName: string }) {
  return (
    <div style={{ backgroundColor: '#1E3A5F', padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="white" opacity={0.2} />
          <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="22" cy="20.5" r="1.6" fill="white" />
        </svg>
        <span style={{ color: 'white', fontSize: 9.5, fontWeight: 'bold' }}>Powered by JobSync™</span>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 8.5 }}>Digital Job Sheet Management System · {orgName}</div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 8.5 }}>Generated: {new Date().toLocaleDateString('en-MY')}</div>
    </div>
  )
}

export function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 8.5, fontWeight: 'bold', color: '#9CA3AF',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {children}
    </div>
  )
}

export function Val({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginTop: 2 }}>
      {children || '—'}
    </div>
  )
}

