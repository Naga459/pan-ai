import { describe, expect, it } from 'vitest'
import { buildSyntheticExtraction } from '../chat/mockAssistant'
import { compareWithExtraction } from './compare'

describe('compareWithExtraction', () => {
  const extraction = buildSyntheticExtraction('sample.jpg')

  it('matches ignoring case, spacing and date separators', () => {
    const results = compareWithExtraction(
      { panNumber: 'abcps 1234f', fullName: ' rahul   sharma ', dateOfBirth: '15-06-1990' },
      extraction,
    )
    expect(results.map((r) => r.match)).toEqual([true, true, true])
  })

  it('flags mismatches per field', () => {
    const results = compareWithExtraction(
      { panNumber: 'ABCPS1234G', fullName: 'Rahul Verma', dateOfBirth: '15/06/1990' },
      extraction,
    )
    expect(results.map((r) => r.match)).toEqual([false, false, true])
  })
})
