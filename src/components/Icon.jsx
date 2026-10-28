// Small inline icon set (no extra library needed)
const paths = {
  phone: 'M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z',
  pin: 'M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z',
  mail: 'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5z',
  clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.4l3.5 2.1-.8 1.3L11 13V7h2z',
  gavel: 'M1 21h12v2H1zM5.2 8.2l2.8-2.8 14.1 14.1-2.8 2.8zM12.3 1.1l5.6 5.7-2.8 2.8-5.7-5.6zM3.8 9.6l5.6 5.7-2.8 2.8L1 12.4z',
  scale: 'M12 3l1 2h6l-3 7a3.5 3.5 0 006 0l-3-7M12 3l-1 2H5l3 7a3.5 3.5 0 01-6 0l3-7M12 3v17m-5 1h10',
  cash: 'M3 6h18v12H3zM12 9a3 3 0 100 6 3 3 0 000-6zM6 9v.01M18 15v.01',
  phoneApp: 'M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zm4 17v.01',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'M6 6l12 12M18 6L6 18',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12l5 5L20 7',
  clipboard: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M8 12h8M8 16h5',
  leaf: 'M5 21c0-9 5-15 15-16-1 10-7 15-15 16zM5 21l8-8',
  printer: 'M7 8V3h10v5M5 8h14a2 2 0 012 2v6h-4v5H7v-5H3v-6a2 2 0 012-2zM9 17h6',
  doc: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h6',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 018 0v4M12 15v2',
  sheet: 'M4 3h16v18H4zM4 9h16M4 15h16M10 3v18',
  devices: 'M3 5h14v10H3zM1 18h18M19 9h4v11h-4z',
}
const stroked = new Set(['scale', 'cash', 'phoneApp', 'menu', 'close', 'arrow', 'check', 'clipboard', 'leaf', 'printer', 'doc', 'layers', 'lock', 'sheet', 'devices'])

export default function Icon({ name, size = 22, className = '' }) {
  const d = paths[name]
  const isStroke = stroked.has(name)
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={isStroke ? 'none' : 'currentColor'}
      stroke={isStroke ? 'currentColor' : 'none'}
      strokeWidth={isStroke ? 2 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

export function WhatsAppIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.1-1.3c0-.1-.2-.2-.5-.3z" />
    </svg>
  )
}

/** DigiMandi logo — three leaves on a white rounded tile (same mark as the app icon) */
export function BrandMark({ className = 'brand-mark' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="DigiMandi">
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="16" fill="#fff" stroke="#cfe9ef" strokeWidth="1.5" />
      <g transform="translate(5 5.5) scale(0.84)" stroke="#fff" strokeWidth="3.4" strokeLinejoin="round">
        <path transform="rotate(-44 32 57)" d="M32 57 C25.4 48 24.9 35 32 22 C39.1 35 38.6 48 32 57 Z" fill="#22d3ee" />
        <path transform="rotate(44 32 57)" d="M32 57 C25.4 48 24.9 35 32 22 C39.1 35 38.6 48 32 57 Z" fill="#0891b2" />
        <path d="M32 57 C23.4 46 22.9 28 32 7 C41.1 28 40.6 46 32 57 Z" fill="#0e7490" />
      </g>
    </svg>
  )
}

export function SocialIcon({ name, size = 20 }) {
  const d = {
    youtube:
      'M23 7.5a3 3 0 00-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 001 7.5 31 31 0 00.6 12a31 31 0 00.4 4.5 3 3 0 002.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 002.1-2.1 31 31 0 00.4-4.5 31 31 0 00-.4-4.5zM9.8 15.3V8.7L15.5 12z',
    facebook: 'M14 8h3V4h-3a4 4 0 00-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z',
    instagram:
      'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-3.5a1 1 0 100 2 1 1 0 000-2z',
    linkedin:
      'M4 3a2 2 0 110 4 2 2 0 010-4zM2 9h4v12H2zM9 9h4v1.7A4.3 4.3 0 0117 9c3 0 4 2 4 5v7h-4v-6c0-1.5-.5-2.5-1.8-2.5S13 13.6 13 15v6H9z',
  }[name]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d={d} fillRule="evenodd" />
    </svg>
  )
}