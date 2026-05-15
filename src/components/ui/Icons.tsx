import type { ReactNode } from 'react'

interface IconProps {
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

function make(path: ReactNode, vb = '0 0 24 24') {
  return function Icon({ size = 18, color = 'currentColor', strokeWidth = 1.75, className }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={vb}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    )
  }
}

export const Icons = {
  logo: ({ size = 28, color = '#1E3A5F' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="8" fill={color} />
      <path d="M10 11.5h12M10 16h8M10 20.5h12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="22" cy="20.5" r="1.6" fill="#fff" />
    </svg>
  ),
  dashboard:   make(<><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>),
  jobs:        make(<><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 3h6v4H9z"/><path d="M9 12h6M9 16h4"/></>),
  sheets:      make(<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>),
  users:       make(<><circle cx="12" cy="8" r="3.5"/><path d="M5 21c0-3.5 3-6.5 7-6.5s7 3 7 6.5"/></>),
  alerts:      make(<><path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16l-2-2z"/><path d="M10 20a2 2 0 004 0"/></>),
  bell:        make(<><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></>),
  user:        make(<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>),
  logout:      make(<><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l-5-5 5-5M5 12h12"/></>),
  plus:        make(<><path d="M12 5v14M5 12h14"/></>),
  search:      make(<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>),
  filter:      make(<><path d="M3 5h18M6 12h12M10 19h4"/></>),
  calendar:    make(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>),
  clock:       make(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  check:       make(<path d="M4 12l5 5L20 6"/>),
  close:       make(<path d="M6 6l12 12M18 6L6 18"/>),
  edit:        make(<><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2 2 0 012.8 2.8L12 14.5l-4 1 1-4 9.5-9.5z"/></>),
  trash:       make(<><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"/></>),
  moreV:       make(<><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></>),
  chevronR:    make(<path d="M9 18l6-6-6-6"/>),
  chevronL:    make(<path d="M15 18l-6-6 6-6"/>),
  chevronD:    make(<path d="M6 9l6 6 6-6"/>),
  arrowR:      make(<><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>),
  arrowL:      make(<><path d="M19 12H5"/><path d="M11 5l-7 7 7 7"/></>),
  camera:      make(<><path d="M3 9a2 2 0 012-2h2l2-3h6l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="4"/></>),
  send:        make(<><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></>),
  download:    make(<><path d="M12 3v14M5 11l7 7 7-7M3 21h18"/></>),
  upload:      make(<><path d="M12 17V3M5 10l7-7 7 7M3 21h18"/></>),
  sync:        make(<><path d="M21 12a9 9 0 01-15 6.7L3 16"/><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/></>),
  warning:     make(<><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v4M12 17.5v.5"/></>),
  spark:       make(<><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4"/></>),
  wifiOff:     make(<><path d="M2 2l20 20"/><path d="M8.5 16a5 5 0 017 0"/><path d="M5 12.5a10 10 0 0110.5-2.3"/><circle cx="12" cy="19.5" r="1"/></>),
  pin:         make(<><path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></>),
}

export type IconName = keyof typeof Icons
