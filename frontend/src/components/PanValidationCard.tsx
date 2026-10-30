import { Tag } from 'antd'
import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react'
import type { PanValidationResult } from '../features/pan-validation/panValidator'

export function PanValidationCard({ result }: { result: PanValidationResult }) {
  return (
    <section
      className="mt-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4"
      aria-label="PAN format check"
      data-testid="pan-validation-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-slate-500">PAN format check</div>
          <div className="truncate font-mono text-lg font-semibold tracking-wider text-navy-900">
            {result.normalized || '—'}
          </div>
        </div>
        <Tag color={result.formatValid ? 'success' : 'error'} className="!m-0 !text-sm">
          {result.formatValid ? 'Format Valid' : 'Format Invalid'}
        </Tag>
      </div>

      <dl className="m-0 mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
        <dt className="text-slate-500">Holder Category</dt>
        <dd className="m-0 font-medium text-slate-900">
          {result.holderCategory ? `${result.holderCategory} (${result.holderCategoryCode})` : 'Unknown'}
        </dd>
        <dt className="text-slate-500">Government Verification</dt>
        <dd className="m-0 flex items-center gap-1 font-medium text-amber-700">
          <ShieldAlert size={14} aria-hidden="true" /> Not checked
        </dd>
      </dl>

      <ul className="m-0 mt-3 grid list-none gap-1 p-0 text-sm sm:grid-cols-2">
        {result.checks.map((check) => (
          <li key={check.id} className="flex items-center gap-2">
            {check.passed ? (
              <CheckCircle2 size={15} className="shrink-0 text-green-600" aria-label="Passed" />
            ) : (
              <XCircle size={15} className="shrink-0 text-red-500" aria-label="Failed" />
            )}
            <span className={check.passed ? 'text-slate-700' : 'text-red-700'}>{check.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
