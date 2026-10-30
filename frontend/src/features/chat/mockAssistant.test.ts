import { describe, expect, it } from 'vitest'
import type { Attachment } from '../../types/chat'
import { ERROR_TRIGGER, SYNTHETIC_PAN_FIELDS, generateMockReply, requestMockReply } from './mockAssistant'

const image: Attachment = {
  id: 'doc_1',
  name: 'my_card.png',
  size: 1000,
  mimeType: 'image/png',
  kind: 'image',
  addedAt: 0,
}

describe('generateMockReply', () => {
  it('returns a clearly-labelled synthetic extraction for an attached document', () => {
    const reply = generateMockReply({ prompt: 'Extract details', attachments: [image] })
    expect(reply.extraction?.synthetic).toBe(true)
    expect(reply.extraction?.documentName).toBe('my_card.png')
    expect(reply.extraction?.fields.panNumber).toBe(SYNTHETIC_PAN_FIELDS.panNumber)
    expect(reply.extraction?.validation.formatValid).toBe(true)
    expect(reply.content).toMatch(/fictional sample values/)
  })

  it('validates PANs found in the prompt and states government verification is not checked', () => {
    const reply = generateMockReply({ prompt: 'Is abcps1234f valid?' })
    expect(reply.validation?.normalized).toBe('ABCPS1234F')
    expect(reply.validation?.formatValid).toBe(true)
    expect(reply.content).toMatch(/government verification: not checked/i)
  })

  it('explains failures for an invalid PAN', () => {
    const reply = generateMockReply({ prompt: 'Validate ABCDE1234F' })
    expect(reply.validation?.formatValid).toBe(false)
    expect(reply.content).toMatch(/does \*\*not\*\* match/)
  })

  it('asks for a document when extraction is requested without one', () => {
    expect(generateMockReply({ prompt: 'Extract PAN number from this image.' }).content).toMatch(
      /attach a PAN card image or PDF/,
    )
  })

  it.each([
    ['What does the fourth character mean?', /4th character/],
    ['How do I correct PAN details?', /correct or update PAN details/],
    ['What documents are required for PAN correction?', /Proof of identity/],
    ['How do I download e-PAN?', /download an e-PAN/],
    ['How do I link PAN with Aadhaar?', /link PAN with Aadhaar/],
    ['What is PAN?', /Permanent Account Number/],
    ['Is this PAN format valid?', /Send me the PAN/],
  ])('answers "%s" from the PAN knowledge stubs', (prompt, expected) => {
    expect(generateMockReply({ prompt }).content).toMatch(expected)
  })

  it.each(['Write me a poem about cricket', "What's the weather in Delhi?"])(
    'refuses out-of-scope prompt "%s"',
    (prompt) => {
      expect(generateMockReply({ prompt }).content).toMatch(/can only help with \*\*Indian PAN/)
    },
  )
})

describe('requestMockReply', () => {
  it('simulates a failure when the error trigger is present', async () => {
    await expect(requestMockReply({ prompt: `test ${ERROR_TRIGGER}` }, 0)).rejects.toThrow(/simulated a failure/)
  })
})
