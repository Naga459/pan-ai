import type { PanFields } from '../types/chat'

interface SyntheticPanCardProps {
  fields: Pick<PanFields, 'panNumber' | 'fullName' | 'parentName' | 'dateOfBirth'>
  compact?: boolean
}

/** Deterministic pseudo-QR pattern so the illustration looks like an ID card. */
const QR_CELLS = Array.from({ length: 49 }, (_, i) => ((i * 37) % 11) % 3 === 0 || i % 8 === 0)

/**
 * Illustration of a PAN-style card for the synthetic demo sample. Deliberately carries a
 * SAMPLE watermark and no government emblem or branding.
 */
export function SyntheticPanCard({ fields, compact = false }: SyntheticPanCardProps) {
  if (compact) {
    return (
      <div
        className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-200 p-1.5 text-[6px] leading-tight text-navy-900"
        aria-hidden="true"
      >
        <div className="font-bold">SAMPLE PAN</div>
        <div className="font-mono font-bold">{fields.panNumber}</div>
        <div className="flex items-end justify-between">
          <span className="truncate">{fields.fullName}</span>
          <span className="grid h-3 w-3 grid-cols-3 gap-px">
            {QR_CELLS.slice(0, 9).map((on, i) => (
              <span key={i} className={on ? 'bg-navy-900' : 'bg-white'} />
            ))}
          </span>
        </div>
      </div>
    )
  }

  return (
    <figure
      className="relative m-0 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-sky-50 via-blue-100 to-indigo-200 p-4 text-navy-900 shadow-sm"
      aria-label={`Synthetic sample PAN card for ${fields.fullName}`}
    >
      <span
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-5xl font-black tracking-widest text-blue-900/10"
        style={{ transform: 'rotate(-18deg)' }}
        aria-hidden="true"
      >
        SAMPLE
      </span>
      <div className="flex items-start justify-between gap-3 border-b border-blue-900/10 pb-2">
        <div>
          <div className="text-sm font-bold tracking-wide">SAMPLE PAN CARD</div>
          <div className="text-[11px] text-slate-600">Synthetic demo · not a real document</div>
        </div>
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
          DEMO
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <div className="min-w-0 flex-1 space-y-1.5 text-xs">
          <div>
            <div className="text-[10px] text-blue-700">Permanent Account Number</div>
            <div className="font-mono text-base font-bold tracking-wider">{fields.panNumber}</div>
          </div>
          <div>
            <div className="text-[10px] text-blue-700">Name</div>
            <div className="truncate font-semibold">{fields.fullName}</div>
          </div>
          <div>
            <div className="text-[10px] text-blue-700">Father&apos;s Name</div>
            <div className="truncate font-semibold">{fields.parentName}</div>
          </div>
          <div>
            <div className="text-[10px] text-blue-700">Date of Birth</div>
            <div className="font-semibold">{fields.dateOfBirth}</div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          <div className="grid h-16 w-16 grid-cols-7 gap-px rounded bg-white p-1" aria-hidden="true">
            {QR_CELLS.map((on, i) => (
              <span key={i} className={on ? 'bg-navy-900' : 'bg-white'} />
            ))}
          </div>
          <svg viewBox="0 0 100 36" className="h-9 w-24 rounded bg-white/80" aria-hidden="true">
            <path
              d="M8 26c6-14 12-18 14-10s-4 12 2 6 8-14 12-8-2 10 4 6 10-12 14-6 4 8 10 4 12-6 22-4"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </figure>
  )
}
