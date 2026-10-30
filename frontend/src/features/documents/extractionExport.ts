import type { PanExtraction, PanFields } from '../../types/chat'

export const FIELD_LABELS: { key: keyof PanFields; label: string }[] = [
  { key: 'panNumber', label: 'PAN Number' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'parentName', label: "Father's Name" },
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'cardType', label: 'Card Type' },
  { key: 'holderCategory', label: 'Holder Category' },
]

export function extractionToText(extraction: PanExtraction): string {
  const lines = FIELD_LABELS.map(({ key, label }) => `${label}: ${extraction.fields[key]}`)
  lines.push(`PAN Format: ${extraction.validation.formatValid ? 'Valid' : 'Invalid'}`)
  lines.push('Government Verification: Not checked')
  if (extraction.synthetic) lines.push('Note: Synthetic demo values, not read from the document.')
  return lines.join('\n')
}

export function extractionToJson(extraction: PanExtraction) {
  return {
    document: extraction.documentName,
    fields: extraction.fields,
    ocrConfidence: extraction.confidence,
    panFormat: {
      valid: extraction.validation.formatValid,
      holderCategoryCode: extraction.validation.holderCategoryCode,
      holderCategory: extraction.validation.holderCategory,
      checks: extraction.validation.checks,
    },
    governmentVerification: 'not_checked',
    synthetic: extraction.synthetic,
    disclaimer:
      'Demo output with fictional values. A PAN format check is not government verification.',
    exportedAt: new Date().toISOString(),
  }
}
