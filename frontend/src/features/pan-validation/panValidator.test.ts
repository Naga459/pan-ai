import { describe, expect, it } from 'vitest'
import { findPanCandidates, maskPan, normalizePan, validatePanFormat } from './panValidator'

// All PANs below are synthetic test strings.
describe('validatePanFormat', () => {
  it('accepts a well-formed individual PAN', () => {
    const r = validatePanFormat('ABCPS1234F')
    expect(r.formatValid).toBe(true)
    expect(r.holderCategoryCode).toBe('P')
    expect(r.holderCategory).toBe('Individual')
    expect(r.checks.every((c) => c.passed)).toBe(true)
    expect(r.governmentVerification).toBe('not_checked')
  })

  it.each([
    ['AAAXX1234A', false, 'unknown category X'],
    ['AAACC1234A', true, 'company'],
    ['AAAHH1234A', true, 'HUF'],
    ['AAAFF1234A', true, 'firm'],
    ['AAATT1234A', true, 'trust'],
    ['AAAGG1234A', true, 'government'],
  ])('%s → formatValid=%s (%s)', (pan, valid) => {
    expect(validatePanFormat(pan).formatValid).toBe(valid)
  })

  it('normalises case, spaces and hyphens', () => {
    expect(normalizePan(' abcps-1234 f ')).toBe('ABCPS1234F')
    expect(validatePanFormat('abcps 1234 f').formatValid).toBe(true)
  })

  it('reports each failing rule', () => {
    const failed = (pan: string) =>
      validatePanFormat(pan)
        .checks.filter((c) => !c.passed)
        .map((c) => c.id)
    expect(failed('ABCPS1234')).toEqual(['length', 'lastLetter'])
    expect(failed('ABC1S1234F')).toEqual(['letters', 'category'])
    expect(failed('ABCPS12X4F')).toEqual(['digits'])
    expect(failed('ABCPS12345')).toEqual(['lastLetter'])
    expect(failed('')).toEqual(['length', 'letters', 'digits', 'lastLetter', 'category'])
  })

  it('rejects PANs with an unrecognised 4th character', () => {
    const r = validatePanFormat('ABCDE1234F')
    expect(r.formatValid).toBe(false)
    expect(r.holderCategory).toBeNull()
    expect(r.checks.find((c) => c.id === 'category')?.passed).toBe(false)
  })
})

describe('findPanCandidates', () => {
  it('finds unique PAN-shaped tokens in free text', () => {
    expect(findPanCandidates('Check abcps1234f and ABCPS1234F, also AAACC1234A.')).toEqual([
      'ABCPS1234F',
      'AAACC1234A',
    ])
  })

  it('ignores tokens embedded in longer words', () => {
    expect(findPanCandidates('XABCPS1234F ABCPS1234FX ABCPS12345')).toEqual([])
  })
})

describe('maskPan', () => {
  it('keeps the first and last two characters', () => {
    expect(maskPan('ABCPS1234F')).toBe('AB******4F')
  })
})
