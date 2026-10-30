interface PanLogoProps {
  size?: number
  className?: string
}

export function PanLogo({ size = 40, className }: PanLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="PAN AI logo"
    >
      <path d="M32 6 58 58H44.5L32 31.5 19.5 58H6Z" fill="#2563eb" />
      <path d="M24.5 48h15L32 31.5Z" fill="#60a5fa" />
    </svg>
  )
}
