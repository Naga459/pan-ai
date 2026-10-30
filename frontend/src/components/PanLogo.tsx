interface PanLogoProps {
  size?: number
  className?: string
  /** `light` renders in white for use on blue backgrounds. */
  variant?: 'brand' | 'light'
}

export function PanLogo({ size = 40, className, variant = 'brand' }: PanLogoProps) {
  const [outer, inner] = variant === 'light' ? ['#ffffff', '#bfdbfe'] : ['#2563eb', '#60a5fa']
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="PAN AI logo"
    >
      <path d="M32 6 58 58H44.5L32 31.5 19.5 58H6Z" fill={outer} />
      <path d="M24.5 48h15L32 31.5Z" fill={inner} />
    </svg>
  )
}
