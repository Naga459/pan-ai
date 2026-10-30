import type { PanExtraction } from '../../types/chat'
import { normalizePan } from './panValidator'

export interface CompareValues {
  panNumber: string
  fullName: string
  dateOfBirth: string
}

export interface FieldResult {
  label: string
  entered: string
  extracted: string
  match: boolean
}

const normalizeName = (v: string) => v.toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim()
const normalizeDate = (v: string) => v.replace(/[.\-\s]/g, '/').replace(/^(\d)\//, '0$1/').trim()

export function compareWithExtraction(values: CompareValues, extraction: PanExtraction): FieldResult[] {
  const { fields } = extraction
  return [
    {
      label: 'PAN Number',
      entered: values.panNumber,
      extracted: fields.panNumber,
      match: normalizePan(values.panNumber) === normalizePan(fields.panNumber),
    },
    {
      label: 'Full Name',
      entered: values.fullName,
      extracted: fields.fullName,
      match: normalizeName(values.fullName) === normalizeName(fields.fullName),
    },
    {
      label: 'Date of Birth',
      entered: values.dateOfBirth,
      extracted: fields.dateOfBirth,
      match: normalizeDate(values.dateOfBirth) === normalizeDate(fields.dateOfBirth),
    },
  ]
}
