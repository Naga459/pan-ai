import { describe, expect, it } from 'vitest'
import { MAX_UPLOAD_BYTES, formatBytes, validateUpload } from './fileValidation'

function file(name: string, type: string, size = 2048): File {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

describe('validateUpload', () => {
  it.each([
    ['card.jpg', 'image/jpeg', 'image'],
    ['card.JPEG', 'image/jpeg', 'image'],
    ['card.png', 'image/png', 'image'],
    ['card.webp', 'image/webp', 'image'],
    ['card.pdf', 'application/pdf', 'pdf'],
  ])('accepts %s', (name, type, kind) => {
    expect(validateUpload(file(name, type))).toEqual({ ok: true, kind, mimeType: type })
  })

  it('falls back to the extension when the browser gives no MIME type', () => {
    expect(validateUpload(file('card.png', ''))).toMatchObject({ ok: true, kind: 'image' })
  })

  it.each([
    ['notes.txt', 'text/plain'],
    ['card.gif', 'image/gif'],
    ['card.svg', 'image/svg+xml'],
    ['payload.exe', 'application/pdf'], // spoofed type, wrong extension
  ])('rejects %s', (name, type) => {
    const r = validateUpload(file(name, type))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/not supported/)
  })

  it('rejects empty and oversized files', () => {
    expect(validateUpload(file('card.png', 'image/png', 0))).toMatchObject({ ok: false })
    const big = validateUpload(file('card.png', 'image/png', MAX_UPLOAD_BYTES + 1))
    expect(big.ok).toBe(false)
    if (!big.ok) expect(big.error).toMatch(/limit is 10 MB/)
  })

  it('rejects PDFs when only images are allowed', () => {
    expect(validateUpload(file('card.pdf', 'application/pdf'), { imagesOnly: true })).toMatchObject({ ok: false })
  })
})

describe('formatBytes', () => {
  it('formats sizes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(1.2 * 1024 * 1024)).toBe('1.2 MB')
  })
})
