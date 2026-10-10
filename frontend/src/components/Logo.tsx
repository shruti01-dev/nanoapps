import { useEffect, useState } from 'react'

let introAvailable = true

export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  const [animate] = useState(introAvailable)

  useEffect(() => {
    introAvailable = false
  }, [])

  return (
    <svg className={`logo-mark${animate ? ' is-animated' : ''} ${className}`} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <g className="logo-orbit">
        <rect className="logo-plate logo-plate-1" width="8" height="8" rx="2.2" fill="#A9C6FF" />
        <rect className="logo-plate logo-plate-2" x="10" width="8" height="8" rx="2.2" fill="#FFD29A" />
        <rect className="logo-plate logo-plate-3" y="10" width="8" height="8" rx="2.2" fill="#F6B8D0" />
        <rect className="logo-plate logo-plate-4" x="10" y="10" width="8" height="8" rx="2.2" fill="#A6DCC6" />
      </g>
    </svg>
  )
}

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight">nanoapps</span>
    </span>
  )
}
