/**
 * Deterministic PAN *format* checks for the demo UI.
 *
 * This only checks the shape of the string. It cannot tell whether a PAN was issued,
 * is active, or belongs to anyone — that needs official verification by the
 * Income Tax Department.
 */

export const PAN_HOLDER_CATEGORIES: Record<string, string> = {
  A: 'Association of Persons (AOP)',
  B: 'Body of Individuals (BOI)',
  C: 'Company',
  F: 'Firm / Limited Liability Partnership',
  G: 'Government',
  H: 'Hindu Undivided Family (HUF)',
  J: 'Artificial Juridical Person',
  L: 'Local Authority',
  P: 'Individual',
  T: 'Trust',
}

export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/
/** Finds PAN-shaped tokens inside free text (case-insensitive, word-bounded). */
const PAN_IN_TEXT = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g

export interface PanCheck {
  id: 'length' | 'letters' | 'digits' | 'lastLetter' | 'category'
  label: string
  passed: boolean
}

export interface PanValidationResult {
  input: string
  normalized: string
  formatValid: boolean
  holderCategoryCode: string | null
  holderCategory: string | null
  checks: PanCheck[]
  /** Format checks never verify a PAN with the government. */
  governmentVerification: 'not_checked'
}

export function normalizePan(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase()
}

export function validatePanFormat(input: string): PanValidationResult {
  const pan = normalizePan(input)
  const code = pan.length >= 4 ? pan[3] : null
  const category = code && /[A-Z]/.test(code) ? (PAN_HOLDER_CATEGORIES[code] ?? null) : null

  const checks: PanCheck[] = [
    { id: 'length', label: 'Has exactly 10 characters', passed: pan.length === 10 },
    {
      id: 'letters',
      label: 'Characters 1–5 are letters',
      passed: /^[A-Z]{5}/.test(pan),
    },
    {
      id: 'digits',
      label: 'Characters 6–9 are digits',
      passed: /^.{5}[0-9]{4}/.test(pan),
    },
    { id: 'lastLetter', label: 'Character 10 is a letter', passed: /^.{9}[A-Z]$/.test(pan) },
    {
      id: 'category',
      label: code
        ? `Character 4 ('${code}') is a known holder category`
        : 'Character 4 is a known holder category',
      passed: category !== null,
    },
  ]

  return {
    input,
    normalized: pan,
    formatValid: PAN_PATTERN.test(pan) && category !== null,
    holderCategoryCode: category ? code : null,
    holderCategory: category,
    checks,
    governmentVerification: 'not_checked',
  }
}

export function findPanCandidates(text: string): string[] {
  const matches = text.match(PAN_IN_TEXT) ?? []
  return [...new Set(matches.map((m) => m.toUpperCase()))]
}

/** Shows only the first 2 and last 2 characters, e.g. AB******4F. */
export function maskPan(pan: string): string {
  const p = normalizePan(pan)
  if (p.length <= 4) return '*'.repeat(p.length)
  return `${p.slice(0, 2)}${'*'.repeat(p.length - 4)}${p.slice(-2)}`
}
