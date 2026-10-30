import { ArrowRight, type LucideIcon } from 'lucide-react'

export type QuickActionTone = 'blue' | 'teal' | 'purple' | 'orange'

const TONES: Record<QuickActionTone, { icon: string; arrow: string; ring: string }> = {
  blue: { icon: 'bg-blue-600', arrow: 'text-blue-600', ring: 'hover:border-blue-300 focus-visible:ring-blue-400' },
  teal: { icon: 'bg-teal-500', arrow: 'text-teal-600', ring: 'hover:border-teal-300 focus-visible:ring-teal-400' },
  purple: {
    icon: 'bg-violet-600',
    arrow: 'text-violet-600',
    ring: 'hover:border-violet-300 focus-visible:ring-violet-400',
  },
  orange: {
    icon: 'bg-orange-500',
    arrow: 'text-orange-500',
    ring: 'hover:border-orange-300 focus-visible:ring-orange-400',
  },
}

interface QuickActionCardProps {
  icon: LucideIcon
  title: string
  description: string
  tone: QuickActionTone
  onClick: () => void
}

export function QuickActionCard({ icon: Icon, title, description, tone, onClick }: QuickActionCardProps) {
  const t = TONES[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full w-full cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 ${t.ring}`}
    >
      <div className="flex items-center gap-2.5 @md:items-start @md:gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white @md:h-11 @md:w-11 ${t.icon}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold leading-tight text-slate-900 @md:text-sm">{title}</span>
          <span className="mt-1 hidden text-xs leading-snug text-slate-500 @md:block">{description}</span>
        </span>
      </div>
      <ArrowRight
        size={18}
        className={`mt-1 hidden self-end transition-transform @md:block group-hover:translate-x-1 ${t.arrow}`}
        aria-hidden="true"
      />
    </button>
  )
}
